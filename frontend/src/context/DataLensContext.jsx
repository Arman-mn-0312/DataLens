import React, { createContext, useContext, useState, useRef } from 'react';
import { SAMPLE_PREVIEW_DATA } from '../services/mockData';
import { fetchReportFromAPI, clearApiCache } from '../services/api';

const DataLensContext = createContext(null);

export const DataLensProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Initialize dataset and upload status from sessionStorage for resilience
  const [dataset, setDataset] = useState(() => {
    try {
      const saved = sessionStorage.getItem('datalens_dataset');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isUploaded, setIsUploaded] = useState(() => {
    try {
      return !!sessionStorage.getItem('datalens_dataset');
    } catch {
      return false;
    }
  });

  const [isAnalyzed, setIsAnalyzed] = useState(() => {
    try {
      return !!sessionStorage.getItem('datalens_dataset');
    } catch {
      return false;
    }
  });

  // In-flight request tracker to prevent duplicate concurrent network requests
  const pendingRequests = useRef({});

  // Status tracker for each report
  const [reportStatus, setReportStatus] = useState({
    overview: 'pending',
    missing: 'pending',
    duplicate: 'pending',
    datatype: 'pending',
    outlier: 'pending',
    dashboard: 'pending'
  });

  const [reportData, setReportData] = useState({
    overview: null,
    dashboard: null,
    missing: null,
    duplicate: null,
    datatype: null,
    outlier: null
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const uploadDataset = (file, datasetData = null) => {
    // Clear API cache on new dataset upload
    clearApiCache();
    pendingRequests.current = {};

    let newDataset = datasetData;
    if (!newDataset && file) {
      newDataset = {
        ...SAMPLE_PREVIEW_DATA,
        filename: file?.name || "uploaded_dataset.csv",
        filesize: file?.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "3.4 MB",
        uploadedAt: new Date().toLocaleDateString()
      };
    } else if (!newDataset && !file) {
      newDataset = SAMPLE_PREVIEW_DATA;
    }

    try {
      sessionStorage.setItem('datalens_dataset', JSON.stringify(newDataset));
    } catch (e) {
      console.warn('Failed to save dataset in sessionStorage:', e);
    }

    setDataset(newDataset);
    setIsUploaded(true);
    setIsAnalyzed(true);

    // Reset report statuses to pending for new dataset
    setReportStatus({
      overview: 'pending',
      missing: 'pending',
      duplicate: 'pending',
      datatype: 'pending',
      outlier: 'pending',
      dashboard: 'pending'
    });

    setReportData({
      overview: null,
      missing: null,
      duplicate: null,
      datatype: null,
      outlier: null,
      dashboard: null
    });
  };

  const analyzeDataset = async () => {
    setIsAnalyzed(true);
    await loadReport('overview');
  };

  const loadReport = async (reportKey) => {
    // Return cached report data if already loaded
    if (reportData[reportKey]) {
      if (reportStatus[reportKey] !== 'ready') {
        setReportStatus(prev => ({ ...prev, [reportKey]: 'ready' }));
      }
      return reportData[reportKey];
    }

    // Return existing pending promise if currently loading
    if (pendingRequests.current[reportKey]) {
      return await pendingRequests.current[reportKey];
    }

    setReportStatus(prev => ({ ...prev, [reportKey]: 'loading' }));
    const filename = dataset?.filename;

    const requestPromise = (async () => {
      try {
        const data = await fetchReportFromAPI(reportKey, filename);
        setReportData(prev => ({ ...prev, [reportKey]: data }));
        setReportStatus(prev => ({ ...prev, [reportKey]: data ? 'ready' : 'error' }));
        if (data) setIsAnalyzed(true);
        return data;
      } catch (err) {
        console.error(`Error loading report '${reportKey}':`, err);
        setReportStatus(prev => ({ ...prev, [reportKey]: 'error' }));
        return null;
      } finally {
        delete pendingRequests.current[reportKey];
      }
    })();

    pendingRequests.current[reportKey] = requestPromise;
    return await requestPromise;
  };

  const resetDataset = () => {
    try {
      sessionStorage.removeItem('datalens_dataset');
    } catch (e) {
      // ignore
    }
    clearApiCache();
    pendingRequests.current = {};
    setIsUploaded(false);
    setIsAnalyzed(false);
    setDataset(null);
  };

  return (
    <DataLensContext.Provider value={{
      theme,
      toggleTheme,
      isUploaded,
      isAnalyzed,
      dataset,
      reportStatus,
      reportData,
      uploadDataset,
      analyzeDataset,
      loadReport,
      resetDataset
    }}>
      {children}
    </DataLensContext.Provider>
  );
};

export const useDataLens = () => {
  const context = useContext(DataLensContext);
  if (!context) {
    throw new Error('useDataLens must be used within a DataLensProvider');
  }
  return context;
};

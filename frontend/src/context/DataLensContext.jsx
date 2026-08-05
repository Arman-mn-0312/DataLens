import React, { createContext, useContext, useState } from 'react';
import { SAMPLE_PREVIEW_DATA } from '../services/mockData';
import { fetchReportFromAPI } from '../services/api';

const DataLensContext = createContext(null);

export const DataLensProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isUploaded, setIsUploaded] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [dataset, setDataset] = useState(null);

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

    setDataset(newDataset);
    setIsUploaded(true);
    setIsAnalyzed(false); // Reset analysis state until user clicks "Analyze Dataset"

    // Reset report statuses to pending except preview
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
    setReportStatus(prev => ({ ...prev, overview: 'loading' }));

    const filename = dataset?.filename;
    const overviewRes = await fetchReportFromAPI('overview', filename);

    setReportData(prev => ({ ...prev, overview: overviewRes }));
    setReportStatus(prev => ({ ...prev, overview: overviewRes ? 'ready' : 'error' }));
  };

  const loadReport = async (reportKey) => {
    if (reportStatus[reportKey] === 'ready' || reportStatus[reportKey] === 'loading') {
      return; // Already loaded or fetching
    }

    setReportStatus(prev => ({ ...prev, [reportKey]: 'loading' }));
    const filename = dataset?.filename;
    const data = await fetchReportFromAPI(reportKey, filename);
    setReportData(prev => ({ ...prev, [reportKey]: data }));
    setReportStatus(prev => ({ ...prev, [reportKey]: data ? 'ready' : 'error' }));
  };

  const resetDataset = () => {
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

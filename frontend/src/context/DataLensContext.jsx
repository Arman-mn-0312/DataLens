import React, { createContext, useContext, useState } from 'react';
import { SAMPLE_PREVIEW_DATA, MOCK_REPORTS, fetchReportData } from '../services/mockData';

const DataLensContext = createContext(null);

export const DataLensProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isUploaded, setIsUploaded] = useState(true); // Default loaded with sample for demo
  const [isAnalyzed, setIsAnalyzed] = useState(true); // Default analyzed for instant exploration
  const [dataset, setDataset] = useState(SAMPLE_PREVIEW_DATA);

  // Status tracker for each report
  const [reportStatus, setReportStatus] = useState({
    overview: 'ready',
    missing: 'ready',
    duplicate: 'pending',
    datatype: 'pending',
    outlier: 'pending',
    dashboard: 'ready'
  });

  const [reportData, setReportData] = useState({
    overview: MOCK_REPORTS.overview,
    dashboard: MOCK_REPORTS.dashboard,
    missing: MOCK_REPORTS.missing,
    duplicate: null,
    datatype: null,
    outlier: null
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const uploadDataset = (file) => {
    // Simulated upload file processing
    const newDataset = {
      ...SAMPLE_PREVIEW_DATA,
      filename: file?.name || "uploaded_dataset.csv",
      filesize: file?.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "3.4 MB",
      uploadedAt: new Date().toLocaleDateString()
    };

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
    setReportStatus(prev => ({ ...prev, overview: 'loading', dashboard: 'loading' }));

    const overviewRes = await fetchReportData('overview');
    const dashboardRes = await fetchReportData('dashboard');

    setReportData(prev => ({ ...prev, overview: overviewRes, dashboard: dashboardRes }));
    setReportStatus(prev => ({ ...prev, overview: 'ready', dashboard: 'ready' }));
  };

  const loadReport = async (reportKey) => {
    if (reportStatus[reportKey] === 'ready' || reportStatus[reportKey] === 'loading') {
      return; // Already loaded or fetching
    }

    setReportStatus(prev => ({ ...prev, [reportKey]: 'loading' }));
    const data = await fetchReportData(reportKey);
    setReportData(prev => ({ ...prev, [reportKey]: data }));
    setReportStatus(prev => ({ ...prev, [reportKey]: 'ready' }));
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

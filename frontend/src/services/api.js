const API_BASE_URL = "http://127.0.0.1:5000";

const apiCache = new Map();

export function clearApiCache() {
  apiCache.clear();
}

export async function fetchReportFromAPI(reportKey, filename) {
  const url = `${API_BASE_URL}/reports/${reportKey}${filename ? `?filename=${encodeURIComponent(filename)}` : ''}`;

  if (apiCache.has(url)) {
    return await apiCache.get(url);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${reportKey} report: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching report '${reportKey}':`, error);
      apiCache.delete(url);
      return null;
    }
  })();

  apiCache.set(url, fetchPromise);
  return await fetchPromise;
}

export async function downloadReportFile(format, filename) {
  const url = `${API_BASE_URL}/reports/generate/${format}${filename ? `?filename=${encodeURIComponent(filename)}` : ''}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filename })
  });

  if (!response.ok) {
    let errorMsg = `Failed to generate ${format.toUpperCase()} report.`;
    try {
      const errJson = await response.json();
      if (errJson?.message) errorMsg = errJson.message;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const cleanFilename = filename ? filename.replace(/\.[^/.]+$/, "") : "dataset";
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const downloadFilename = `DataLens_${cleanFilename}_report.${ext}`;

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);

  return true;
}

export default API_BASE_URL;
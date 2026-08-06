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

export default API_BASE_URL;
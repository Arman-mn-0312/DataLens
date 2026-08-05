const API_BASE_URL = "http://127.0.0.1:5000";

export async function fetchReportFromAPI(reportKey, filename) {
  try {
    const url = `${API_BASE_URL}/reports/${reportKey}${filename ? `?filename=${encodeURIComponent(filename)}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${reportKey} report: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching report '${reportKey}':`, error);
    return null;
  }
}

export default API_BASE_URL;
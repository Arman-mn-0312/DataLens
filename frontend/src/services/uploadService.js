import API_BASE_URL from "./api";
import { clearStoredToken, getStoredToken } from "../auth/authService";

export async function uploadDataset(file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_BASE_URL}/upload`,
        {
            method: "POST",
            headers: getStoredToken()
                ? { Authorization: `Bearer ${getStoredToken()}` }
                : {},
            body: formData,
        }
    );

    if (response.status === 401) {
        clearStoredToken();
    }

    return response.json();
}
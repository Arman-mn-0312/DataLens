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

export async function deleteUploadedDataset(filename) {
    const params = new URLSearchParams({ filename });
    const response = await fetch(`${API_BASE_URL}/upload?${params.toString()}`, {
        method: "DELETE",
        headers: getStoredToken()
            ? { Authorization: `Bearer ${getStoredToken()}` }
            : {},
    });

    if (response.status === 401) {
        clearStoredToken();
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 404) {
        throw new Error(payload?.message || "Failed to remove uploaded dataset.");
    }
    return payload;
}

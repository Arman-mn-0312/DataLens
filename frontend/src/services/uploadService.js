import API_BASE_URL from "./api";

export async function uploadDataset(file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_BASE_URL}/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    return response.json();
}
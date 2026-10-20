import { API_BASE } from '../config';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Gagal mengunggah berkas ke server');
  }

  const json = await res.json();
  return json.data;
}

export async function deleteUploadedFile(filename) {
  try {
    const res = await fetch(`${API_BASE}/upload/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const uploadFileToServer = uploadFile;
export const deleteFileFromServer = deleteUploadedFile;

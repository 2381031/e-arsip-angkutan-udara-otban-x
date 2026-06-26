import type { Dokumen } from "../types.js";

export function getFileExtension(fileUrl: string): string {
  if (!fileUrl) return "";
  const clean = fileUrl.split("?")[0].split("#")[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

export function isPdfFile(fileUrl: string): boolean {
  return getFileExtension(fileUrl) === "pdf";
}

export function buildDownloadFilename(doc: Pick<Dokumen, "nama_dokumen" | "file_url" | "nomor_dokumen">): string {
  const ext = getFileExtension(doc.file_url) || "pdf";
  const baseName = (doc.nama_dokumen || doc.nomor_dokumen || "dokumen")
    .replace(/[^\w\s\-().]/g, "_")
    .trim()
    .slice(0, 120);
  return `${baseName}.${ext}`;
}

export async function fetchDocumentBlob(token: string, docId: string): Promise<Blob> {
  const response = await fetch(`/api/dokumen/${docId}/file?inline=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = "Gagal memuat dokumen";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // response bukan JSON
    }
    throw new Error(message);
  }

  return response.blob();
}

export async function downloadDocument(
  token: string,
  doc: Pick<Dokumen, "id" | "nama_dokumen" | "file_url" | "nomor_dokumen">
): Promise<void> {
  const response = await fetch(`/api/dokumen/${doc.id}/file`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = "Gagal mengunduh dokumen";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // response bukan JSON
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = buildDownloadFilename(doc);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function logDocumentDownload(token: string, docId: string): Promise<void> {
  await fetch(`/api/dokumen/${docId}/download-log`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

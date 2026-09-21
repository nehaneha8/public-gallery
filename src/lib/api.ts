import type { GalleryConfig, ArtworkSize, AboutPromptInput } from '../data/galleryConfig';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body && !(init.body instanceof Blob) ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `request failed (${res.status})`);
  return data as T;
}

export function signup(email: string, password: string, displayName: string) {
  return request<{ slug: string }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export function login(email: string, password: string) {
  return request<{ slug: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ ok: true }>('/api/auth/logout', { method: 'POST' });
}

export function me() {
  return request<{ email: string; displayName: string; slug: string; title: string }>('/api/auth/me');
}

export function updateGalleryTitle(title: string) {
  return request<{ title: string }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ galleryTitle: title }) });
}

export function fetchGallery(slug: string) {
  return request<GalleryConfig>(`/api/gallery/${encodeURIComponent(slug)}`);
}

export function fetchDirectory() {
  return request<{ galleries: { slug: string; title: string; thumbnail: string | null }[] }>('/api/galleries');
}

export async function uploadImage(file: File): Promise<{ url: string; aspectRatio: number }> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `upload failed (${res.status})`);
  return data;
}

export function createArtwork(input: {
  title: string;
  description?: string;
  size: ArtworkSize;
  imageUrl: string;
  aspectRatio: number;
}) {
  return request<{ id: number }>('/api/gallery/artworks', { method: 'POST', body: JSON.stringify(input) });
}

export function deleteArtwork(id: number) {
  return request<{ ok: true }>(`/api/gallery/artworks?id=${id}`, { method: 'DELETE' });
}

export function createSketch(imageUrl: string) {
  return request<{ id: number }>('/api/gallery/sketches', { method: 'POST', body: JSON.stringify({ imageUrl }) });
}

export function deleteSketch(id: number) {
  return request<{ ok: true }>(`/api/gallery/sketches?id=${id}`, { method: 'DELETE' });
}

export function saveAbout(input: { optedIn: boolean; photoUrl?: string; prompts: AboutPromptInput[] }) {
  return request<{ ok: true }>('/api/gallery/about', { method: 'PUT', body: JSON.stringify(input) });
}

// Wipes all gallery content (paintings, sketches, about-me) but keeps the
// account itself — the user stays logged in.
export function clearGallery() {
  return request<{ ok: true }>('/api/gallery/clear', { method: 'DELETE' });
}

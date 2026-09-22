import { useEffect, useState, type CSSProperties } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import * as api from '../lib/api';
import type { GalleryConfig, ArtworkSize, AboutPromptInput } from '../data/galleryConfig';

type Tab = 'paintings' | 'about';

export default function DashboardPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [gallery, setGallery] = useState<GalleryConfig | null>(null);
  const [tab, setTab] = useState<Tab>('paintings');
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((u) => setSlug(u.slug))
      .catch(() => setAuthError(true));
  }, []);

  const reload = () => {
    if (slug) api.fetchGallery(slug).then(setGallery);
  };

  useEffect(reload, [slug]);

  useEffect(() => {
    if (authError) navigate('/login');
  }, [authError]);

  if (authError) return null;
  if (!slug || !gallery) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0e6d8', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <h1 style={{ ...GLOW_TEXT_STYLE, fontSize: 24, margin: 0 }}>{gallery.title}</h1>
            <button onClick={() => setInfoModalOpen(true)} aria-label="Edit gallery name and photo" style={editIconButton}>
              ✎
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(`/g/${slug}`)} style={ghostButton}>
              View my gallery →
            </button>
            <button onClick={() => api.logout().then(() => navigate('/'))} style={ghostButton}>
              Log out
            </button>
          </div>
        </div>
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 28 }}>usable-gallery.vercel.app/g/{slug}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid rgba(255,176,102,0.2)' }}>
          {(['paintings', 'about'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabButton,
                borderBottomColor: tab === t ? '#ffb066' : 'transparent',
                color: tab === t ? '#ffb066' : '#f0e6d8',
              }}
            >
              {t === 'paintings' ? 'Paintings' : 'About Me'}
            </button>
          ))}
        </div>

        {tab === 'paintings' && (
          <>
            <PaintingsSection gallery={gallery} onChange={reload} />
            <SketchbookSection gallery={gallery} onChange={reload} />
          </>
        )}
        {tab === 'about' && <AboutTab gallery={gallery} onChange={reload} />}

        <DangerZone onCleared={reload} />
      </div>

      {infoModalOpen && (
        <GalleryInfoModal gallery={gallery} onChange={reload} onClose={() => setInfoModalOpen(false)} />
      )}
    </div>
  );
}

function GalleryInfoModal({
  gallery,
  onChange,
  onClose,
}: {
  gallery: GalleryConfig;
  onChange: () => void;
  onClose: () => void;
}) {
  const [titleDraft, setTitleDraft] = useState(gallery.title);
  const [titleSaved, setTitleSaved] = useState(false);
  const [titleBusy, setTitleBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTitle = async () => {
    setTitleBusy(true);
    setError(null);
    try {
      await api.updateGalleryTitle(titleDraft);
      onChange();
      setTitleSaved(true);
      setTimeout(() => setTitleSaved(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setTitleBusy(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setPhotoBusy(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      await api.setCoverPhoto(url);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    setError(null);
    try {
      await api.setCoverPhoto(null);
      onChange();
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={modalBackdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalPanelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ ...GLOW_TEXT_STYLE, fontSize: 18 }}>Edit Gallery</div>
          <button onClick={onClose} aria-label="Close" style={{ ...editIconButton, fontSize: 20 }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Gallery name</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder={`${gallery.displayName}'s Gallery`}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={saveTitle} disabled={titleBusy} style={ghostButton}>
              {titleBusy ? 'Saving…' : titleSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Gallery photo</div>
          <p style={{ fontSize: 12, opacity: 0.55, margin: '0 0 10px' }}>
            Shown on the directory page. Upload your own, or leave it to use whichever painting you've
            starred (falling back to your first upload).
          </p>
          {gallery.coverPhotoUrl && (
            <img
              src={gallery.coverPhotoUrl}
              alt=""
              style={{ width: 140, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6, marginBottom: 10, display: 'block' }}
            />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ ...ghostButton, display: 'inline-block' }}>
              {photoBusy ? 'Uploading…' : gallery.coverPhotoUrl ? 'Replace photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                disabled={photoBusy}
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            {gallery.coverPhotoUrl && (
              <button onClick={removePhoto} disabled={photoBusy} style={ghostButton}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ color: '#ff9d9d', fontSize: 13, marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
}

function DangerZone({ onCleared }: { onCleared: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.clearGallery();
      setConfirming(false);
      onCleared();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid rgba(255,100,100,0.2)' }}>
      <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>Danger zone</div>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} style={dangerButton}>
          Delete my gallery
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
            This permanently deletes all your paintings, sketches, and about-me content. Your account and
            login stay — you can start uploading again right after. This can't be undone.
          </p>
          {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleDelete} disabled={busy} style={dangerButton}>
              {busy ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={busy} style={ghostButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaintingsSection({ gallery, onChange }: { gallery: GalleryConfig; onChange: () => void }) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<ArtworkSize>('medium');
  const [pendingImage, setPendingImage] = useState<{ url: string; aspectRatio: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverBusyId, setCoverBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const closeForm = () => {
    setFormOpen(false);
    setTitle('');
    setDescription('');
    setSize('medium');
    setPendingImage(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { url, aspectRatio } = await api.uploadImage(file);
      setPendingImage({ url, aspectRatio });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Bulk upload: each file becomes its own painting right away (blank
  // title, medium size) — reviewing/renaming happens afterward via each
  // card's Edit button, rather than filling in fields per file up front.
  const handleBulkFiles = async (files: File[]) => {
    setUploading(true);
    setError(null);
    setBulkProgress({ done: 0, total: files.length });
    let failed = 0;
    for (const file of files) {
      try {
        const { url, aspectRatio } = await api.uploadImage(file);
        await api.createArtwork({ title: '', size: 'medium', imageUrl: url, aspectRatio });
      } catch {
        failed += 1;
      }
      setBulkProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setUploading(false);
    setBulkProgress(null);
    if (failed > 0) setError(`${failed} of ${files.length} photos failed to upload.`);
    else closeForm();
    onChange();
  };

  const handleFileSelect = (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length > 1) handleBulkFiles(files);
    else handleFile(files[0]);
  };

  const handleAdd = async () => {
    if (!pendingImage) return;
    setAdding(true);
    setError(null);
    try {
      await api.createArtwork({
        title: title.trim(),
        description: description.trim() || undefined,
        size,
        imageUrl: pendingImage.url,
        aspectRatio: pendingImage.aspectRatio,
      });
      closeForm();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setAdding(false);
    }
  };

  const effectiveCoverId = gallery.coverArtworkId ?? gallery.artworks[0]?.id ?? null;

  const handleSetCover = async (id: string) => {
    setCoverBusyId(id);
    try {
      await api.setCoverArtwork(id === gallery.coverArtworkId ? null : id);
      onChange();
    } finally {
      setCoverBusyId(null);
    }
  };

  const editingArtwork = gallery.artworks.find((a) => a.id === editingId) ?? null;

  return (
    <div>
      <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 20 }}>
        The paintings in your hallway. Star one to use as your gallery's cover photo — or upload your own
        from the ✎ next to your gallery name above, which always takes priority.
      </p>

      {!formOpen ? (
        <button onClick={() => setFormOpen(true)} style={{ ...ghostButton, marginBottom: 28 }}>
          + Add paintings
        </button>
      ) : (
        <div style={formPanelStyle}>
          {bulkProgress ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Uploading {bulkProgress.done} of {bulkProgress.total}…
            </div>
          ) : pendingImage ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={pendingImage.url} alt="" style={formPreviewStyle} />
              <label style={{ ...ghostButton, fontSize: 12 }}>
                {uploading ? 'Uploading…' : 'Replace image'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <>
              <label style={{ ...ghostButton, textAlign: 'center', display: 'block' }}>
                {uploading ? 'Uploading…' : 'Choose image(s) to upload'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => e.target.files && e.target.files.length > 0 && handleFileSelect(e.target.files)}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
                Select more than one photo to bulk-upload them — each becomes its own painting with a
                blank title, which you can fill in afterward from its Edit button below.
              </p>
            </>
          )}
          {pendingImage && (
            <>
              <input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                {(['small', 'medium', 'large'] as ArtworkSize[]).map((s) => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </>
          )}
          {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={closeForm} disabled={adding || uploading} style={ghostButton}>
              Cancel
            </button>
            {pendingImage && (
              <button
                onClick={handleAdd}
                disabled={!pendingImage || adding || uploading}
                style={{ ...ghostButton, opacity: !pendingImage || adding || uploading ? 0.4 : 1 }}
              >
                {adding ? 'Adding…' : 'Add painting'}
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {gallery.artworks.map((a) => (
          <div key={a.id} style={{ border: '1px solid rgba(255,176,102,0.15)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <img src={a.src} alt={a.title || 'Untitled'} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => handleSetCover(a.id)}
                disabled={coverBusyId === a.id}
                title={a.id === effectiveCoverId ? 'Gallery cover photo (click to reset to default)' : 'Set as gallery cover photo'}
                style={coverStarButtonStyle(a.id === effectiveCoverId)}
              >
                {a.id === effectiveCoverId ? '★' : '☆'}
              </button>
            </div>
            <div style={{ padding: '8px 10px', fontSize: 13 }}>
              <div style={!a.title ? { opacity: 0.5, fontStyle: 'italic' } : undefined}>{a.title || 'Untitled'}</div>
              <div style={{ opacity: 0.6, fontSize: 11 }}>{a.size}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={() => setEditingId(a.id)} style={{ ...ghostButton, fontSize: 11, padding: '4px 10px' }}>
                  Edit
                </button>
                <button
                  onClick={() => api.deleteArtwork(Number(a.id)).then(onChange)}
                  style={{ ...ghostButton, fontSize: 11, padding: '4px 10px' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingArtwork && (
        <EditArtworkModal artwork={editingArtwork} onChange={onChange} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}

function EditArtworkModal({
  artwork,
  onChange,
  onClose,
}: {
  artwork: GalleryConfig['artworks'][number];
  onChange: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description ?? '');
  const [size, setSize] = useState<ArtworkSize>(artwork.size);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.updateArtwork(Number(artwork.id), { title: title.trim(), description: description.trim(), size });
      onChange();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={modalBackdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalPanelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ ...GLOW_TEXT_STYLE, fontSize: 18 }}>Edit Painting</div>
          <button onClick={onClose} aria-label="Close" style={{ ...editIconButton, fontSize: 20 }}>
            ×
          </button>
        </div>
        <img src={artwork.src} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6, marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            {(['small', 'medium', 'large'] as ArtworkSize[]).map((s) => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="edit-size" checked={size === s} onChange={() => setSize(s)} />
                {s}
              </label>
            ))}
          </div>
          {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={save} disabled={busy} style={ghostButton}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SketchbookSection({ gallery, onChange }: { gallery: GalleryConfig; onChange: () => void }) {
  const [formOpen, setFormOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeForm = () => {
    setFormOpen(false);
    setPendingImage(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      setPendingImage({ url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!pendingImage) return;
    setAdding(true);
    setError(null);
    try {
      await api.createSketch(pendingImage.url);
      closeForm();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ fontSize: 13, letterSpacing: 0.5, opacity: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Sketchbook
      </div>
      <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 20 }}>
        Sketches shown in order in your hallway's sketchbook — just the images, no titles needed.
      </p>

      {!formOpen ? (
        <button onClick={() => setFormOpen(true)} style={{ ...ghostButton, marginBottom: 28 }}>
          + Add a sketch to the sketchbook
        </button>
      ) : (
        <div style={formPanelStyle}>
          {pendingImage ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={pendingImage.url} alt="" style={formPreviewStyle} />
              <label style={{ ...ghostButton, fontSize: 12 }}>
                {uploading ? 'Uploading…' : 'Replace image'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <label style={{ ...ghostButton, textAlign: 'center', display: 'block' }}>
              {uploading ? 'Uploading…' : 'Choose image to upload'}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          )}
          {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={closeForm} disabled={adding} style={ghostButton}>
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!pendingImage || adding || uploading}
              style={{ ...ghostButton, opacity: !pendingImage || adding || uploading ? 0.4 : 1 }}
            >
              {adding ? 'Adding…' : 'Add sketch'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
        {gallery.sketches.map((s) => (
          <div key={s.id} style={{ border: '1px solid rgba(255,176,102,0.15)', borderRadius: 6, overflow: 'hidden' }}>
            <img src={s.src} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
            <button
              onClick={() => api.deleteSketch(Number(s.id)).then(onChange)}
              style={{ ...ghostButton, width: '100%', fontSize: 11, padding: '4px 0', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab({ gallery, onChange }: { gallery: GalleryConfig; onChange: () => void }) {
  const [optedIn, setOptedIn] = useState(gallery.about !== null);
  const [photoUrl, setPhotoUrl] = useState(gallery.about?.photoSrc ?? '');
  const [prompts, setPrompts] = useState<AboutPromptInput[]>(gallery.about?.prompts ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.saveAbout({
        optedIn,
        photoUrl: photoUrl || undefined,
        prompts: prompts.filter((p) => p.question.trim() && p.answer.trim()),
      });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
        <input type="checkbox" checked={optedIn} onChange={(e) => setOptedIn(e.target.checked)} />
        Include an "About the Artist" section at the end of my hallway
      </label>

      {optedIn && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Photo of yourself (optional)</div>
            {photoUrl && <img src={photoUrl} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />}
            <label style={{ ...ghostButton, display: 'inline-block' }}>
              {busy ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Prompts (optional)</div>
            {prompts.map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                <input
                  placeholder="Question (e.g. What inspires you?)"
                  value={p.question}
                  onChange={(e) => {
                    const next = [...prompts];
                    next[i] = { ...next[i], question: e.target.value };
                    setPrompts(next);
                  }}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Answer"
                  value={p.answer}
                  onChange={(e) => {
                    const next = [...prompts];
                    next[i] = { ...next[i], answer: e.target.value };
                    setPrompts(next);
                  }}
                  style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                />
                <button
                  onClick={() => setPrompts(prompts.filter((_, j) => j !== i))}
                  style={{ ...ghostButton, alignSelf: 'flex-start', fontSize: 11, padding: '4px 10px' }}
                >
                  Remove prompt
                </button>
              </div>
            ))}
            <button
              onClick={() => setPrompts([...prompts, { question: '', answer: '' }])}
              style={ghostButton}
            >
              + Add a prompt
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ color: '#ff9d9d', fontSize: 13, marginTop: 16 }}>{error}</div>}
      <button onClick={save} disabled={busy} style={{ ...ghostButton, marginTop: 24 }}>
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

const ghostButton: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.35)',
  background: 'transparent',
  color: '#ffb066',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
};

const formPanelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginBottom: 28,
  padding: 18,
  border: '1px solid rgba(255,176,102,0.25)',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.015)',
};

const formPreviewStyle: CSSProperties = {
  width: 72,
  height: 72,
  objectFit: 'cover',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.25)',
};

function coverStarButtonStyle(isCover: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(10, 7, 5, 0.6)',
    color: isCover ? '#ffcf6a' : 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: '26px',
    textAlign: 'center',
    padding: 0,
    cursor: 'pointer',
  };
}

const editIconButton: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#ffb066',
  fontSize: 16,
  cursor: 'pointer',
  padding: 4,
  lineHeight: 1,
};

const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

const modalPanelStyle: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: '#0b0705',
  border: '1px solid rgba(255,176,102,0.25)',
  borderRadius: 8,
  padding: 24,
  color: '#f0e6d8',
};

const dangerButton: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255,100,100,0.4)',
  background: 'transparent',
  color: '#ff9d9d',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
};

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.25)',
  background: 'rgba(255,255,255,0.03)',
  color: '#f0e6d8',
  fontFamily: 'inherit',
  fontSize: 13,
};

const tabButton: CSSProperties = {
  padding: '10px 4px',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontFamily: 'inherit',
  fontSize: 14,
  cursor: 'pointer',
};

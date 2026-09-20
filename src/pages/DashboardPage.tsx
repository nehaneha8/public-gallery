import { useEffect, useState, type CSSProperties } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import * as api from '../lib/api';
import type { GalleryConfig, ArtworkSize, AboutPromptInput } from '../data/galleryConfig';

type Tab = 'paintings' | 'sketchbook' | 'about';

export default function DashboardPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [gallery, setGallery] = useState<GalleryConfig | null>(null);
  const [tab, setTab] = useState<Tab>('paintings');

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
          <h1 style={{ ...GLOW_TEXT_STYLE, fontSize: 24, margin: 0 }}>Your Gallery</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(`/g/${slug}`)} style={ghostButton}>
              View my gallery →
            </button>
            <button
              onClick={() => api.logout().then(() => navigate('/'))}
              style={ghostButton}
            >
              Log out
            </button>
          </div>
        </div>
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 28 }}>usable-gallery.vercel.app/g/{slug}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid rgba(255,176,102,0.2)' }}>
          {(['paintings', 'sketchbook', 'about'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabButton,
                borderBottomColor: tab === t ? '#ffb066' : 'transparent',
                color: tab === t ? '#ffb066' : '#f0e6d8',
              }}
            >
              {t === 'paintings' ? 'Paintings' : t === 'sketchbook' ? 'Sketchbook' : 'About Me'}
            </button>
          ))}
        </div>

        {tab === 'paintings' && <PaintingsTab gallery={gallery} onChange={reload} />}
        {tab === 'sketchbook' && <SketchbookTab gallery={gallery} onChange={reload} />}
        {tab === 'about' && <AboutTab gallery={gallery} onChange={reload} />}
      </div>
    </div>
  );
}

function PaintingsTab({ gallery, onChange }: { gallery: GalleryConfig; onChange: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<ArtworkSize>('medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!title.trim()) {
      setError('give the painting a title first');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { url, aspectRatio } = await api.uploadImage(file);
      await api.createArtwork({ title: title.trim(), description: description.trim() || undefined, size, imageUrl: url, aspectRatio });
      setTitle('');
      setDescription('');
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, padding: 16, border: '1px solid rgba(255,176,102,0.2)', borderRadius: 6 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
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
        {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
        <label style={{ ...ghostButton, textAlign: 'center', display: 'block' }}>
          {busy ? 'Uploading…' : 'Choose image to upload'}
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {gallery.artworks.map((a) => (
          <div key={a.id} style={{ border: '1px solid rgba(255,176,102,0.15)', borderRadius: 6, overflow: 'hidden' }}>
            <img src={a.src} alt={a.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
            <div style={{ padding: '8px 10px', fontSize: 13 }}>
              <div>{a.title}</div>
              <div style={{ opacity: 0.6, fontSize: 11 }}>{a.size}</div>
              <button
                onClick={() => api.deleteArtwork(Number(a.id)).then(onChange)}
                style={{ ...ghostButton, marginTop: 8, fontSize: 11, padding: '4px 10px' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SketchbookTab({ gallery, onChange }: { gallery: GalleryConfig; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      await api.createSketch(url);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 16 }}>
        Upload sketches in the order you want them to appear — no titles needed, just the images.
      </p>
      <label style={{ ...ghostButton, display: 'inline-block', marginBottom: 24 }}>
        {busy ? 'Uploading…' : 'Choose sketch to upload'}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </label>
      {error && <div style={{ color: '#ff9d9d', fontSize: 13, marginBottom: 16 }}>{error}</div>}

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

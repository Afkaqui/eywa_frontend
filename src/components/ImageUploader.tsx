"use client";

import { useRef, useState } from 'react';
import { Camera, Loader2, ImageIcon } from 'lucide-react';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  /** URL pública actual de la imagen (o null si no hay). */
  currentUrl?: string | null;
  /** Endpoint de subida (POST multipart, campo "file"). */
  endpoint: string;
  shape?: 'circle' | 'square';
  size?: number; // px
  label?: string;
  /** Se llama con la nueva URL (ya con cache-busting) tras subir. */
  onUploaded?: (url: string) => void;
}

export function ImageUploader({
  currentUrl,
  endpoint,
  shape = 'square',
  size = 96,
  label = 'Subir imagen',
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError('Usa PNG, JPG o WebP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Máximo 5 MB.');
      return;
    }
    // Vista previa optimista
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo subir');
      const url: string = data.image_url ?? data.avatar_url;
      const busted = `${url}?v=${data.version ?? Date.now()}`;
      setPreview(busted);
      onUploaded?.(busted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir');
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center ${rounded}`}
        style={{ width: size, height: size }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
            onError={() => setPreview(null)}
          />
        ) : (
          <ImageIcon className="w-7 h-7 text-gray-300" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Camera className="w-4 h-4" />
          {label}
        </button>
        <p className="text-xs text-gray-400 mt-1.5">PNG, JPG o WebP · máx 5 MB</p>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

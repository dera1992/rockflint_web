'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { deleteListingImage, uploadListingImage } from '@/lib/api/endpoints/listings';
import type { ListingImage } from '@/lib/api/types';
import { useToastStore } from '@/store/useToastStore';

interface UploadState {
  file: File;
  preview: string;
  progress: number;
  uploaded?: ListingImage;
}

export function ListingImageUploader({ listingId }: { listingId: number }) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const { addToast } = useToastStore();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));
    setUploads((prev) => [...prev, ...next]);
  };

  const handleUpload = async (upload: UploadState) => {
    const formData = new FormData();
    formData.append('listing', String(listingId));
    formData.append('image', upload.file);

    try {
      const result = await uploadListingImage(formData);
      setUploads((prev) =>
        prev.map((item) =>
          item.preview === upload.preview ? { ...item, uploaded: result, progress: 100 } : item
        )
      );
      addToast({ title: 'Image uploaded', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Upload failed', variant: 'error' });
    }
  };

  const handleDelete = async (imageId?: number) => {
    if (!imageId) return;
    try {
      await deleteListingImage(imageId);
      setUploads((prev) => prev.filter((item) => item.uploaded?.id !== imageId));
      addToast({ title: 'Image removed', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Unable to delete', variant: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold">Upload listing images</p>
        <p className="mt-1 text-xs text-slate-500">Drag and drop or select multiple files.</p>
        <input
          type="file"
          multiple
          className="mt-4 w-full text-sm"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {uploads.map((upload) => (
          <div key={upload.preview} className="rounded-xl border border-slate-200 p-4">
            <div
              className="h-40 w-full rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${upload.preview})` }}
            />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span>{upload.file.name}</span>
              {upload.uploaded ? (
                <button
                  type="button"
                  className="text-rose-500"
                  onClick={() => handleDelete(upload.uploaded?.id)}
                >
                  Remove
                </button>
              ) : (
                <Button size="sm" onClick={() => handleUpload(upload)}>
                  Upload
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/components/admin/ImageUpload.jsx
import { useState, useRef } from 'react';
import { uploadToCloudinary, formatImageUrl, isValidImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(formatImageUrl(value || ''));
  const inputRef = useRef(null);
  const [invalid, setInvalid] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPreview(url);
      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed. Check Cloudinary config.');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {/* URL input */}
      <div className="flex gap-2 mb-3">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => {
            const formatted = formatImageUrl(e.target.value);
            onChange(formatted);
            setPreview(formatted);
            setInvalid(!!formatted && !isValidImageUrl(formatted));
          }}
          placeholder="Paste image URL or upload below"
          className="input-field flex-1 text-sm"
        />
      </div>
      {invalid && (
        <p className="text-rose-400 text-xs mt-1">Invalid image URL (accepted: jpg, jpeg, png, webp, gif or Google Drive)</p>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 transition-colors relative"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-36 object-cover rounded-xl"
              onError={(e) => { e.currentTarget.src = '/fallback.svg'; }}
            />
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm">Click to change</span>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-sm">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-2">📸</div>
                <p className="text-white/40 text-sm">Click or drag to upload image</p>
                <p className="text-white/25 text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
        )}
        {uploading && preview && (
          <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

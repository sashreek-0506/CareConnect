import { useState } from 'react';

// Evidence in this capstone is stored as URLs (no file storage backend wired
// up), so this is a simple "paste an image URL" affordance -- swap for a real
// upload widget backed by S3/Cloudinary in production.
export default function EvidenceUploader({ label, onAdd }) {
  const [url, setUrl] = useState('');

  const submit = () => {
    if (!url.trim()) return;
    onAdd(url.trim());
    setUrl('');
  };

  return (
    <div className="flex gap-2">
      <input
        className="input" placeholder={`${label} photo URL`}
        value={url} onChange={(e) => setUrl(e.target.value)}
      />
      <button type="button" onClick={submit} className="btn-outline shrink-0">Add</button>
    </div>
  );
}

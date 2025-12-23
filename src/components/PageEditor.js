'use client';
import { useState, useEffect } from 'react';
import styles from './PageEditor.module.css';

export default function PageEditor({ pageName, initialContent, onSave }) {
  const [content, setContent] = useState(initialContent || { title: '', subtitle: '', image: '', sections: [] });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload-page-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setContent({ ...content, image: data.imageUrl });
      } else {
        alert('Gagal upload gambar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload gambar');
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    if (confirm('Hapus gambar ini?')) {
      setContent({ ...content, image: '' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(content);
    setSaving(false);
  };

  const handleSectionChange = (index, field, value) => {
    if (!content.sections) return;
    const newSections = [...content.sections];
    newSections[index][field] = value;
    setContent({ ...content, sections: newSections });
  };

  const addSection = () => {
    const currentSections = content.sections || [];
    setContent({
      ...content,
      sections: [...currentSections, { heading: '', content: '' }]
    });
  };

  const removeSection = (index) => {
    if (!content.sections) return;
    const newSections = content.sections.filter((_, i) => i !== index);
    setContent({ ...content, sections: newSections });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.field}>
        <label>Judul</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label>Subtitle</label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          className={styles.textarea}
          rows="3"
        />
      </div>

      <div className={styles.field}>
        <label>Gambar Header</label>
        {content.image && (
          <div className={styles.imagePreview}>
            <img src={content.image} alt="Preview" />
            <button 
              type="button"
              onClick={handleRemoveImage} 
              className={styles.removeImageBtn}
            >
              🗑️ Hapus Gambar
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.fileInput}
          disabled={uploading}
        />
        {uploading && <p className={styles.uploading}>Mengupload...</p>}
      </div>

      {pageName === 'tentang' && content.sections && (
        <div className={styles.sections}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Sections</h3>
            <button onClick={addSection} className={styles.addBtn}>+ Tambah Section</button>
          </div>
          {content.sections.map((section, index) => (
            <div key={index} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4>Section {index + 1}</h4>
                <button onClick={() => removeSection(index)} className={styles.removeBtn}>Hapus</button>
              </div>
              <div className={styles.field}>
                <label>Heading</label>
                <input
                  type="text"
                  value={section.heading || ''}
                  onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label>Content</label>
                <textarea
                  value={section.content || ''}
                  onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                  className={styles.textarea}
                  rows="6"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  );
}

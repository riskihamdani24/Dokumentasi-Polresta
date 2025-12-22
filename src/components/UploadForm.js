'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './UploadForm.module.css';
import { getFileType, getFileTypeIcon, getFileTypeLabel } from '@/lib/fileUtils';

export default function UploadForm({ onUploadSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const mediaInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const filesWithPreviews = files.map(file => {
      const fileType = getFileType(file.name);
      let preview = null;

      // Generate preview for images and videos
      if (fileType === 'image' || fileType === 'video') {
        preview = URL.createObjectURL(file);
      }

      return {
        file,
        preview,
        type: fileType,
        icon: getFileTypeIcon(file.name),
        label: getFileTypeLabel(file.name)
      };
    });

    if (type === 'media') {
      setMediaFiles(prev => [...prev, ...filesWithPreviews]);
    } else {
      setDocFiles(prev => [...prev, ...filesWithPreviews]);
    }
  };

  const handleRemoveFile = (index, type) => {
    if (type === 'media') {
      setMediaFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[index].preview) URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    } else {
      setDocFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[index].preview) URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('date', e.target.date.value);
    formData.append('type', e.target.type.value);
    formData.append('description', e.target.description.value);
    
    // Append all files
    [...mediaFiles, ...docFiles].forEach(({ file }) => {
      formData.append('files', file);
    });
    
    const res = await fetch('/api/activities', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      e.target.reset();
      // Clean up object URLs
      [...mediaFiles, ...docFiles].forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
      setMediaFiles([]);
      setDocFiles([]);
      onUploadSuccess();

      if (confirm('Kegiatan berhasil di-upload! 🥳\n\nKlik OK untuk melihat hasilnya.\nKlik Cancel untuk tetap di sini.')) {
        router.push(`/kegiatan/${data.id}`);
      }
    } else {
      const data = await res.json();
      alert(data.message || 'Upload failed');
    }
    setLoading(false);
  };

  const getTotalSize = () => {
    const total = [...mediaFiles, ...docFiles].reduce((sum, { file }) => sum + file.size, 0);
    const mb = (total / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Tambah Kegiatan Baru</h2>
      <div className={styles.field}>
        <label>Judul Kegiatan</label>
        <input name="title" required className={styles.input} placeholder="Contoh: Apel Pagi" />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
            <label>Tanggal</label>
            <input name="date" type="date" required className={styles.input} />
        </div>
        <div className={styles.field}>
            <label>Jenis</label>
            <select name="type" className={styles.select}>
                <option value="Zoom Meeting">Zoom Meeting</option>
                <option value="Apel Pagi">Apel Pagi</option>
                <option value="Apel Sore">Apel Sore</option>
                <option value="Laporan">Laporan</option>
                <option value="Lainnya">Lainnya</option>
            </select>
        </div>
      </div>
      <div className={styles.field}>
        <label>Deskripsi</label>
        <textarea name="description" rows="4" className={styles.textarea} placeholder="Deskripsi lengkap kegiatan..." />
      </div>

      {/* Media Upload Section */}
      <div className={styles.field}>
        <label>Dokumentasi (Foto & Video)</label>
        <input 
          ref={mediaInputRef}
          name="mediaFiles" 
          type="file" 
          multiple
          accept="image/*,video/*"
          className={styles.fileInput}
          onChange={(e) => handleFileChange(e, 'media')}
        />
        {mediaFiles.length > 0 && (
          <div className={styles.filesContainer}>
            <div className={styles.filesHeader}>
              <span>{mediaFiles.length} file dipilih</span>
            </div>
            <div className={styles.filesGrid}>
              {mediaFiles.map((fileData, index) => (
                <div key={index} className={styles.filePreviewCard}>
                  {fileData.type === 'image' && fileData.preview ? (
                    <div className={styles.imagePreview}>
                      <img src={fileData.preview} alt={fileData.file.name} />
                    </div>
                  ) : (
                    <div className={styles.videoPreview}>
                      <video src={fileData.preview} />
                      <div className={styles.playIcon}>▶️</div>
                    </div>
                  )}
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{fileData.file.name}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveFile(index, 'media')} 
                    className={styles.removeFileBtn}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents Upload Section */}
      <div className={styles.field}>
        <label>Dokumen (PDF / Word / Excel)</label>
        <input 
          ref={docInputRef}
          name="docFiles" 
          type="file" 
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          className={styles.fileInput}
          onChange={(e) => handleFileChange(e, 'doc')}
        />
        {docFiles.length > 0 && (
          <div className={styles.filesContainer}>
            <div className={styles.filesHeader}>
              <span>{docFiles.length} file dipilih</span>
            </div>
            <div className={styles.filesGrid}>
              {docFiles.map((fileData, index) => (
                <div key={index} className={styles.filePreviewCard}>
                  <div className={styles.documentPreview}>
                    <span className={styles.docIcon}>{fileData.icon}</span>
                    <span className={styles.docLabel}>{fileData.label}</span>
                  </div>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{fileData.file.name}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveFile(index, 'doc')} 
                    className={styles.removeFileBtn}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{marginTop: '1rem', textAlign: 'right', color: 'var(--text-muted)'}}>
        Total Ukuran: {getTotalSize()}
      </div>

      <button disabled={loading} className={styles.button}>
        {loading ? 'Mengupload...' : 'Upload Kegiatan'}
      </button>
    </form>
  );
}

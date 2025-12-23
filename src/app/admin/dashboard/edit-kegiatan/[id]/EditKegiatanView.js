'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import styles from '../../add-kegiatan/addkegiatan.module.css';
import formStyles from '@/components/UploadForm.module.css';
import { getFileType, getFileTypeIcon, getFileTypeLabel } from '@/lib/fileUtils';

export default function EditKegiatanView({ activityId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  
  // File states
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  
  // New split file states
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newDocFiles, setNewDocFiles] = useState([]);
  const mediaInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const res = await fetch(`/api/activities/${activityId}`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data);
        
        // Normalize existing files
        let files = [];
        if (data.files && data.files.length > 0) {
          files = [...data.files];
        } else if (data.fileUrl) {
          // Backward compatibility
          files.push({
            url: data.fileUrl,
            name: data.fileName || 'File Lama',
            type: getFileType(data.fileName)
          });
        }
        setExistingFiles(files);
      } else {
        alert('Gagal memuat data kegiatan');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      alert('Error: ' + error.message);
    }
    setFetchLoading(false);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const filesWithPreviews = files.map(file => {
      const fileType = getFileType(file.name);
      let preview = null;

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
      setNewMediaFiles(prev => [...prev, ...filesWithPreviews]);
    } else {
      setNewDocFiles(prev => [...prev, ...filesWithPreviews]);
    }
  };

  const handleRemoveNewFile = (index, type) => {
    if (type === 'media') {
      setNewMediaFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[index].preview) URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    } else {
      setNewDocFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[index].preview) URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  const handleRemoveExistingFile = (fileUrl) => {
    if (confirm('Hapus file ini?')) {
      setExistingFiles(prev => prev.filter(f => f.url !== fileUrl));
      setFilesToRemove(prev => [...prev, fileUrl]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    
    // Append files to remove
    filesToRemove.forEach(url => {
      formData.append('filesToRemove', url);
    });
    
    // Append new files (merge both media and docs)
    [...newMediaFiles, ...newDocFiles].forEach(({ file }) => {
      formData.append('files', file);
    });
    
    const res = await fetch(`/api/activities/${activityId}`, {
      method: 'PUT',
      body: formData,
    });

    if (res.ok) {
      // Cleanup previews
      [...newMediaFiles, ...newDocFiles].forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });

      if (confirm('Kegiatan berhasil diupdate! 🥳\n\nKlik OK untuk melihat hasil tampilan depan.\nKlik Cancel untuk kembali ke dashboard.')) {
        router.push(`/kegiatan/${activityId}`);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } else {
      alert('Gagal update kegiatan');
    }
    setLoading(false);
  };

  const getTotalSize = () => {
    const total = [...newMediaFiles, ...newDocFiles].reduce((sum, { file }) => sum + file.size, 0);
    const mb = (total / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  if (fetchLoading) {
    return (
      <div className={styles.pageContainer}>
        <AdminNavbar />
        <div className={styles.content}>
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className={styles.pageContainer}>
        <AdminNavbar />
        <div className={styles.content}>
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <p>Kegiatan tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <AdminNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>✏️ Edit Kegiatan</h1>
          <p>Update informasi kegiatan yang sudah ada</p>
          <a 
            href={`/kegiatan/${activityId}`} 
            target="_blank" 
            className={formStyles.button} 
            style={{ 
              display: 'inline-block', 
              width: 'auto', 
              padding: '0.75rem 1.5rem', 
              marginTop: '1rem',
              backgroundColor: '#007bff', // Explicit Blue
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            👁️ Lihat Tampilan Depan
          </a>
        </div>
        
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={formStyles.form}>
            <h2>Edit Kegiatan</h2>
            
            <div className={formStyles.field}>
              <label>Judul Kegiatan</label>
              <input 
                name="title" 
                required 
                className={formStyles.input} 
                placeholder="Contoh: Apel Pagi"
                defaultValue={activity.title}
              />
            </div>
            
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <label>Tanggal</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  className={formStyles.input}
                  defaultValue={activity.date}
                />
              </div>
              <div className={formStyles.field}>
                <label>Jenis</label>
                <select name="type" className={formStyles.select} defaultValue={activity.type}>
                  <option value="Zoom Meeting">Zoom Meeting</option>
                  <option value="Apel Pagi">Apel Pagi</option>
                  <option value="Apel Sore">Apel Sore</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            <div className={formStyles.field}>
              <label>Deskripsi</label>
              <textarea 
                name="description" 
                rows="4" 
                className={formStyles.textarea} 
                placeholder="Deskripsi lengkap kegiatan..."
                defaultValue={activity.description}
              />
            </div>
            
            {/* Existing Files Display */}
            {existingFiles.length > 0 && (
              <div className={formStyles.field}>
                <label>File Saat Ini ({existingFiles.length} file)</label>
                <div className={formStyles.filesContainer}>
                  <div className={formStyles.filesGrid}>
                    {existingFiles.map((file, index) => (
                      <div key={index} className={formStyles.filePreviewCard}>
                        {file.type === 'image' ? (
                          <div className={formStyles.imagePreview}>
                            <img src={file.url} alt={file.name} />
                          </div>
                        ) : file.type === 'video' ? (
                          <div className={formStyles.videoPreview}>
                            <video src={file.url} />
                            <div className={formStyles.playIcon}>▶️</div>
                          </div>
                        ) : (
                          <div className={formStyles.documentPreview}>
                            <span className={formStyles.docIcon}>{getFileTypeIcon(file.name)}</span>
                            <span className={formStyles.docLabel}>{getFileTypeLabel(file.name)}</span>
                          </div>
                        )}
                        <div className={formStyles.fileInfo}>
                          <span className={formStyles.fileName}>{file.name}</span>
                          <span className={formStyles.fileSize}>Existing</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveExistingFile(file.url)}
                          className={formStyles.removeFileBtn}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* New Media Upload */}
            <div className={formStyles.field}>
              <label>Tambah Dokumentasi (Foto & Video)</label>
              <input 
                ref={mediaInputRef}
                name="mediaFiles" 
                type="file" 
                multiple
                accept="image/*,video/*"
                className={formStyles.fileInput}
                onChange={(e) => handleFileChange(e, 'media')}
              />
              {newMediaFiles.length > 0 && (
                <div className={formStyles.filesContainer}>
                  <div className={formStyles.filesHeader}>
                    <span>{newMediaFiles.length} file media dipilih</span>
                  </div>
                  <div className={formStyles.filesGrid}>
                    {newMediaFiles.map((fileData, index) => (
                      <div key={index} className={formStyles.filePreviewCard}>
                        {fileData.type === 'image' && fileData.preview ? (
                          <div className={formStyles.imagePreview}>
                            <img src={fileData.preview} alt={fileData.file.name} />
                          </div>
                        ) : (
                          <div className={formStyles.videoPreview}>
                            <video src={fileData.preview} />
                            <div className={formStyles.playIcon}>▶️</div>
                          </div>
                        )}
                        <div className={formStyles.fileInfo}>
                          <span className={formStyles.fileName}>{fileData.file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveNewFile(index, 'media')} 
                          className={formStyles.removeFileBtn}
                        >
                          🗑️ Batal Upload
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* New Document Upload */}
            <div className={formStyles.field}>
              <label>Tambah Dokumen (PDF / Word / Excel)</label>
              <input 
                ref={docInputRef}
                name="docFiles" 
                type="file" 
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className={formStyles.fileInput}
                onChange={(e) => handleFileChange(e, 'doc')}
              />
              {newDocFiles.length > 0 && (
                <div className={formStyles.filesContainer}>
                  <div className={formStyles.filesHeader}>
                    <span>{newDocFiles.length} dokumen dipilih</span>
                  </div>
                  <div className={formStyles.filesGrid}>
                    {newDocFiles.map((fileData, index) => (
                      <div key={index} className={formStyles.filePreviewCard}>
                        <div className={formStyles.documentPreview}>
                          <span className={formStyles.docIcon}>{fileData.icon}</span>
                          <span className={formStyles.docLabel}>{fileData.label}</span>
                        </div>
                        <div className={formStyles.fileInfo}>
                          <span className={formStyles.fileName}>{fileData.file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveNewFile(index, 'doc')} 
                          className={formStyles.removeFileBtn}
                        >
                          🗑️ Batal Upload
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {newMediaFiles.length + newDocFiles.length > 0 && (
              <div style={{marginTop: '1rem', textAlign: 'right', color: 'var(--text-muted)'}}>
                Total Ukuran Baru: {getTotalSize()}
              </div>
            )}

            <button disabled={loading} className={formStyles.button}>
              {loading ? 'Mengupdate...' : 'Update Kegiatan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

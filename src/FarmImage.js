/**
 * FarmImage.js — แสดงรูปฟาร์ม + อัปโหลด/ลบ (เมื่อ login แล้ว)
 */
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://map.surveywms.com/farm-api';

const FarmImage = ({ farmName, authToken }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // ดึงรูปฟาร์มจาก server
  const fetchImage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/images`);
      const images = await res.json();
      const match = images.find(img => img.farmName === farmName);
      setImageUrl(match ? `${API_URL}${match.url}` : null);
    } catch {
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  }, [farmName]);

  useEffect(() => {
    if (farmName) fetchImage();
  }, [farmName, fetchImage]);

  // อัปโหลดรูป
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/api/images/${encodeURIComponent(farmName)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'อัปโหลดไม่สำเร็จ');
        return;
      }
      setMessage('อัปโหลดสำเร็จ');
      await fetchImage();
    } catch {
      setMessage('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
      // ล้าง input เพื่อให้เลือกไฟล์เดิมซ้ำได้
      e.target.value = '';
    }
  };

  // ลบรูป
  const handleDelete = async () => {
    if (!window.confirm('ต้องการลบรูปภาพนี้หรือไม่?')) return;
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/images/${encodeURIComponent(farmName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'ลบไม่สำเร็จ');
        return;
      }
      setMessage('ลบรูปภาพสำเร็จ');
      setImageUrl(null);
    } catch {
      setMessage('เกิดข้อผิดพลาดในการลบ');
    }
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center', padding: 20, color: 'var(--c-text-secondary)',
        fontSize: 13,
      }}>
        กำลังโหลดรูปภาพ...
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 16, background: 'var(--c-bg-subtle)',
      borderRadius: 12, border: '1px solid var(--c-border)',
      overflow: 'hidden',
    }}>
      {/* หัวข้อ */}
      <div style={{
        padding: '10px 16px', fontWeight: 600, fontSize: 13,
        color: 'var(--c-text-secondary)', borderBottom: '1px solid var(--c-border-subtle)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <circle cx="4.5" cy="5.5" r="1.2" stroke="currentColor" strokeWidth="1" fill="none"/>
          <path d="M1 10l3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        รูปภาพฟาร์ม
      </div>

      {/* รูปภาพ */}
      {imageUrl ? (
        <div style={{ position: 'relative' }}>
          <img
            src={imageUrl}
            alt={farmName}
            style={{
              width: '100%', maxHeight: 240, objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* ปุ่มลบ (เฉพาะเมื่อ login) */}
          {authToken && (
            <button
              onClick={handleDelete}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(220,38,38,0.85)', color: '#fff',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Sarabun-Medium, sans-serif',
              }}
            >
              ลบรูป
            </button>
          )}
        </div>
      ) : (
        <div style={{
          padding: '24px 16px', textAlign: 'center',
          color: 'var(--c-text-secondary)', fontSize: 13,
        }}>
          {authToken ? 'ยังไม่มีรูปภาพ — อัปโหลดด้านล่าง' : 'ยังไม่มีรูปภาพ'}
        </div>
      )}

      {/* ปุ่มอัปโหลด (เฉพาะเมื่อ login) */}
      {authToken && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-border-subtle)' }}>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--c-accent-bg)', color: 'var(--c-accent-light)',
            padding: '8px 16px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
            border: '1px solid var(--c-accent-border)',
            opacity: uploading ? 0.7 : 1,
            fontFamily: 'Sarabun-Medium, sans-serif',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v9M4 4l3-3 3 3M2 10v2h10v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {uploading ? 'กำลังอัปโหลด...' : (imageUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป')}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          {message && (
            <span style={{
              marginLeft: 10, fontSize: 12, fontWeight: 500,
              color: message.includes('สำเร็จ') ? 'var(--c-green)' : '#dc2626',
            }}>
              {message}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmImage;

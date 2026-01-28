// src/components/AdminPanel.jsx
import React, { useState, useRef } from 'react';
import { createPost } from '../firebase/db';
import '../styles/AdminPanel.css';

export default function AdminPanel({ user, onBackClick }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '보드게임',
    hashtags: [],
  });

  const [images, setImages] = useState([]);
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ['보드게임', '향수', '칵테일', '음악', '영화', '기타'];

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === 'Enter' && hashtag.trim()) {
      e.preventDefault();
      if (!formData.hashtags.includes(hashtag.trim())) {
        setFormData({
          ...formData,
          hashtags: [...formData.hashtags, hashtag.trim()],
        });
      }
      setHashtag('');
    }
  };

  const removeHashtag = (index) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter((_, i) => i !== index),
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: event.target.result,
            link: '',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImageLink = (index, link) => {
    const updatedImages = [...images];
    updatedImages[index].link = link;
    setImages(updatedImages);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (images.length === 0) {
      alert('최소 1장의 이미지를 선택해주세요.');
      return;
    }

    if (images.length < 1 || images.length > 5) {
      alert('1~5장의 이미지를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        hashtags: formData.hashtags,
        createdBy: user.uid,
        views: 0,
      };

      await createPost(postData, images);
      alert('게시물이 성공적으로 등록되었습니다!');

      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        category: '보드게임',
        hashtags: [],
      });
      setImages([]);
      setHashtag('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시물 등록에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="back-btn" onClick={onBackClick}>
          ← 돌아가기
        </button>
        <h1>📝 게시물 관리</h1>
        <p>새로운 매거진 게시물을 등록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* 제목 */}
        <div className="form-group">
          <label>제목 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="게시물 제목 입력"
            required
          />
        </div>

        {/* 카테고리 */}
        <div className="form-group">
          <label>카테고리 *</label>
          <select
            value={formData.category}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 설명 */}
        <div className="form-group">
          <label>설명</label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="게시물 설명 입력 (선택사항)"
            rows="4"
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="form-group">
          <label>이미지 (1~5장) *</label>
          <div className="image-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 이미지 선택
            </button>
          </div>

          {images.length > 0 && (
            <div className="images-preview">
              <h3>선택된 이미지 ({images.length})</h3>
              {images.map((img, index) => (
                <div key={index} className="image-item">
                  <img src={img.preview} alt={`Preview ${index}`} />
                  <div className="image-info">
                    <p>이미지 {index + 1}</p>
                    <input
                      type="url"
                      placeholder="클릭 시 이동할 링크 (선택)"
                      value={img.link}
                      onChange={(e) => updateImageLink(index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 해시태그 */}
        <div className="form-group">
          <label>해시태그</label>
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            placeholder="해시태그 입력 후 Enter (예: #보드게임)"
          />
          {formData.hashtags.length > 0 && (
            <div className="hashtags-list">
              {formData.hashtags.map((tag, index) => (
                <span key={index} className="hashtag-chip">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(index)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? '등록 중...' : '게시물 등록'}
        </button>
      </form>
    </div>
  );
}

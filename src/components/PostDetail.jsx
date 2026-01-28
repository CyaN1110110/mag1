// src/components/PostDetail.jsx
import React from 'react';
import '../styles/PostDetail.css';

export default function PostDetail({ post, onBack, onImageClick }) {
  return (
    <div className="post-detail">
      <button className="back-btn" onClick={onBack}>
        ← 돌아가기
      </button>

      <div className="detail-container">
        <h1>{post.title}</h1>
        <p className="category">📌 {post.category}</p>

        {post.description && (
          <p className="description">{post.description}</p>
        )}

        {/* 이미지 갤러리 */}
        <div className="images-gallery">
          {post.images && post.images.map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => onImageClick(image.link)}
              style={{ cursor: image.link ? 'pointer' : 'default' }}
            >
              <img src={image.url} alt={`${post.title} - ${index}`} />
              {image.link && (
                <div className="image-link-indicator">
                  🔗 클릭하면 이동
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 해시태그 */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="detail-hashtags">
            <h3>태그</h3>
            <div className="hashtags-list">
              {post.hashtags.map((tag, i) => (
                <span key={i} className="hashtag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

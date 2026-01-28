// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getPosts, logActivity, checkIsAdmin } from '../firebase/db';
import PostDetail from './PostDetail';
import '../styles/Home.css';

export default function Home({ user, onAdminClick, onLogout }) {
  const [posts, setPosts] = useState([]); // 전체 게시물
  const [filteredPosts, setFilteredPosts] = useState([]); // 검색된 게시물
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 검색 상태 추가
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null); // 클릭된 해시태그 필터

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminStatus = await checkIsAdmin(user.uid);
        setIsAdmin(adminStatus);

        const allPosts = await getPosts();
        setPosts(allPosts);
        setFilteredPosts(allPosts); // 처음엔 모든 게시물 표시
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  // 검색 로직 (검색어 or 해시태그 변경 시 실행)
  useEffect(() => {
    let result = posts;

    // 1. 해시태그 필터링
    if (activeTag) {
      result = result.filter(post => 
        post.hashtags && post.hashtags.includes(activeTag)
      );
    }

    // 2. 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, activeTag, posts]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    
    // 검색 기록 저장 (너무 빈번하지 않게 디바운싱 필요하지만 일단 단순화)
    if (e.target.value.length > 2) {
      logActivity(user.uid, {
        action: 'search',
        query: e.target.value
      });
    }
  };

  const handleTagClick = (tag, e) => {
    e.stopPropagation(); // 카드 클릭 방지
    if (activeTag === tag) {
      setActiveTag(null); // 이미 선택된 태그면 해제
    } else {
      setActiveTag(tag); // 태그 선택
      setSearchQuery(''); // 태그 선택 시 검색어 초기화 (선택사항)
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    try {
      await logActivity(user.uid, {
        action: 'view_post',
        postId: post.id,
        postTitle: post.title,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        onImageClick={(link) => {
          if (link) {
            logActivity(user.uid, {
              action: 'click_image_link',
              postId: selectedPost.id,
              link: link,
            });
            window.open(link, '_blank');
          }
        }}
      />
    );
  }

  return (
    <div className="home">
      <header className="home-header">
        <div className="header-top">
          <h1>📖 매거진</h1>
          <div className="header-actions">
            {isAdmin && (
              <button className="icon-btn" onClick={onAdminClick} title="관리자 페이지">
                ⚙️
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
        
        {/* 검색창 영역 */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="관심있는 주제나 해시태그 검색..." 
              value={searchQuery}
              onChange={handleSearch}
            />
            {(searchQuery || activeTag) && (
              <button 
                className="clear-btn" 
                onClick={() => {
                  setSearchQuery('');
                  setActiveTag(null);
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          {activeTag && (
            <div className="active-filter-badge">
              #{activeTag} 필터 적용 중
              <button onClick={() => setActiveTag(null)}>✕</button>
            </div>
          )}
        </div>
      </header>

      <div className="home-container">
        {loading ? (
          <div className="loading">로드 중...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchQuery || activeTag 
                ? '검색 결과가 없습니다. 다른 단어로 검색해보세요!' 
                : '아직 게시물이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => handlePostClick(post)}
              >
                {post.images && post.images.length > 0 && (
                  <div className="post-image">
                    <img src={post.images[0].url} alt={post.title} />
                  </div>
                )}
                <div className="post-info">
                  <h3>{post.title}</h3>
                  <p className="category">📌 {post.category}</p>
                  
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="hashtags">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span 
                          key={i} 
                          className={`tag ${activeTag === tag ? 'active' : ''}`}
                          onClick={(e) => handleTagClick(tag, e)}
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="tag more">+{post.hashtags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

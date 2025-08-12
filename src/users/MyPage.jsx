import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from "./modal/ConfirmModal";
import PasswordModal from './modal/PasswordModal';
import MyPageCalendar from './components/MyPageCalendar';
import ProjectAnalytics from '../project/analytics/ProjectAnalytics';
import './MyPage.css';

// StudyCard와 BookmarkCard 컴포넌트
const StudyCard = ({
  groupId,
  category,
  groupName,
  groupIntroduction,
  groupOwnerId,
  ownerNickname,
  createdAt,
  maxMembers,
  studyMode,
  region,
  thumbnail,
  thumbnailFullPath,
  isSelected,
  onSelect,
}) => {
  const navigate = useNavigate();
  
  // GroupDetail과 동일한 썸네일 URL 처리 함수
  const getThumbnailUrl = () => {
    // 1순위: S3 전체 URL 사용 (thumbnailFullPath)
    if (thumbnailFullPath && !thumbnailFullPath.includes('default')) {
      console.log('S3 썸네일 URL 사용:', thumbnailFullPath);
      return thumbnailFullPath;
    }
    
    // 2순위: 기존 썸네일 필드 사용 (thumbnail)
    if (thumbnail && !thumbnail.includes('default')) {
      console.log('썸네일 필드 사용:', thumbnail);
      return thumbnail;
    }
    
    // 3순위: 기본 이미지
    console.log('기본 썸네일 이미지 사용');
    return '/images/default-thumbnail.png';
  };

  const handleClick = () => {
    navigate(`/group/${groupId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  return (
    <div
      className={`mypage-study-card-item ${isSelected ? 'mypage-card-selected' : ''}`}
      onClick={handleClick}
    >
      <div className="mypage-study-card-header">
        <div className="mypage-study-card-badges">
          <span className="mypage-study-card-badge mode">{studyMode || '모드 없음'}</span>
          <span className="mypage-study-card-badge location">{region || '지역 정보 없음'}</span>
          <span className="mypage-study-card-badge members">최대 {maxMembers || 0}명</span>
        </div>
        <div className="mypage-study-card-content">
          <div className="mypage-study-title-row">
            <p className="mypage-study-card-category">{category || '카테고리 없음'}</p>
            <h3 className="mypage-study-card-title">{groupName || '스터디명 없음'}</h3>
          </div>
          <p className="mypage-study-card-description">{groupIntroduction || '소개글이 없습니다.'}</p>
          <p className="mypage-study-card-owner">
            그룹장: {ownerNickname || '그룹장 정보 없음'}
          </p>
          <p className="mypage-study-card-date">생성일: {formatDate(createdAt)}</p>
        </div>
      </div>
      <div className="mypage-study-thumbnail-wrapper">
        <div className="mypage-study-thumbnail-image">
          <img
            src={getThumbnailUrl()}
            alt={`${groupName} 썸네일`}
            width="200"
            onError={(e) => { 
              console.log('이미지 로딩 실패, 기본 이미지로 변경');
              e.target.src = '/images/default-thumbnail.png'; 
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BookmarkCard = ({
  bookmarkId,
  groupId,
  category,
  groupName,
  groupIntroduction,
  groupOwnerId,
  ownerNickname,
  createdAt,
  maxMembers,
  studyMode,
  region,
  thumbnail,
  thumbnailFullPath,
  isSelected,
  onSelect,
}) => {
  const navigate = useNavigate();
  
  // 동일한 썸네일 URL 처리 함수
  const getThumbnailUrl = () => {
    if (thumbnailFullPath && !thumbnailFullPath.includes('default')) {
      return thumbnailFullPath;
    }
    
    if (thumbnail && !thumbnail.includes('default')) {
      return thumbnail;
    }
    
    return '/images/default-thumbnail.png';
  };

  const handleClick = () => {
    navigate(`/group/${groupId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  return (
    <div
      className={`mypage-study-card-item ${isSelected ? 'mypage-card-selected' : ''}`}
      onClick={handleClick}
    >
      <div className="mypage-study-card-header">
        <div className="mypage-study-card-badges">
          <span className="mypage-study-card-badge mode">{studyMode || '모드 없음'}</span>
          <span className="mypage-study-card-badge location">{region || '지역 정보 없음'}</span>
          <span className="mypage-study-card-badge members">최대 {maxMembers || 0}명</span>
        </div>
        <div className="mypage-study-card-content">
          <div className="mypage-study-title-row">
            <p className="mypage-study-card-category">{category || '카테고리 없음'}</p>
            <h3 className="mypage-study-card-title">{groupName || '스터디명 없음'}</h3>
          </div>
          <p className="mypage-study-card-description">{groupIntroduction || '소개글이 없습니다.'}</p>
          <p className="mypage-study-card-owner">
            그룹장: {ownerNickname || '그룹장 정보 없음'}
          </p>
          <p className="mypage-study-card-date">생성일: {formatDate(createdAt)}</p>
        </div>
      </div>
      <div className="mypage-study-thumbnail-wrapper">
        <div className="mypage-study-thumbnail-image">
          <img
            src={getThumbnailUrl()}
            alt={`${groupName} 썸네일`}
            width="200"
            onError={(e) => { 
              console.log('이미지 로딩 실패, 기본 이미지로 변경');
              e.target.src = '/images/default-thumbnail.png'; 
            }}
          />
        </div>
      </div>
    </div>
  );
};

function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const profileImageSrc = user?.profileImage ? 
    user.profileImage : 
    "/images/default-profile.png";

  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBookmarkCard, setSelectedBookmarkCard] = useState(null);
  const [myStudies, setMyStudies] = useState([]);
  const [studyLoading, setStudyLoading] = useState(true);
  const [studyError, setStudyError] = useState(null);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState(null);
  const [activeStudyFilter, setActiveStudyFilter] = useState('all');
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [studyCurrentPage, setStudyCurrentPage] = useState(0);
  const [bookmarkCurrentPage, setBookmarkCurrentPage] = useState(0);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const ITEMS_PER_PAGE = 3;

  const studyFilterOptions = [
    { key: 'all', label: '전체 스터디' },
    { key: 'owner', label: '내가 관리하는' },
    { key: 'participating', label: '참여중인' },
    { key: 'completed', label: '참여했던' }
  ];

  // 스터디 상세 페이지로 이동하는 핸들러
  const handleNavigateToStudy = (groupId) => {
    if (!groupId) {
      console.error('그룹 ID가 없습니다.');
      return;
    }
    navigate(`/group/${groupId}`);
  };

  const filterStudies = (filterType) => {
    let filtered = [];
    
    switch (filterType) {
      case 'all':
        filtered = myStudies;
        break;
      case 'owner':
        filtered = myStudies.filter(study => study.groupOwnerId === user?.id);
        break;
      case 'participating':
        filtered = myStudies.filter(study => 
          study.groupOwnerId !== user?.id && 
          (study.status === 'active' || !study.status)
        );
        break;
      case 'completed':
        filtered = myStudies.filter(study => study.status === 'completed');
        break;
      default:
        filtered = myStudies;
    }
    
    setFilteredStudies(filtered);
    setActiveStudyFilter(filterType);
    setStudyCurrentPage(0);
  };

  const getStudyPages = () => Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);
  const getBookmarkPages = () => Math.ceil(myBookmarks.length / ITEMS_PER_PAGE);

  const getCurrentStudyItems = () => {
    const start = studyCurrentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredStudies.slice(start, end);
  };

  const getCurrentBookmarkItems = () => {
    const start = bookmarkCurrentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return myBookmarks.slice(start, end);
  };

  const handleStudyPrevPage = () => {
    if (studyCurrentPage > 0) {
      setStudyCurrentPage(studyCurrentPage - 1);
    }
  };

  const handleStudyNextPage = () => {
    if (studyCurrentPage < getStudyPages() - 1) {
      setStudyCurrentPage(studyCurrentPage + 1);
    }
  };

  const handleBookmarkPrevPage = () => {
    if (bookmarkCurrentPage > 0) {
      setBookmarkCurrentPage(bookmarkCurrentPage - 1);
    }
  };

  const handleBookmarkNextPage = () => {
    if (bookmarkCurrentPage < getBookmarkPages() - 1) {
      setBookmarkCurrentPage(bookmarkCurrentPage + 1);
    }
  };

  const handleEditProfile = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmEdit = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(true);
    setPasswordError('');
  };

  const handleCancelEdit = () => {
    setShowConfirmModal(false);
  };

  const handlePasswordConfirm = async (password) => {
    setPasswordLoading(true);
    setPasswordError('');

    console.log('비밀번호 확인 시도:', { 
      password, 
      userId: user.userId, 
      userInfo: user 
    });

    try {
      const apiUrl = window.REACT_APP_API_URL || 'http://localhost:8081';
      console.log('API 호출 URL:', `${apiUrl}/api/user/verify-password`);
      
      const requestBody = {
        userId: user.userId,
        password: password
      };
      console.log('요청 본문:', requestBody);

      const response = await fetch(`${apiUrl}/api/user/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('응답 상태:', response.status, response.statusText);

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (response.ok && data.success) {
        console.log('비밀번호 확인 성공');
        setShowPasswordModal(false);
        navigate('/myedit');
      } else {
        console.log('비밀번호 확인 실패:', data);
        setPasswordError(data.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error);
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordError('');
  };

  const handleCardSelect = (id) => {
    setSelectedCard(selectedCard === id ? null : id);
  };

  const handleBookmarkCardSelect = (id) => {
    setSelectedBookmarkCard(selectedBookmarkCard === id ? null : id);
  };

  useEffect(() => {
    filterStudies(activeStudyFilter);
  }, [myStudies, user?.id]);

  useEffect(() => {
    const fetchMyActiveStudies = async () => {
      if (!isAuthenticated || !user?.id) {
        setStudyLoading(false);
        return;
      }

      try {
        setStudyLoading(true);
        setStudyError(null);

        const apiUrl = window.REACT_APP_API_URL || 'http://localhost:8081';
        const url = `${apiUrl}/api/study/user/${user.id}/active`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const sortedStudies = data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setMyStudies(sortedStudies);
        } else {
          throw new Error(data.message || '데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        setStudyError(`스터디 데이터를 불러올 수 없습니다: ${error.message}`);
        setMyStudies([]);
      } finally {
        setStudyLoading(false);
      }
    };

    fetchMyActiveStudies();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const fetchMyBookmarks = async () => {
      if (!isAuthenticated || !user?.id) {
        setBookmarkLoading(false);
        return;
      }

      try {
        setBookmarkLoading(true);
        setBookmarkError(null);

        const apiUrl = window.REACT_APP_API_URL || 'http://localhost:8081';
        const url = `${apiUrl}/api/bookmark/user/${user.id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const sortedBookmarks = data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setMyBookmarks(sortedBookmarks);
        } else {
          throw new Error(data.message || '북마크 데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        setBookmarkError(`북마크 데이터를 불러올 수 없습니다: ${error.message}`);
        setMyBookmarks([]);
      } finally {
        setBookmarkLoading(false);
      }
    };

    fetchMyBookmarks();
  }, [isAuthenticated, user?.id]);

  if (isLoading) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mypage-container">
        <div className="mypage-error">로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-top-background"></div>

      <div className="mypage-main-content">
        <div className="mypage-profile-section">
          <div className="mypage-profile-image-wrapper">
            <div className="mypage-profile-image">
              <img 
                src={profileImageSrc} 
                alt="프로필" 
                onError={(e) => {
                  e.target.src = "/images/default-profile.png";
                }}
              />
            </div>
          </div>
          <div className="mypage-profile-info">
            <h1 className="mypage-profile-name">
              {user.nickname || user.userId}
            </h1>
            <button className="mypage-edit-profile-btn" onClick={handleEditProfile}>
              프로필 수정
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 통계와 캘린더를 나란히 배치 */}
        <div className="mypage-section-card">
          <div className="mypage-analytics-calendar-wrapper">
            <div className="mypage-analytics-section">
              <div className="mypage-analytics-content">
                {/* 통계 컨텐츠는 추후 개발 예정 */}
                <div className="mypage-analytics-placeholder">
                  통계 데이터가 여기에 표시됩니다.
                </div>
              </div>
            </div>
            <div className="mypage-calendar-section">
              <div className="mypage-calendar-wrapper">
                <MyPageCalendar myStudies={myStudies} userId={user?.id} />
              </div>
            </div>
          </div>
        </div>

        <div className="mypage-categories-grid">
          <div className="mypage-category-card">
            <div className="mypage-category-header">
              <span className="mypage-chevron-down">▼</span>
              <span className="mypage-category-title">To-Do's</span>
            </div>
            <div className="mypage-category-items">
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
            </div>
          </div>

          <div className="mypage-category-card">
            <div className="mypage-category-header">
              <span className="mypage-chevron-down">▼</span>
              <span className="mypage-category-title">Daily Habits</span>
            </div>
            <div className="mypage-category-items">
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
            </div>
          </div>

          <div className="mypage-category-card">
            <div className="mypage-category-header">
              <span className="mypage-chevron-down">▼</span>
              <span className="mypage-category-title">Achievement</span>
            </div>
            <div className="mypage-category-items">
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
              <div className="mypage-category-item">Achievement Targets</div>
            </div>
          </div>
        </div>

        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <div className="mypage-section-header-top">
              <h3 className="mypage-section-title">스터디</h3>
              
              {filteredStudies.length > 0 && (
                <div className="mypage-header-pagination">
                  <button 
                    className={`mypage-header-pagination-btn prev ${studyCurrentPage === 0 ? 'disabled' : ''}`}
                    onClick={handleStudyPrevPage}
                    disabled={studyCurrentPage === 0}
                  >
                    <span className="header-arrow-icon">‹</span>
                  </button>
                  <button 
                    className={`mypage-header-pagination-btn next ${studyCurrentPage >= getStudyPages() - 1 ? 'disabled' : ''}`}
                    onClick={handleStudyNextPage}
                    disabled={studyCurrentPage >= getStudyPages() - 1}
                  >
                    <span className="header-arrow-icon">›</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="mypage-study-filter-tabs">
              {studyFilterOptions.map(option => (
                <button
                  key={option.key}
                  className={`mypage-filter-tab ${activeStudyFilter === option.key ? 'active' : ''}`}
                  onClick={() => filterStudies(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mypage-studies-section-wrapper">
            {studyLoading ? (
              <div className="mypage-study-loading">
                스터디 목록을 불러오는 중...
              </div>
            ) : studyError ? (
              <div className="mypage-study-error">
                <p>오류: {studyError}</p>
              </div>
            ) : filteredStudies.length === 0 ? (
              <div className="mypage-study-empty">
                {activeStudyFilter === 'all' && '현재 참여 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'owner' && '관리 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'participating' && '참여 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'completed' && '참여했던 스터디가 없습니다.'}
              </div>
            ) : (
              <>
                <div className="mypage-studies-cards-container">
                  {getCurrentStudyItems().map((study) => (
                    <StudyCard
                      key={`study-${study.groupId}-${study.groupName || 'unknown'}`}
                      groupId={study.groupId}
                      category={study.category}
                      groupName={study.groupName}
                      groupIntroduction={study.groupIntroduction}
                      groupOwnerId={study.groupOwnerId}
                      ownerNickname={study.ownerNickname}
                      createdAt={study.createdAt}
                      maxMembers={study.maxMembers}
                      studyMode={study.studyMode}
                      region={study.region}
                      thumbnail={study.thumbnail}
                      thumbnailFullPath={study.thumbnailFullPath}
                      isSelected={selectedCard === study.groupId}
                      onSelect={handleCardSelect}
                    />
                  ))}
                </div>

                <div className="mypage-page-indicator">
                  {getStudyPages() > 1 && (
                    <span>
                      {studyCurrentPage + 1} / {getStudyPages()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <div className="mypage-section-header-top">
              <h3 className="mypage-section-title">북마크</h3>
              
              {myBookmarks.length > 0 && (
                <div className="mypage-header-pagination">
                  <button 
                    className={`mypage-header-pagination-btn prev ${bookmarkCurrentPage === 0 ? 'disabled' : ''}`}
                    onClick={handleBookmarkPrevPage}
                    disabled={bookmarkCurrentPage === 0}
                  >
                    <span className="header-arrow-icon">‹</span>
                  </button>
                  <button 
                    className={`mypage-header-pagination-btn next ${bookmarkCurrentPage >= getBookmarkPages() - 1 ? 'disabled' : ''}`}
                    onClick={handleBookmarkNextPage}
                    disabled={bookmarkCurrentPage >= getBookmarkPages() - 1}
                  >
                    <span className="header-arrow-icon">›</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mypage-studies-section-wrapper">
            {bookmarkLoading ? (
              <div className="mypage-study-loading">
                북마크 목록을 불러오는 중...
              </div>
            ) : bookmarkError ? (
              <div className="mypage-study-error">
                <p>오류: {bookmarkError}</p>
              </div>
            ) : myBookmarks.length === 0 ? (
              <div className="mypage-study-empty">
                현재 북마크한 스터디가 없습니다.
              </div>
            ) : (
              <>
                <div className="mypage-studies-cards-container">
                  {getCurrentBookmarkItems().map((bookmark) => (
                    <BookmarkCard
                      key={`bookmark-${bookmark.id}-${bookmark.groupId}`}
                      bookmarkId={bookmark.id}
                      groupId={bookmark.groupId}
                      category={bookmark.category}
                      groupName={bookmark.groupName}
                      groupIntroduction={bookmark.groupIntroduction}
                      groupOwnerId={bookmark.groupOwnerId}
                      ownerNickname={bookmark.ownerNickname}
                      createdAt={bookmark.studyCreatedAt || bookmark.createdAt}
                      maxMembers={bookmark.maxMembers}
                      studyMode={bookmark.studyMode}
                      region={bookmark.region}
                      thumbnail={bookmark.thumbnail}
                      thumbnailFullPath={bookmark.thumbnailFullPath}
                      isSelected={selectedBookmarkCard === bookmark.id}
                      onSelect={handleBookmarkCardSelect}
                    />
                  ))}
                </div>

                <div className="mypage-page-indicator">
                  {getBookmarkPages() > 1 && (
                    <span>
                      {bookmarkCurrentPage + 1} / {getBookmarkPages()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onCancel={handleCancelEdit}
        onConfirm={handleConfirmEdit}
        type="editProfileSimple"
        userName={user?.nickname || user?.userId}
        profileImage={profileImageSrc}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onCancel={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        loading={passwordLoading}
        error={passwordError}
      />
    </div>
  );
}

export default MyPage;
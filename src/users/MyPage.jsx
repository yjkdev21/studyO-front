import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MyPage.css';

// StudyCard와 BookmarkCard 컴포넌트는 기존과 동일하므로 생략...
const StudyCard = ({
  groupId,
  category,
  groupName,
  groupIntroduction,
  groupOwnerId,
  createdAt,
  maxMembers,
  studyMode,
  region,
  contact,
  thumbnail,
  isSelected,
  onSelect,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(groupId);
    }
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
          <p className="mypage-study-card-owner">그룹장: {groupOwnerId || '그룹장 정보 없음'}</p>
          <p className="mypage-study-card-date">생성일: {formatDate(createdAt)}</p>
        </div>
      </div>
      {thumbnail && (
        <div className="mypage-study-thumbnail-wrapper">
          <div className="mypage-study-thumbnail-image">
            <img
              src={thumbnail}
              alt={`${groupName} 썸네일`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
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
  createdAt,
  maxMembers,
  studyMode,
  region,
  contact,
  thumbnail,
  isSelected,
  onSelect,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(bookmarkId);
    }
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
          <p className="mypage-study-card-owner">그룹장: {groupOwnerId || '그룹장 정보 없음'}</p>
          <p className="mypage-study-card-date">생성일: {formatDate(createdAt)}</p>
        </div>
      </div>
      {thumbnail && (
        <div className="mypage-study-thumbnail-wrapper">
          <div className="mypage-study-thumbnail-image">
            <img
              src={thumbnail}
              alt={`${groupName} 썸네일`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const profileImageSrc = user?.profileImage ? 
    user.profileImage : 
    "/images/default-profile.png";

  // 기존 상태들
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBookmarkCard, setSelectedBookmarkCard] = useState(null);
  const [myStudies, setMyStudies] = useState([]);
  const [studyLoading, setStudyLoading] = useState(true);
  const [studyError, setStudyError] = useState(null);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState(null);

  // 새로 추가된 스터디 필터 상태들
  const [activeStudyFilter, setActiveStudyFilter] = useState('all');
  const [filteredStudies, setFilteredStudies] = useState([]);

  // 스터디 필터 옵션들
  const studyFilterOptions = [
    { key: 'all', label: '전체 스터디' },
    { key: 'owner', label: '내가 관리하는' },
    { key: 'participating', label: '참여중인' },
    { key: 'completed', label: '참여했던' }
  ];

  // 스터디 필터링 함수
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
          (study.status === 'active' || !study.status) // status가 없으면 active로 가정
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
  };

  // 스터디 데이터가 변경될 때마다 필터링 업데이트
  useEffect(() => {
    filterStudies(activeStudyFilter);
  }, [myStudies, user?.id]);

  // 기존 useEffect들 (스터디 및 북마크 데이터 fetch)
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

        if (response.status === 403) {
          throw new Error('서버 접근 권한이 없습니다. CORS 설정을 확인해주세요.');
        }

        if (response.status === 404) {
          throw new Error('API 엔드포인트를 찾을 수 없습니다.');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('서버에서 올바른 JSON 응답을 받지 못했습니다.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('스터디 데이터:', data);

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
        console.error('스터디 데이터 조회 실패:', error);
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

        if (response.status === 403) {
          throw new Error('서버 접근 권한이 없습니다. CORS 설정을 확인해주세요.');
        }

        if (response.status === 404) {
          throw new Error('북마크 API 엔드포인트를 찾을 수 없습니다.');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('서버에서 올바른 JSON 응답을 받지 못했습니다.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('북마크 데이터:', data);

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
        console.error('북마크 데이터 조회 실패:', error);
        setBookmarkError(`북마크 데이터를 불러올 수 없습니다: ${error.message}`);
        setMyBookmarks([]);
      } finally {
        setBookmarkLoading(false);
      }
    };

    fetchMyBookmarks();
  }, [isAuthenticated, user?.id]);

  // 기존 핸들러 함수들
  const handleEditProfile = () => {
    navigate('/myedit');
  };

  const handleCardSelect = (id) => {
    setSelectedCard(selectedCard === id ? null : id);
  };

  const handleBookmarkCardSelect = (id) => {
    setSelectedBookmarkCard(selectedBookmarkCard === id ? null : id);
  };

  // 각 필터별 카운트 계산 함수 - 더 이상 사용하지 않음
  // const getFilterCount = (filterType) => {
  //   switch (filterType) {
  //     case 'all':
  //       return myStudies.length;
  //     case 'owner':
  //       return myStudies.filter(study => study.groupOwnerId === user?.id).length;
  //     case 'participating':
  //       return myStudies.filter(study => 
  //         study.groupOwnerId !== user?.id && 
  //         (study.status === 'active' || !study.status)
  //       ).length;
  //     case 'completed':
  //       return myStudies.filter(study => study.status === 'completed').length;
  //     default:
  //       return 0;
  //   }
  // };

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
        {/* 프로필 섹션 */}
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
            </button>
          </div>
        </div>

        {/* 할 일/습관/업적 섹션 */}
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

        {/* 스터디 섹션 - 필터 탭 추가됨 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <h3 className="mypage-section-title">스터디</h3>
            
            {/* 스터디 필터 탭 */}
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

          <div className="mypage-studies-cards-container">
            {studyLoading ? (
              <div className="mypage-study-loading">
                스터디 목록을 불러오는 중...
              </div>
            ) : studyError ? (
              <div className="mypage-study-error">
                <p>오류: {studyError}</p>
                <small>API 서버가 실행 중인지, 엔드포인트가 올바른지 확인해주세요.</small>
              </div>
            ) : filteredStudies.length === 0 ? (
              <div className="mypage-study-empty">
                {activeStudyFilter === 'all' && '현재 참여 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'owner' && '관리 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'participating' && '참여 중인 스터디가 없습니다.'}
                {activeStudyFilter === 'completed' && '참여했던 스터디가 없습니다.'}
              </div>
            ) : (
              filteredStudies.map((study) => (
                <StudyCard
                  key={`study-${study.groupId}-${study.groupName || 'unknown'}`}
                  groupId={study.groupId}
                  category={study.category}
                  groupName={study.groupName}
                  groupIntroduction={study.groupIntroduction}
                  groupOwnerId={study.groupOwnerId}
                  createdAt={study.createdAt}
                  maxMembers={study.maxMembers}
                  studyMode={study.studyMode}
                  region={study.region}
                  contact={study.contact}
                  thumbnail={study.thumbnail}
                  isSelected={selectedCard === study.groupId}
                  onSelect={handleCardSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* 북마크 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <h3 className="mypage-section-title">북마크</h3>
          </div>

          <div className="mypage-studies-cards-container">
            {bookmarkLoading ? (
              <div className="mypage-study-loading">
                북마크 목록을 불러오는 중...
              </div>
            ) : bookmarkError ? (
              <div className="mypage-study-error">
                <p>오류: {bookmarkError}</p>
                <small>API 서버가 실행 중인지, 북마크 엔드포인트가 올바른지 확인해주세요.</small>
              </div>
            ) : myBookmarks.length === 0 ? (
              <div className="mypage-study-empty">
                현재 북마크한 스터디가 없습니다.
              </div>
            ) : (
              myBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={`bookmark-${bookmark.id}-${bookmark.groupId}`}
                  bookmarkId={bookmark.id}
                  groupId={bookmark.groupId}
                  category={bookmark.category}
                  groupName={bookmark.groupName}
                  groupIntroduction={bookmark.groupIntroduction}
                  groupOwnerId={bookmark.groupOwnerId}
                  createdAt={bookmark.studyCreatedAt || bookmark.createdAt}
                  maxMembers={bookmark.maxMembers}
                  studyMode={bookmark.studyMode}
                  region={bookmark.region}
                  contact={bookmark.contact}
                  thumbnail={bookmark.thumbnail}
                  isSelected={selectedBookmarkCard === bookmark.id}
                  onSelect={handleBookmarkCardSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
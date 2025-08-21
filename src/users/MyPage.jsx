import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from "./modal/ConfirmModal";
import PasswordModal from './modal/PasswordModal';
import MyPageCalendar from './components/MyPageCalendar';
import axios from 'axios';
import './MyPage.css';

// 스터디 카드 컴포넌트
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

  // 썸네일 이미지 우선순위: S3 URL > 기본 썸네일 > 기본 이미지
  const getThumbnailUrl = () => {
    if (thumbnailFullPath && !thumbnailFullPath.includes('default')) {
      return thumbnailFullPath;
    }
    if (thumbnail && !thumbnail.includes('default')) {
      return thumbnail;
    }
    return '/images/default-thumbnail.png';
  };

  // 스터디 상세 페이지 이동
  const handleClick = () => {
    navigate(`/group/${groupId}`);
  };

  // 날짜 한국어 형식 포맷팅
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
        {/* 스터디 정보 뱃지 */}
        <div className="mypage-study-card-badges">
          <span className="mypage-study-card-badge mode">{studyMode || '모드 없음'}</span>
          <span className="mypage-study-card-badge location">{region || '지역 정보 없음'}</span>
          <span className="mypage-study-card-badge members">최대 {maxMembers || 0}명</span>
        </div>

        {/* 스터디 상세 정보 */}
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

      {/* 스터디 썸네일 */}
      <div className="mypage-study-thumbnail-wrapper">
        <div className="mypage-study-thumbnail-image">
          <img
            src={getThumbnailUrl()}
            alt={`${groupName} 썸네일`}
            width="200"
            onError={(e) => {
              e.target.src = '/images/default-thumbnail.png';
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 북마크 카드 컴포넌트

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

  // 썸네일 이미지 우선순위 설정
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
  const { user, isAuthenticated, isLoading, deleteAccount } = useAuth();
  const defaultProfileImageSrc = "/images/default-profile.png";

  // 프로필 상태
  const [profileImage, setProfileImage] = useState(null);
  const [displayUser, setDisplayUser] = useState(null);

  // 카드 선택 상태
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBookmarkCard, setSelectedBookmarkCard] = useState(null);

  // 스터디 상태
  const [myStudies, setMyStudies] = useState([]);
  const [studyLoading, setStudyLoading] = useState(true);
  const [studyError, setStudyError] = useState(null);

  // 북마크 상태
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState(null);

  // 필터링 및 페이지네이션 상태
  const [activeStudyFilter, setActiveStudyFilter] = useState('all');
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [studyCurrentPage, setStudyCurrentPage] = useState(0);
  const [bookmarkCurrentPage, setBookmarkCurrentPage] = useState(0);

  // 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const ITEMS_PER_PAGE = 3;

  // 스터디 필터 옵션
  const studyFilterOptions = [
    { key: 'all', label: '전체 스터디' },
    { key: 'owner', label: '내가 관리하는' },
    { key: 'participating', label: '참여중인' },
    { key: 'completed', label: '참여했던' }
  ];

  // 서버에서 사용자 프로필 정보 로드
  const loadUserProfileFromServer = async () => {
    if (!user?.id) return;

    try {
      const apiUrl = import.meta.env.VITE_AWS_API_HOST;
      const response = await axios.get(`${apiUrl}/api/user/${user.id}`, {
        withCredentials: true,
        timeout: 10000
      });

      if (response.status === 200 && response.data.success) {
        const serverUser = response.data.data;
        const imageToSet = serverUser.profileImageFullPath || defaultProfileImageSrc;
        setProfileImage(imageToSet);

        const updatedUser = {
          ...user,
          ...serverUser,
          profileImage: serverUser.profileImageFullPath || defaultProfileImageSrc
        };
        setDisplayUser(updatedUser);
      } else {
        fallbackToLocalUser();
      }
    } catch (error) {
      fallbackToLocalUser();
    }
  };

  // 서버 로딩 실패 시 로컬 user 데이터 사용
  const fallbackToLocalUser = () => {
    const imageToSet = (user.profileImage && user.profileImage.startsWith('http'))
      ? user.profileImage
      : defaultProfileImageSrc;

    setProfileImage(imageToSet);
    setDisplayUser(user);
  };

  // 이미지 로딩 실패 시 기본 이미지로 대체
  const handleImageError = (e) => {
    e.target.src = defaultProfileImageSrc;
  };

  // 스터디 상세 페이지 이동
  const handleNavigateToStudy = (groupId) => {
    if (!groupId) return;
    navigate(`/group/${groupId}`);
  };

  // 필터 타입에 따라 스터디 목록 필터링
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

  // 페이지 수 계산
  const getStudyPages = () => Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);
  const getBookmarkPages = () => Math.ceil(myBookmarks.length / ITEMS_PER_PAGE);

  // 현재 페이지 아이템 조회
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

  // 페이지네이션 핸들러
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

  // 프로필 수정 시작 - 확인 모달 표시
  const handleEditProfile = () => {
    setShowConfirmModal(true);
  };

  // 프로필 수정 확인 - 비밀번호 모달 표시
  const handleConfirmEdit = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(true);
    setPasswordError('');
  };

  const handleCancelEdit = () => {
    setShowConfirmModal(false);
  };

  // 비밀번호 확인 후 프로필 수정 페이지 이동
  const handlePasswordConfirm = async (password) => {
    setPasswordLoading(true);
    setPasswordError('');

    try {
      const apiUrl = import.meta.env.VITE_AWS_API_HOST;
      const requestBody = {
        userId: user.userId,
        password: password
      };

      const response = await axios.post(`${apiUrl}/api/user/verify-password`, requestBody, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (response.status === 200 && response.data.success) {
        setShowPasswordModal(false);
        navigate('/myedit');
      } else {
        setPasswordError(response.data.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setPasswordError(error.response.data.message || '비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordError('');
  };

  // 카드 선택 핸들러
  const handleCardSelect = (id) => {
    setSelectedCard(selectedCard === id ? null : id);
  };

  const handleBookmarkCardSelect = (id) => {
    setSelectedBookmarkCard(selectedBookmarkCard === id ? null : id);
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    const result = await deleteAccount();

    if (result.success) {
      window.location.href = "/login";
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // 컴포넌트 마운트 시 사용자 프로필 로드
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserProfileFromServer();
    }
  }, [user, isAuthenticated]);

  // 스터디 필터 변경 시 필터링 실행
  useEffect(() => {
    filterStudies(activeStudyFilter);
  }, [myStudies, user?.id]);

  // 사용자의 활성 스터디 목록 조회
  useEffect(() => {
    const fetchMyActiveStudies = async () => {
      if (!isAuthenticated || !user?.id) {
        setStudyLoading(false);
        return;
      }

      try {
        setStudyLoading(true);
        setStudyError(null);

        const apiUrl = import.meta.env.VITE_AWS_API_HOST;
        const response = await axios.get(`${apiUrl}/api/study/user/${user.id}/active`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
          // 최신순 정렬
          const sortedStudies = response.data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setMyStudies(sortedStudies);
        } else {
          throw new Error(response.data.message || '데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '스터디 데이터를 불러올 수 없습니다.';
        setStudyError(`스터디 데이터를 불러올 수 없습니다: ${errorMessage}`);
        setMyStudies([]);
      } finally {
        setStudyLoading(false);
      }
    };

    fetchMyActiveStudies();
  }, [isAuthenticated, user?.id]);

  // 사용자의 북마크 목록 조회
  useEffect(() => {
    const fetchMyBookmarks = async () => {
      if (!isAuthenticated || !user?.id) {
        setBookmarkLoading(false);
        return;
      }

      try {
        setBookmarkLoading(true);
        setBookmarkError(null);

        const apiUrl = import.meta.env.VITE_AWS_API_HOST;
        const response = await axios.get(`${apiUrl}/api/bookmark/user/${user.id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
          // 최신순 정렬
          const sortedBookmarks = response.data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setMyBookmarks(sortedBookmarks);
        } else {
          throw new Error(response.data.message || '북마크 데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '북마크 데이터를 불러올 수 없습니다.';
        setBookmarkError(`북마크 데이터를 불러올 수 없습니다: ${errorMessage}`);
        setMyBookmarks([]);
      } finally {
        setBookmarkLoading(false);
      }
    };

    fetchMyBookmarks();
  }, [isAuthenticated, user?.id]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">로딩 중...</div>
      </div>
    );
  }

  // 인증되지 않은 사용자
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
                src={profileImage || defaultProfileImageSrc}
                alt="프로필"
                onError={handleImageError}
              />
            </div>
          </div>
          <div className="mypage-profile-info">
            <h1 className="mypage-profile-name">
              {displayUser?.nickname || displayUser?.userId || user?.nickname || user?.userId}
            </h1>
            <button className="mypage-edit-profile-btn" onClick={handleEditProfile}>
              프로필 수정
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* 통계와 캘린더 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-analytics-calendar-wrapper">
            <div className="mypage-analytics-section">
              <div className="mypage-analytics-content">
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

        {/* 카테고리 그리드 섹션 */}
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

        {/* 스터디 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <div className="mypage-section-header-top">
              <h3 className="mypage-section-title">스터디</h3>

              {/* 페이지네이션 버튼 */}
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

            {/* 필터 탭 */}
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

          {/* 스터디 목록 */}
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
                {/* 스터디 카드 목록 */}
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

                {/* 페이지 인디케이터 */}
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

        {/* 북마크 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <div className="mypage-section-header-top">
              <h3 className="mypage-section-title">북마크</h3>

              {/* 페이지네이션 버튼 */}
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

          {/* 북마크 목록 */}
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
                {/* 북마크 카드 목록 */}
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

                {/* 페이지 인디케이터 */}
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

        {/* 회원탈퇴 버튼 */}
        <div className="mypage-section-card flex justify-end">
          <button
            type="button"
            className="!border user-leave-btn"
            onClick={handleDeleteAccount}
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 프로필 수정 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onCancel={handleCancelEdit}
        onConfirm={handleConfirmEdit}
        type="editProfileSimple"
        userName={displayUser?.nickname || displayUser?.userId || user?.nickname || user?.userId}
        profileImage={profileImage || defaultProfileImageSrc}
      />

      {/* 비밀번호 입력 모달 */}
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
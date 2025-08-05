import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MyPage.css';

/**
 * 스터디 카드 UI 컴포넌트
 * - 각 스터디의 정보를 카드 형태로 표시
 * - 클릭 시 선택 상태를 부모 컴포넌트로 전달
 */
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
  /**
   * 카드 클릭 이벤트 핸들러
   * - 부모 컴포넌트의 onSelect 함수를 호출하여 선택 상태 변경
   */
  const handleClick = () => {
    if (onSelect) {
      onSelect(groupId); // 카드 클릭 시 부모로 선택 상태 전달
    }
  };

  /**
   * 날짜를 한국어 형식으로 변환하는 함수
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} - YYYY.MM.DD 형식의 한국어 날짜
   */
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

  // 오프라인 스터디 여부 체크 (현재는 사용되지 않음)
  const isOffline = studyMode === '오프라인' || studyMode === '온오프';

  return (
    <div
      className={`study-card ${isSelected ? 'selected' : ''}`} // 선택 상태에 따라 클래스 추가
      onClick={handleClick}
    >
      <div className="study-card-header">
        {/* 스터디 태그 영역 (모드, 지역, 멤버 수) */}
        <div className="study-tags">
          <span className="tag mode">{studyMode || '모드 없음'}</span>
          <span className="tag location">{region || '지역 정보 없음'}</span>
          <span className="tag members">최대 {maxMembers || 0}명</span>
        </div>
        {/* 스터디 상세 정보 영역 */}
        <div className="study-card-body">
          <p className="study-category">{category || '카테고리 없음'}</p>
          <h3 className="study-name">{groupName || '스터디명 없음'}</h3>
          <p className="study-description">{groupIntroduction || '소개글이 없습니다.'}</p>
          <p className="study-author">스터디 모드: {studyMode || '모드 없음'}</p>
          <p className="study-due-date">생성일: {formatDate(createdAt)}</p>
          {/* 연락처가 있을 때만 표시 */}
          {contact && <p className="study-contact">연락처: {contact}</p>}
        </div>
      </div>
      {/* 썸네일 이미지가 있을 때만 표시 */}
      {thumbnail && (
        <div className="study-thumbnail-container">
          <div className="study-thumbnail">
            <img
              src={thumbnail}
              alt={`${groupName} 썸네일`}
              onError={(e) => {
                e.target.style.display = 'none'; // 이미지 로드 실패 시 숨김 처리
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 북마크 카드 UI 컴포넌트
 * - StudyCard와 거의 동일하지만 북마크 ID를 사용
 * - 북마크한 스터디들을 표시할 때 사용
 */
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
  /**
   * 북마크 카드 클릭 이벤트 핸들러
   * - StudyCard와 달리 bookmarkId를 사용
   */
  const handleClick = () => {
    if (onSelect) {
      onSelect(bookmarkId); // 북마크 ID로 선택 상태 전달
    }
  };

  // 날짜 포맷팅 함수 (StudyCard와 동일)
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

  const isOffline = studyMode === '오프라인' || studyMode === '온오프';

  // JSX 구조는 StudyCard와 동일
  return (
    <div
      className={`study-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="study-card-header">
        <div className="study-tags">
          <span className="tag mode">{studyMode || '모드 없음'}</span>
          <span className="tag location">{region || '지역 정보 없음'}</span>
          <span className="tag members">최대 {maxMembers || 0}명</span>
        </div>
        <div className="study-card-body">
          <p className="study-category">{category || '카테고리 없음'}</p>
          <h3 className="study-name">{groupName || '스터디명 없음'}</h3>
          <p className="study-description">{groupIntroduction || '소개글이 없습니다.'}</p>
          <p className="study-author">스터디 모드: {studyMode || '모드 없음'}</p>
          <p className="study-due-date">생성일: {formatDate(createdAt)}</p>
          {contact && <p className="study-contact">연락처: {contact}</p>}
        </div>
      </div>
      {thumbnail && (
        <div className="study-thumbnail-container">
          <div className="study-thumbnail">
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

/**
 * 마이페이지 메인 컴포넌트
 * - 사용자 프로필 정보 표시
 * - 참여 중인 스터디 목록 표시
 * - 북마크한 스터디 목록 표시
 */
function MyPage() {
  // React Router의 navigate 훅 - 페이지 이동용
  const navigate = useNavigate();
  
  // 인증 컨텍스트에서 사용자 정보와 인증 상태 가져오기
  const { user, isAuthenticated, isLoading } = useAuth();

  // === 상태 관리 ===
  
  // 선택된 카드들의 ID를 관리하는 state
  const [selectedCard, setSelectedCard] = useState(null); // 선택된 스터디 카드 ID
  const [selectedBookmarkCard, setSelectedBookmarkCard] = useState(null); // 선택된 북마크 카드 ID
  
  // 스터디 관련 상태들
  const [myStudies, setMyStudies] = useState([]); // 참여 중인 스터디 목록
  const [studyLoading, setStudyLoading] = useState(true); // 스터디 로딩 상태
  const [studyError, setStudyError] = useState(null); // 스터디 에러 메시지

  // 북마크 관련 상태들
  const [myBookmarks, setMyBookmarks] = useState([]); // 북마크 목록
  const [bookmarkLoading, setBookmarkLoading] = useState(true); // 북마크 로딩 상태
  const [bookmarkError, setBookmarkError] = useState(null); // 북마크 에러 메시지

  /**
   * 참여 중인 스터디 목록을 서버에서 가져오는 useEffect
   * - 사용자 인증 상태와 사용자 ID가 있을 때만 실행
   * - 컴포넌트 마운트 시와 인증 상태 변경 시 실행
   */
  useEffect(() => {
    const fetchMyActiveStudies = async () => {
      // 인증되지 않았거나 사용자 ID가 없으면 로딩 종료
      if (!isAuthenticated || !user?.id) {
        setStudyLoading(false);
        return;
      }

      try {
        // 로딩 시작 및 에러 초기화
        setStudyLoading(true);
        setStudyError(null);

        // API URL 설정 (환경변수 또는 기본값)
        const apiUrl = window.REACT_APP_API_URL || 'http://localhost:8081';
        const url = `${apiUrl}/api/study/user/${user.id}/active`;

        // 서버에 스터디 목록 요청
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
        });

        // HTTP 상태 코드별 에러 처리
        if (response.status === 403) {
          throw new Error('서버 접근 권한이 없습니다. CORS 설정을 확인해주세요.');
        }

        if (response.status === 404) {
          throw new Error('API 엔드포인트를 찾을 수 없습니다.');
        }

        // 응답 헤더 확인 - JSON 형태인지 체크
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('서버에서 올바른 JSON 응답을 받지 못했습니다.');
        }

        // HTTP 상태가 성공이 아닌 경우
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 응답 데이터 파싱
        const data = await response.json();

        console.log('스터디 데이터:', data); // 디버깅용 로그

        // 데이터 구조 검증 및 처리
        if (data.success && Array.isArray(data.data)) {
          // 최신 순으로 정렬 (생성일 기준 내림차순)
          const sortedStudies = data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // 최신이 먼저 오도록
          });

          setMyStudies(sortedStudies);
        } else {
          throw new Error(data.message || '데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        // 에러 로깅 및 사용자에게 표시할 에러 메시지 설정
        console.error('스터디 데이터 조회 실패:', error);
        setStudyError(`스터디 데이터를 불러올 수 없습니다: ${error.message}`);
        setMyStudies([]); // 에러 시 빈 배열로 초기화
      } finally {
        // 성공/실패 관계없이 로딩 상태 해제
        setStudyLoading(false);
      }
    };

    fetchMyActiveStudies();
  }, [isAuthenticated, user?.id]); // 의존성 배열: 인증 상태와 사용자 ID 변경 시 재실행

  /**
   * 북마크 목록을 서버에서 가져오는 useEffect
   * - 스터디 목록 가져오기와 비슷한 로직
   */
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
        const url = `${apiUrl}/api/bookmark/user/${user.id}`; // 북마크 전용 엔드포인트

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

        console.log('북마크 데이터:', data); // 디버깅용

        if (data.success && Array.isArray(data.data)) {
          // 북마크 추가일 기준 최신 순 정렬
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

  /**
   * 프로필 수정 버튼 클릭 핸들러
   * - 프로필 수정 페이지로 이동
   */
  const handleEditProfile = () => {
    navigate('/myedit'); // React Router를 통한 페이지 이동
  };

  /**
   * 스터디 카드 선택 핸들러
   * - 토글 방식: 같은 카드 클릭 시 선택 해제, 다른 카드 클릭 시 해당 카드 선택
   */
  const handleCardSelect = (id) => {
    setSelectedCard(selectedCard === id ? null : id); // 토글 방식 선택
  };

  /**
   * 북마크 카드 선택 핸들러
   * - 스터디 카드와 동일한 토글 로직
   */
  const handleBookmarkCardSelect = (id) => {
    setSelectedBookmarkCard(selectedBookmarkCard === id ? null : id);
  };

  // === 조건부 렌더링 ===

  // 인증 정보 로딩 중일 때
  if (isLoading) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 사용자일 때
  if (!isAuthenticated) {
    return (
      <div className="mypage-container">
        <div className="mypage-error">로그인이 필요합니다.</div>
      </div>
    );
  }

  // === 메인 JSX 렌더링 ===
  return (
    <div className="mypage-container">
      {/* 상단 회색 배경 */}
      <div className="mypage-top-background"></div>

      <div className="mypage-main-content">
        {/* 프로필 정보 섹션 */}
        <div className="mypage-profile-section">
          {/* 프로필 이미지 영역 */}
          <div className="mypage-profile-image-wrapper">
            <div className="mypage-profile-image">
              {user.profileImage && (
                <img src={user.profileImage} alt="프로필" />
              )}
            </div>
          </div>
          {/* 프로필 정보 및 수정 버튼 */}
          <div className="mypage-profile-info">
            <h1 className="mypage-profile-name">
              {user.nickname || user.userId} {/* 닉네임이 없으면 사용자 ID 표시 */}
            </h1>
            <button className="mypage-edit-profile-btn" onClick={handleEditProfile}>
              프로필 수정
            </button>
          </div>
        </div>

        {/* 할 일/습관/업적 섹션 - 현재는 정적 데이터 */}
        <div className="mypage-categories-grid">
          <div className="mypage-category-card">
            <div className="mypage-category-header">
              <span className="mypage-chevron-down">▼</span>
              <span className="mypage-category-title">To-Do's</span>
            </div>
            <div className="mypage-category-items">
              {/* 임시 데이터 - 추후 동적 데이터로 교체 예정 */}
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

        {/* 참여 중인 스터디 목록 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <h3 className="mypage-section-title">스터디</h3>
            <span className="mypage-chevron-right">&gt;</span>
          </div>

          <div className="mypage-study-cards-container">
            {/* 조건부 렌더링: 로딩/에러/빈 상태/데이터 표시 */}
            {studyLoading ? (
              // 로딩 중 표시
              <div className="mypage-study-loading">
                스터디 목록을 불러오는 중...
              </div>
            ) : studyError ? (
              // 에러 발생 시 표시
              <div className="mypage-study-error">
                <p>오류: {studyError}</p>
                <small>API 서버가 실행 중인지, 엔드포인트가 올바른지 확인해주세요.</small>
              </div>
            ) : myStudies.length === 0 ? (
              // 데이터가 없을 때 표시
              <div className="mypage-study-empty">
                현재 참여 중인 스터디가 없습니다.
              </div>
            ) : (
              // 데이터가 있을 때 스터디 카드들 렌더링
              myStudies.map((study) => (
                <StudyCard
                  // key는 각 카드를 고유하게 식별하기 위함
                  key={`study-${study.groupId}-${study.groupName || 'unknown'}`}
                  // 스터디 데이터를 props로 전달
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
                  // 선택 상태 관련 props
                  isSelected={selectedCard === study.groupId}
                  onSelect={handleCardSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* 북마크한 스터디 목록 섹션 */}
        <div className="mypage-section-card">
          <div className="mypage-section-header">
            <h3 className="mypage-section-title">북마크</h3>
            <span className="mypage-chevron-right">&gt;</span>
          </div>

          <div className="mypage-study-cards-container">
            {/* 북마크 목록도 동일한 조건부 렌더링 패턴 */}
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
              // 북마크 데이터가 있을 때 북마크 카드들 렌더링
              myBookmarks.map((bookmark) => (
                <BookmarkCard
                  // 북마크는 고유한 북마크 ID와 그룹 ID를 모두 사용
                  key={`bookmark-${bookmark.id}-${bookmark.groupId}`}
                  bookmarkId={bookmark.id} // 북마크 고유 ID
                  groupId={bookmark.groupId} // 스터디 그룹 ID
                  category={bookmark.category}
                  groupName={bookmark.groupName}
                  groupIntroduction={bookmark.groupIntroduction}
                  groupOwnerId={bookmark.groupOwnerId}
                  // 북마크의 경우 스터디 생성일 또는 북마크 생성일 사용
                  createdAt={bookmark.studyCreatedAt || bookmark.createdAt}
                  maxMembers={bookmark.maxMembers}
                  studyMode={bookmark.studyMode}
                  region={bookmark.region}
                  contact={bookmark.contact}
                  thumbnail={bookmark.thumbnail}
                  // 북마크 선택 상태 관리
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
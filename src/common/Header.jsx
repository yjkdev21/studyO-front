import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from 'axios';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // 프로필 이미지 상태 추가
  const [profileImage, setProfileImage] = useState(null);
  const [displayUser, setDisplayUser] = useState(null);
  const defaultProfileImageSrc = "/images/default-profile.png";

  const categories = [
    "전체",
    "IT",
    "자격증",
    "언어",
    "전공",
    "취업/면접",
    "취미",
    "기타",
  ];
  const isSearchPage = location.pathname === "/search";
  const selectedCategory = isSearchPage ? location.state?.category : null;

  // 관리자 권한 체크 함수
  const isAdmin = () => {
    if (!user) return false;
    
    // GLOBAL_ROLE 필드로 관리자 권한 확인
    return user.globalRole === 'ADMIN' || 
          user.global_role === 'ADMIN' ||
          user.GLOBAL_ROLE === 'ADMIN' ||
          displayUser?.globalRole === 'ADMIN' ||
          displayUser?.global_role === 'ADMIN' ||
          displayUser?.GLOBAL_ROLE === 'ADMIN';
  };

  // 서버에서 사용자 프로필 정보 로딩
  const loadUserProfileFromServer = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`http://localhost:8081/api/user/${user.id}`, {
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
      console.error('Header 프로필 로딩 실패:', error);
      fallbackToLocalUser();
    }
  };

  // 서버 로딩 실패 시 로컬 user 데이터 사용
  const fallbackToLocalUser = () => {
    const imageToSet = (user?.profileImage && user.profileImage.startsWith('http')) 
      ? user.profileImage 
      : defaultProfileImageSrc;
    
    setProfileImage(imageToSet);
    setDisplayUser(user);
  };

  const handleImageError = (e) => {
    e.target.src = defaultProfileImageSrc;
  };

  // 컴포넌트 마운트 시 사용자 프로필 전체 로딩
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserProfileFromServer();
    }
  }, [user, isAuthenticated]);

  // 프로필 업데이트 이벤트 리스너 추가
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user && isAuthenticated) {
        loadUserProfileFromServer();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user, isAuthenticated]);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  // 프로필 이미지 경로 - 서버에서 가져온 최신 이미지 사용
  const imageSrc = profileImage || defaultProfileImageSrc;

  // 로그아웃 핸들
  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    window.location.href = "/";

    const result = await logout();
    alert(result.message);
  };

  return (
    <>
      <header>
        <div id="header" className="border-b border-[#eee]">
          <div className="relative !px-3 max-w-7xl !m-auto w-full h-[80px] flex items-center">
            {/* 헤더 왼쪽: 로고 & 카테고리 */}
            <div className="header-nav flex items-center">
              {/* 로고 */}
              <h1 className="header-logo">
                <Link to="/">
                  <img src="/images/logo.svg" alt="logo" className="block" />
                </Link>
              </h1>
              {/* 모바일 메뉴 버튼 */}
              <button
                type="button"
                className="header-mobile-btn"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <span className="material-symbols-rounded !text-3xl">
                  keyboard_arrow_down
                </span>
              </button>
              {/* 카테고리 */}
              <ul className={`header-category flex ${isMenuOpen ? "" : "on"}`}>
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      to="/search"
                      state={{ category: cat }}
                      className={
                        isSearchPage && selectedCategory === cat ? "active" : ""
                      }
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 헤더 오른쪽: 회원 메뉴 */}
            <div className="header-info !ml-auto">
              {isAuthenticated ? (
                <ul className="flex items-center !space-x-[30px]">
                  <li>
                    <Link
                      to="/groupCreate"
                      className="header-study-btn text-sm"
                    >
                      스터디 생성
                    </Link>
                  </li>
                    {isAdmin() && (
                      <li>
                        <Link
                          to="/admin/admindashboard/adminboard"
                          className="header-study-btn text-sm"
                        >
                            관리자
                        </Link>
                      </li>
                    )}
                  <li>
                    <button
                      type="button"
                      className="header-profile-btn block w-[40px] h-[40px] !rounded-[100%] overflow-hidden"
                      onClick={() => setOpen((prev) => !prev)}
                    >
                      <img 
                        src={imageSrc} 
                        alt="프로필이미지" 
                        onError={handleImageError}
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    </button>
                    {open && (
                      <div className="header-dropmenu absolute top-[70px] right-3 !p-3 border border-[#eee] rounded-lg bg-white z-50">
                        <ul className="min-w-[120px] !space-y-4 text-sm">
                          <li>
                            <Link to="study/dashboard/dashboardList">
                              대시보드
                            </Link>
                          </li>
                          <li>
                            <Link to="/myPage">마이페이지</Link>
                          </li>
                          <li>
                            <Link to="/myHistory">내 북마크</Link>
                          </li>
                          <li>
                            <button type="button" onClick={handleLogout}>
                              로그아웃
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                </ul>
              ) : (
                <ul className="flex md:!space-x-[30px] !space-x-0">
                  <li className="login">
                    <Link to="/login">로그인</Link>
                  </li>
                  <li className="join">
                    <Link to="/join">회원가입</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
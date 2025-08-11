import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  // 프로필 이미지 경로
  const imageSrc = user?.profileImage
    ? user?.profileImage
    : "/images/default-profile.png";

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
                  <li>
                    <button
                      type="button"
                      className="header-profile-btn block w-[40px] !rounded-[100%] overflow-hidden"
                      onClick={() => setOpen((prev) => !prev)}
                    >
                      <img src={imageSrc} alt="프로필이미지" />
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

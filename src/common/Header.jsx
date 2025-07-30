<<<<<<< HEAD
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
=======
import { Link, useLocation, useNavigate } from "react-router-dom";
>>>>>>> obama

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => { 
    const result = await logout();
    console.log(result.message);
  }

  return (
<<<<<<< HEAD
    <header id="header" className="border-b border-[#eee]">
      <div className="px-3 max-w-7xl m-auto w-full h-[80px] flex items-center">
        <h1 className="header-logo mb-0 mr-[30px]">
          <Link to="/">
            <img src="/images/logo.svg" alt="logo" className="block" />
          </Link>
        </h1>
        <ul className="header-category flex !space-x-[30px]">
          <li><Link to="/">전체</Link></li>
          <li><Link to="/">IT</Link></li>
          <li><Link to="/">자격증</Link></li>
          <li><Link to="/">언어</Link></li>
          <li><Link to="/">전공</Link></li>
          <li><Link to="/">취업/면접</Link></li>
          <li><Link to="/">취미</Link></li>
          <li><Link to="/">기타</Link></li>
        </ul>
        <div className="header-info !ml-auto">
          {isAuthenticated ?
            (
              <ul className="flex !space-x-[30px]">
                <li><span>{user?.nickname || user?.userId}님</span></li>
                <li><button type="button" onClick={handleLogout}>로그아웃</button></li>
                <li><Link to="/myPage">마이페이지</Link></li>
              </ul>
            ) :
            (
              <ul className="flex !space-x-[30px]">
                <li><Link to="/login">로그인</Link></li>
                <li><Link to="/join">회원가입</Link></li>
              </ul>
            )}
        </div>
      </div >
=======
    <header style={{ border: "1px solid", padding: "10px" }}>
      <Link to="/" style={{ border: "1px solid" }}>
        <img src="../assets/logo.svg" alt="logo" />
        홈페이지
      </Link>
      <Link to="/join" style={{ border: "1px solid" }}>
        회원가입
      </Link>
      <Link to="/login" style={{ border: "1px solid" }}>
        로그인
      </Link>
>>>>>>> obama
    </header>
  );
}

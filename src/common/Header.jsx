import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  return (
    <header style={{border: "1px solid", padding:"10px"}}>
      <Link to="/" style={{border: "1px solid"}}>
        <img src="../assets/logo.svg" alt="logo" />홈페이지
      </Link>
      <Link to="/join" style={{border: "1px solid"}}>회원가입</Link>
      <Link to="/login"style={{border: "1px solid"}}>로그인</Link>
      <Link to="/groupCreate" style={{ border: "1px solid" }}>스터디 생성</Link>
      <Link to="/groupUpdate" style={{ border: "1px solid" }}>스터디 생성</Link>
    </header>
  );
}
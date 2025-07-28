import { Border } from "react-bootstrap-icons";

export default function Header() {
  return (
    <header style={{border: "1px solid", padding:"10px"}}>
      <a href="/" style={{border: "1px solid"}}>
        <img src="../assets/logo.svg" alt="logo" />홈페이지
      </a>
      <a href="./join" style={{border: "1px solid"}}>회원가입</a>
      <a href="./login" style={{border: "1px solid"}}>로그인</a>
    </header>
  );
}
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#eee] text-[#666]">
      <div className="footer-content !px-3 max-w-7xl !m-auto w-full flex">
        <h2 className="w-[80px]">
          <Link to="/">
            <img src="/images/logo-black.svg" alt="logo" className="block opacity-20" />
          </Link>
        </h2>
        <span className="text-sm tracking-wide">서울 종로구 우정국로2길 21 9층 | 대표전화: 02-1234-5678 | 이메일: info@company.com</span>
        <span className="text-sm tracking-wide">ⓒ 2025 스터디오.</span>
      </div>

    </footer>
  );
}

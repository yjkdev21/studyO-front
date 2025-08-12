import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main id="home-page">
      <div className="main-center">
        {/* 메인 배너 */}
        <div className="main-banner relative">
          {/* 배너 컨텐츠 */}
          <div className="banner-content">
            {/* 배너 텍스트 */}
            <div className="banner-text flex flex-col">
              <h2 className="font-bold tracking-wider">
                <span className="block !mb-2">모든 스터디의</span>
                <span className="block !mb-2">시작</span>
              </h2>
              <img
                src="/images/logo-black.svg"
                alt="Studyo"
                className="block"
              />
            </div>
            {/* 배너 버튼 */}
            <div className="main-banner-btn">
              <Link to="/groupCreate" className="shadow-btn">스터디 시작하기 <span>→</span></Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

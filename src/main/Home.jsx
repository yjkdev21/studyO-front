import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main id="home-page">
      <div className="main-center">
        {/* 추후 삭제 -- 시작 */}
        <div className="absolute top-1 left-1 z-10">
          <Link to="/sample/5" className="border bg-gray-300 block">
            Go to Sample 5
          </Link>
          <Link to="/study/postMain" className="border bg-gray-300 block">
            Go Promotion List
          </Link>
          <Link to="/groupCreate" className="border bg-gray-300 block">
            스터디그룹생성
          </Link>
          <br />
          <br />
        </div>
        {/* 추후 삭제 -- 끝 */}
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
              <Link to="/groupCreate" className="shadow-btn">
                스터디 시작하기 <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

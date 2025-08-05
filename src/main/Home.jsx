import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main id="home-page">
      <div className="main-center">
        <div className="absolute top-23 left-1 space-y-1 z-10">
          <Link to="/sample/5" className="border bg-gray-300 block">Go to Sample 5</Link>
          <Link to="/study/promotion/list" className="border bg-gray-300 block">Go Promotion List</Link>
          <Link to="/groupCreate" className="border bg-gray-300 block">스터디그룹생성</Link>
          <Link to="/groupList" className="border bg-gray-300 block">스터디그룹리스트</Link>
          <br /><br />
        </div>
        {/* 메인 배너 */}
        <div className="main-banner relative">
          {/* 배너 컨텐츠 */}
          <div className="banner-content">
            {/* 배너 텍스트 */}
            <div className="banner-text flex flex-col">
              <h2 className="font-bold tracking-wider">
                <span className="block mb-2">모든 스터디의</span>
                <span className="block mb-2">시작</span>
              </h2>
              <img src="/images/logo-black.svg" alt="Studyo" className="block" />
            </div>
            {/* 배너 버튼 */}
            <div className="mt-40">
              <button type="button" className="shadow-btn"><Link to="/">스터디 시작하기 →</Link></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

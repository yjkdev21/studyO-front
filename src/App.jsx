import "./App.css";
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./common/Header";
import Footer from "./common/Footer";
import Home from "./main/Home";

import Search from "./main/Search";

import Join from "./users/Join";
import Login from "./users/Login";
import MyPage from "./users/MyPage";
import MyEdit from "./users/MyEdit";
import FindId from "./users/FindId";
import FindPw from "./users/FindPw";
import MyHistory from "./users/MyHistory";

import GroupDetail from "./study/group/GroupDetail";
import GroupCreate from "./study/group/GroupCreate";
import GroupUpdate from "./study/group/GroupUpdate";

import DashboardList from "./study/dashboard/DashboardList";
import StudyDashboardWrapper from "./study/dashboard/StudyDashboardWrapper";
import StudyMain from "./study/dashboard/StudyMain";
import StudyMember from "./study/dashboard/StudyMember";
import StudyCalendar from "./study/dashboard/StudyCalendar";

import ProjectList from "./study/dashboard/ProjectList";

import ProjectCreate from "./project/ProjectCreate";
import ProjectUpdate from "./project/ProjectUpdate";

import ProjectMain from "./project/dashboard/ProjectMain";
import ProjectMember from "./project/dashboard/ProjectMember";
import ProjectCalendar from "./project/dashboard/ProjectCalendar";

import NotFoundPage from "./common/NotFoundPage";
import { AuthProvider } from "./contexts/AuthContext";
import StudySidebar from "./study/components/StudySidebar";
import StudyPostMain from "./study/post/StudyPostMain";

import ProtectedRoute from "./common/auth/ProtectedRoute";
import StudyPromotion from "./study/post/StudyPromotion";

import AdminSidebar from "./admin/component/AdminSidebar";

function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  const hideHeaderPaths = [
    "/admin"
  ]

  // Header 숨길 경로 설정
  const shouldHideHeader =
  hideHeaderPaths.includes(location.pathname) ||
  /^\/admin(\/.*)?$/.test(location.pathname);

  const hideFooterPaths = [
    "/login",
    "/join",
    "/findId",
    "/findPw",
    "/groupCreate",
    "/promotion/create",
    "/study/dashboard/dashboardList",
    "/admin/component/adminSidebar"
  ];

  // Footer를 숨길 경로 설정
  const shouldHideFooter =
    hideFooterPaths.includes(location.pathname) || // 고정 경로는 includes()로 체크
    /^\/groupUpdate\/\d+$/.test(location.pathname) || // /groupUpdate/숫자 → 그룹 수정
    /^\/promotion\/edit\/\d+$/.test(location.pathname) || // /promotion/edit/숫자 → 홍보글 수정
    /^\/study\/\d+\/dashboard$/.test(location.pathname); // 대시보드 화면

  return (
    <div>
      <AuthProvider>
        {!shouldHideHeader && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />

          {/* 로그인이 필요한 페이지 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/findId" element={<FindId />} />
            <Route path="/findPw" element={<FindPw />} />
            <Route path="/myHistory" element={<MyHistory />} />

            <Route path="/myPage" element={<MyPage />} />
            <Route path="/myEdit" element={<MyEdit />} />

            <Route path="/groupCreate" element={<GroupCreate />} />
            <Route path="/groupUpdate/:groupId" element={<GroupUpdate />} />
            <Route path="/study/postMain" element={<StudyPostMain />} />
            <Route
              path="/study/postView/:groupId"
              element={<StudyPromotion />}
            />

            <Route
              path="/study/dashboard/DashboardList"
              element={<DashboardList />}
            />
            <Route path="/study/:groupId/dashboard" element={<StudyDashboardWrapper />}>
              <Route index element={<StudyMain />} />
              <Route path="member" element={<StudyMember />} />
              <Route path="calendar" element={<StudyCalendar />} />
              <Route path="project" element={<ProjectList />} />
            </Route>
            {/* <Route path="/study/:groupId" element={<StudyMain />} /> */}
            <Route path="/study/:groupId/member" element={<StudyMember />} />
            <Route path="/project/:studyId/list" element={<ProjectList />} />
            <Route path="/project/create" element={<ProjectCreate />} />

            <Route
              path="/project/:projectId/update"
              element={<ProjectUpdate />}
            />

            <Route path="/project/:projectId" element={<ProjectMain />} />
            <Route
              path="/project/:projectId/member"
              element={<ProjectMember />}
            />
            <Route
              path="/project/:projectId/calendar"
              element={<ProjectCalendar />}
            />
          </Route>

          <Route path="/search" element={<Search />} />

          <Route path="/group/:groupId" element={<GroupDetail />} />

          <Route
            path="/study/components/studySidebar"
            element={<StudySidebar />}
          />

          {/* amdin */}
          <Route
            path="/admin/component/adminSidebar"
            element={<AdminSidebar />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!shouldHideFooter && <Footer />}
      </AuthProvider>
    </div>
  );
}

export default App;

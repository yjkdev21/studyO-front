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
import MyStudy from "./users/MyStudy";

import StudyList from "./study/StudyList";

import GroupDetail from "./study/group/GroupDetail";
import GroupList from "./study/group/GroupList";
import GroupCreate from "./study/group/GroupCreate";
import GroupUpdate from "./study/group/GroupUpdate";
import DashboardList from "./study/dashboard/DashboardList";
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
import PromotionView from "./study/promotion/PromotionView";
import PromotionList from "./study/promotion/PromotionList";
import PromotionPost from "./study/promotion/PromotionPost";
import PromotionEdit from "./study/promotion/PromotionEdit";
// import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./contexts/AuthContext";
import StudySidebar from "./study/components/StudySidebar";
import StudyPostMain from "./study/post/StudyPostMain";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/myPage" element={<MyPage />} />
          <Route path="/myEdit" element={<MyEdit />} />
          <Route path="/findId" element={<FindId />} />
          <Route path="/findPw" element={<FindPw />} />
          <Route path="/myHistory" element={<MyHistory />} />
          <Route path="/myStudy" element={<MyStudy />} />
          <Route path="/search" element={<Search />} />

          <Route path="/groupList" element={<GroupList />} />
          <Route path="/group/:groupId" element={<GroupDetail />} />
          <Route path="/groupCreate" element={<GroupCreate />} />
          <Route path="/groupUpdate/:groupId" element={<GroupUpdate />} />
          <Route path="/study/postMain/:userId" element={<StudyPostMain />} />

          <Route
            path="/study/dashboard/DashboardList"
            element={<DashboardList />}
          />
          <Route path="/study/:studyId" element={<StudyMain />} />
          <Route path="/study/:studyId/member" element={<StudyMember />} />
          <Route path="/study/:studyId/calendar" element={<StudyCalendar />} />

          <Route
            path="/study/dashboard/studyCalendar"
            element={<StudyCalendar />}
          />
          <Route
            path="/study/components/studySidebar"
            element={<StudySidebar />}
          />
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </div>
  );
}

export default App;

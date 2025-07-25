import "./App.css";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./main/Home";
import Search from "./main/Search";

import Header from "./common/Header";
import Footer from "./common/Footer";

import Join from "./users/Join";
import Login from "./users/Login";
import MyPage from "./users/MyPage";
import MyEdit from "./users/MyEdit";
import FindId from "./users/FindId";
import FindPw from "./users/FindPw";
import MyHistory from "./users/MyHistory";

import StudyList from "./study/StudyList";

import GroupCreate from "./study/group/GroupCreate";
import GroupUpdate from "./study/group/GroupUpdate";

import PostCreate from "./study/post/PostCreate";
import PostUpdate from "./study/post/PostUpdate";
import StudyPost from "./study/post/StudyPost";

import StudyMain from "./study/dashboard/StudyMain";
import StudyMember from "./study/dashboard/StudyMember";
import StudyCalender from "./study/dashboard/StudyCalender";

import ProjectList from "./study/dashboard/ProjectList";

import ProjectCreate from "./project/ProjectCreate";
import ProjectUpdate from "./project/ProjectUpdate";

import ProjectMain from "./project/dashboard/ProjectMain";
import ProjectMember from "./project/dashboard/ProjectMember";
import ProjectCalender from "./project/dashboard/ProjectCalender";

import { AuthProvider } from "./contexts/AuthContext";
import NotFoundPage from "./common/NotFoundPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div>
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
          <Route path="/search" element={<Search />} />

          <Route path="/groupCreate" element={<GroupCreate />} />
          <Route path="/groupUpdate" element={<GroupUpdate />} />

          <Route path="/postCreate" element={<PostCreate />} />
          <Route path="/postUpdate" element={<PostUpdate />} />
          <Route path="/studyPost" element={<StudyPost />} />
          <Route path="/studyList" element={<StudyList />} />

          <Route path="/study/:studyId" element={<StudyMain />} />
          <Route path="/study/:studyId/member" element={<StudyMember />} />
          <Route path="/study/:studyId/calender" element={<StudyCalender />} />
          <Route path="/project/:studyId/list" element={<ProjectList />} />

          <Route path="/project/create" element={<ProjectCreate />} />
          <Route path="/project/:projectId/update" element={<ProjectUpdate />} />

          <Route path="/project/:projectId" element={<ProjectMain />} />
          <Route path="/project/:projectId/member" element={<ProjectMember />} />
          <Route path="/project/:projectId/calender" element={<ProjectCalender />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

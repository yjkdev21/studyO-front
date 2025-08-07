// StudyMainPageWrapper.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudySidebar from '../components/StudySidebar';

import StudyMain from './StudyMain'; // 대시보드 메인 화면
import StudyCalendar from './StudyCalendar'; // 캘린더
import StudyMember from './StudyMember'; // 멤버 페이지
import ProjectList from './ProjectList'; // 프로젝트
import './StudyDashboardWrapper.css';

export default function StudyMainPageWrapper() {
  const { groupId } = useParams();
  const [currentTab, setCurrentTab] = useState('dashboard'); // 기본 탭

  // 탭에 따라 다른 컴포넌트 렌더링
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <StudyMain />;
      case 'member':
        return <StudyMember />;
      case 'calendar':
        return <StudyCalendar />;
      case 'project':
        return <ProjectList />;
      default:
        return <StudyMain />;
    }
  };

  return (
    <div className="study-layout-wrapper">
      <StudySidebar
        groupId={groupId}
        initialTab={currentTab}
        onMenuClick={(tabId) => setCurrentTab(tabId)}
      />
      <div className="main-scrollable-area">
        {renderTabContent()}
      </div>
    </div>
  );
}

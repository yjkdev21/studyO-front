import React from 'react';
import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import StudySidebar from '../components/StudySidebar';
import { StudyProvider } from '../../contexts/StudyContext';

import './StudyDashboardWrapper.css';

export default function StudyMainPageWrapper() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에서 어떤 탭인지 추출
  const currentPath = location.pathname;
  let currentTab = 'dashboard';

  if (currentPath.includes('/member')) currentTab = 'member';
  else if (currentPath.includes('/calendar')) currentTab = 'calendar';
  else if (currentPath.includes('/project')) currentTab = 'project';

  const handleMenuClick = (tabId) => {
    if (tabId === 'dashboard') {
      navigate(`/study/${groupId}/dashboard`);
    } else {
      navigate(`/study/${groupId}/dashboard/${tabId}`);
    }
  };

  return (
    <StudyProvider groupId={groupId}>
      <div className="study-layout-wrapper">
        <StudySidebar
          groupId={groupId}
          initialTab={currentTab}
          onMenuClick={handleMenuClick}
        />
        <div className="main-scrollable-area">
          <Outlet />
        </div>
      </div>
    </StudyProvider>
  );
}

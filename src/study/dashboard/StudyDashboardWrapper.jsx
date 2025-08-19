import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import StudySidebar from '../components/StudySidebar';
import { useAuth } from '../../contexts/AuthContext';
import { StudyProvider } from '../../contexts/StudyContext';

import './StudyDashboardWrapper.css';

export default function StudyMainPageWrapper() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const host = import.meta.env.VITE_AWS_API_HOST;

  const [accessAllowed, setAccessAllowed] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
  // 사이드바 collapsed 상태 변경 핸들러
  const handleSidebarCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const checkAccess = async () => {
    try {
      const { data } = await axios.get(`${host}/api/study-dashboard/${groupId}/dashboard-info`, {
        headers: { 'X-USER-ID': user.id }
      });
      setAccessAllowed(data.success);
    } catch (err) {
      console.error('접근 확인 실패:', err);
      setAccessAllowed(false);
    }
  };

  useEffect(() => {
    if (user && groupId) {
      checkAccess();
    }
  }, [user, groupId]);

  useEffect(() => {
    if (accessAllowed === false) {
      const goToAdPage = window.confirm('이 스터디에 가입되어 있지 않습니다.\n스터디 모집 글로 이동하시겠습니까?');
      if (goToAdPage) {
        navigate(`/study/postView/${groupId}`);
      } else {
        navigate('/');
      }
    }
  }, [accessAllowed]);

  if (accessAllowed === null) return <p>접근 권한 확인 중...</p>;

  return (
    <StudyProvider groupId={groupId}>
      <div className={`study-layout-wrapper ${!isSidebarCollapsed ? 'on' : ''}`}>
        <StudySidebar
          groupId={groupId}
          initialTab={currentTab}
          onMenuClick={handleMenuClick}
          onCollapseChange={handleSidebarCollapse}
        />
        <div className="main-scrollable-area">
          <Outlet />
        </div>
      </div>
    </StudyProvider>
  );
}
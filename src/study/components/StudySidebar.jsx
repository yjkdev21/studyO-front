import React, { useState, useEffect } from 'react';
import './StudySidebar.css';
import { useStudy } from '../../contexts/StudyContext';


export default function StudySidebar({
  initialTab = '', //기본 활성화 탭
  onMenuClick,
  onCollapseChange
}) {

  // StudyContext에서 필요한 데이터만 가져오기
  const { studyInfo, isLoading: loading } = useStudy();

  // 사이드 바 접기, 펼치기
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 현재 활성 탭 상태를 컴포넌트 내부에서 관리
  const [currentTab, setCurrentTab] = useState(initialTab || 'dashboard');

  // 사이드 바 메뉴
  const menuItems = [
    { id: 'main', label: '대시보드' },
    { id: 'member', label: '멤버' },
    { id: 'calendar', label: '캘린더' },
    { id: 'project', label: '프로젝트' }
  ];

  //메뉴 클릭 처리 함수
  const handleMenuClick = (tabId) => {
    setCurrentTab(tabId);

    if (onMenuClick) {
      onMenuClick(tabId);
    }
  };

  //사이드바 토글
  const toggle = () => {
    setIsCollapsed(!isCollapsed); // 현재 상태의 반대로 변경
  };

  // collapsed 상태 부모에게 전달 
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange])

  return (
    <div id={'sidebar-wrap'} className={` ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 메인 사이드바 */}
      <div className={`study-sidebar`}>
        {/* 스터디 정보 */}
        <div className='study-info'>
          <p className='sidebar-category'>
            {loading ? '로딩 중...' : (studyInfo?.category || '카테고리')}
          </p>
          <p className='sidebar-group-name'>
            {loading ? '로딩 중...' : (studyInfo?.groupName || studyInfo?.name || '스터디이름')}
          </p>
          <p className='sidebar-contact'>
            {loading ? '로딩 중...' : (studyInfo?.contact || '연락방법')}
          </p>
        </div>
        {/* 대시보드 메뉴 */}
        <ul className='sidebar-study-menu'>
          <li className={`menu-tab dashboard-tab ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}>
            대시보드
          </li>
          <li className={`menu-tab member-tab ${currentTab === 'member' ? 'active' : ''}`}
            onClick={() => handleMenuClick('member')}>
            멤버
          </li>
          <li className={`menu-tab calendar-tab ${currentTab === 'calendar' ? 'active' : ''}`}
            onClick={() => handleMenuClick('calendar')}>
            캘린더
          </li>
          <li className={`menu-tab project-tab ${currentTab === 'project' ? 'active' : ''}`}
            onClick={() => handleMenuClick('project')}>
            프로젝트
          </li>
        </ul>
      </div>
      {/* 토글 */}
      <div className='sidebar-toggle'>
        <button onClick={toggle} className='toggle-button' aria-label="사이드바 토글">
          <div className='toggle-bars'>
            <div className='bar'></div>
            <div className='bar'></div>
            <div className='bar'></div>
          </div>
        </button>
      </div>
    </div>
  );
}
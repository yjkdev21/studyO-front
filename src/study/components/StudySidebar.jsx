import React, { useEffect, useState } from 'react';
import './StudySideBar.css';
import { studySidebarApi } from '../components/StusySidebarApi';


export default function StudySidebar({
  studyId,
  initialTab = 'dashboard', //기본 활성화 탭
  onMenuClick
}) {

  // 스터디 정보 저장
  const [studyInfo, setStudyInfo] = useState({
    category: '',
    name: '',
    contact: '' // 다 빈 문자열로 저장
  })

  // 사이드 바 접기, 펼치기
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 현재 활성 탭 상태를 컴포넌트 내부에서 관리
  const [currentTab, setCurrentTab] = useState(initialTab);

  // API 로딩 상태 관리
  const [loading, setLoading] = useState(true);

  // 사이드 바 메뉴
  const menuItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'member', label: '멤버' },
    { id: 'calendar', label: '캘린더' },
    { id: 'project', label: '프로젝트' }
  ];

  // API 호출
  useEffect(() => {
    // 스터디 정보 가져오기
    const fetchStudyInfo = async () => {
      try {
        setLoading(true);

        // API 호출
        const data = await studySidebarApi.getStudyInfo(studyId);

        // 데이터 o 상태 업데이트
        if (data) {
          setStudyInfo({
            category: data.category,
            name: data.name,
            contact: data.contact
          });
        }
        setLoading(false);

      } catch (error) {
        console.error('스터디 정보 로딩 실패:', error);
        setLoading(false);
      }
    };

    // studyId가 존재할 때만 API 호출
    if (studyId) {
      fetchStudyInfo();
    } else {
      setLoading(false);
    }
  }, [studyId]);

  //메뉴 클릭 처리 함수
  const handleMenuClick = (tabId) => {
    console.log(`${tabId} 탭 클릭됨`); // 디버깅용 로그

    // 내부 상태 업데이트
    setCurrentTab(tabId);

    // 부모 컴포넌트에게 알림
    if (onMenuClick) {
      onMenuClick(tabId);
    }
  };

  //사이드바 토글
  const toggle = () => {
    setIsCollapsed(!isCollapsed); // 현재 상태의 반대로 변경
  };


  return (
    <div id={'wrap'}>
      {/* 메인 사이드바 */}
      <div className={`study-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* 스터디 정보 */}
        <div className='study-info'>
          <p className='sidebar-category'>
            {loading ? '로딩 중...' : (studyInfo.category || '카테고리')}
          </p>
          <p className='sidebar-group-name'>
            {loading ? '로딩 중...' : (studyInfo.name || '스터디이름')}
          </p>
          <p className='sidebar-contact'>
            {loading ? '로딩 중...' : (studyInfo.contact || '연락방법')}D
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
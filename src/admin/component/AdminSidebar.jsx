import React, { useState } from 'react';
import './AdminSidebar.css';

export default function AdminSidebar({
    initialTab = 'member',
    onMenuClick
}) {

    const [currentTab, setCurrentTab] = useState(initialTab);

    // 메뉴 클릭 처리 함수
    const handleMenuClick = (tabId) => {
        setCurrentTab(tabId);

        if (onMenuClick) {
            onMenuClick(tabId);
        }
    };

    return (
        <div className="admin-sidebar">
            {/* 관리자 타이틀 */}
            <div className="admin-title">
                <h1>스튜디오 관리자</h1>
            </div>

            {/* 관리 메뉴 */}
            <nav className="admin-menu">
                <ul>
                    <li
                        className={`menu-item ${currentTab === 'member' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('member')}
                    >
                        회원 관리
                    </li>
                    <li
                        className={`menu-item ${currentTab === 'studio-recruit' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('studio-recruit')}
                    >
                        스튜디오 모집글 관리
                    </li>
                    <li
                        className={`menu-item ${currentTab === 'studio-group' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('studio-group')}
                    >
                        스튜디오 그룹 관리
                    </li>
                    <li
                        className={`menu-item ${currentTab === 'project' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('project')}
                    >
                        프로젝트 관리
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="home-link">
                    스튜디오 홈페이지
                </button>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import './AdminBoard.css';

export default function AdminBoard() {
    const [currentTab, setCurrentTab] = useState('member');

    // 사이드바 메뉴 클릭 처리
    const handleMenuClick = (tabId) => {
        setCurrentTab(tabId);
    };

    return (
        <div className="admin-board">
            {/* 사이드바 */}
            <AdminSidebar 
                initialTab={currentTab}
                onMenuClick={handleMenuClick}
            />
            
            {/* 메인 컨텐츠 영역 */}
            <div className="admin-main-content">
                {/* 전체 통계 제목 */}
                <div className="admin-header">
                    <h1>전체 통계</h1>
                </div>

                {/* 4칸 그리드 레이아웃 */}
                <div className="admin-grid">
                    {/* 첫 번째 칸 - 필터링 목록 */}
                    <div className="admin-section filter-section">
                        <h2>필터링 목록</h2>
                        <div className="section-content">
                            {/* 필터링 관련 컨텐츠가 들어갈 자리 */}
                            <p>필터링 옵션 및 목록이 표시됩니다.</p>
                        </div>
                    </div>

                    {/* 두 번째 칸 - 데이터 분석 1 */}
                    <div className="admin-section data-section">
                        
                    </div>

                    {/* 세 번째 칸 - 데이터 분석 2 */}
                    <div className="admin-section data-section">
                        
                    </div>

                    {/* 네 번째 칸 - 데이터 분석 3 */}
                    <div className="admin-section data-section">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
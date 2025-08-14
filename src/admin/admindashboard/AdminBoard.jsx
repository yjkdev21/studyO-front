import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../component/AdminSidebar';
import './AdminBoard.css';
import axios from 'axios';

export default function AdminBoard() {
    const [currentTab, setCurrentTab] = useState('member');
    const [filters, setFilters] = useState({
        category: '',
        region: '',
        dateRange: '6months'
    });
    
    // 통계 데이터 상태
    const [categoryData, setCategoryData] = useState([]);
    const [regionData, setRegionData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const host = import.meta.env.VITE_AWS_API_HOST || 'http://localhost:8081';

    // API에서 데이터 가져오기
    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                // 카테고리별 분포 데이터
                const categoryResponse = await axios.get(`${host}/api/admin/statistics/categories`, {
                    withCredentials: true,
                    params: filters
                });
                setCategoryData(categoryResponse.data.data || []);

                // 지역별 그룹 수 데이터
                const regionResponse = await axios.get(`${host}/api/admin/statistics/regions`, {
                    withCredentials: true,
                    params: filters
                });
                setRegionData(regionResponse.data.data || []);

                // 월별 그룹 생성 데이터
                const monthlyResponse = await axios.get(`${host}/api/admin/statistics/monthly`, {
                    withCredentials: true,
                    params: filters
                });
                setMonthlyData(monthlyResponse.data.data || []);

            } catch (error) {
                console.error('통계 데이터 로딩 실패:', error);
                // 에러 발생시 임시 데이터 사용
                setCategoryData([
                    { name: 'IT/프로그래밍', value: 45, color: '#8884d8' },
                    { name: '어학', value: 30, color: '#82ca9d' },
                    { name: '자격증', value: 25, color: '#ffc658' },
                    { name: '취업준비', value: 20, color: '#ff7c7c' },
                    { name: '기타', value: 15, color: '#8dd1e1' }
                ]);

                setRegionData([
                    { region: '서울', count: 120 },
                    { region: '경기', count: 85 },
                    { region: '부산', count: 45 },
                    { region: '대구', count: 32 },
                    { region: '인천', count: 28 },
                    { region: '기타', count: 25 }
                ]);

                setMonthlyData([
                    { month: '2024-02', groups: 45 },
                    { month: '2024-03', groups: 78 },
                    { month: '2024-04', groups: 65 },
                    { month: '2024-05', groups: 52 },
                    { month: '2024-06', groups: 48 },
                    { month: '2024-07', groups: 42 },
                    { month: '2024-08', groups: 58 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [filters, host]);

    // 사이드바 메뉴 클릭 처리
    const handleMenuClick = (tabId) => {
        setCurrentTab(tabId);
    };

    // 필터 변경 처리
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // 색상 배열 (원형 그래프용)
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

    if (loading) {
        return (
            <div className="admin-board">
                <AdminSidebar 
                    initialTab={currentTab}
                    onMenuClick={handleMenuClick}
                />
                <div className="admin-main-content">
                    <div className="loading-container">
                        <p>통계 데이터를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h2>필터링</h2>
                        <div className="section-content">
                            <div className="filter-group">
                                
                            </div>
                        </div>
                    </div>

                    {/* 두 번째 칸 - 원형 그래프 (카테고리별 분포) */}
                    <div className="admin-section data-section">
                        <h2>카테고리별 스터디 분포</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 세 번째 칸 - 막대 그래프 (지역별 그룹 수) */}
                    <div className="admin-section data-section">
                        <h2>지역별 스터디 그룹 수</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={regionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="region" 
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 네 번째 칸 - 라인 그래프 (월별 그룹 생성) */}
                    <div className="admin-section data-section">
                        <h2>월별 그룹 생성 추이</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="month" 
                                        fontSize={12}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}월`;
                                        }}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                                        }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="groups" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        name="생성된 그룹 수"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
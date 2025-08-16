import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext"; // 사용자 인증 정보
import { useNavigate } from "react-router-dom";

import StudyCard from "../post/components/StudyCard";
import "../../users/MyEdit.css";

export default function DashboardList() {
  // useAuth에서 사용자 정보와 인증 상태 가져오기
  const { user, isAuthenticated } = useAuth();

  const [myStudies, setMyStudies] = useState([]); // 참여 중인 스터디 목록
  const [studyLoading, setStudyLoading] = useState(true); // 스터디 로딩 상태
  const [studyError, setStudyError] = useState(null); // 스터디 에러 메시지
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  
  const host = import.meta.env.VITE_AWS_API_HOST;

  const handleCardSelect = (groupId) => {
    setSelectedCard(groupId); // 선택 저장
    navigate(`/study/${groupId}/dashboard`); // 해당 스터디의 대시보드로 이동
  };

  useEffect(() => {
    const fetchMyActiveStudies = async () => {
      // 인증되지 않았거나 사용자 ID가 없으면 로딩 종료
      if (!isAuthenticated || !user?.id) {
        setStudyLoading(false);
        return;
      }

      try {
        // 로딩 시작 및 에러 초기화
        setStudyLoading(true);
        setStudyError(null);

        // axios로 서버에 스터디 목록 요청
        const response = await axios.get(`${host}/api/study/user/${user.id}/active`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true, // 세션 ID 쿠키(JSESSIONID) 자동 포함
        });

        const data = response.data; // axios는 자동으로 JSON 파싱하고 response.data에 저장

        // 데이터 구조 검증 및 처리
        if (data.success && Array.isArray(data.data)) {
          // 내가 가입한 날짜 기준 내림차순
          const sortedStudies = data.data.sort((a, b) => {
            const dateA = new Date(a.joinedAt || a.createdAt); // 가입일 우선, 없으면 생성일
            const dateB = new Date(b.joinedAt || b.createdAt);
            return dateB - dateA; // 최근 가입한 스터디가 먼저 오도록
          });
          setMyStudies(sortedStudies);
        } else {
          throw new Error(data.message || "데이터 형식이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("스터디 데이터 조회 실패:", error);
        setStudyError("스터디 목록을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
        setMyStudies([]);
      } finally {
        // 성공/실패 관계없이 로딩 상태 해제
        setStudyLoading(false);
      }
    };

    fetchMyActiveStudies();
  }, [isAuthenticated, user?.id]); // 의존성 배열: 인증 상태와 사용자 ID 변경 시 재실행
  return (
    <div className="mypage-section-card">
      <div className="mypage-section-header">
        <h3 className="mypage-section-title">스터디</h3>
        <span className="mypage-chevron-right">&gt;</span>
      </div>

      <div className="mypage-study-cards-container">
        {/* 조건부 렌더링: 로딩/에러/빈 상태/데이터 표시 */}
        {studyLoading ? (
          // 로딩 중 표시
          <div className="mypage-study-loading">
            스터디 목록을 불러오는 중...
          </div>
        ) : studyError ? (
          // 에러 발생 시 표시
          <div className="mypage-study-error">
            <p>오류: {studyError}</p>
            <small>
              API 서버가 실행 중인지, 엔드포인트가 올바른지 확인해주세요.
            </small>
          </div>
        ) : myStudies.length === 0 ? (
          // 데이터가 없을 때 표시
          <div className="mypage-study-empty">
            현재 참여 중인 스터디가 없습니다.
          </div>
        ) : (
          // 데이터가 있을 때 스터디 카드들 렌더링
          myStudies.map((study) => (
            <StudyCard
              key={`study-${study.groupId}-${study.groupName || "unknown"}`}
              studyGroup={study}
              isSelected={selectedCard === study.groupId}
              onSelect={handleCardSelect}
            />
          ))
        )}
      </div>x
    </div>
  );
}
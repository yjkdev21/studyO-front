import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // 사용자 인증 정보를 가져오는 커스텀 훅
import { useNavigate } from "react-router-dom";

import StudyCard from "../post/components/StudyCard";
import "../../users/MyEdit.css"; // 스타일 파일

export default function DashboardList() {
  // === 인증 정보 가져오기 ===
  // useAuth 커스텀 훅에서 사용자 정보와 인증 상태 가져오기
  const { user, isAuthenticated, isLoading } = useAuth();
  const [myStudies, setMyStudies] = useState([]); // 참여 중인 스터디 목록
  const [studyLoading, setStudyLoading] = useState(true); // 스터디 로딩 상태
  const [studyError, setStudyError] = useState(null); // 스터디 에러 메시지
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const handleCardSelect = (groupId) => {
    setSelectedCard(groupId); // 선택 저장
    navigate(`/study/${groupId}`); // 해당 스터디의 대시보드로 이동
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

        // API URL 설정 (환경변수 또는 기본값)
        const apiUrl = window.REACT_APP_API_URL || "http://localhost:8081";
        const url = `${apiUrl}/api/study/user/${user.id}/active`;

        // 서버에 스터디 목록 요청
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // 쿠키 포함
        });

        // HTTP 상태 코드별 에러 처리
        if (response.status === 403) {
          throw new Error(
            "서버 접근 권한이 없습니다. CORS 설정을 확인해주세요."
          );
        }

        if (response.status === 404) {
          throw new Error("API 엔드포인트를 찾을 수 없습니다.");
        }

        // 응답 헤더 확인 - JSON 형태인지 체크
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("서버에서 올바른 JSON 응답을 받지 못했습니다.");
        }

        // HTTP 상태가 성공이 아닌 경우
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        // 응답 데이터 파싱
        const data = await response.json();

        console.log("스터디 데이터:", data); // 디버깅용 로그

        // 데이터 구조 검증 및 처리
        if (data.success && Array.isArray(data.data)) {
          // 최신 순으로 정렬 (생성일 기준 내림차순)
          const sortedStudies = data.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // 최신이 먼저 오도록
          });

          setMyStudies(sortedStudies);
        } else {
          throw new Error(data.message || "데이터 형식이 올바르지 않습니다.");
        }
      } catch (error) {
        // 에러 로깅 및 사용자에게 표시할 에러 메시지 설정
        console.error("스터디 데이터 조회 실패:", error);
        setStudyError(`스터디 데이터를 불러올 수 없습니다: ${error.message}`);
        setMyStudies([]); // 에러 시 빈 배열로 초기화
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
              id={study.groupId}
              category={study.category}
              name={study.groupName}
              description={study.groupIntroduction}
              author={study.groupOwnerId}
              dueDate={study.createdAt}
              members={study.maxMembers}
              isOffline={study.studyMode === "오프라인"}
              location={study.region}
              contact={study.contact} // StudyCard에서 사용하지 않으면 생략 가능
              thumbnail={study.thumbnail}
              isSelected={selectedCard === study.groupId}
              onSelect={handleCardSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

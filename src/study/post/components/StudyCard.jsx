// src/components/StudyGroupCard.jsx
import React from "react";
import "./StudyCard.css"; // 순수 CSS 파일을 import (기존 CSS 파일명 유지)

// studyGroup 데이터와 함께 isSelected, onSelect props를 받습니다.
const StudyCard = ({ studyGroup, isSelected, onSelect }) => {
  // console.log(isSelected, "isSelected");

  // 마감일 포맷팅 함수
  const formatEndDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formattedDate = formatEndDate(studyGroup.createdAt);

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onSelect && !isSelected) {
      onSelect(studyGroup.groupId); // 선택된 스터디 그룹의 ID를 부모로 전달
    }
  };

  return (
    // isSelected prop에 따라 'selected' 클래스를 조건부로 추가
    <div
      className={`study-card-container ${isSelected ? "selected" : ""}`}
      onClick={handleCardClick} // 카드 클릭 이벤트 추가
    >
      <div className="study-card-badges">
        <span className="study-card-badge mode">{studyGroup.studyMode}</span>
        <span className="study-card-badge region">{studyGroup.region}</span>
        <span className="study-card-badge members">
          모집인원 {studyGroup.maxMembers}명
        </span>
      </div>

      <div className="study-card-content">
        <div className="study-card-body-section">
          <div className="study-card-header">
            <span className="study-card-category">{studyGroup.category}</span>
            <span className="study-card-title">{studyGroup.groupName}</span>
          </div>
          <p className="study-card-intro">{studyGroup.groupIntroduction}</p>
        </div>

        <div className="study-card-thumbnail">
          {/* thumbnailUrl이 있을 경우 이미지 표시, 없을 경우 플레이스홀더 표시 */}
          <img
            src={
              studyGroup.thumbnailUrl ||
              "https://placehold.co/150x120/E0E0E0/FFFFFF?text=No+Img"
            }
            alt={`${studyGroup.groupName} 썸네일`}
          />
        </div>
      </div>

      <div className="study-card-footer">
        <div className="study-card-meta">
          <span className="study-card-author">{studyGroup.nickName}</span>
          <span className="study-card-date">생성일 : {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;

// src/components/StudyCard.jsx
import React from "react";
import "./StudyCard.css"; // 순수 CSS 파일 임포트

const StudyCard = ({
  id, // 새로 추가된 prop: 스터디 그룹 ID
  category,
  name,
  description,
  author,
  dueDate,
  members,
  isOffline,
  location,
  thumbnail,
  isSelected,
  onSelect,
}) => {
  // 카드 클릭 핸들러
  const handleClick = () => {
    if (onSelect) {
      onSelect(id); // 콜백 함수에 현재 카드의 ID 전달
    }
  };

  return (
    <div
      className={`study-card ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div className="study-card-header">
        <div className="study-tags">
          {isOffline && <span className="tag offline">오프라인</span>}
          {location && <span className="tag location">{location}</span>}
          <span className="tag members">모집인원 {members}</span>
        </div>
        {thumbnail && (
          <div className="study-thumbnail-container">
            <img
              src={thumbnail}
              alt={`${name} 썸네일`}
              className="study-thumbnail"
            />
          </div>
        )}
      </div>
      <div className="study-card-body">
        <p className="study-category">{category}</p>
        <h3 className="study-name">{name}</h3>
        <p className="study-description">{description}</p>
        <p className="study-author">작성자: {author}</p>
        <p className="study-due-date">마감일 {dueDate}</p>
      </div>
    </div>
  );
};

export default StudyCard;

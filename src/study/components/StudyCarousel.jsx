// src/components/StudyCarousel.jsx
import React, { useState } from "react"; // useState는 currentIndex 때문에 필요
import StudyCard from "./StudyCard";
import "./StudyCard.css";

// selectedStudyId와 onSelectStudy를 props로 받습니다.
const StudyCarousel = ({ studyData, selectedStudyId, onSelectStudy }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(studyData.length - itemsPerPage, prevIndex + itemsPerPage)
    );
  };

  const isNextButtonDisabled = currentIndex + itemsPerPage >= studyData.length;
  const isPrevButtonDisabled = currentIndex === 0;

  const visibleStudies = studyData.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <div className="study-carousel-container">
      <div className="carousel-controls">
        <button
          className="carousel-button prev"
          onClick={handlePrev}
          disabled={isPrevButtonDisabled}
        >
          &lt;
        </button>
        <button
          className="carousel-button next"
          onClick={handleNext}
          disabled={isNextButtonDisabled}
        >
          &gt;
        </button>
      </div>
      <div className="study-carousel-track">
        {visibleStudies.map((study, index) => (
          <StudyCard
            key={study.id}
            id={study.id}
            category={study.category}
            name={study.name}
            description={study.description}
            author={study.author}
            dueDate={study.dueDate}
            members={study.members}
            isOffline={study.isOffline}
            location={study.location}
            thumbnail={study.thumbnail}
            // App.jsx에서 받은 selectedStudyId와 onSelectStudy를 StudyCard로 그대로 전달
            isSelected={study.id === selectedStudyId}
            onSelect={onSelectStudy}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyCarousel;

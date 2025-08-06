import React, { useState, useEffect } from "react";
import axios from "axios";
import StudyCard from "./StudyCard";
import "./StudyCard.css";

const StudyCarousel = ({ userId, selectedGroupId, onSelectStudy }) => {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const [studies, setStudies] = useState([]);
  const [viewCardNum, setViewCardNum] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchStudyGroups = async () => {
    try {
      const response = await axios.get(
        `${host}/api/study-groups/user/${userId}`,
        { withCredentials: true }
      );
      const { groupList } = response.data;
      if (groupList) {
        setStudies(groupList);

        // 첫 번째 스터디 그룹을 선택하는 로직
        // selectedGroupId가 null이거나 studies에 해당 ID가 없을 경우
        const isSelectedGroupIdValid = groupList.some(
          (study) => study.groupId === selectedGroupId
        );

        if (groupList.length > 0 && !isSelectedGroupIdValid) {
          const firstStudyId = groupList[0].groupId;
          onSelectStudy(firstStudyId, groupList);
        } else if (groupList.length > 0 && isSelectedGroupIdValid) {
          // 기존에 선택된 ID가 유효하면 그대로 유지
          onSelectStudy(selectedGroupId, groupList);
        }
      }
    } catch (error) {
      console.error("Error fetching study groups:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStudyGroups();
    }
  }, [userId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setViewCardNum(2);
      } else {
        setViewCardNum(1);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - viewCardNum));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(studies.length - viewCardNum, prevIndex + viewCardNum)
    );
  };

  const isNextButtonDisabled = currentIndex + viewCardNum >= studies.length;
  const isPrevButtonDisabled = currentIndex === 0;

  const visibleStudies = studies.slice(
    currentIndex,
    currentIndex + viewCardNum
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
        {visibleStudies.map((study) => (
          <StudyCard
            key={study.groupId}
            studyGroup={study}
            isSelected={study.groupId === selectedGroupId}
            onSelect={() => onSelectStudy(study.groupId, studies)}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyCarousel;

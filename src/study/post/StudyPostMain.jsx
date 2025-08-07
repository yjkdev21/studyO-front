import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import StudyCarousel from "./components/StudyCarousel";
import StudyPostInput from "./StudyPostInput";
import StudyPostView from "./StudyPostView";
import "./Post.css";
import { useAuth } from "../../contexts/AuthContext";

export default function StudyPostMain() {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const { user } = useAuth();
  const userId = 10; //user?.id;

  //console.log("user.id: " + userId);

  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [selectStudy, setSelectStudy] = useState(null);
  const [postMode, setPostMode] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // StudyCarousel로부터 선택된 스터디 ID와 전체 스터디 리스트를 받을 콜백 함수
  const handleStudySelect = (groupId, allStudies) => {
    //console.log("groupId: ", groupId);
    const selectedStudy = allStudies.find((study) => study.groupId === groupId);
    if (selectedStudy) {
      setSelectedStudyId(groupId);
      setSelectStudy(selectedStudy);
      checkPostExistence(groupId); // 게시글 존재 여부 확인 함수 호출
    }
  };

  // 게시글 존재 여부를 확인하는 함수
  const checkPostExistence = async (groupId) => {
    setPostMode("loading");
    setErrorMessage(""); // 새로운 스터디 선택 시 오류 메시지 초기화
    try {
      const response = await axios.get(
        `${host}/api/study-groups/post/${groupId}/exist`,
        { withCredentials: true }
      );
      const { exist } = response.data;

      if (exist) {
        setPostMode("view");
      } else {
        setPostMode("post");
      }
    } catch (error) {
      console.error("Error checking post existence:", error);
      setPostMode("post");
      setErrorMessage("게시글 존재 여부를 확인하는 중 오류가 발생했습니다.");
    }
  };

  // StudyPostInput에서 게시글 생성 완료 후 호출될 콜백 함수
  const handlePostCreated = () => {
    setSuccessMessage("게시글이 성공적으로 등록되었습니다.");
    // 게시글 등록 후 View 모드로 전환하기 위해 존재 여부 다시 확인
    checkPostExistence(selectedStudyId);
  };

  // StudyPostView에서 게시글이 삭제되었을 때 호출될 콜백 함수
  const handlePostDeleted = () => {
    setSuccessMessage("게시글이 성공적으로 삭제되었습니다.");
    // 삭제 후 Post 모드로 전환
    setPostMode("post");
  };

  useEffect(() => {
    if (userId) {
      setPostMode("loading");
    }
  }, [userId]);

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">✔</span>
        스터디 선택
      </h2>

      <StudyCarousel
        userId={userId}
        selectedGroupId={selectedStudyId}
        onSelectStudy={handleStudySelect}
      />

      {errorMessage && (
        <div className="alert-error-message">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert-success-message">{successMessage}</div>
      )}

      {postMode === "loading" && <div>로딩 중...</div>}

      {postMode !== "loading" && selectStudy && (
        <h2 className="form-title">
          <span className="form-badge">*</span>
          {selectStudy.groupName}
        </h2>
      )}

      {postMode === "view" && selectedStudyId && (
        <StudyPostView
          groupId={selectedStudyId}
          onPostDeleted={handlePostDeleted}
        />
      )}

      {postMode === "post" && (
        <StudyPostInput
          groupId={selectedStudyId}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

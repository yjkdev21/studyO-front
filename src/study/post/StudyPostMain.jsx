import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudyCarousel from "./components/StudyCarousel";
import StudyPostInput from "./StudyPostInput";
import StudyPostView from "./StudyPostView";
import StudyPostEdit from "./StudyPostEdit"; // StudyPostEdit 컴포넌트 추가
import "./Post.css";
import { useAuth } from "../../contexts/AuthContext";
import EmptyGroupPage from "./components/EmptyGroupPage";

export default function StudyPostMain() {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const { user } = useAuth();
  const userId = user?.id;

  // 선택된 스터디 ID, 해당 스터디 정보, 현재 게시글 모드를 관리하는 상태
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [selectStudy, setSelectStudy] = useState(null);
  const [postMode, setPostMode] = useState("loading"); // "loading", "post", "view", "edit"
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [groupIdForEdit, setGroupIdForEdit] = useState(null); // 수정할 게시글의 ID
  const [emptyGroup, setEmptyGroup] = useState(false);

  const navigate = useNavigate();

  const handleEmptyGroup = () => {
    //alert("개설한 스터디 그룹이 없습니다.");
    setEmptyGroup(true);
  };

  // StudyCarousel에서 스터디를 선택했을 때 호출되는 콜백 함수
  const handleStudySelect = (groupId, allStudies) => {
    // console.log(" >> groupId :", groupId);
    const selectedStudy = allStudies.find((study) => study.groupId === groupId);
    if (selectedStudy) {
      setSelectedStudyId(groupId);
      setSelectStudy(selectedStudy);
      checkPostExistence(groupId); // 스터디 선택 시 게시글 존재 여부 확인
    }
  };

  // 특정 스터디에 홍보글이 존재하는지 확인하는 함수
  const checkPostExistence = async (groupId) => {
    setPostMode("loading");
    setErrorMessage("");
    setSuccessMessage("");
    try {
      // 홍보글의 존재 여부만 확인하는 API...
      const response = await axios.get(
        `${host}/api/study-groups/post/${groupId}/exist`,
        { withCredentials: true }
      );
      const { exist } = response.data;

      if (exist) {
        setPostMode("view"); // 홍보글이 존재하면 'view' 모드로 전환
      } else {
        setPostMode("post"); // 홍보글이 없으면 'post' 모드로 전환
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
    checkPostExistence(selectedStudyId);
  };

  // StudyPostView에서 게시글이 삭제되었을 때 호출될 콜백 함수
  const handlePostDeleted = () => {
    setSuccessMessage("게시글이 성공적으로 삭제되었습니다.");
    // 삭제 후 'post' 모드로 전환
    setGroupIdForEdit(null);
    setPostMode("post");
  };

  // StudyPostView에서 수정 버튼 클릭 시 호출될 콜백 함수
  const handleEditPost = (groupId) => {
    setGroupIdForEdit(groupId);
    setPostMode("edit");
  };

  // StudyPostEdit에서 게시글 수정 완료 후 호출될 콜백 함수
  const handlePostUpdated = () => {
    setSuccessMessage("게시글이 성공적으로 수정되었습니다.");
    setPostMode("view");
  };

  const handleEditCanceled = () => {
    setPostMode("view");
  };

  useEffect(() => {
    if (userId) {
      setPostMode("loading");
    }
  }, [userId]);

  return (
    <>
      {emptyGroup && <EmptyGroupPage />}
      {emptyGroup || (
        <div className="promotion-container">
          <h2 className="form-title">
            <span className="form-badge">✔</span>
            스터디 선택
          </h2>

          <StudyCarousel
            userId={userId}
            selectedGroupId={selectedStudyId}
            onSelectStudy={handleStudySelect}
            onEmptyGroup={handleEmptyGroup}
          />

          {errorMessage && (
            <div className="alert-error-message">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert-success-message">{successMessage}</div>
          )}

          {/* postMode에 따라 다른 컴포넌트를 렌더링 */}
          {postMode === "loading" && <div>로딩 중...</div>}

          {/* 스터디 그룹 타이틀 영역 */}
          {postMode !== "loading" && selectStudy && (
            <div className="studypost-main-group-title-container">
              <h2 className="form-title">
                <span className="form-badge">*</span>
                {selectStudy.groupName}
              </h2>
              <div
                className="group-edit-navigator"
                onClick={() => {
                  navigate(`/groupUpdate/${selectedStudyId}`);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-pencil-square"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                  />
                </svg>
                <span>그룹정보수정</span>
              </div>
            </div>
          )}

          {/* 게시글이 존재하면 StudyPostView를 렌더링 */}
          {postMode === "view" && selectedStudyId && (
            <StudyPostView
              groupId={selectedStudyId}
              onPostDeleted={handlePostDeleted}
              onPostEdit={handleEditPost}
            />
          )}

          {/* 게시글이 없으면 StudyPostInput을 렌더링 */}
          {postMode === "post" && selectedStudyId && (
            <StudyPostInput
              groupId={selectedStudyId}
              onPostCreated={handlePostCreated}
            />
          )}

          {/* 수정 버튼 클릭 시 StudyPostEdit를 렌더링 */}
          {postMode === "edit" && groupIdForEdit && (
            <StudyPostEdit
              groupId={groupIdForEdit}
              onPostUpdated={handlePostUpdated}
              onCancel={handleEditCanceled}
            />
          )}
        </div>
      )}
    </>
  );
}

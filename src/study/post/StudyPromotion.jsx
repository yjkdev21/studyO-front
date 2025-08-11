import React, { useState, useEffect } from "react";
import StudyPostView from "./StudyPostView";
import "./Post.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import RequestModal from "./components/RequestModal";

export default function StudyPromotion() {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const { user } = useAuth();
  const userId = user?.id;
  const { groupId } = useParams();
  const [studyPostId, setStudyPostId] = useState(0);
  const [message, setMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStudyJoin = (postId) => {
    //console.log("handleStudyJoin postId: ", postId);
    setStudyPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAppMsgChange = (msg) => {
    setMessage(msg);
  };

  const handleSubmit = async () => {
    // console.log(
    //   "DEBUG => userId:",
    //   userId,
    //   "postId:",
    //   studyPostId,
    //   "message:",
    //   message
    // );

    // 타입 방어
    if (typeof userId !== "string" && typeof userId !== "number") {
      alert("userId 값이 올바르지 않습니다.");
      console.error("Invalid userId:", userId);
      return;
    }
    if (typeof studyPostId !== "string" && typeof studyPostId !== "number") {
      alert("studyPostId 값이 올바르지 않습니다.");
      console.error("Invalid studyPostId:", studyPostId);
      return;
    }
    if (!message.trim()) {
      alert("가입 신청 내용을 입력해주세요.");
      return;
    }

    const userRequestDto = {
      userId: userId,
      studyPostId: studyPostId,
      applicationMessage: message.trim(),
    };

    try {
      const response = await axios.post(
        `${host}/api/userRequest/create`,
        userRequestDto,
        { withCredentials: true }
      );

      alert(response?.data?.message || "가입 신청이 완료되었습니다.");
    } catch (error) {
      let errorMsg = "가입 신청 중 오류가 발생했습니다.";
      if (error.response?.data?.error) {
        errorMsg +=
          " " +
          (typeof error.response.data.error === "string"
            ? error.response.data.error
            : JSON.stringify(error.response.data.error));
      } else if (error.message) {
        errorMsg += " " + error.message;
      }
      alert(errorMsg);
    } finally {
      handleCloseModal();
      setMessage("");
    }
  };

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">✔</span>
        스터디 모집 홍보글
      </h2>
      <StudyPostView groupId={groupId} onStudyJoin={handleStudyJoin} />
      <RequestModal
        isOpen={isModalOpen}
        groupId={groupId}
        msg={message}
        onChange={handleAppMsgChange}
        onConfirm={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
}

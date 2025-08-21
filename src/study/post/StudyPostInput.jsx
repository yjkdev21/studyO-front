import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import QuillFormFields from "../components/QuillFormFields";
import DatePicker from "../../common/form/DatePicker";
import FormInput from "../../common/form/FormInput";
import "./Post.css";
import { useAuth } from "../../contexts/AuthContext";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const formatToLocalDateTimeString = (dateString) => {
  const formattedDate = dateString.replace(/\./g, "-"); // "YYYY-MM-DD"로 변경
  return `${formattedDate}T00:00:00`;
};

const StudyPostInput = ({ groupId, onPostCreated }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const host = import.meta.env.VITE_AWS_API_HOST;
  const navigate = useNavigate();

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(oneWeekLater));
  const [hashTag, setHashTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDateMessage, setErrorDateMessage] = useState("");
  const [errorInputMessage, setErrorInputMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [qtitle, setTitle] = useState("");
  const [qcontent, setContent] = useState("");

  const handleStartDateChange = (newDate) => {
    const newStartDate = new Date(newDate.replace(/\./g, "-"));
    const currentEndDate = new Date(endDate.replace(/\./g, "-"));
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 제거

    // 마감일이 시작일보다 빠른 경우
    if (newStartDate > currentEndDate) {
      setErrorDateMessage("⚠️ 모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      return;
    }

    // 시작일이 오늘보다 이전인 경우
    if (newStartDate < today) {
      setErrorDateMessage("⚠️ 모집 시작일은 오늘 이전일 수 없습니다.");
      return;
    }

    setStartDate(newDate);
    setErrorMessage("");
    setErrorDateMessage("");
    setErrorInputMessage("");
  };

  const handleEndDateChange = (newDate) => {
    const newEndDate = new Date(newDate.replace(/\./g, "-"));
    const currentStartDate = new Date(startDate.replace(/\./g, "-"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 마감일이 시작일보다 빠른 경우
    if (newEndDate < currentStartDate) {
      setErrorDateMessage("⚠️ 모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      return;
    }

    // 마감일이 오늘보다 이전인 경우
    //console.log("newEndDate: ", newEndDate);
    //console.log("today: ", today);
    if (newEndDate < today) {
      setErrorDateMessage("⚠️ 모집 마감일은 오늘 이전일 수 없습니다.");
      return;
    }

    setEndDate(newDate);
    setErrorMessage("");
    setErrorDateMessage("");
    setErrorInputMessage("");
  };

  const handleHashTagChange = (e) => {
    setHashTag(e.target.value);
  };

  // 폼 제출 핸들러 (신규 작성)
  const handleSubmitForm = async (title, content, newAttachments) => {
    setLoading(true);
    setErrorMessage("");
    setErrorDateMessage("");
    setSuccessMessage("");
    setErrorInputMessage("");

    if (!title || !content || !hashTag) {
      setErrorInputMessage("제목, 내용, 해시태그는 필수 입력입니다.");
      setLoading(false);
      return;
    }

    if (!groupId) {
      setErrorMessage("스터디를 선택해주세요.");
      setLoading(false);
      return;
    }

    if (userId === null || userId === undefined) {
      setErrorInputMessage(
        "사용자 정보가 없어 게시글을 등록할 수 없습니다. 로그인 상태를 확인해주세요."
      );
      setLoading(false);
      return;
    }

    const startDateTime = new Date(startDate.replace(/\./g, "-"));
    const endDateTime = new Date(endDate.replace(/\./g, "-"));
    if (endDateTime < startDateTime) {
      setErrorDateMessage("모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title); // QuillFormFields에서 받은 최신 title
    formData.append("content", content); // QuillFormFields에서 받은 최신 content
    formData.append("groupId", groupId);
    formData.append("authorId", userId);
    formData.append("hashTag", hashTag);

    // 날짜를 LocalDateTime 호환 형식으로 변환하여 전송
    formData.append("recruitStartDate", formatToLocalDateTimeString(startDate));
    formData.append("recruitEndDate", formatToLocalDateTimeString(endDate));

    //console.log("formData: ", formData); // 디버깅용

    formData.append("recruitStartDate", formatToLocalDateTimeString(startDate));
    formData.append("recruitEndDate", formatToLocalDateTimeString(endDate));

    // 새로 추가된 파일만 FormData에 추가
    if (newAttachments?.length > 0) {
      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      await axios.post(`${host}/api/study-groups/post`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setSuccessMessage("게시글이 성공적으로 등록되었습니다.");
      setTitle("");
      setContent("");
      setHashTag("");

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      setErrorMessage(
        "게시글 등록 실패: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    if (loading) {
      e.preventDefault();
    }
    navigate(`/study/postMain`);
  };

  return (
    <div className="promotion-container">
      {successMessage && (
        <div className="alert-success-message">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="alert-error-message">{errorMessage}</div>
      )}

      <h2 className="form-title">
        <span className="form-badge">1</span>
        스터디 모집기간 검색어
      </h2>
      <div className="date-picker-wrapper-container">
        <div className="flex-item">
          <DatePicker
            labelText={"모집-시작일"}
            date={startDate}
            onDateChange={handleStartDateChange}
          />
        </div>
        <div className="flex-item">
          <DatePicker
            labelText={"모집-종료일"}
            date={endDate}
            onDateChange={handleEndDateChange}
          />
        </div>
      </div>
      {errorDateMessage && (
        <div className="alert-error-message">{errorDateMessage}</div>
      )}
      <div>
        <FormInput
          id="hashTag"
          label="검색해시태그"
          value={hashTag}
          onChange={handleHashTagChange}
          required={true}
          placeholder="#자격증#수능#영어"
          disabled={loading}
        />
      </div>

      <h2 className="form-title">
        <span className="form-badge">2</span>
        스터디 홍보글 작성
      </h2>

      <QuillFormFields
        title={qtitle}
        content={qcontent}
        onTitleChange={setTitle}
        onContentChange={setContent}
        initialAttachments={[]}
        onSubmit={handleSubmitForm}
        // onCancel={handleCancel}
        isLoading={loading}
      />

      {errorInputMessage && (
        <div className="alert-error-message-post-input">
          {errorInputMessage}
        </div>
      )}
    </div>
  );
};

export default StudyPostInput;

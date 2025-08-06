import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuillFormFields from "../components/QuillFormFields";
import DatePicker from "../../common/form/DatePicker";
import FormInput from "../../common/form/FormInput";
import "./Post.css";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const StudyPostInput = ({ groupId, onPostCreated }) => {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const navigate = useNavigate();

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(oneWeekLater));
  const [hashTag, setHashTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    const newStartDate = new Date(newDate.replace(/\./g, "-"));
    const currentEndDate = new Date(endDate.replace(/\./g, "-"));
    if (currentEndDate < newStartDate) {
      setEndDate(newDate);
    }
    setErrorMessage("");
  };

  const handleEndDateChange = (newDate) => {
    const newEndDate = new Date(newDate.replace(/\./g, "-"));
    const currentStartDate = new Date(startDate.replace(/\./g, "-"));

    if (newEndDate < currentStartDate) {
      setErrorMessage("모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      return;
    }
    setEndDate(newDate);
    setErrorMessage("");
  };

  const handleHashTagChange = (e) => {
    setHashTag(e.target.value);
  };

  const handleSubmitForm = async (title, content, attachments) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!title || !content) {
      setErrorMessage("제목과 내용을 입력하세요.");
      setLoading(false);
      return;
    }

    if (!groupId) {
      setErrorMessage("스터디를 선택해주세요.");
      setLoading(false);
      return;
    }

    const startDateTime = new Date(startDate.replace(/\./g, "-"));
    const endDateTime = new Date(endDate.replace(/\./g, "-"));
    if (endDateTime < startDateTime) {
      setErrorMessage("모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("groupId", groupId);
    formData.append("hashTag", hashTag);
    formData.append("recruitStartDate", startDate);
    formData.append("recruitEndDate", endDate);

    if (attachments?.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      await axios.post(`${host}/api/study-group/post`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setSuccessMessage("게시글이 성공적으로 등록되었습니다.");

      if (onPostCreated) {
        onPostCreated(); // 부모 컴포넌트에 게시글이 생성되었음을 알림
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
    navigate(`/study/promotion/list`);
  };

  return (
    <div className="promotion-container">
      {errorMessage && (
        <div className="alert-error-message">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert-success-message">{successMessage}</div>
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
      <div>
        <FormInput
          id="hashTag"
          label="검색해시태그"
          value={hashTag}
          onChange={handleHashTagChange}
          required={true}
          placeholder="#자격증#수능"
          disabled={loading}
        />
      </div>

      <h2 className="form-title">
        <span className="form-badge">2</span>
        스터디 홍보글 작성
      </h2>
      <QuillFormFields
        initialTitle={""}
        initialContent={""}
        initialAttachments={[]}
        onSubmit={handleSubmitForm}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  );
};

export default StudyPostInput;

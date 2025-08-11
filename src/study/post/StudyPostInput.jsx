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
  return `${formattedDate}T00:00:00`; // 시간 정보 추가 (자정)
};

const StudyPostInput = ({ groupId, onPostCreated }) => {
  const { user } = useAuth();
  const userId = user?.id;

  //console.log("StudyPostInput user.id: " + userId);

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
  const [qtitle, setTitle] = useState(""); // 이 상태가 이제 QuillFormFields의 실제 값입니다.
  const [qcontent, setContent] = useState(""); // 이 상태가 이제 QuillFormFields의 실제 값입니다.

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    const newStartDate = new Date(newDate.replace(/\./g, "-"));
    const currentEndDate = new Date(endDate.replace(/\./g, "-"));
    if (currentEndDate < newStartDate) {
      setEndDate(newDate);
    }
    setErrorMessage("");
    setErrorDateMessage("");
    setErrorInputMessage("");
  };

  const handleEndDateChange = (newDate) => {
    const newEndDate = new Date(newDate.replace(/\./g, "-"));
    const currentStartDate = new Date(startDate.replace(/\./g, "-"));

    if (newEndDate < currentStartDate) {
      setErrorDateMessage("모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
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

  const handleSubmitForm = async (title, content, attachments) => {
    setLoading(true);
    setErrorMessage("");
    setErrorDateMessage("");
    setSuccessMessage("");
    setErrorInputMessage("");

    // 이제 title과 content는 qtitle, qcontent 상태에 이미 반영되어 있습니다.
    // QuillFormFields의 onSubmit에서 넘어온 title, content를 사용합니다.
    if (!title || !content || !hashTag) {
      setErrorInputMessage("제목과 , 내용 , 해시태그는 필수 입력 입니다.");
      // setTitle(qtitle); // 이 줄들은 제거된 상태를 유지합니다.
      // setContent(qcontent); // 이 줄들은 제거된 상태를 유지합니다.
      setLoading(false);
      return;
    }

    if (!groupId) {
      setErrorMessage("스터디를 선택해주세요.");
      setLoading(false);
      return;
    }

    // userId가 유효한지 확인 (null 또는 undefined일 경우 제출 방지)
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

    // console.log("formData: ", formData); // 디버깅용

    if (attachments?.length > 0) {
      attachments.forEach((file) => {
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
      setTitle(""); // 성공 시에는 초기화
      setContent(""); // 성공 시에는 초기화
      setHashTag(""); // 해시태그도 초기화

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
    navigate(`/study/postMain/list`); // 경로 확인 필요
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
        title={qtitle} // qtitle 상태를 prop으로 전달
        content={qcontent} // qcontent 상태를 prop으로 전달
        onTitleChange={setTitle} // 제목 변경 시 setTitle 호출
        onContentChange={setContent} // 내용 변경 시 setContent 호출
        initialAttachments={[]}
        onSubmit={handleSubmitForm}
        onCancel={handleCancel}
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

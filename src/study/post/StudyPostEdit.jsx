import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const StudyPostEdit = ({ groupId, onPostUpdated, onCancel }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const host = import.meta.env.VITE_AWS_API_HOST;
  const navigate = useNavigate();

  // 폼 필드 상태
  const [studyPostId, setStudyPostId] = useState(0);
  const [qtitle, setTitle] = useState("");
  const [qcontent, setContent] = useState("");
  const [hashTag, setHashTag] = useState("");
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));

  // 기존에 첨부되어 있던 파일 목록 (서버에서 불러옴)
  // QuillFormFields로 props 전달
  const [initialAttachments, setInitialAttachments] = useState([]);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true); // 초기 데이터 로딩을 위해 true로 시작
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDateMessage, setErrorDateMessage] = useState("");

  // 컴포넌트 마운트 시 기존 게시글 데이터 로드
  useEffect(() => {
    const fetchPostData = async () => {
      if (!groupId) {
        setErrorMessage("게시글 ID가 유효하지 않습니다.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${host}/api/study-groups/post/${groupId}`,
          {
            withCredentials: true,
          }
        );
        const { postDto } = response.data;
        setStudyPostId(postDto.studyPostId);
        setTitle(postDto.title);
        setContent(postDto.content);
        setHashTag(postDto.hashTag);
        setStartDate(formatDate(new Date(postDto.recruitStartDate)));
        setEndDate(formatDate(new Date(postDto.recruitEndDate)));
        // 첨부파일 정보도 로드하여 initialAttachments에 저장
        setInitialAttachments(postDto.attachFile || []);
      } catch (error) {
        console.error("게시글 데이터 로드 실패:", error);
        setErrorMessage("게시글 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [groupId, host]);

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
    console.log("newEndDate: ", newEndDate);
    console.log("today: ", today);
    if (newEndDate < today) {
      setErrorDateMessage("⚠️ 모집 마감일은 오늘 이전일 수 없습니다.");
      return;
    }

    setEndDate(newDate);
    setErrorMessage("");
    setErrorDateMessage("");
  };

  const handleHashTagChange = (e) => {
    setHashTag(e.target.value);
  };

  // QuillFormFields에서 전달받은 파일 목록 인자들을 추가
  const handleSubmitForm = async (
    title,
    content,
    newAttachments,
    deletedStoredFileNames
  ) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setErrorDateMessage("");

    if (!title || !content || !hashTag) {
      setErrorMessage("제목, 내용, 해시태그는 필수 입력입니다.");
      setIsSubmitting(false);
      return;
    }

    const startDateTime = new Date(startDate.replace(/\./g, "-"));
    const endDateTime = new Date(endDate.replace(/\./g, "-"));
    if (endDateTime < startDateTime) {
      setErrorDateMessage("모집 마감일은 모집 시작일보다 빠를 수 없습니다.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("studyPostId", studyPostId);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("hashTag", hashTag);
    formData.append("authorId", userId);
    formData.append("recruitStartDate", formatToLocalDateTimeString(startDate));
    formData.append("recruitEndDate", formatToLocalDateTimeString(endDate));

    // QuillFormFields에서 전달받은 새로운 파일들을 FormData에 추가
    if (newAttachments?.length > 0) {
      newAttachments.forEach((file) => {
        formData.append("newAttachments", file);
      });
    }

    // QuillFormFields에서 전달받은 삭제할 파일 목록을 FormData에 추가
    if (deletedStoredFileNames?.length > 0) {
      deletedStoredFileNames.forEach((fileName) => {
        formData.append("deletedStoredFileNames", fileName);
      });
    }

    try {
      await axios.post(`${host}/api/study-groups/post/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (onPostUpdated) {
        onPostUpdated(); // 부모 컴포넌트에 게시글이 수정되었음을 알림
      }
      navigate(`/study/postMain`); // 수정 후 게시글 포스트메인으로 이동
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      setErrorMessage(
        "게시글 수정 실패: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e) => {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    // 취소 시 게시글 상세 페이지로 돌아감
    onCancel();
  };

  if (loading) {
    return <div>게시글 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="promotion-container">
      {errorMessage && (
        <div className="alert-error-message">{errorMessage}</div>
      )}
      <h2> Edit 화면 </h2>

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
          disabled={isSubmitting}
        />
      </div>

      <h2 className="form-title">
        <span className="form-badge">2</span>
        스터디 홍보글 작성
      </h2>

      {/* QuillFormFields 제목,내용,첨부파일,기존첨부파일 을 관리 */}
      <QuillFormFields
        title={qtitle}
        content={qcontent}
        onTitleChange={setTitle}
        onContentChange={setContent}
        initialAttachments={initialAttachments}
        onSubmit={handleSubmitForm}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StudyPostEdit;

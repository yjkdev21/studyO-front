import React, { useState } from "react";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import axios from "axios";
import "./Promotion.css";
import { useNavigate } from "react-router-dom";
import StudyCarousel from "../components/StudyCarousel";

export default function PromotionPost() {
  // host는 빌드 시점에 결정되는 값이므로, useState의 초기값으로만 사용됩니다.
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("API Host:", host); // 디버깅을 위해 호스트 값 출력

  // 선택된 스터디 Group ID 상태
  const [selectedStudyId, setSelectedStudyId] = useState(null);

  // StudyCarousel로부터 선택된 스터디 ID를 받을 콜백 함수
  const handleStudySelect = (id) => {
    setSelectedStudyId(id);
    console.log("선택된 스터디 ID:", id);
    // 여기에 선택된 스터디 정보를 활용하는 추가 로직을 구현할 수 있습니다.
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태 추가
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태 추가
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = (e) => {
    // 로딩 중일 때는 취소 버튼 클릭 방지 (이벤트 기본 동작 막기)
    if (loading) {
      e.preventDefault();
    }
    navigate(`/study/promotion/list`);
  };

  const handleNewFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const submitPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // 새로운 요청 전에 오류 메시지 초기화
    setSuccessMessage(""); // 성공 메시지 초기화

    if (!title || !content) {
      setErrorMessage("제목과 내용을 입력하세요."); // alert 대신 상태 업데이트
      setLoading(false); // 로딩 상태 해제
      return;
    }

    // 스터디 ID가 선택되지 않았다면 오류 메시지 표시
    if (!selectedStudyId) {
      setErrorMessage("스터디를 선택해주세요.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("studyId", selectedStudyId); // 선택된 스터디 ID 추가

    if (attachments?.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    console.log("FormData:", formData); // FormData 내용 확인 (디버깅용)

    try {
      const response = await axios.post(
        `${host}/api/study/promotion`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
          withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
        }
      );

      const newPostId = response.data;
      console.log("newPostId: " + newPostId);
      setSuccessMessage("게시글이 성공적으로 등록되었습니다."); // 메시지 업데이트

      // ReactQuill이 사라지기 전 range 작업 중이므로, 라우팅을 약간 지연
      setTimeout(() => {
        navigate(`/study/promotion/view/${newPostId}`);
      }, 0);
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      setErrorMessage(
        "게시글 등록 실패: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">v</span>
        스터디 선택
      </h2>
      <StudyCarousel
        studyData={demoStudies}
        selectedStudyId={selectedStudyId}
        onSelectStudy={handleStudySelect} // StudyCarousel로 콜백 함수 전달
      />
      {/* App.jsx에서 현재 선택된 스터디 ID를 표시 */}
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "1.1em",
          fontWeight: "bold",
        }}
      >
        현재 선택된 스터디 ID: {selectedStudyId ? selectedStudyId : "없음"}
      </div>

      <h2 className="form-title">
        <span className="form-badge">1</span>
        프로젝트에 대해 소개해주세요.
      </h2>

      {/* 오류 메시지 표시 */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      {/* 성공 메시지 표시 */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <form onSubmit={submitPost} encType="multipart/form-data">
        <div>
          <FormInput
            id="title"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={true}
            placeholder="제목을 입력하세요"
            disabled={loading}
          />
        </div>

        <div>
          <label className="form-label fw-semibold">내용</label>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder={"홍보글을 작성해 주세요."}
            readOnly={loading}
          />
        </div>

        <div>
          <FileInput
            id="attachments"
            label="첨부파일"
            multiple={true}
            helperText="최대 10MB 파일 업로드 가능"
            onChange={handleNewFileChange}
            disabled={loading}
          />
        </div>

        <div className="button-container">
          <button
            className="btn-base btn-gray"
            disabled={loading}
            onClick={handleCancel}
          >
            취소
          </button>

          <button
            type="submit"
            className="btn-base btn-primary margin-left-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                등록 중...
              </>
            ) : (
              "작성하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const demoStudies = [
  {
    id: "study-1", // 고유 ID 추가
    category: "개발",
    name: "React 개발 심화 스터디",
    description:
      "프론트엔드 개발자를 위한 React 심화 스터디입니다. 프로젝트를 함께 만들며 실력을 향상시킵니다.",
    author: "김코딩",
    dueDate: "25.08.09",
    members: 4,
    isOffline: true,
    location: "서울",
    thumbnail: "https://via.placeholder.com/60/aaffa0/ffffff?text=Dev",
  },
  {
    id: "study-2", // 고유 ID 추가
    category: "어학",
    name: "토익 900+ 달성 모의고사 스터디",
    description:
      "매주 토익 모의고사를 풀고 오답 분석을 통해 점수를 올리는 스터디입니다. 열정 있는 분 환영!",
    author: "이영훈",
    dueDate: "25.09.15",
    members: 3,
    isOffline: false,
    location: "",
    thumbnail: "https://via.placeholder.com/60/ffbba0/ffffff?text=Lang",
  },
  {
    id: "study-3", // 고유 ID 추가
    category: "자격증",
    name: "정보처리기사 실기 정복",
    description:
      "정보처리기사 실기 시험 대비 그룹 스터디입니다. 문제풀이와 핵심 개념 정리를 통해 합격 목표!",
    author: "박스터디",
    dueDate: "25.08.20",
    members: 5,
    isOffline: true,
    location: "경기",
    thumbnail: "https://via.placeholder.com/60/a0bbff/ffffff?text=Cert",
  },
  {
    id: "study-4", // 고유 ID 추가
    category: "취업",
    name: "IT 기업 면접 준비 그룹",
    description:
      "기술 면접, 인성 면접 대비를 위한 스터디입니다. 모의 면접과 피드백으로 실전 감각을 익힙니다.",
    author: "최멘토",
    dueDate: "25.10.01",
    members: 2,
    isOffline: false,
    location: "",
    thumbnail: "https://via.placeholder.com/60/bba0ff/ffffff?text=Job",
  },
  {
    id: "study-5", // 고유 ID 추가
    category: "취미",
    name: "초보자를 위한 사진 강좌",
    description:
      "DSLR/미러리스 카메라 초보자를 위한 사진 이론 및 실습 스터디입니다. 함께 출사도 나가요!",
    author: "정포토",
    dueDate: "25.09.05",
    members: 4,
    isOffline: true,
    location: "부산",
    thumbnail: "https://via.placeholder.com/60/ffdea0/ffffff?text=Hobby",
  },
];

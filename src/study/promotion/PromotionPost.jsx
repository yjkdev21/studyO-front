import React, { useState } from "react";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import axios from "axios";
import "./Promotion.css";
import { useNavigate } from "react-router-dom";
import StudyCarousel from "../components/StudyCarousel";

export default function PromotionPost() {
  console.log(import.meta.env.VITE_AWS_API_HOST);
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = (e) => {
    loading && e.preventDefault();
    navigate(`/study/promotion/list`);
  };

  const handleNewFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const submitPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (attachments?.length > 0) {
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await axios.post(
        `${host}/api/study/promotion`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
        }
      );

      const newPostId = response.data;
      console.log("newPostId: " + newPostId);
      // ReactQuill이 사라지기 전 range 작업 중이므로, 라우팅을 약간 지연
      setTimeout(() => {
        navigate(`/study/promotion/view/${newPostId}`);
      }, 0);
    } catch (error) {
      console.error("등록 실패:", error);
      setMessage(
        "등록 실패: " + (error.response?.data?.error || error.message)
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

      {message && (
        <div className="alert alert-info text-center" role="alert">
          {message}
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

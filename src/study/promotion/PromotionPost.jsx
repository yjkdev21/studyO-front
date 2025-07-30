import React, { useState } from "react";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import axios from "axios";
import "./Promotion.css";
import { useNavigate } from "react-router-dom";

export default function PromotionPost() {
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
        "http://localhost:8081/api/study/promotion",
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
      // ⚠️ ReactQuill이 사라지기 전 range 작업 중이므로, 라우팅을 약간 지연
      setTimeout(() => {
        navigate(`/study/promotion/view/${newPostId}`);
      }, 0);
    } catch (error) {
      console.error("등록 실패:", error);
      setMessage(
        "❌ 등록 실패: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promotion-container">
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

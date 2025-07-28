import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import axios from "axios";
import "./Promotion.css";

export default function PromotionEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedStoredFileNames, setDeletedStoredFileNames] = useState([]);
  const [newAttachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleCancel = (e) => {
    loading && e.preventDefault();
    navigate(`/study/promotion/view/${postId}`);
  };

  useCallback(handleCancel);

  // 게시글 상세 정보 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/study/promotion/${postId}`
        );
        const data = res.data;

        setTitle(data.title);
        setContent(data.content);
        setExistingFiles(data.attachFile || []);
      } catch (err) {
        setError("게시글을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // 기존 첨부파일 삭제 핸들러
  const handleDeleteExistingFile = (storedFileName) => {
    setDeletedStoredFileNames((prev) => [...prev, storedFileName]);
    setExistingFiles((prev) =>
      prev.filter((file) => file.storedFileName !== storedFileName)
    );
  };

  // 새 첨부파일 선택
  const handleNewFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  // 수정 제출
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("id", postId); // 기존 게시글 ID
    formData.append("title", title); // 제목
    formData.append("content", content); // 퀼 에디터 내용

    // 삭제할 기존 첨부파일들 (String 배열)
    deletedStoredFileNames.forEach((name) => {
      formData.append("deletedStoredFileNames", name);
    });

    // 새롭게 추가된 첨부파일들 (File 객체 배열)
    newAttachments.forEach((file) => {
      formData.append("newAttachments", file);
    });

    console.log(formData);

    try {
      // "multipart/form-data" 을 사용할 경우 put 요청 spring 500 에러남
      // post 로 보냄
      await axios.post(
        "http://localhost:8081/api/study/promotion/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("게시글이 수정되었습니다.");
      navigate(`/study/promotion/view/${postId}`);
    } catch (error) {
      console.error("수정 중 오류:", error);
      alert("수정 실패");
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">1</span>
        프로젝트 홍보글 수정
      </h2>

      <form onSubmit={handleUpdate} encType="multipart/form-data">
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
          <label>내용</label>
          <QuillEditor
            value={content}
            onChange={setContent}
            readOnly={loading}
          />
        </div>

        <div className="attachment-section">
          <label className="attachment-header">기존 첨부파일</label>
          {existingFiles.length === 0 ? (
            <p>첨부된 파일 없음</p>
          ) : (
            <ul className="attachment-list">
              {existingFiles.map((file) => (
                <li className="attachment-item" key={file.storedFileName}>
                  {file.fileName}
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteExistingFile(file.storedFileName)
                    }
                    className="btn-base btn-dark-orange margin-left-1 pdding-03"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <FileInput
            id="attachments"
            label="새첨부파일"
            multiple={true}
            helperText="최대 10MB 파일 업로드 가능"
            onChange={handleNewFileChange}
            disabled={loading}
          />
        </div>

        <div className="button-container">
          <button
            type="reset"
            className="btn-base btn-gray"
            disabled={loading}
            onClick={handleCancel}
          >
            취소
          </button>

          <button type="submit" className="btn-base btn-primary margin-left-1">
            수정 완료
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import axios from "axios";
import "./Promotion.css";

export default function PromotionEdit() {
  // host는 빌드 시점에 결정되는 값이므로, useState의 초기값으로만 사용됩니다.
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("API Host:", host); // 디버깅을 위해 호스트 값 출력

  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedStoredFileNames, setDeletedStoredFileNames] = useState([]);
  const [newAttachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태 추가
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태 추가

  // handleCancel 함수를 useCallback으로 감싸서 불필요한 재생성을 방지 (의존성 배열은 비어있음)
  const handleCancel = useCallback(
    (e) => {
      // 로딩 중일 때는 취소 버튼 클릭 방지 (이벤트 기본 동작 막기)
      if (loading) {
        e.preventDefault();
      }
      navigate(`/study/promotion/view/${postId}`);
    },
    [loading, navigate, postId]
  );

  // 게시글 상세 정보 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setErrorMessage(""); /// 새로운 요청 전에 오류 메시지 초기화
      try {
        const res = await axios.get(`${host}/api/study/promotion/${postId}`, {
          withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
        });
        const data = res.data;

        setTitle(data.title);
        setContent(data.content);
        setExistingFiles(data.attachFile || []);
      } catch (err) {
        console.error("게시글을 불러오는 데 실패했습니다:", err);
        setErrorMessage(
          "게시글을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, host]); // host도 의존성 배열에 추가하여 변경 시 재호출되도록 함

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
    setErrorMessage(""); // 새로운 요청 전에 오류 메시지 초기화
    setSuccessMessage(""); // 성공 메시지 초기화

    if (!title || !content) {
      setErrorMessage("제목과 내용을 입력하세요."); // alert 대신 상태 업데이트
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

    console.log("FormData:", formData); // FormData 내용 확인 (디버깅용)

    try {
      // "multipart/form-data" 을 사용할 경우 put 요청 spring 500 에러남
      // post 로 보냄
      await axios.post(`${host}/api/study/promotion/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
      });

      setSuccessMessage("게시글이 성공적으로 수정되었습니다."); // alert 대신 상태 업데이트
      // 성공적으로 수정 후 상세 페이지로 이동
      navigate(`/study/promotion/view/${postId}`);
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      setErrorMessage(
        "게시글 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      ); // alert 대신 상태 업데이트
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (errorMessage && !loading)
    return <p className="text-danger">{errorMessage}</p>; // 로딩 중이 아닐 때만 오류 표시

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">1</span>
        프로젝트 홍보글 수정
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

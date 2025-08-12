import React, { useState, useEffect } from "react";
import QuillEditor from "../../common/form/QuillEditor";
import FormInput from "../../common/form/FormInput";
import FileInput from "../../common/form/FileInput";
import AttachmentManager from "../post/components/AttachmentManager";
import "../../study/post/Post.css";

export default function QuillFormFields({
  title,
  content,
  onTitleChange,
  onContentChange,
  initialAttachments = [],
  onSubmit,
  onCancel,
  isLoading,
}) {
  // 컴포넌트 내부에서 관리할 기존 첨부파일 상태
  const [currentInitialAttachments, setCurrentInitialAttachments] =
    useState(initialAttachments);
  const [newAttachments, setNewAttachments] = useState([]);
  const [deletedStoredFileNames, setDeletedStoredFileNames] = useState([]);
  const [errorInputMessage, setErrorInputMessage] = useState("");

  // initialAttachments prop이 변경될 때 상태 업데이트
  // 이는 부모 컴포넌트로부터 새로운 initialAttachments 목록을 받을 때 동기화하기 위함입니다.
  useEffect(() => {
    setCurrentInitialAttachments(initialAttachments);
  }, [initialAttachments]);

  // 새로운 파일을 추가하는 핸들러
  const handleNewFileChange = (e) => {
    setNewAttachments(Array.from(e.target.files));
  };

  // 첨부파일 삭제 핸들러 (AttachmentManager에서 호출)
  const handleDeleteAttachFile = (fileInfo) => {
    // 파일 정보에 storedFileName 속성이 있으면 기존 파일, 없으면 새로운 파일로 판단
    if (fileInfo.storedFileName) {
      // 기존 파일인 경우: 삭제할 목록에 추가하고, 화면에서 제거
      setDeletedStoredFileNames((prev) => [...prev, fileInfo.storedFileName]);
      setCurrentInitialAttachments((prev) =>
        prev.filter((file) => file.storedFileName !== fileInfo.storedFileName)
      );
    } else {
      // 새로운 파일인 경우: newAttachments 목록에서 제거
      setNewAttachments((prev) => prev.filter((file) => file !== fileInfo));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorInputMessage("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    // 부모 컴포넌트로 제목, 내용, 새로 추가된 파일, 삭제할 파일 목록을 전달
    onSubmit(title, content, newAttachments, deletedStoredFileNames);
  };

  // UI에 표시할 모든 첨부파일 목록
  //const orgAttachments = [...currentInitialAttachments];

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      {errorInputMessage && (
        <div className="alert-error-message">{errorInputMessage}</div>
      )}
      <div>
        <FormInput
          id="title"
          label="제목"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required={true}
          placeholder="제목을 입력하세요"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="input-form-label">내용</label>
        <QuillEditor
          value={content}
          onChange={onContentChange}
          placeholder={"홍보글을 작성해 주세요."}
          readOnly={isLoading}
        />
      </div>

      <div>
        {/* FileInput은 새로운 파일을 선택하는 역할만 합니다. */}
        <FileInput
          id="attachments"
          label="첨부파일"
          multiple={true}
          helperText="최대 10MB 파일 업로드 가능"
          onChange={handleNewFileChange}
          disabled={isLoading}
        />
        {/* AttachmentManager는 기존 파일과 새로운 파일 목록을 합쳐서 보여주는 역할만 합니다. */}
        {currentInitialAttachments.length > 0 && (
          <AttachmentManager
            files={currentInitialAttachments}
            mode="edit"
            onDelete={handleDeleteAttachFile}
          />
        )}
      </div>

      <div className="button-container">
        {onCancel && (
          <button
            className="btn-base btn-gray"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
        )}

        <button
          type="submit"
          className="btn-base btn-primary margin-left-1"
          disabled={isLoading}
        >
          {isLoading ? (
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
  );
}

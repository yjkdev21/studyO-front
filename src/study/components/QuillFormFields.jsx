// src/components/QuillFormFields.jsx
import React, { useState, useEffect } from "react";
import QuillEditor from "../../common/form/QuillEditor"; // QuillEditor 경로 확인
import FormInput from "../../common/form/FormInput"; // FormInput 경로 확인
import FileInput from "../../common/form/FileInput"; // FileInput 경로 확인

export default function QuillFormFields({
  title, // prop으로 받음
  content, // prop으로 받음
  onTitleChange, // 제목 변경 콜백
  onContentChange, // 내용 변경 콜백
  initialAttachments = [], // 초기 첨부파일 (수정 시 기존 파일 정보)
  onSubmit, // (title, content, attachments) => void
  onCancel, // () => void
  isLoading, // boolean
}) {
  const [attachments, setAttachments] = useState(initialAttachments);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  // 파일 변경 핸들러
  const handleNewFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(title, content, attachments); // 현재 prop으로 받은 title, content 사용
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <FormInput
          id="title"
          label="제목"
          value={title} // prop으로 받은 title 사용
          onChange={(e) => onTitleChange(e.target.value)} // 부모의 onTitleChange 호출
          required={true}
          placeholder="제목을 입력하세요"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="input-form-label">내용</label>
        <QuillEditor
          value={content} // prop으로 받은 content 사용
          onChange={onContentChange} // 부모의 onContentChange 호출
          placeholder={"홍보글을 작성해 주세요."}
          readOnly={isLoading}
        />
      </div>

      <div>
        <FileInput
          id="attachments"
          label="첨부파일"
          multiple={true}
          helperText="최대 10MB 파일 업로드 가능"
          onChange={handleNewFileChange}
          disabled={isLoading}
        />
        {/* 수정 모드 시 기존 첨부파일 목록을 표시할 수 있습니다. (추가 구현 필요) */}
        {/* {initialAttachments.length > 0 && (
          <div className="mt-2">
            <span className="fw-bold">기존 첨부파일:</span>
            <ul>
              {initialAttachments.map((file, index) => (
                <li key={index}>{file.name || file.fileName}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>

      <div className="button-container">
        <button
          className="btn-base btn-gray"
          disabled={isLoading}
          onClick={onCancel} // 부모로부터 받은 onCancel 콜백 함수 호출
        >
          취소
        </button>

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

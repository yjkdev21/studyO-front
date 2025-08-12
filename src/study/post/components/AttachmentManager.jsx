import React, { useState, useEffect } from "react";
import "./StudyCard.css";

export default function AttachmentManager({
  files = [],
  mode = "view", // 'view' or 'edit'
  onDownload,
  onDelete,
}) {
  const [visibleFiles, setVisibleFiles] = useState(files);

  useEffect(() => {
    setVisibleFiles(files);
  }, [files]);

  // 'edit' 모드에서만 호출되는 삭제 처리 함수입니다.
  const handleDeleteClick = (fileToDelete) => {
    if (onDelete) {
      onDelete(fileToDelete);
    }
  };

  if (!visibleFiles || visibleFiles.length === 0) {
    return null;
  }

  return (
    <div className="attachment-section-container">
      <label className="attachment-header">첨부파일</label>
      <ul className="attachment-list">
        {visibleFiles.map((file) => (
          <li
            className="attachment-item"
            key={file.storedFileName || file.name}
          >
            <span className="attachment-filename">{file.fileName}</span>
            {/* 'view' 모드일 때 다운로드 버튼을 보여줍니다. */}
            {mode === "view" && (
              <button
                type="button"
                onClick={() => onDownload(file.storedFileName, file.fileName)}
                className="btn-base btn-small-orange margin-left-1 pdding-03"
              >
                다운로드
              </button>
            )}
            {/* 'edit' 모드일 때 삭제 버튼을 보여줍니다. */}
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => handleDeleteClick(file)}
                className="btn-base btn-small-dark-orange margin-left-1 pdding-03"
              >
                삭제
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./StudyCard.css";

export default function AttachmentManager({
  files = [],
  mode = "view", // 'view' 또는 'edit' 모드
  onDownload,
  onDelete,
}) {
  const [visibleFiles, setVisibleFiles] = useState(files);

  // 부모로부터 받은 files prop이 변경되면 내부 state도 동기화합니다.
  useEffect(() => {
    setVisibleFiles(files);
  }, [files]);

  // 'edit' 모드에서만 호출되는 삭제 처리 함수입니다.
  const handleDeleteClick = (fileToDelete) => {
    // 부모의 onDelete 함수를 호출하여 삭제 목록에 파일을 추가합니다.
    if (onDelete) {
      onDelete(fileToDelete);
    }
    // UI에서 즉시 파일을 제거하기 위해 내부 state를 업데이트합니다.
    setVisibleFiles(
      visibleFiles.filter(
        (file) => file.storedFileName !== fileToDelete.storedFileName
      )
    );
  };

  if (!visibleFiles || visibleFiles.length === 0) {
    return null;
  }

  return (
    <div className="attachment-section">
      <label className="attachment-header">첨부파일</label>
      <ul className="attachment-list">
        {visibleFiles.map((file) => (
          <li className="attachment-item" key={file.storedFileName}>
            <span className="attachment-filename">{file.fileName}</span>
            {/* 'view' 모드일 때 다운로드 버튼을 보여줍니다. */}
            {mode === "view" && (
              <button
                type="button"
                onClick={() => onDownload(file.storedFileName, file.fileName)}
                className="btn-base btn-primary margin-left-1 pdding-03"
              >
                다운로드
              </button>
            )}
            {/* 'edit' 모드일 때 삭제 버튼을 보여줍니다. */}
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => handleDeleteClick(file)}
                className="btn-base btn-negative margin-left-1 pdding-03"
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

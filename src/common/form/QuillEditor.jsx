import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill"; // ReactQuill 컴포넌트 임포트
import "react-quill/dist/quill.snow.css"; // Quill 에디터의 Snow 테마 CSS 임포트

// quill-blot-formatter 임포트
// 이 라이브러리는 이미지 크기 조절, 이동, 정렬 등 다양한 기능을 제공합니다.
import BlotFormatter from "quill-blot-formatter";

// Quill 객체에 직접 접근하기 위해 ReactQuill이 노출하는 Quill 인스턴스를 사용합니다.
const Quill = ReactQuill.Quill;

// BlotFormatter 모듈을 Quill에 등록합니다.
// 이 등록은 컴포넌트 외부에서 한 번만 호출되어야 합니다.
if (!Quill.imports["modules/blotFormatter"]) {
  Quill.register("modules/blotFormatter", BlotFormatter);
}

const editorStyle = {
  width: "100%",
  height: "500px", // 전체 wrapper 높이 (선택)
};

const editorContentStyle = {
  maxHeight: "250px",
  overflowY: "auto",
};

export default function QuillEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
}) {
  const quillRef = useRef(null);

  useEffect(() => {
    // console.log("QuillEditor mounted or updated.");
  }, []);

  const modules = {
    toolbar: readOnly
      ? false // readOnly인 경우 툴바 제거
      : [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
          ["clean"],
        ],
    blotFormatter: readOnly ? undefined : {},
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "color",
    "background",
  ];

  return (
    <div style={{ marginBottom: "50px" }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={editorStyle}
      />
    </div>
  );
}

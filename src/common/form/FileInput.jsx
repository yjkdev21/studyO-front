// components/FileInput.jsx
import React from "react";

function FileInput({
  id,
  label,
  onChange,
  multiple = false,
  helperText = "",
  accept = "*",
}) {
  return (
    <>
      <div>
        <label htmlFor={id} className="form-label fw-semibold">
          {label}
        </label>
        <input
          type="file"
          className="form-control"
          id={id}
          multiple={multiple}
          accept={accept}
          onChange={onChange}
        />
        {helperText && <div className="form-text">{helperText}</div>}
      </div>
    </>
  );
}

export default FileInput;

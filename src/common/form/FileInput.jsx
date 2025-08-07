// components/FileInput.jsx
import React from "react";
import "./Form.css";

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
        <label htmlFor={id} className="input-form-attach-label">
          {label}
        </label>
        <input
          type="file"
          className="input-form-file-field"
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

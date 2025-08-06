import React from "react";
import "./Form.css";

function FormInput({
  id,
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
}) {
  return (
    <>
      <label htmlFor={id} className="input-form-label">
        {label}
      </label>
      <input
        type={type}
        className="input-form-field"
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </>
  );
}

export default FormInput;

import React from "react";

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
      <label htmlFor={id} className="form-label fw-semibold">
        {label}
      </label>
      <input
        type={type}
        className="form-control"
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

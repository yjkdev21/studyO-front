import React from "react";
import "./Form.css";

// 부모 컴포넌트로부터 date와 onChange 핸들러를 prop으로 받습니다.
const DatePicker = ({ labelText, date, onDateChange }) => {
  // prop으로 받은 날짜 형식이 'YYYY.MM.DD'일 경우, 'YYYY-MM-DD'로 변환합니다.
  const formattedDate = date ? date.replace(/\./g, "-") : "";

  return (
    <div className="date-picker-container">
      <label className="input-form-label" htmlFor={labelText}>
        {labelText}
      </label>
      <div className="date-picker-input-wrapper">
        <input
          type="date"
          id={labelText}
          className="date-picker-input"
          value={formattedDate}
          onChange={(e) => {
            const newDate = e.target.value;
            if (newDate) {
              const [year, month, day] = newDate.split("-");
              onDateChange(`${year}.${month}.${day}`);
            }
          }}
        />
        <span className="calendar-icon">
          <svg className="calendar-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V5h14v2H5zm2 5h5v5H7v-5zm7 0h5v5h-5v-5z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default DatePicker;

import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Join() {
  const navigate = useNavigate();
  const host = import.meta.env.VITE_AWS_API_HOST;

  const [form, setForm] = useState({
    userId: "",
    password: "",
    passwordCheck: "",
    nickname: "",
    email: "",
  });

  const [messages, setMessages] = useState({
    userId: "",
    password: "",
    passwordCheck: "",
    nickname: "",
    email: "",
  });

  const [validationStatus, setValidationStatus] = useState({
    userId: null,
    nickname: null,
    password: null,
    passwordCheck: null,
    email: null,
  });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && password.length <= 16;
  const validateUserId = (userId) => {
    const regex = /^[a-z0-9_-]{5,20}$/;
    return regex.test(userId);
  };

  const CheckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "block", marginBottom: "15" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#FDB515" />
      <path
        d="M7 12l3 3 7-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const checkUserId = useCallback(
    debounce(async (userId) => {
      if (!validateUserId(userId)) {
        setMessages((prev) => ({
          ...prev,
          userId:
            "5~20자의 영문 소문자, 숫자, 특수기호(_),(-)만 사용 가능합니다.",
        }));
        setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
        return;
      }

      try {
        setValidationStatus((prev) => ({ ...prev, userId: "checking" }));
        const response = await axios.get(
          `${host}/api/user/check-id?userId=${userId}`
        );

        if (response.data === "exists") {
          setMessages((prev) => ({
            ...prev,
            userId: "이미 사용 중인 아이디입니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
        } else {
          setMessages((prev) => ({
            ...prev,
            userId: "사용 가능한 아이디입니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, userId: "valid" }));
        }
      } catch (error) {
        console.error("아이디 중복 검사 오류:", error);
        setMessages((prev) => ({
          ...prev,
          userId: "서버 오류가 발생했습니다.",
        }));
        setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
      }
    }, 500),
    [host]
  );

  const checkNickname = useCallback(
    debounce(async (nickname) => {
      if (!nickname.trim()) return;

      try {
        setValidationStatus((prev) => ({ ...prev, nickname: "checking" }));
        const response = await axios.get(
          `${host}/api/user/check-nickname?nickname=${nickname}`
        );

        if (response.data === "exists") {
          setMessages((prev) => ({
            ...prev,
            nickname: "이미 사용 중인 닉네임입니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, nickname: "invalid" }));
        } else {
          setMessages((prev) => ({
            ...prev,
            nickname: "사용 가능한 닉네임입니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, nickname: "valid" }));
        }
      } catch (error) {
        console.error("닉네임 중복 검사 오류:", error);
        setMessages((prev) => ({
          ...prev,
          nickname: "서버 오류가 발생했습니다.",
        }));
        setValidationStatus((prev) => ({ ...prev, nickname: "invalid" }));
      }
    }, 500),
    [host]
  );

  const hasKorean = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    switch (name) {
      case "userId":
        if (value.trim() && !validateUserId(value.trim())) {
          setMessages((prev) => ({
            ...prev,
            userId:
              "5~20자의 영문 소문자, 숫자, 특수기호(_),(-)만 사용 가능합니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
        } else if (value.trim()) {
          checkUserId(value.trim());
        } else {
          setMessages((prev) => ({ ...prev, userId: "" }));
          setValidationStatus((prev) => ({ ...prev, userId: null }));
        }
        break;

      case "email":
        const localPart = value.split("@")[0] || "";
        if (hasKorean(localPart)) {
          setMessages((prev) => ({
            ...prev,
            email: "이메일 앞부분에 한글을 사용할 수 없습니다.",
          }));
          setValidationStatus((prev) => ({ ...prev, email: "invalid" }));
        } else {
          const isEmailValid = validateEmail(value);
          setMessages((prev) => ({
            ...prev,
            email: isEmailValid
              ? "올바른 이메일 형식입니다."
              : "이메일 형식이 올바르지 않습니다.",
          }));
          setValidationStatus((prev) => ({
            ...prev,
            email: isEmailValid ? "valid" : "invalid",
          }));
        }
        break;

      case "nickname":
        if (value.trim()) {
          checkNickname(value.trim());
        } else {
          setMessages((prev) => ({ ...prev, nickname: "" }));
          setValidationStatus((prev) => ({ ...prev, nickname: null }));
        }
        break;

      case "password":
        const isPasswordValid = validatePassword(value);
        setMessages((prev) => ({
          ...prev,
          password: isPasswordValid ? "" : "8~16자리로 입력해주세요.",
          passwordCheck:
            form.passwordCheck && value !== form.passwordCheck
              ? "비밀번호가 일치하지 않습니다."
              : form.passwordCheck && value === form.passwordCheck
              ? ""
              : prev.passwordCheck,
        }));
        setValidationStatus((prev) => ({
          ...prev,
          password: isPasswordValid ? "valid" : "invalid",
          passwordCheck:
            form.passwordCheck && value === form.passwordCheck
              ? "valid"
              : form.passwordCheck && value !== form.passwordCheck
              ? "invalid"
              : prev.passwordCheck,
        }));
        break;

      case "passwordCheck":
        const isPasswordMatch = value === form.password;
        setMessages((prev) => ({
          ...prev,
          passwordCheck: isPasswordMatch ? "" : "비밀번호가 일치하지 않습니다.",
        }));
        setValidationStatus((prev) => ({
          ...prev,
          passwordCheck: isPasswordMatch ? "valid" : "invalid",
        }));
        break;

      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUserId(form.userId.trim())) {
      alert(
        "아이디는 5~20자의 영문 소문자, 숫자, 특수기호(_),(-)만 사용 가능합니다."
      );
      return;
    }

    if (hasKorean(form.email.split("@")[0])) {
      alert("이메일 앞부분에 한글은 사용할 수 없습니다.");
      return;
    }

    if (
      !form.userId.trim() ||
      !form.password ||
      !form.passwordCheck ||
      !form.nickname.trim() ||
      !form.email.trim()
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!validateEmail(form.email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (!validatePassword(form.password)) {
      alert("비밀번호는 8~16자리로 입력해주세요.");
      return;
    }

    if (validationStatus.userId !== "valid") {
      alert("아이디를 다시 확인해주세요.");
      return;
    }

    try {
      console.log("회원가입 요청 시작:", {
        host,
        form: { ...form, password: "***" },
      });

      const [idRes, nickRes] = await Promise.all([
        axios.get(`${host}/api/user/check-id?userId=${form.userId}`),
        axios.get(`${host}/api/user/check-nickname?nickname=${form.nickname}`),
      ]);

      if (idRes.data === "exists") {
        alert("이미 사용 중인 아이디입니다.");
        return;
      }

      if (nickRes.data === "exists") {
        alert("이미 사용 중인 닉네임입니다.");
        return;
      }

      const res = await axios.post(`${host}/api/user/register`, {
        userId: form.userId,
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        profileImage: "",
        introduction: "",
        isDeleted: "N",
        globalRole: "USER",
      });

      console.log("회원가입 응답:", res.data);

      if (res.data === "success") {
        alert("회원가입이 완료되었습니다!");
        navigate("/login", {
          state: {
            userId: form.userId,
            fromSignup: true,
          },
        });
      } else {
        alert("회원가입 실패: " + res.data);
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      if (err.response) {
        console.error("응답 오류:", err.response.data);
        alert(`서버 오류: ${err.response.status} - ${err.response.data}`);
      } else if (err.request) {
        console.error("요청 오류:", err.request);
        alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        console.error("기타 오류:", err.message);
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // 인라인 스타일 객체
  const mainStyle = {
    padding: "0 15px",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const h1Style = {
    fontSize: "clamp(24px, 6vw, 30px)",
    fontWeight: "bold",
    marginTop: "40px",
    textAlign: "center",
  };

  const h2Style = {
    fontSize: "clamp(12px, 3vw, 14px)",
    marginTop: "20px",
    marginBottom: "40px",
    color: "#999999",
    textAlign: "center",
  };

  const formWrapperStyle = {
    width: "90%",
    maxWidth: "400px",
    margin: "0 auto",
    padding: "0 20px",
  };

  const inputWrapperStyle = {
    position: "relative",
    display: "inline-block",
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    border: "none",
    borderBottom: "1.7px solid #999999",
    padding: "0px 30px 5px 4px",
    marginBottom: "8px",
    fontSize: "16px",
    outline: "none",
    display: "block",
  };

  const labelStyle = {
    textAlign: "left",
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  };

  const messageStyle = (msg) => ({
    fontSize: "12px",
    minHeight: "20px",
    marginBottom: "10px",
    color:
      msg.includes("이미 사용 중") ||
      msg.includes("일치하지") ||
      msg.includes("올바르지") ||
      msg.includes("사용 가능합니다.") ||
      msg.includes("서버 오류")
        ? "red"
        : msg.includes("사용 가능한") || msg.includes("올바른 이메일")
        ? "green"
        : "#777",
    textAlign: "left",
  });

  const checkIconStyle = {
    position: "absolute",
    right: "4px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  };

  const buttonStyle = {
    backgroundColor: "#eeeeee",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    padding: "12px 50px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "30px",
    fontWeight: "bold",
    display: "block",
    width: "100%",
    maxWidth: "200px",
    margin: "30px auto 0",
  };

  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>회원가입</h1>
      <h2 style={h2Style}>스터디에서 시작해 프로젝트까지 한번에</h2>
      <div style={formWrapperStyle}>
        <form onSubmit={handleSubmit}>
          {["userId", "password", "passwordCheck", "nickname", "email"].map(
            (field, i) => {
              const labels = {
                userId: "ID",
                password: "Password",
                passwordCheck: "Password Check",
                nickname: "닉네임",
                email: "Email",
              };
              const types = {
                userId: "text",
                password: "password",
                passwordCheck: "password",
                nickname: "text",
                email: "email",
              };

              const msg = messages[field];
              const isValid = validationStatus[field] === "valid";

              return (
                <div key={i}>
                  <label style={labelStyle} htmlFor={field}>
                    {labels[field]}
                  </label>
                  <div style={inputWrapperStyle}>
                    <input
                      id={field}
                      name={field}
                      type={types[field]}
                      value={form[field]}
                      onChange={handleChange}
                      required
                      autoComplete={
                        field.includes("password") ? "new-password" : "off"
                      }
                      style={inputStyle}
                    />
                    {isValid && (
                      <span style={checkIconStyle}>
                        <CheckIcon />
                      </span>
                    )}
                  </div>
                  <div style={messageStyle(msg)}>{msg}</div>
                </div>
              );
            }
          )}

          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}

export default Join;

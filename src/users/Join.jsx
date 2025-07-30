import React, { useState } from "react";
import axios from "axios";

function Join() {
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

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && password.length <= 16;

  // 체크 아이콘 SVG 컴포넌트
  const CheckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "block", marginBottom: "15" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#FDB515" /> {/* 노란 원 */}
      <path
        d="M7 12l3 3 7-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    switch (name) {
      case "userId":
        if (value.trim()) {
          try {
            const res = await axios.get(
              `http://localhost:8081/api/user/check-id?userId=${value}`
            );
            setMessages((prev) => ({
              ...prev,
              userId:
                res.data === "exists"
                  ? " 이미 사용 중인 아이디입니다."
                  : " 사용 가능한 아이디입니다.",
            }));
          } catch {
            setMessages((prev) => ({ ...prev, userId: "⚠️ 서버 오류" }));
          }
        } else {
          setMessages((prev) => ({ ...prev, userId: "" }));
        }
        break;
      case "password":
        setMessages((prev) => ({
          ...prev,
          password: validatePassword(value) ? "" : " 8~16자리로 입력해주세요.",
          passwordCheck:
            form.passwordCheck && value !== form.passwordCheck
              ? " 비밀번호가 일치하지 않습니다."
              : form.passwordCheck
              ? ""
              : "",
        }));
        break;
      case "passwordCheck":
        setMessages((prev) => ({
          ...prev,
          passwordCheck:
            value === form.password ? "" : " 비밀번호가 일치하지 않습니다.",
        }));
        break;
      case "nickname":
        if (value.trim()) {
          try {
            const res = await axios.get(
              `http://localhost:8081/api/user/check-nickname?nickname=${value}`
            );
            setMessages((prev) => ({
              ...prev,
              nickname:
                res.data === "exists"
                  ? " 이미 사용 중인 닉네임입니다."
                  : " 사용 가능한 닉네임입니다.",
            }));
          } catch {
            setMessages((prev) => ({ ...prev, nickname: "⚠️ 서버 오류" }));
          }
        } else {
          setMessages((prev) => ({ ...prev, nickname: "" }));
        }
        break;
      case "email":
        setMessages((prev) => ({
          ...prev,
          email: validateEmail(value)
            ? ""
            : " 이메일 형식이 올바르지 않습니다.",
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8081/api/user/register", {
        userId: form.userId,
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        profileImage: "",
        introduction: "",
        isDeleted: "N",
        globalRole: "USER",
      });

      if (res.data === "success") {
        alert("회원가입 완료!");
      } else {
        alert("회원가입 실패: " + res.data);
      }
    } catch (err) {
      alert("서버 오류 발생!");
      console.error(err);
    }
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
    padding: "0px 30px 5px 4px", // 오른쪽 체크 아이콘 공간 확보
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
    minHeight: "20px", // 항상 같은 높이 유지
    marginBottom: "10px",
    color:
      msg.includes("") ||
      msg.includes("이미 사용 중") ||
      msg.includes("일치하지") ||
      msg.includes("올바르지") ||
      msg.includes("서버 오류")
        ? "red"
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

  const formWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <main>
      <h1
        style={{ fontWeight: "bold", marginTop: "50px", textAlign: "center" }}
      >
        회원가입
      </h1>

      <h2
        style={{
          fontSize: "14px",
          marginTop: "25px",
          marginBottom: "70px",
          color: "#999999",
          textAlign: "center",
        }}
      >
        스터디에서 시작해 프로젝트까지 한번에
      </h2>

      <div style={formWrapperStyle}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400 }}>
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
                password: "text", // 기본 보이도록 text로 변경
                passwordCheck: "password",
                nickname: "text",
                email: "email",
              };

              const msg = messages[field];
              const isValid =
                msg !== "" &&
                (msg.includes("사용 가능한") ||
                  msg.includes("일치합니다") ||
                  msg.includes("올바른 이메일"));

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

          <button
            type="submit"
            style={{
              backgroundColor: "#eeeeee",
              color: "#000",
              border: "none",
              borderRadius: "5px",
              padding: "10px 50px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "30px",
              fontWeight: "bold",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}

export default Join;

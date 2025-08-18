import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "./Auth.css";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: location.state?.userId || '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);

  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // 로그인된 사용자 리다이렉트 처리
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // 로그인된 상태면 메인 페이지로 리다이렉트
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이거나 이미 로그인된 상태라면 아무것도 렌더링하지 않음
  if (isLoading || isAuthenticated) {
    return null; // 또는 로딩 스피너
  }


  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 입력 시 에러 상태 초기화
    if (hasLoginError) {
      setHasLoginError(false);
      setMessage('');
    }
  };

  // 비밀번호 보이기 토글 
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setHasLoginError(false);

    const result = await login(formData);

    if (result.success) {
      setFormData({ userId: '', password: '' });
      setHasLoginError(false);
      navigate("/");
    } else {
      setHasLoginError(true);
    }

    setMessage(result.message);
    setIsSubmitting(false);
  };

  // 페이지 로드 후 초기화
  useEffect(() => {
    if (location.state?.fromSignup) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  // 로그아웃 핸들
  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    alert("로그아웃되었습니다.");
    const result = await logout();
    setMessage(result.message);
  };

  return (
    <main>
      <div className="main-center auth-container">

        <h2>로그인</h2>
        <p className="text-base !my-5 text-[#666]">모든 스터디의 시작 StudyO</p>
        {/* 메시지 표시 */}
        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: isAuthenticated ? '#d4edda' : '#f8d7da',
            color: isAuthenticated ? '#155724' : '#721c24',
            border: `1px solid ${isAuthenticated ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}
        {/* 로그인 폼 */}
        <div className="auth-form">
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label htmlFor="userId" className={hasLoginError ? "error" : ""}>ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className={hasLoginError ? "error" : ""}
                autoComplete="username"
              />
            </div>
            <div className="form-field !mt-10">
              <label htmlFor="password" className={hasLoginError ? "error" : ""}>Password</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={hasLoginError ? "error" : ""}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                >
                  <span className="material-symbols-rounded text-[#666]">Visibility{showPassword ? "_off" : ""}</span>

                </button>
              </div>
            </div>
            <div className="auth-btn-wrap !mt-10">
              <button type="submit" className="auth-btn">로그인</button>
              <Link to="/join" className="auth-btn sub">회원가입</Link>
            </div>
            <div className="text-[#999] text-sm !my-4">
              <Link to="/findId" className="">아이디 찾기</Link>
              <span className="!px-2">|</span>
              <Link to="/findPw" className="">비밀번호 찾기</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
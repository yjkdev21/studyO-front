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

  const { user, isAuthenticated, isLoading, login, logout, deleteAccount } = useAuth();



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

    const result = await logout();
    setMessage(result.message);
    alert("로그아웃되었습니다.");
  };

  // 회원 탈퇴 요청
  const handleDeleteAccount = async () => {
    // 확인 창 추가
    if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    const result = await deleteAccount();

    if (result.success) {
      alert(result.message);
      window.location.href = "/login";
    } else {
      alert(result.message);
    }

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
        {/* 로그인된 상태 */}
        {isAuthenticated ? (
          <div>
            <h3>환영합니다, {user.nickname || user.userId}님!</h3>
            <div>
              <p><strong>ID:</strong> {user.userId}</p>
              <p><strong>이메일:</strong> {user.email}</p>
              <p><strong>닉네임:</strong> {user.nickname}</p>
              {user.introduction && <p><strong>소개:</strong> {user.introduction}</p>}
              <p><strong>가입일:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? '로그아웃 중...' : '로그아웃'}
            </button>
            {/* 회원탈퇴 버튼 */}
            <br />
            <button
              type="button"
              className="!border !mt-20 !p-1"
              onClick={handleDeleteAccount}
            >
              회원 탈퇴
            </button>

          </div>
        ) : (
          /* 로그인 폼 */
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
            <div className="none">
              <pre className='bg-gray-200'>
                <b>[로그인 테스트 정보]</b><br />
                id:   kim_coder<br />
                pw:        1234
              </pre><br />
              <pre className='bg-gray-200'>
                <b>[로그인 테스트 정보]</b><br />
                id:         demo<br />
                pw:        1234
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

function FindId() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const { findUserId } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
    } else {
      setErrors({});
    }

    if (result) setResult(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!email.trim()) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await findUserId(email.trim());
      setResult(response);
    } catch {
      setResult({
        success: false,
        message: '아이디 찾기 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setResult(null);
    setErrors({});
  };

  return (
    <main>
      <div className="main-center auth-container">
        <h2>아이디 찾기</h2>
        <div className="auth-form">
          {!result ? (
            <>
              <p className="text-base !my-5 text-[#666]">가입 시 사용한 이메일 주소를 입력해주세요</p>
              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <input
                  name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="example@email.com"
                    disabled={isLoading}
                    className={errors.email && "error"}
                  />
                  {errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>
                <button type="submit" className="auth-btn !mt-5">아이디 찾기</button>
              </form>
            </>
          ) : (
            <div>
              {result.success ? (
                <>
                  <p className="text-base !my-5 text-[#666]">해당하는 아이디를 찾았습니다!</p>
                  <p className="result-text">{result.userId}</p>
                  <button 
                  onClick={() => navigate('/login')}
                  className="auth-btn !mt-5"
                  >
                    로그인
                  </button>
                </>
              ) : (
                <>
                  <p className="text-base !my-5 text-[#666]">아이디를 찾을 수 없습니다</p>
                  <p className="error-text">{result.message}</p>
                  <button onClick={handleReset} className="auth-btn sub !mt-5">다시 시도하기</button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="text-[#666] text-sm !my-4">
          <button onClick={() => navigate('/findPw')}>
            비밀번호 찾기
          </button>
          <span className="!px-2">|</span>
          <button onClick={() => navigate('/login')}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}

export default FindId;
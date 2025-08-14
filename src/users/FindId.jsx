import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function FindId() {
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
        <h2 className="text-5xl">아이디 찾기</h2>
        <p className="text-base !my-5 text-[#666]">가입 시 사용한 이메일 주소를 입력해주세요</p>

        {!result ? (
          <div className="auth-form">
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                {/* <label htmlFor="email">이메일 주소</label> */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p style={{ color: 'red', fontSize: '0.9rem' }}>{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isLoading ? '찾는 중...' : '아이디 찾기'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {result.success ? (
              <>
                <p>아이디 찾기 성공</p>
                <p>
                  <strong>{result.userId}</strong>
                </p>
                <button onClick={() => window.location.href = '/login'}>
                  로그인하기
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'red' }}>아이디를 찾을 수 없습니다.</p>
                <p>{result.message}</p>
                <button onClick={handleReset}>다시 시도하기</button>
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button onClick={() => window.location.href = '/FindPw'}>
            비밀번호 찾기
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
          <button onClick={() => window.location.href = '/login'}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}

export default FindId;

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

function FindPw() {
  const navigate = useNavigate();

  // 단계 관리 (1: 계정 검증, 2: 비밀번호 입력, 3: 결과)
  const [step, setStep] = useState(1);

  const [verifyForm, setVerifyForm] = useState({ userId: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const { verifyAccount, resetPassword } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 1단계: 계정 검증 폼 변경
  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyForm(prev => ({ ...prev, [name]: value }));

    // 입력 시작하면 해당 필드의 에러 제거
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식을 입력해주세요.' }));
    }
  };

  // 2단계: 비밀번호 폼 변경
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    // 비밀번호 일치 검증
    if (passwordForm.confirmPassword || name === 'confirmPassword') {
      if (
        name === 'newPassword' && passwordForm.confirmPassword !== value ||
        name === 'confirmPassword' && passwordForm.newPassword !== value
      ) {
        setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  // 1단계 제출
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const { userId, email } = verifyForm;
    const newErrors = {};
    if (!userId.trim()) newErrors.userId = '아이디를 입력해주세요.';
    if (!email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else if (!validateEmail(email)) newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    setErrors({});
    try {
      const response = await verifyAccount(userId.trim(), email.trim());
      if (response.success) setStep(2);
      else setErrors({ general: response.message });
    } catch {
      setErrors({ general: '계정 검증 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계 제출
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwordForm;
    const newErrors = {};
    if (!newPassword.trim()) newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    else if (newPassword.length < 8) newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.';
    if (!confirmPassword.trim()) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    setErrors({});
    try {
      const response = await resetPassword(verifyForm.userId.trim(), verifyForm.email.trim(), newPassword.trim());
      setResult(response);
      setStep(3);
    } catch {
      setResult({ success: false, message: '비밀번호 재설정 중 오류가 발생했습니다.' });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setStep(1);
    setVerifyForm({ userId: '', email: '' });
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setResult(null);
    setErrors({});
  };

  // 이전 단계
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setErrors({});
    }
  };

  return (
    <main>
      <div className="main-center auth-container">
        <h2>비밀번호 찾기</h2>
        <div className="auth-form">
          {step === 1 && (
            <form onSubmit={handleVerifySubmit}>
              <p className="text-base !my-5 text-[#666]">아이디와 이메일을 입력해주세요</p>
              <div className="form-field">
                <label>ID</label>
                <input
                  type="text"
                  name="userId"
                  value={verifyForm.userId}
                  onChange={handleVerifyChange}
                  placeholder="아이디를 입력하세요"
                  disabled={isLoading}
                  className={errors.userId && "error"}
                  autoComplete="username"
                />
                {errors.userId && <p className="error-text">{errors.userId}</p>}
              </div>
              <div className="form-field !mt-5">
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={verifyForm.email}
                  onChange={handleVerifyChange}
                  placeholder="이메일을 입력하세요"
                  disabled={isLoading}
                  className={errors.email && "error"}
                  autoComplete="email"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              {errors.general && <p className="error-text !mt-3">{errors.general}</p>}
              <button type="submit" className="auth-btn !mt-5" disabled={isLoading}>
                {isLoading ? '확인 중...' : '계정 확인'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePasswordSubmit}>
              <p className="text-base !my-5 text-[#666]">계정이 확인되었습니다.<br />새 비밀번호를 입력해주세요.</p>
              <div className="form-field">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                  disabled={isLoading}
                  className={errors.newPassword && "error"}
                  autoComplete="new-password"
                />
                {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
              </div>
              <div className="form-field !mt-5">
                <label>비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={isLoading}
                  className={errors.confirmPassword && "error"}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
              <div className="flex gap-3 !mt-5">
                <button type="button" onClick={handleBack} className="auth-btn sub flex-1" disabled={isLoading}>이전</button>
                <button type="submit" className="auth-btn flex-1" disabled={isLoading}>{isLoading ? '변경 중...' : '비밀번호 변경'}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              {result?.success ? (
                <>
                  <p className="text-base !my-5 text-[#666]">✅ 비밀번호가 성공적으로 변경되었습니다!</p>
                  <button onClick={() => navigate('/login')} className="auth-btn !mt-5">로그인하러 가기</button>
                </>
              ) : (
                <>
                  <p className="text-base !my-5 text-[#666]">❌ 비밀번호 변경에 실패했습니다</p>
                  <p className="error-text">{result?.message}</p>
                  <button onClick={handleReset} className="auth-btn sub !mt-5">처음부터 다시 시도</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-[#666] text-sm !my-4">
          <button onClick={() => navigate('/findId')}>아이디 찾기</button>
          <span className="!px-2">|</span>
          <button onClick={() => navigate('/login')}>로그인으로 돌아가기</button>
        </div>
      </div>
    </main>
  );
}

export default FindPw;

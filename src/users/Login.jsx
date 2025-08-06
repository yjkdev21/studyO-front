import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, isLoading, login, logout, deleteAccount } = useAuth();

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const result = await login(formData);

    if (result.success) {
      setFormData({ userId: '', password: '' });
    }

    setMessage(result.message);
    setIsSubmitting(false);
  };

  // 로그아웃 핸들
  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmed) return;

    const result = await logout();
    setMessage(result.message);
    alert("로그아웃되었습니다.");
    // 로그인 화면으로 이동
    // window.location.href = "/login";
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

  // 로딩 중일 때 로딩 화면 표시
  // if (isLoading) {
  //   return (
  //     <main style={{ 
  //       padding: '20px', 
  //       maxWidth: '500px', 
  //       margin: '0 auto',
  //       textAlign: 'center'
  //     }}>
  //       <div style={{
  //         padding: '40px',
  //         fontSize: '18px',
  //         color: '#666'
  //       }}>
  //         로딩 중...
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main>
      <div className="main-center w-xl">

        <h2 className="text-5xl">로그인</h2>
        <p>(임시 디자인)</p>
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
          <div>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="userId" style={{ display: 'block', marginBottom: '5px' }}>
                  ID
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  style={{
                    padding: '8px',
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  style={{
                    padding: '8px',
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </button>
                <Link
                  to="/join"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                  }}
                >
                  회원가입
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '10px' }} className='!my-4'>
                <Link
                  to="/findId"
                  style={{
                    padding: '10px 20px',
                    border: '1px solid gray',
                    borderRadius: '4px',
                  }}
                >
                  아이디 찾기
                </Link>
                <Link
                  to="/findPw"
                  style={{
                    padding: '10px 20px',
                    border: '1px solid gray',
                    borderRadius: '4px',
                  }}
                >
                  비밀번호 찾기
                </Link>
              </div>
            </form>
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
        )}
      </div>
    </main>
  );
}
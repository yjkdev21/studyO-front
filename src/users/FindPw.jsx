import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 경로는 프로젝트에 맞게 수정

function FindPw() {
  const { resetPassword } = useAuth();

  const [form, setForm] = useState({
    userId: '',
    email: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { userId, email, newPassword } = form;

    if (!userId || !email || !newPassword) {
      setMessage('모든 필드를 입력해주세요.');
      setSuccess(false);
      return;
    }

    const result = await resetPassword(userId, email, newPassword);

    setMessage(result.message);
    setSuccess(result.success);
  };

  return (
    <main>
      <span>(디자인 추후수정)</span>
      <div className="main-center !w-200">
        <h2 className="text-2xl font-semibold mb-4 text-center">비밀번호 재설정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">아이디</label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              className="!border"
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div>
            <label className="block font-medium">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="!border"
              placeholder="가입한 이메일 주소"
            />
          </div>
          <div>
            <label className="block font-medium">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="!border"
              placeholder="새 비밀번호 입력"
            />
          </div>
          <button
            type="submit"
            className="!bg-blue-300 text-white !p-2 !mt-4 rounded"
          >
            비밀번호 재설정
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${success ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

export default FindPw;

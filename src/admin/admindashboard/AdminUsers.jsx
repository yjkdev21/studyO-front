// src/admin/AdminUsers.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminUsers.css"; // 수정된 CSS 파일 불러오기

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8081/api/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("회원 목록을 불러오는 데 실패했습니다.", err);
      setError("회원 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/users/search",
        {
          params: { searchKeyword },
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error("회원 검색에 실패했습니다.", err);
      setError("회원 검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-page-title">회원 관리</h2>

      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="아이디 또는 닉네임으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="admin-search-input"
        />
        <button onClick={handleSearch} className="admin-search-btn">
          검색
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner">로딩 중...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>아이디</th>
              <th>닉네임</th>
              <th>이메일</th>
              <th>가입일자</th>
              <th>권한</th>
              <th>탈퇴 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.nickname}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.globalRole}</td>
                <td>{user.isDeleted === "Y" ? "탈퇴" : "회원"}</td>
                <td>
                  <button className="admin-action-btn delete-btn">탈퇴</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;

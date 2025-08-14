import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminGroups.css"; // 파일명은 그대로 유지

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const host = import.meta.env.VITE_AWS_API_HOST;

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${host}/api/admin/groups`);
      setGroups(response.data);
    } catch (err) {
      console.error("그룹 목록을 불러오는 데 실패했습니다.", err);
      setError("그룹 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${host}/api/admin/groups/search`, {
        params: { searchKeyword },
      });
      setGroups(response.data);
    } catch (err) {
      console.error("그룹 검색에 실패했습니다.", err);
      setError("그룹 검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (window.confirm("정말로 이 스터디 그룹을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${host}/api/admin/groups/${groupId}`);
        alert("스터디 그룹이 삭제되었습니다.");
        fetchGroups();
      } catch (err) {
        console.error("그룹 삭제 실패:", err);
        alert("그룹 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="g-admin-container">
      <h2 className="g-admin-page-title">스터디 그룹 관리</h2>

      <div className="g-admin-search-bar">
        <input
          type="text"
          placeholder="그룹명 또는 카테고리로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="g-admin-search-input"
        />
        <button onClick={handleSearch} className="g-admin-search-btn">
          검색
        </button>
      </div>

      {isLoading ? (
        <div className="g-loading-spinner">로딩 중...</div>
      ) : error ? (
        <div className="g-error-message">{error}</div>
      ) : (
        <table className="g-admin-group-table">
          <thead>
            <tr>
              <th>그룹명</th>
              <th>그룹 생성일</th>
              <th>카테고리</th>
              <th>진행 방식</th>
              <th>현재 인원/최대 인원</th>
              <th>스터디 상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.groupId}>
                <td>{group.groupName}</td>
                <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                <td>{group.category}</td>
                <td>{group.studyMode}</td>
                <td>
                  {group.currentMembers}/{group.maxMembers}명
                </td>
                <td>{group.status}</td>
                <td>
                  <button
                    className="g-admin-action-btn g-delete-btn"
                    onClick={() => handleDelete(group.groupId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminGroups;

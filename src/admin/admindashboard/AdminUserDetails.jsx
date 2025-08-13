// src/admin/AdminUserDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminUserDetails.css"; // 새로운 CSS 파일

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [userStudies, setUserStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const host = import.meta.env.VITE_AWS_API_HOST;

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userResponse = await axios.get(
          `${host}/api/admin/users/${userId}`
        );
        setUserDetails(userResponse.data);

        const studiesResponse = await axios.get(
          `${host}/api/admin/users/${userId}/studies`
        );
        setUserStudies(studiesResponse.data);
      } catch (err) {
        console.error("회원 상세 정보를 불러오는 데 실패했습니다.", err);
        setError("회원 상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId, host]);

  if (isLoading) {
    return <div className="admin-container loading-spinner">로딩 중...</div>;
  }
  if (error) {
    return <div className="admin-container error-message">{error}</div>;
  }
  if (!userDetails) {
    return (
      <div className="admin-container error-message">
        회원 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const handleGoBack = () => {
    navigate("/admin/users");
  };

  const handleWithdrawal = async () => {
    if (
      window.confirm(`${userDetails.nickname} 회원을 탈퇴 처리하시겠습니까?`)
    ) {
      try {
        await axios.delete(`${host}/api/admin/users/${userDetails.id}`);
        alert("회원 탈퇴 처리가 완료되었습니다.");
        navigate("/admin/users");
      } catch (err) {
        console.error("회원 탈퇴 처리 실패:", err);
        alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="admin-user-details-container">
      <div className="back-button-section" onClick={handleGoBack}>
        {"<"} 회원 목록으로
      </div>

      <div className="user-profile-section">
        <div className="profile-image-container">
          <img
            src={userDetails.profileImage || "기본_이미지_경로"}
            alt="프로필"
            className="profile-image"
          />
        </div>
        <div className="user-info">
          <h2>{userDetails.nickname}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">아이디</span>
              <span className="info-value">{userDetails.userId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">이메일</span>
              <span className="info-value">{userDetails.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">가입일자</span>
              <span className="info-value">
                {new Date(userDetails.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">권한 등급</span>
              <span className="info-value">{userDetails.globalRole}</span>
            </div>
            <div className="info-item">
              <span className="info-label">탈퇴 여부</span>
              <span className="info-value">
                {userDetails.isDeleted === "Y" ? "탈퇴" : "회원"}
              </span>
            </div>
          </div>
          <button className="withdrawal-button" onClick={handleWithdrawal}>
            회원 탈퇴
          </button>
        </div>
      </div>

      <div className="user-studies-section">
        <h3>소속 스터디</h3>
        <table className="user-studies-table">
          <thead>
            <tr>
              <th>그룹명</th>
              <th>그룹 생성일</th>
              <th>카테고리</th>
              <th>진행 방식</th>
              <th>현재 인원/최대 인원</th>
              <th>스터디 상태</th>
            </tr>
          </thead>
          <tbody>
            {userStudies.map((study) => (
              <tr key={study.groupId}>
                <td>{study.groupName}</td>
                <td>{new Date(study.createdAt).toLocaleDateString()}</td>
                <td>{study.category}</td>
                <td>{study.studyMode}</td>
                <td>
                  {study.currentMembers}/{study.maxMembers}명
                </td>
                <td>{study.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminUserDetails;

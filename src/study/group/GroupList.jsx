import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [host] = useState(import.meta.env.VITE_AWS_API_HOST);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${host}/api/study`);
      if (response.data.success) {
        setGroups(response.data.data);
      } else {
        setError(response.data.message || "데이터를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("그룹 목록 가져오기 실패:", err);
      setError("서버 통신 중 오류가 발생했습니다.");
    }
  };

  // 썸네일 이미지 URL 생성
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    return `${host}/uploads/${thumbnail}`;
  };

  // 이미지 로드 에러 처리
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    console.error('이미지 로드 실패:', e.target.src);
  };

   return (
    <div className="container mt-4">
      <h2>스터디 그룹 목록</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {groups.length === 0 ? (
        <p>등록된 스터디 그룹이 없습니다.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {groups.map((group) => (
            <div className="col" key={group.groupId}>
              <div
                className="card h-100 shadow-sm"
                onClick={() => navigate(`/group/${group.groupId}`)}
                style={{ cursor: "pointer" }}
              >
                {group.thumbnail && (
                  <img
                    src={getThumbnailUrl(group.thumbnail)}
                    className="card-img-top"
                    alt="썸네일"
                    style={{
                      height: '200px',
                      objectFit: 'cover',
                      backgroundColor: '#f8f9fa'
                    }}
                    onError={handleImageError}
                    onLoad={() => console.log('이미지 로드 성공:', group.thumbnail)}
                  />
                )}

                <div className="card-body">
                  <h5 className="card-title">{group.groupName}</h5>
                  <p className="card-text">{group.groupIntroduction}</p>

                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className="badge bg-primary">{group.category}</span>
                    <span className="badge bg-secondary">{group.studyMode}</span>
                    {group.region && <span className="badge bg-info">{group.region}</span>}
                  </div>

                  <small className="text-muted">
                    최대 인원: {group.maxMembers}명
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function GroupDetail() {
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await axios.get(`${host}/api/study/${groupId}`);
                console.log("=== 그룹 데이터 디버깅 ===");
                console.log("전체 응답:", response.data);
                console.log("그룹 데이터:", response.data.data);
                console.log("썸네일 값:", response.data.data.thumbnail);
                console.log("썸네일 타입:", typeof response.data.data.thumbnail);
                
                setGroup(response.data.data); 
            } catch (err) {
                console.error("그룹 조회 실패:", err);
                setErrorMessage("❌ 그룹 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (groupId) fetchGroup();
    }, [groupId, host]);

    // 이미지 URL을 결정하는 함수
    const getImageUrl = (thumbnail) => {
        console.log("=== 이미지 URL 결정 ===");
        console.log("썸네일 파일명:", thumbnail);
        
        // null, undefined, 빈 문자열 또는 기본 이미지인 경우
        if (!thumbnail || thumbnail === 'default-thumbnail.png') {
            console.log("기본 이미지 사용: /images/default-thumbnail.png");
            return '/images/default-thumbnail.png';
        }
        
        // 업로드된 파일인 경우
        const imageUrl = `${host}/uploads/${thumbnail}`;
        console.log("업로드된 이미지 URL:", imageUrl);
        return imageUrl;
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;

        try {
            await axios.delete(`${host}/api/study/${groupId}`);
            alert("삭제 완료!");
            navigate("/groupList");
        } catch (err) {
            console.error("삭제 실패:", err);
            setErrorMessage("❌ 삭제에 실패했습니다.");
        }
    };

    if (loading) return <p>로딩 중...</p>;
    if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;
    if (!group) return <div>존재하지 않는 그룹입니다.</div>;

    return (
        <div className="container mt-4">
            <h2>{group.groupName}</h2>
            <p className="text-muted">
                카테고리: {group.category} | 모드: {group.studyMode} | 지역: {group.region}
            </p>

            <div className="mb-3">
                <img
  src={
    group.thumbnail
      ? `http://localhost:8081/api/study/image/${group.thumbnail}`
      : '/image/default.jpg'
  }
  alt="썸네일"
  width="200"
/>

                
                {/* 디버깅용 정보 표시 (개발 중에만 사용) */}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    <div>썸네일 파일명: {group.thumbnail || 'null'}</div>
                    <div>이미지 URL: {getImageUrl(group.thumbnail)}</div>
                </div>
            </div>

            <div className="mt-3">
                <strong>닉네임:</strong> {group.nickname}<br />
                <strong>최대 인원:</strong> {group.maxMembers}명<br />
                <strong>연락 방법:</strong> {group.contact}<br />
                <strong>소개:</strong> <p>{group.groupIntroduction}</p>
            </div>

            <div className="mt-4">
                <Link to="/groupList" className="btn btn-secondary">목록</Link>
                <Link to={`/groupUpdate/${group.groupId}`} className="btn btn-primary mx-2">수정</Link>
                <button onClick={handleDelete} className="btn btn-danger">삭제</button>
            </div>
        </div>
    );
}
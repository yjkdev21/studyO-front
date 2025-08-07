import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

export default function GroupDetail() {
    const host = import.meta.env.VITE_AWS_API_HOST;
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [memberCount, setMemberCount] = useState(0);
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!groupId || !isAuthenticated) {
            setGroup(null);
            setLoading(false);
            return;
        }

        const fetchGroup = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await axios.get(`${host}/api/study/${groupId}`, { withCredentials: true });
                if (response.data && response.data.data) {
                    setGroup(response.data.data);
                } else {
                    setGroup(null);
                }

                try {
                    const memberResponse = await axios.get(`${host}/api/study/${groupId}/members`, { withCredentials: true });
                    setMemberCount(memberResponse.data.memberCount || 0);
                } catch {
                    setMemberCount(0);
                }
            } catch (err) {
                setErrorMessage("❌ 그룹 정보를 불러오는 데 실패했습니다.");
                setGroup(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId, host, isAuthenticated]);

    if (loading || isLoading) return <p>로딩 중...</p>;

    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <h2>로그인이 필요합니다</h2>
                <p>스터디 그룹 상세 정보를 보려면 먼저 로그인해주세요.</p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    로그인하러 가기
                </button>
            </div>
        );
    }

    if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;
    if (!group) return <div>존재하지 않는 그룹입니다.</div>;

    const isOwner = () => {
        if (!user || !group) return false;
        const userId = user.id || user.userId;
        return group.groupOwnerId === userId;
    };

    const canDelete = () => {
        return isOwner() && memberCount <= 1;
    };

    const getThumbnailUrl = (group) => {
        if (!group || !group.thumbnail) {
            return '/images/default-thumbnail.png';
        }
        return group.thumbnail;
    };

    const handleDelete = async () => {
        if (!canDelete()) {
            if (!isOwner()) {
                alert("❌ 삭제 권한이 없습니다. 그룹 소유자만 삭제할 수 있습니다.");
            } else if (memberCount > 1) {
                alert("❌ 다른 멤버가 있어 삭제할 수 없습니다. 모든 멤버가 나간 후 삭제해주세요.");
            }
            return;
        }

        const confirmed = window.confirm(`정말 삭제하시겠습니까?\n현재 멤버 수: ${memberCount}명`);
        if (!confirmed) return;

        try {
            await axios.delete(`${host}/api/study/${groupId}`, { withCredentials: true });
            alert("삭제가 완료되었습니다.");
            navigate(-1);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "삭제에 실패했습니다.";
            setErrorMessage(`❌ ${errorMsg}`);
        }
    };

    return (
        <div className="container mt-4">
            <h2>{group.groupName}</h2>
            <p className="text-muted">
                카테고리: {group.category} | 모드: {group.studyMode} | 지역: {group.region}
            </p>

            <div className="mb-3">
                <img
                    src={getThumbnailUrl(group)}
                    alt="썸네일"
                    width="200"
                    onError={(e) => { e.target.src = '/images/default-thumbnail.png'; }}
                />
            </div>

            <div className="mt-3">
                <strong>닉네임:</strong> {group.nickname}<br />
                <strong>최대 인원:</strong> {group.maxMembers}명<br />
                <strong>현재 멤버:</strong> {memberCount}명<br />
                <strong>연락 방법:</strong> {group.contact}<br />
                <strong>소개:</strong> <p>{group.groupIntroduction}</p>
            </div>

            <div className="mt-4">
                <Link to="/groupList" className="btn btn-secondary">목록</Link>

                {isOwner() && (
                    <>
                        <Link to={`/groupUpdate/${group.groupId}`} className="btn btn-primary mx-2">
                            수정
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="btn btn-danger"
                            disabled={!canDelete()}
                            title={!canDelete() ? "다른 멤버가 있어 삭제할 수 없습니다" : ""}
                        >
                            삭제 {memberCount > 1 && `(멤버 ${memberCount}명)`}
                        </button>
                    </>
                )}
                {/* 권한 정보 디버깅 (개발 중에만 표시) */}
            <div style={{ fontSize: '12px', color: '#999', marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                <strong>권한 디버깅:</strong><br />
                로그인 여부: {isAuthenticated ? 'O' : 'X'}<br />
                현재 사용자 ID: {user?.id || user?.userId || 'N/A'}<br />
                그룹 소유자 ID: {group.groupOwnerId}<br />
                소유자 여부: {isOwner() ? 'O' : 'X'}<br />
                삭제 가능 여부: {canDelete() ? 'O' : 'X'}<br />
                멤버 수: {memberCount}명
            </div>
            </div>
        </div>
    );
}

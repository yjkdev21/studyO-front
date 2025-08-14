import React, { useEffect, useState } from "react";
import axios from "axios";
import './group.css';
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';


export default function GroupDetail() {
    const host = import.meta.env.VITE_AWS_API_HOST;
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [memberCount, setMemberCount] = useState(0);
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();
    const defaultProfileImageSrc = "/images/default-profile.png";

    const loadUserProfileImage = async (userId) => {
        if (!userId) return defaultProfileImageSrc;

        try {
            const apiUrl = host || 'http://localhost:8081';
            const response = await axios.get(`${apiUrl}/api/user/${userId}`, {
                withCredentials: true,
                timeout: 10000
            });

            if (response.status === 200 && response.data.success) {
                const serverUser = response.data.data;
                return serverUser.profileImageFullPath || defaultProfileImageSrc;
            } else {
                return defaultProfileImageSrc;
            }
        } catch {
            return defaultProfileImageSrc;
        }
    };

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
                    const groupData = response.data.data;
                    setGroup(groupData);

                    if (groupData.groupOwnerId) {
                        const profileImageUrl = await loadUserProfileImage(groupData.groupOwnerId);
                        setProfileImage(profileImageUrl);
                    }
                } else {
                    setGroup(null);
                }

                try {
                    const memberResponse = await axios.get(`${host}/api/study/${groupId}/members`, { withCredentials: true });
                    setMemberCount(memberResponse.data.memberCount || 0);
                } catch {
                    setMemberCount(0);
                }
            } catch {
                setErrorMessage("그룹 정보를 불러오는 데 실패했습니다.");
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
        if (!group) {
            return '/images/default-thumbnail.png';
        }
        if (group.thumbnailFullPath && !group.thumbnailFullPath.includes('default')) {
            return group.thumbnailFullPath;
        }
        if (group.thumbnail && !group.thumbnail.includes('default')) {
            return group.thumbnail;
        }
        return '/images/default-thumbnail.png';
    };

    const handleProfileImageError = (e) => {
        e.target.src = defaultProfileImageSrc;
    };

    const handleDelete = async () => {
        if (!canDelete()) {
            if (!isOwner()) {
                alert("삭제 권한이 없습니다. 그룹 소유자만 삭제할 수 있습니다.");
            } else if (memberCount > 1) {
                alert("다른 멤버가 있어 삭제할 수 없습니다. 모든 멤버가 나간 후 삭제해주세요.");
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
        <div id="groupdetail" className="container mt-4">
            <div className="view-header-section">
                <h2 className="form-title">
                    <span className="form-badge">✔</span>
                    스터디 그룹글
                </h2>
                <h1 className="view-title">{group.groupName}</h1>
                <div className="view-author-info">
                    <img
                        src={profileImage || defaultProfileImageSrc}
                        alt="프로필 이미지"
                        className="view-profile-image"
                        onError={handleProfileImageError}
                    />
                    <span className="view-author">{group.nickname}</span>
                    <span className="view-date"> | 스터디 그룹</span>
                </div>
                <div id="groupdetail" className="thumbnail-section">
                    <img
                        src={getThumbnailUrl(group)}
                        alt="썸네일"
                        onError={(e) => {
                            e.target.src = '/images/default-thumbnail.png';
                        }}
                    />
                </div>
                <div className="view-meta-info-flex">
                    <div className="meta-item">
                        <span className="meta-label">카테고리</span>
                        <span className="meta-value">{group.category}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">최대 인원</span>
                        <span className="meta-value">{group.maxMembers}명</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">진행방식</span>
                        <span className="meta-value">{group.studyMode}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">지역</span>
                        <span className="meta-value">{group.region}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">연락방법</span>
                        <span className="meta-value">{group.contact}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">현재 멤버</span>
                        <span className="meta-value">{memberCount}명</span>
                    </div>
                </div>
            </div>

            <div className="view-body-section">
                <h3 className="section-title">스터디 소개</h3>
                <div id="groupdetail" className="intro-content">
                    {group.groupIntroduction}
                </div>
            </div>

            <div id="groupdetail" className="button-container">
                <Link to={`/study/${groupId}/dashboard`} className="btn btn-secondary">
                    대시보드
                </Link>
                <Link to="/study/postMain" className="btn btn-secondary">
                    홍보글 관리
                </Link>
                {isOwner() && (
                    <>
                        <Link to={`/groupUpdate/${group.groupId}`} className="btn btn-primary">
                            수정
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

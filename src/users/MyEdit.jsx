import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from "./modal/ConfirmModal";
import axios from 'axios';
import './MyEdit.css';

function MyEdit() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const defaultProfileImageSrc = "/images/default-profile.png";

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        id: null,
        userId: '',
        nickname: '',
        newPassword: '',
        confirmPassword: '',
        introduction: '',
        profileImage: null
    });

    // 프로필 이미지 관련 상태
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [isImageChanged, setIsImageChanged] = useState(false);

    // 모달 상태
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 표시용 사용자 정보
    const [displayUser, setDisplayUser] = useState(null);

    //SSL 환경을 위한 API URL 결정 함수
    const getApiUrl = () => {
        // HTTPS 환경(배포)에서는 8081 포트 사용
        if (window.location.protocol === 'https:') {
            return 'https://www.studyo.r-e.kr:8081';
        }
        // HTTP 환경(로컬)에서는 환경변수 사용
        return import.meta.env.VITE_AWS_API_HOST || '';
    };

    // 컴포넌트 마운트 시 사용자 프로필 로드
    useEffect(() => {
        if (user && isAuthenticated) {
            loadUserProfileFromServer();
        }
    }, [user, isAuthenticated]);

    // 서버에서 사용자 프로필 정보 로드
    const loadUserProfileFromServer = async () => {
        try {
            const apiUrl = getApiUrl();
            console.log('🔍 [DEBUG] Loading profile with API URL:', apiUrl);
            
            const response = await axios.get(`${apiUrl}/api/user/${user.id}`, {
                withCredentials: true,
                timeout: 10000
            });

            if (response.status === 200 && response.data.success) {
                const serverUser = response.data.data;
                
                // 서버 데이터로 폼 초기화
                setFormData({
                    id: serverUser.id,
                    userId: user.userId || '',
                    nickname: serverUser.nickname || '',
                    newPassword: '',
                    confirmPassword: '',
                    introduction: serverUser.introduction || '',
                    profileImage: serverUser.profileImage
                });

                // 프로필 이미지 설정
                const imageToSet = serverUser.profileImageFullPath || defaultProfileImageSrc;
                setProfileImage(imageToSet);
                
                // 표시용 사용자 정보 업데이트
                const updatedUser = {
                    ...user,
                    ...serverUser,
                    profileImage: serverUser.profileImageFullPath || defaultProfileImageSrc
                };
                setDisplayUser(updatedUser);
                
                // 이미지 상태 초기화
                setProfileImageFile(null);
                setIsImageChanged(false);
                
            } else {
                fallbackToLocalUser();
            }
            
        } catch (error) {
            console.error('Profile load error:', error);
            fallbackToLocalUser();
        }
    };

    // 서버 로드 실패 시 로컬 데이터 사용
    const fallbackToLocalUser = () => {
        setFormData({
            id: user.id,
            userId: user.userId || '',
            nickname: user.nickname || '',
            newPassword: '',
            confirmPassword: '',
            introduction: user.introduction || '',
            profileImage: user.profileImage
        });

        // 프로필 이미지 설정
        const imageToSet = (user.profileImage && user.profileImage.startsWith('http')) 
            ? user.profileImage 
            : defaultProfileImageSrc;
        
        setProfileImage(imageToSet);
        setDisplayUser(user);
        setProfileImageFile(null);
        setIsImageChanged(false);
    };

    // 입력 필드 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 프로필 이미지 변경 처리
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 크기 검증 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            // 이미지 파일 형식 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return;
            }

            setProfileImageFile(file);
            setIsImageChanged(true);

            // 이미지 미리보기 설정
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 폼 제출 전 유효성 검사
    const handleSubmit = () => {
        if (!formData.nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        setShowModal(true);
    };

    // 수정 확인 및 서버 전송
    const handleConfirm = async () => {
        try {
            const apiUrl = getApiUrl();
            console.log('🔍 [DEBUG] API URL for update:', apiUrl);
            console.log('🔍 [DEBUG] HTTPS environment:', window.location.protocol === 'https:');
            console.log('🔍 [DEBUG] Profile image file:', profileImageFile);
            
            let response;
            
            if (profileImageFile) {
                // 이미지 파일이 있는 경우 FormData로 전송
                const formDataToSend = new FormData();
                
                const userDto = {
                    id: formData.id,
                    nickname: formData.nickname.trim(),
                    introduction: formData.introduction || '',
                };

                // 비밀번호 변경이 있는 경우 추가
                if (formData.newPassword && formData.newPassword.trim()) {
                    userDto.password = formData.newPassword;
                }
                
                formDataToSend.append('userDto', JSON.stringify(userDto));
                formDataToSend.append('profileImage', profileImageFile);

                console.log('🔍 [DEBUG] Sending multipart request to:', `${apiUrl}/api/user/update-with-image`);

                response = await axios.put(`${apiUrl}/api/user/update-with-image`, formDataToSend, {
                    withCredentials: true,
                    timeout: 30000
                });
            } else {
                // 일반 데이터만 전송
                const dataToSend = {
                    id: formData.id,
                    nickname: formData.nickname.trim(),
                    introduction: formData.introduction || '',
                };

                if (formData.newPassword && formData.newPassword.trim()) {
                    dataToSend.password = formData.newPassword;
                }

                console.log('🔍 [DEBUG] Sending JSON request to:', `${apiUrl}/api/user/update`);

                response = await axios.put(`${apiUrl}/api/user/update`, dataToSend, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
            }

            console.log('🔍 [DEBUG] Response:', response.status, response.data);

            if (response.status === 200) {
                // 수정 완료 후 최신 정보 다시 로드
                setTimeout(() => {
                    loadUserProfileFromServer();
                }, 500);
                
                // 상태 초기화
                setProfileImageFile(null);
                setIsImageChanged(false);
                setFormData(prev => ({
                    ...prev,
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                // 업데이트된 사용자 정보를 이벤트에 포함하여 전송
                const updatedUserData = {
                    id: formData.id,
                    nickname: formData.nickname.trim(),
                    introduction: formData.introduction || '',
                    profileImage: profileImage, // 현재 설정된 프로필 이미지
                    profileImageFullPath: profileImage // 전체 경로
                };
                
                // 헤더 컴포넌트와 다른 컴포넌트에 프로필 업데이트 알림 (데이터 포함)
                window.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: updatedUserData
                }));
                
                setShowSuccessModal(true);
            }
            
        } catch (err) {
            console.error('🔍 [DEBUG] Update error:', err);
            
            // 에러 상황별 처리
            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                
                console.error('🔍 [DEBUG] Error details:', {
                    status,
                    statusText: err.response.statusText,
                    data: errorData,
                    url: err.response.config?.url
                });
                
                switch (status) {
                    case 401:
                        alert('로그인이 필요합니다. 다시 로그인해주세요.');
                        break;
                    case 403:
                        alert('권한이 없습니다.');
                        break;
                    case 400:
                        const errorMessage = errorData?.message || '입력 정보를 확인해주세요.';
                        alert(errorMessage);
                        break;
                    case 404:
                        alert('서버 엔드포인트를 찾을 수 없습니다.');
                        break;
                    case 500:
                        alert('서버 내부 오류가 발생했습니다.');
                        break;
                    default:
                        const defaultErrorMessage = errorData?.message || '프로필 수정에 실패했습니다.';
                        alert(defaultErrorMessage);
                }
            } else if (err.request) {
                console.error('🔍 [DEBUG] Request error - no response');
                alert('서버와 연결할 수 없습니다.');
            } else {
                console.error('🔍 [DEBUG] Setup error:', err.message);
                alert('프로필 수정 중 오류가 발생했습니다.');
            }
        } finally {
            setShowModal(false);
        }
    };

    // 모달 취소
    const handleModalCancel = () => {
        setShowModal(false);
    };

    // 성공 모달 확인 후 마이페이지로 이동
    const handleSuccessConfirm = () => {
        setShowSuccessModal(false);
        navigate('/mypage');
    };

    // 수정 취소 및 초기화 후 마이페이지로 이동
    const handleCancel = () => {
        navigate('/mypage');
    };

    // 이미지 로드 실패 시 기본 이미지로 대체
    const handleImageError = (e) => {
        e.target.src = defaultProfileImageSrc;
    };

    // 로딩 중 화면
    if (isLoading) {
        return (
            <div className="myedit-container">
                <div className="myedit-loading">로딩 중...</div>
            </div>
        );
    }

    // 비로그인 상태 화면
    if (!isAuthenticated) {
        return (
            <div className="myedit-container">
                <div className="myedit-error">로그인이 필요합니다.</div>
            </div>
        );
    }

    return (
        <div className="myedit-container">
            <div className="myedit-form">
                {/* 프로필 이미지 섹션 */}
                <div className="myedit-profile-section">
                    <div className="myedit-profile-image-wrapper">
                        <div className="myedit-profile-image">
                            <img 
                                src={profileImage || defaultProfileImageSrc} 
                                alt="프로필" 
                                onError={handleImageError}
                            />
                        </div>

                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="profileImage" className="myedit-image-change-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </label>
                    </div>

                    <div className="myedit-profile-name">
                        {displayUser?.nickname || displayUser?.userId || user?.nickname || user?.userId}
                    </div>

                    {/* 새 이미지 선택 상태 표시 */}
                    {profileImageFile && (
                        <div className="myedit-image-status">
                            <small style={{color: '#007bff'}}>
                                새 이미지가 선택되었습니다: {profileImageFile.name}
                            </small>
                        </div>
                    )}
                </div>

                {/* 폼 필드 섹션 */}
                <div className="myedit-form-fields">
                    <div className="myedit-field-group">
                        <label className="myedit-field-label">아이디</label>
                        <input
                            type="text"
                            value={formData.userId}
                            disabled
                            className="myedit-field-input myedit-disabled"
                        />
                    </div>

                    <div className="myedit-field-group">
                        <label className="myedit-field-label">
                            닉네임 <span className="myedit-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="myedit-field-input"
                            maxLength="50"
                            required
                        />
                    </div>

                    <div className="myedit-field-group">
                        <label className="myedit-field-label">비밀번호 변경</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="myedit-field-input"
                            placeholder="새 비밀번호를 입력하세요"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="myedit-field-group">
                        <label className="myedit-field-label">변경된 비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="myedit-field-input"
                            placeholder="새 비밀번호를 다시 입력하세요"
                            autoComplete="new-password"
                        />
                        {/* 비밀번호 불일치 에러 메시지 */}
                        {formData.newPassword && formData.confirmPassword && 
                         formData.newPassword !== formData.confirmPassword && (
                            <p className="myedit-password-error">비밀번호를 확인해주세요.</p>
                        )}
                    </div>

                    <div className="myedit-field-group">
                        <label className="myedit-field-label">자기소개</label>
                        <textarea
                            name="introduction"
                            value={formData.introduction}
                            onChange={handleInputChange}
                            placeholder="자기소개를 입력해주세요."
                            rows={4}
                            className="myedit-field-textarea"
                            maxLength="500"
                        />
                        <div className="myedit-char-count">
                            {formData.introduction?.length || 0}/500
                        </div>
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="myedit-button-group">
                    <button onClick={handleCancel} className="myedit-cancel-btn">
                        취소
                    </button>
                    <button onClick={handleSubmit} className="myedit-submit-btn">
                        저장하기
                    </button>
                </div>
            </div>

            {/* 확인 모달 */}
            <ConfirmModal
                isOpen={showModal}
                onCancel={handleModalCancel}
                onConfirm={handleConfirm}
                userName={formData.nickname}
                profileImage={profileImage}
                type="editProfile"
            />

            {/* 성공 모달 */}
            <ConfirmModal
                isOpen={showSuccessModal}
                userName={formData.nickname}
                profileImage={profileImage}
                type="editProfile"
                isSuccess={true}
                onSuccessConfirm={handleSuccessConfirm}
            />
        </div>
    );
}

export default MyEdit;
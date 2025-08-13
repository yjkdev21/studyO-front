import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from "./modal/ConfirmModal";
import axios from 'axios';
import './MyEdit.css';

function MyEdit() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const defaultProfileImageSrc = "/images/default-profile.png";

    const [formData, setFormData] = useState({
        id: null,
        userId: '',
        nickname: '',
        newPassword: '',
        confirmPassword: '',
        introduction: '',
        profileImage: null
    });

    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [displayUser, setDisplayUser] = useState(null);
    const [isImageChanged, setIsImageChanged] = useState(false);

    // 컴포넌트 마운트 시 사용자 프로필 전체 로딩
    useEffect(() => {
        if (user && isAuthenticated) {
            loadUserProfileFromServer();
        }
    }, [user, isAuthenticated]);

    // 서버에서 사용자 프로필 정보 로딩
    const loadUserProfileFromServer = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/user/${user.id}`, {
                withCredentials: true,
                timeout: 10000
            });

            if (response.status === 200 && response.data.success) {
                const serverUser = response.data.data;
                
                setFormData({
                    id: serverUser.id,
                    userId: user.userId || '',
                    nickname: serverUser.nickname || '',
                    newPassword: '',
                    confirmPassword: '',
                    introduction: serverUser.introduction || '',
                    profileImage: serverUser.profileImage
                });

                const imageToSet = serverUser.profileImageFullPath || defaultProfileImageSrc;
                setProfileImage(imageToSet);
                
                const updatedUser = {
                    ...user,
                    ...serverUser,
                    profileImage: serverUser.profileImageFullPath || defaultProfileImageSrc
                };
                setDisplayUser(updatedUser);
                
                setProfileImageFile(null);
                setIsImageChanged(false);
                
            } else {
                fallbackToLocalUser();
            }
            
        } catch (error) {
            console.error('프로필 로딩 실패:', error);
            fallbackToLocalUser();
        }
    };

    // 서버 로딩 실패 시 로컬 user 데이터 사용
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

        const imageToSet = (user.profileImage && user.profileImage.startsWith('http')) 
            ? user.profileImage 
            : defaultProfileImageSrc;
        
        setProfileImage(imageToSet);
        setDisplayUser(user);
        setProfileImageFile(null);
        setIsImageChanged(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return;
            }

            setProfileImageFile(file);
            setIsImageChanged(true);

            // 미리보기 설정
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

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

    const handleConfirm = async () => {
        try {
            let response;
            
            if (profileImageFile) {
                const formDataToSend = new FormData();
                
                const userDto = {
                    id: formData.id,
                    nickname: formData.nickname.trim(),
                    introduction: formData.introduction || '',
                };

                if (formData.newPassword && formData.newPassword.trim()) {
                    userDto.password = formData.newPassword;
                }
                
                formDataToSend.append('userDto', JSON.stringify(userDto));
                formDataToSend.append('profileImage', profileImageFile);

                response = await axios.put('http://localhost:8081/api/user/update-with-image', formDataToSend, {
                    withCredentials: true,
                    timeout: 30000
                });
            } else {
                const dataToSend = {
                    id: formData.id,
                    nickname: formData.nickname.trim(),
                    introduction: formData.introduction || '',
                };

                if (formData.newPassword && formData.newPassword.trim()) {
                    dataToSend.password = formData.newPassword;
                }

                response = await axios.put('http://localhost:8081/api/user/update', dataToSend, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
            }

            if (response.status === 200) {
                // 수정 완료 후 서버에서 최신 프로필 정보 다시 로딩
                setTimeout(() => {
                    loadUserProfileFromServer();
                }, 500);
                
                setProfileImageFile(null);
                setIsImageChanged(false);
                setFormData(prev => ({
                    ...prev,
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                // 헤더 컴포넌트에 프로필 업데이트 알림
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                
                setShowSuccessModal(true);
            }
            
        } catch (err) {
            console.error('프로필 수정 오류:', err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                
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
                alert('서버와 연결할 수 없습니다.');
            } else {
                alert('프로필 수정 중 오류가 발생했습니다.');
            }
        } finally {
            setShowModal(false);
        }
    };

    const handleModalCancel = () => {
        setShowModal(false);
    };

    const handleSuccessConfirm = () => {
        setShowSuccessModal(false);
    };

    const handleCancel = () => {
        loadUserProfileFromServer();
        setProfileImageFile(null);
        setIsImageChanged(false);
    };

    const handleImageError = (e) => {
        e.target.src = defaultProfileImageSrc;
    };

    if (isLoading) {
        return (
            <div className="myedit-container">
                <div className="myedit-loading">로딩 중...</div>
            </div>
        );
    }

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

                    {profileImageFile && (
                        <div className="myedit-image-status">
                            <small style={{color: '#007bff'}}>
                                새 이미지가 선택되었습니다: {profileImageFile.name}
                            </small>
                        </div>
                    )}
                </div>

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
                        />
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

                <div className="myedit-button-group">
                    <button onClick={handleCancel} className="myedit-cancel-btn">
                        취소
                    </button>
                    <button onClick={handleSubmit} className="myedit-submit-btn">
                        저장하기
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showModal}
                onCancel={handleModalCancel}
                onConfirm={handleConfirm}
                userName={formData.nickname}
                profileImage={profileImage}
                type="editProfile"
            />

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
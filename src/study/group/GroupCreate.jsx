import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../users/modal/ConfirmModal';

// 작성 기본값 초기화 
const RESET_FORM = {
    groupName: '',
    category: '',
    maxMembers: '',
    studyMode: '',
    region: '',
    contact: '',
    groupIntroduction: '',
    thumbnail: null,
    groupOwnerId: null,
    nickname: ''
};

const REQUIRED_FIELDS = [
    'groupName', 'nickname', 'category', 'maxMembers',
    'studyMode', 'region', 'contact', 'groupIntroduction'
];

function GroupCreate() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const host = import.meta.env.VITE_AWS_API_HOST;
    
    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [userNickname, setUserNickname] = useState('');

    // 모달 관련 상태
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                <p>스터디 그룹을 생성하려면 먼저 로그인해주세요.</p>
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

    // 모달에서 확인 버튼 클릭 → 서버 전송 후 postMain으로 이동
    const handleModalConfirm = async () => {
        await handleFormSubmit();
    };

    // 모달에서 취소 버튼 클릭 → 서버 전송 안 함, 폼 데이터 유지
    const handleModalCancel = () => {
        setIsCreateModalOpen(false);
    };

    const checkGroupNameDuplicate = async (groupName) => {
        try {
            const res = await axios.get(`${host}/api/study/check-name/${encodeURIComponent(groupName)}`);
            return res.data.isDuplicate;
        } catch (err) {
            console.error('중복 확인 오류:', err);
            return false;
        }
    };

    const checkNicknameDuplicate = async (nickname) => {
    try {
        const res = await axios.get(`${host}/api/study/check-nickname/${encodeURIComponent(nickname)}`);
        return res.data.isDuplicate;
    } catch (err) {
        console.error('닉네임 중복 확인 오류:', err);
        return false;
    }
};

    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchUserNickname = async () => {
                try {
                    const userId = user.id || user.userId || 1;
                    const res = await axios.get(`${host}/api/study/user/${userId}/nickname`, {
                        withCredentials: true,
                    });
                    
                    if (res.data.success) {
                        const nickname = res.data.nickname;
                        setUserNickname(nickname || '');
                        setFormData(prev => ({
                            ...prev,
                            nickname: nickname || '',
                            groupOwnerId: userId
                        }));
                    }
                } catch (error) {
                    console.error("닉네임 불러오기 실패:", error);
                }
            };
            fetchUserNickname();
        }
    }, [host, isAuthenticated, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            if (name === 'studyMode' && value === '온라인') {
                newData.region = '';
            }
            return newData;
        });
    };

    const handleFileInputChange = (file) => {
        setFormData((prev) => ({
            ...prev,
            thumbnail: file,
        }));
    };

    const validateRequiredFields = () => {
        for (const field of REQUIRED_FIELDS) {
            if (field === 'region' && formData.studyMode === '온라인') {
                continue;
            }
            const value = formData[field];
            if (!value || value.toString().trim() === '') {
                return `${getFieldDisplayName(field)} 필드를 입력해주세요.`;
            }
        }
        if ((formData.studyMode === '오프라인' || formData.studyMode === '온오프') && 
            (!formData.region || formData.region.trim() === '')) {
            return '오프라인 또는 온오프 모드에서는 지역 정보가 필요합니다.';
        }
        return null;
    };

    const getFieldDisplayName = (field) => {
        const fieldNames = {
            groupName: '스터디 이름',
            nickname: '닉네임',
            category: '카테고리',
            maxMembers: '최대 인원',
            studyMode: '진행 방식',
            region: '지역',
            contact: '연락처',
            groupIntroduction: '스터디 소개'
        };
        return fieldNames[field] || field;
    };

    // 작성하기 버튼 클릭 → 확인 모달 띄우기
const handleCreateClick = async (e) => {
    e.preventDefault();
    const validationError = validateRequiredFields();
    if (validationError) {
        setSubmitMessage(validationError);
        return;
    }
    
    // 그룹명 중복 검사
    const isGroupNameDuplicate = await checkGroupNameDuplicate(formData.groupName);
    if (isGroupNameDuplicate) {
        setSubmitMessage("이미 사용 중인 스터디 이름입니다.");
        return;
    }
    
    // 닉네임 중복 검사 추가
    const isNicknameDuplicate = await checkNicknameDuplicate(formData.nickname);
    if (isNicknameDuplicate) {
        setSubmitMessage("이미 사용 중인 닉네임입니다.");
        return;
    }
    
    // 확인 모달 띄우기
    setIsCreateModalOpen(true);
};

    // 실제 생성 처리
    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        setSubmitMessage('');
        try {
            const groupDto = {
                groupName: formData.groupName,
                category: formData.category,
                maxMembers: parseInt(formData.maxMembers),
                studyMode: formData.studyMode,
                region: formData.studyMode === '온라인' ? null : formData.region,
                contact: formData.contact,
                groupIntroduction: formData.groupIntroduction,
                groupOwnerId: formData.groupOwnerId,
                nickname: formData.nickname
            };
            const formPayload = new FormData();
            formPayload.append('groupDto', new Blob([JSON.stringify(groupDto)], { type: 'application/json' }));
            if (formData.thumbnail && formData.thumbnail instanceof File) {
                formPayload.append('thumbnail', formData.thumbnail);
            }
            const response = await axios.post(`${host}/api/study`, formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            if (response.data.success) {
                setIsCreateModalOpen(false);
                navigate('/study/postMain'); // 성공 시 바로 이동
            } else {
                setSubmitMessage(response.data.message || '등록에 실패했습니다.');
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '등록 중 오류가 발생했습니다.';
            setSubmitMessage(errorMessage);
            setIsCreateModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main id='studygroup-container'>
            {submitMessage && (
                <div className={`message ${submitMessage.includes('실패') || submitMessage.includes('오류') ? 'error' : 'success'}`}>
                    {submitMessage}
                </div>
            )}
            <StudyForm
                mode="create"
                formData={formData}
                onChange={handleInputChange}
                onFileChange={handleFileInputChange}
                onSubmit={handleCreateClick}
                isSubmitting={isSubmitting}
                submitMessage={submitMessage}
                submitLabel="작성하기"
                userNickname={userNickname}
            />
            {/* 작성 확인 모달 */}
            <ConfirmModal
                isOpen={isCreateModalOpen}
                onCancel={handleModalCancel}
                onConfirm={handleModalConfirm}
                type="editProfileSimple"
                userName={formData.groupName}
                customText={{
                    title: <>스터디 그룹을 <span className="highlight">작성</span>하시겠습니까?</>,
                    actionText: '확인'
                }}
            />
        </main>
    );
}

export default GroupCreate;
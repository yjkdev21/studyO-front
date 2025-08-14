import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
    thumbnail: '/images/default-thumbnail.png',
    groupOwnerId: null,
    nickname: ''
};

//필수 필드
const REQUIRED_FIELDS = [
    'groupName', 'nickname', 'category', 'maxMembers',
    'studyMode', 'region', 'contact', 'groupIntroduction',
];

const DISABLED_FIELDS = ['category', 'studyMode', 'region'];

function GroupUpdate() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    const { groupId } = useParams();
    const host = import.meta.env.VITE_AWS_API_HOST;
    

    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [submitMessage, setSubmitMessage] = useState('');
    const [userNickname, setUserNickname] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successType, setSuccessType] = useState('');
    const [memberCount, setMemberCount] = useState(1);

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트 또는 메시지 표시
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
                <p>스터디 그룹을 수정하려면 먼저 로그인해주세요.</p>
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

    useEffect(() => {
        // 로그인한 사용자가 있을 때만 데이터를 가져옴
        if (isAuthenticated && user && groupId) {
            const fetchStudyData = async () => {
                try {
                    setIsLoading(true);
                    
                    // 로컬 하고 서버 올라갔을때 host 주소가 변경
                    const response = await axios.get(`${host}/api/study/${groupId}`, {
                        withCredentials: true, // 자격 증명(쿠키 등)을 요청에 포함
                    });

                    if (response.data.success && response.data.data) {
                        const data = response.data.data;
                        
                        // 현재 로그인한 사용자가 그룹의 소유자인지 확인
                        const userId = user.id || user.userId;
                        if (data.groupOwnerId !== userId) {
                            setSubmitMessage('수정 권한이 없습니다. 그룹의 소유자만 수정할 수 있습니다.');
                            setTimeout(() => navigate(`/group/${groupId}`), 2000);
                            return;
                        }
                        
                        setFormData({
                            groupName: data.groupName || '',
                            category: data.category || '',
                            maxMembers: data.maxMembers || '',
                            studyMode: data.studyMode || '',
                            region: data.region || '',
                            contact: data.contact || '',
                            groupIntroduction: data.groupIntroduction || '',
                            thumbnail: data.thumbnailFullPath || '/images/default-thumbnail.png',
                            groupOwnerId: data.groupOwnerId || 1,
                            nickname: data.nickname || ''
                        });
                        setUserNickname(data.nickname || '');
                        
                        setMemberCount(data.memberCount || 1);
                    } else {
                        setSubmitMessage('데이터를 불러올 수 없습니다.');
                    }
                } catch (error) {
                    console.error('스터디 그룹 데이터 불러오기 실패:', error);
                    setSubmitMessage(`데이터 불러오기 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchStudyData();
        }
    }, [groupId, host, isAuthenticated, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            
            // 온라인 모드 선택 시 지역 필드 초기화 (수정 모드에서는 disabled이지만 혹시 모르니)
            if (name === 'studyMode' && value === '온라인') {
                newData.region = '';
            }
            
            return newData;
        });
    };

    // 파일 입력 처리를 위한 별도 핸들러 추가
    const handleFileInputChange = (file) => {
        setFormData((prev) => ({
            ...prev,
            thumbnail: file,
        }));
    };

    const validateRequiredFields = () => {
        console.log('=== 필수 필드 검증 시작 ===');
        console.log('전체 formData:', formData);
        
        for (const field of REQUIRED_FIELDS) {
            // 온라인 모드일 때는 region 필드 검증 스킵
            if (field === 'region' && formData.studyMode === '온라인') {
                continue;
            }

            const value = formData[field];
            const isEmpty = !value || value.toString().trim() === '';
            
            console.log(`필드: ${field}, 값: "${value}", 비어있음: ${isEmpty}`);
            
            if (isEmpty) {
                return `${getFieldDisplayName(field)} 필드를 입력해주세요.`;
            }
        }

        // 오프라인/온오프 모드일 때 region 필수 검증
        if ((formData.studyMode === '오프라인' || formData.studyMode === '온오프') && 
            (!formData.region || formData.region.trim() === '')) {
            return '오프라인 또는 온오프 모드에서는 지역 정보가 필요합니다.';
        }
        
        console.log('=== 모든 필수 필드 검증 통과 ===');
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

    // 수정 버튼 클릭 핸들러 (모달 열기)
    const handleEditClick = (e) => {
        e.preventDefault();
        
        // 필수 필드 검증
        const validationError = validateRequiredFields();
        if (validationError) {
            alert(validationError);
            return;
        }

        setIsEditModalOpen(true);
    };

    // 실제 수정 처리 함수
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
            nickname: formData.nickname,
            thumbnail: (!formData.thumbnail || formData.thumbnail === '') ? 'default' : null
        };

        const formPayload = new FormData();
        formPayload.append('groupDto', new Blob([JSON.stringify(groupDto)], { type: 'application/json' }));

        // 새 이미지가 File 객체면 추가
        if (formData.thumbnail && formData.thumbnail instanceof File) {
            formPayload.append('thumbnail', formData.thumbnail);
        }

        const response = await axios.put(`${host}/api/study/${groupId}`, formPayload, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });

        if (response.data.success) {
            setIsEditModalOpen(false);
            navigate(`/group/${groupId}`);
        } else {
            alert(response.data.message || '수정에 실패했습니다.');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        alert(`수정 실패: ${errorMessage}`);
    } finally {
        setIsSubmitting(false);
    }
};




    // 삭제 가능 여부 확인 함수
    const canDelete = () => {
        return memberCount <= 1; // 방장만 있을 때만 삭제 가능
    };

    // 삭제 버튼 클릭 핸들러 (모달 열기)
    const handleDeleteClick = () => {
        if (!canDelete()) {
            alert("현재 멤버가 있어서 삭제할 수 없습니다.");
            return;
        }
        setIsDeleteModalOpen(true);
    };

    // 실제 삭제 처리 함수
    const handleDelete = async () => {
        try {
            await axios.delete(`${host}/api/study/${groupId}`, {
                withCredentials: true,
            });
            navigate('/myPage');
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제에 실패했습니다.');
        }
    };


    const handleCancel = () => {
        navigate(`/group/${groupId}`);
    };

    const handleModalCancel = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
    };


    if (isLoading) {
        return (
            <div id="studygroup-update-container">
                <div id="studygroup-form-wrapper">
                    <div id="studygroup-loading-text">로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div id="studygroup-update-container">
            <div id="studygroup-form-wrapper">
                {submitMessage && (
                    <div id={submitMessage.includes('실패') || submitMessage.includes('입력') || submitMessage.includes('권한') ? 'studygroup-error-message' : 'studygroup-success-message'}>
                        {submitMessage}
                    </div>
                )}

                <StudyForm
                    mode="update"
                    formData={formData}
                    onChange={handleInputChange}
                    onFileChange={handleFileInputChange}
                    onSubmit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    disabledFields={DISABLED_FIELDS}
                    submitLabel="수정하기"
                    userNickname={userNickname}
                    memberCount={memberCount}
                />
            </div>

            {/* 수정 확인 모달 */}
            <ConfirmModal
                isOpen={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onConfirm={handleFormSubmit}
                type="editProfileSimple"
                userName={formData.groupName}
                customText={{
                    title: (
                        <>
                            스터디 그룹을 <span className="highlight">수정</span>하시겠습니까?
                        </>
                    ),
                    actionText: '수정'
                }}
            />

            {/* 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onCancel={handleModalCancel}
                onConfirm={handleDelete}
                type="kick"
                userName={formData.groupName}
                customText={{
                    title: (
                        ""
                    ),
                    actionText: '삭제',
                    description: '삭제된 그룹은 복구할 수 없습니다.'
                }}
            />
        </div>
    );
}

export default GroupUpdate;
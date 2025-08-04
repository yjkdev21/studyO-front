import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';

// 작성 기본값 초기화 
const RESET_FORM = {
    groupName: '',
    category: '',
    maxMembers: '',
    studyMode: '',
    region: '',
    contact: '',
    groupIntroduction: '',
    thumbnail: '',
    groupOwnerId: 1
};

//필수 필드
const REQUIRED_FIELDS = [
    'groupName', 'category', 'maxMembers',
    'studyMode', 'region', 'contact', 'groupIntroduction',
];


const DISABLED_FIELDS = ['category', 'studyMode', 'region'];

const MODAL_TYPES = {
    SUBMIT: 'update'
};

function GroupUpdate() {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);

    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [submitMessage, setSubmitMessage] = useState('');
    const [modalType, setModalType] = useState(null);

    useEffect(() => {
        const fetchStudyData = async () => {
            try {
                setIsLoading(true);
                
                // 로컬 하고 서버 올라갔을때 host 주소가 변경
                const response = await axios.get(`${host}/api/study/${groupId}`, {
                    withCredentials: true, // 자격 증명(쿠키 등)을 요청에 포함
                });

                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    setFormData({
                        groupName: data.groupName || '',
                        category: data.category || '',
                        maxMembers: data.maxMembers || '',
                        studyMode: data.studyMode || '',
                        region: data.region || '',
                        contact: data.contact || '',
                        groupIntroduction: data.groupIntroduction || '',
                        thumbnail: data.thumbnail || '',
                        groupOwnerId: data.groupOwnerId || 1
                    });
                }
            } catch (error) {
                console.error('스터디 그룹 데이터 불러오기 실패:', error);
                setSubmitMessage(`데이터 불러오기 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (groupId) {
            fetchStudyData();
        }
    }, [groupId, host]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateRequiredFields = () => {
        console.log('=== 필수 필드 검증 시작 ===');
        console.log('전체 formData:', formData);
        
        for (const field of REQUIRED_FIELDS) {
            const value = formData[field];
            const isEmpty = !value || value.toString().trim() === '';
            
            console.log(`필드: ${field}, 값: "${value}", 비어있음: ${isEmpty}`);
            
            if (isEmpty) {
                return `${getFieldDisplayName(field)} 필드를 입력해주세요.`;
            }
        }
        
        console.log('=== 모든 필수 필드 검증 통과 ===');
        return null;
    };

    const getFieldDisplayName = (field) => {
        const fieldNames = {
            groupName: '스터디 이름',
            category: '카테고리',
            maxMembers: '최대 인원',
            studyMode: '진행 방식',
            region: '지역',
            contact: '연락처',
            groupIntroduction: '스터디 소개'
        };
        return fieldNames[field] || field;
    };

    const openSubmitModal = () => {
        const validationError = validateRequiredFields();
        if (validationError) {
            setSubmitMessage(validationError);
            return;
        }
        setModalType(MODAL_TYPES.SUBMIT);
    };

    const closeModal = () => {
        setModalType(null);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        openSubmitModal();
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setSubmitMessage('');
        closeModal();

        try {
            // JSON 형태로 데이터 전송
            const submitData = {
                groupName: formData.groupName,
                category: formData.category,
                maxMembers: formData.maxMembers,
                studyMode: formData.studyMode,
                region: formData.region,
                contact: formData.contact,
                groupIntroduction: formData.groupIntroduction,
                thumbnail: '',
                groupOwnerId: formData.groupOwnerId
            };

            console.log('전송할 데이터:', submitData);

            // 로컬 하고 서버 올라갔을때 host 주소가 변경
            const response = await axios.put(`${host}/api/study/${groupId}`, submitData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true, // 자격 증명(쿠키 등)을 요청에 포함
            });
            
            console.log('서버 응답:', response.data);

            if (response.data.success) {
                setSubmitMessage('스터디 그룹이 성공적으로 수정되었습니다!');
                
                setTimeout(() => {
                    navigate(`/group/${groupId}`);
                }, 1500);
            } else {
                setSubmitMessage(response.data.message || '수정에 실패했습니다.');
            }

        } catch (error) {
            console.error('스터디 그룹 수정 실패:', error);
            const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
            setSubmitMessage(`수정 실패: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        await axios.delete(`${host}/api/study/${groupId}`, {
            withCredentials: true,
        });
        alert('스터디 그룹이 삭제되었습니다.');
        navigate('/groupList',{ replace: true });
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
};

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="group-container">
            {submitMessage && (
                <div className={`message ${submitMessage.includes('실패') ? 'error' : 'success'}`}>
                    {submitMessage}
                </div>
            )}

            <StudyForm
                mode="update"
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleFormSubmit}
                submitMessage={submitMessage}
                modalType={modalType}
                onConfirm={handleConfirmSubmit}
                onDelete={handleDelete}
                onCancel={closeModal}
                isSubmitting={isSubmitting}
                disabledFields={DISABLED_FIELDS}
                submitLabel="수정하기"
            />
        </div>
    );
}

export default GroupUpdate;
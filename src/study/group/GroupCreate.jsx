import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    thumbnail: null,
    groupOwnerId: '',
    nickname: ''
};

//필수 필드
const REQUIRED_FIELDS = [
    'groupName', 'nickname', 'category', 'maxMembers',
    'studyMode', 'region', 'contact', 'groupIntroduction'
];

function GroupCreate() {
    const navigate = useNavigate();
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [userNickname, setUserNickname] = useState(''); // 원본 닉네임 저장

    // 이름 중복 확인 함수
    const checkGroupNameDuplicate = async (groupName) => {
        try {
            const res = await axios.get(`${host}/api/study/check-name/${encodeURIComponent(groupName)}`);
            return res.data.isDuplicate;
        } catch (err) {
            console.error('중복 확인 오류:', err);
            return false;
        }
    };

    useEffect(() => {
    const fetchUserNickname = async () => {
        try {
            const userId = 1;
            
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
            } else {
                console.error("닉네임 불러오기 실패:", res.data.message);
            }
        } catch (error) {
            console.error("닉네임 불러오기 실패:", error);
        }
    };

    if (host) { 
        fetchUserNickname();
    }
}, [host]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            
            // 온라인 모드 선택 시 지역 필드 초기화
            if (name === 'studyMode' && value === '온라인') {
                newData.region = '';
            }
            
            return newData;
        });
    };

    // 파일 입력 처리를 위한 별도 핸들러
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // 필수 필드 검사
        const validationError = validateRequiredFields();
        if (validationError) {
            setSubmitMessage(validationError);
            return;
        }

        const isDuplicate = await checkGroupNameDuplicate(formData.groupName);
        if(isDuplicate) {
            setSubmitMessage("이미 사용 중인 스터디 이름입니다.");
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // groupDto 객체를 만듭니다.
            const groupDto = {
                groupName: formData.groupName,
                category: formData.category,
                maxMembers: parseInt(formData.maxMembers),
                studyMode: formData.studyMode,
                region: formData.studyMode === '온라인' ? null : formData.region,
                contact: formData.contact,
                groupIntroduction: formData.groupIntroduction,
                groupOwnerId: formData.groupOwnerId,
                nickname: formData.nickname // 수정된 닉네임 포함
            };

            // FormData에 JSON Blob으로 추가
            const formPayload = new FormData();
            formPayload.append('groupDto', new Blob([JSON.stringify(groupDto)], { type: 'application/json' }));

            // 썸네일 파일 추가
            if (formData.thumbnail && formData.thumbnail instanceof File) {
                formPayload.append('thumbnail', formData.thumbnail);
            }

            console.log('서버에 보낼 데이터:', {
                groupDto: groupDto,
                thumbnail: formData.thumbnail ? formData.thumbnail.name : 'none'
            });

            // 요청 보내기
            const response = await axios.post(`${host}/api/study`, formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (response.data.success) {
                setSubmitMessage('스터디 그룹이 성공적으로 등록되었습니다.');
                setTimeout(() => navigate('/groupList'), 1500);
            } else {
                setSubmitMessage(response.data.message || '등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('등록 실패:', error);
            if (error.response) {
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태:', error.response.status);
            }
            const errorMessage = error.response?.data?.message || '등록 중 오류가 발생했습니다.';
            setSubmitMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main id='study-create'>
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
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitMessage={submitMessage}
                submitLabel="작성하기"
                userNickname={userNickname} // 원본 닉네임 전달
            />
        </main>
    );
}

export default GroupCreate;
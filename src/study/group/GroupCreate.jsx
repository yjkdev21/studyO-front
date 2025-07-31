import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';

// 작성 기본값 초기화 - camelCase로 통일
const RESET_FORM = {
    groupName: '',
    nickName: '',
    category: '',
    maxMembers: '',
    studyMode: '',
    region: '',
    contact: '',
    recruitEndDate: '',
    studyStartDate: '',
    studyEndDate: '',
    groupIntroduction: '',
    thumbnailUrl: '',
    groupOwnerId: 1 //임시임
};

//필수 필드
const REQUIRED_FIELDS = [
    'groupName', 'nickName', 'category', 'maxMembers',
    'studyMode', 'region', 'contact',
    'recruitEndDate', 'studyStartDate', 'studyEndDate', 'groupIntroduction'
];

function GroupCreate() {
    const navigate = useNavigate();
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState('');
    const [isGroupNameDuplicate, setIsGroupNameDuplicate] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
        
        if (name === 'groupName') {
            setIsDuplicateChecked(false);
            setDuplicateMessage('');
        }
    };

    const checkStudyNameDuplicate = async () => {
        if (!formData.groupName.trim()) {
            setDuplicateMessage('스터디 이름을 입력해주세요.');
            return;
        }
        setIsCheckingDuplicate(true);
        setDuplicateMessage('');

        try {
            // 로컬 하고 서버 올라갔을때 host 주소가 변경
            const response = await axios.get(`${host}/api/study/group/check-name/${formData.groupName}`, {
                withCredentials: true,// 자격 증명(쿠키 등)을 요청에 포함
            });

            if (response.data.success) {
                if (response.data.isDuplicate) {
                    setDuplicateMessage('이미 사용 중인 스터디 이름입니다.');
                    setIsDuplicateChecked(false);
                    setIsGroupNameDuplicate(true);
                } else {
                    setDuplicateMessage('사용 가능한 스터디 이름입니다.');
                    setIsDuplicateChecked(true);
                    setIsGroupNameDuplicate(false);
                }
            }
        } catch (error) {
            console.error('중복 확인 실패:', error);
            setDuplicateMessage('중복 확인 중 오류가 발생했습니다.');
            setIsDuplicateChecked(false);
            setIsGroupNameDuplicate(null);
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    const checkNickNameDuplicate = async () => {
        if (!formData.nickName.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        try {
            // 로컬 하고 서버 올라갔을때 host 주소가 변경
            const response = await axios.get(`${host}/api/study/group/check-nickname/${formData.nickName}`, {
                withCredentials: true, // 자격 증명(쿠키 등)을 요청에 포함
            });
            
            if (response.data.success) {
                if (response.data.isDuplicate) {
                    alert('이미 사용 중인 닉네임입니다.');
                } else {
                    alert('사용 가능한 닉네임입니다.');
                }
            }
        } catch (error) {
            console.error('닉네임 중복 확인 실패:', error);
            alert('중복 확인 중 오류가 발생했습니다.');
        }
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
            nickName: '닉네임',
            category: '카테고리',
            maxMembers: '최대 인원',
            studyMode: '진행 방식',
            region: '지역',
            contact: '연락처',
            recruitEndDate: '모집 마감일',
            studyStartDate: '스터디 시작일',
            studyEndDate: '스터디 종료일',
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

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
        // ✅ 스터디 이름 중복 체크
        const nameCheckRes = await axios.get(`${host}/api/study/group/check-name/${formData.groupName}`, {
            withCredentials: true,
        });

        if (nameCheckRes.data.success && nameCheckRes.data.isDuplicate) {
            setSubmitMessage('이미 사용 중인 스터디 이름입니다.');
            setIsSubmitting(false);
            return;
        }

        // ✅ 닉네임 중복 체크
        const nickCheckRes = await axios.get(`${host}/api/study/group/check-nickname/${formData.nickName}`, {
            withCredentials: true,
        });

        if (nickCheckRes.data.success && nickCheckRes.data.isDuplicate) {
            setSubmitMessage('이미 사용 중인 닉네임입니다.');
            setIsSubmitting(false);
            return;
        }

        // 등록할 데이터 준비
        const submitData = {
            ...formData,
            maxMembers: parseInt(formData.maxMembers.replace('명', '')) || formData.maxMembers,
            thumbnailUrl: formData.thumbnailUrl || '',
        };

        // 등록 요청
        const response = await axios.post(`${host}/api/study/group`, submitData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        });

        if (response.data.success) {
            setSubmitMessage('스터디 그룹이 성공적으로 등록되었습니다.');
            setTimeout(() => navigate('/study/groups'), 1500);
        } else {
            setSubmitMessage(response.data.message || '등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('등록 실패:', error);
        setSubmitMessage('등록 중 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
};


    return (
        <main id='study-create'>
            {submitMessage && (
                <div className={`message ${submitMessage.includes('실패') ? 'error' : 'success'}`}>
                    {submitMessage}
                </div>
            )}

            <StudyForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitMessage={submitMessage}
                onCheckDuplicate={checkStudyNameDuplicate}
                onCheckNickname={checkNickNameDuplicate}
                isCheckingDuplicate={isCheckingDuplicate}
                isDuplicateChecked={isDuplicateChecked}
                duplicateMessage={duplicateMessage}
                submitLabel="작성하기"
            />
        </main>
    );
}

export default GroupCreate;
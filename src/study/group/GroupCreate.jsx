import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';

// 작성 기본값 초기화 
const RESET_FORM = {
    groupId: '',
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
    // 'groupId', 'groupName', 'category', 'maxMembers',
    // 'studyMode', 'region', 'contact', 'groupIntroduction', 'thumbnail'
    'thumbnail'
];

function GroupCreate() {
    const navigate = useNavigate();
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

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
            // URL 인코딩 처리
            const encodedGroupName = encodeURIComponent(formData.groupName);
            const response = await axios.get(`${host}/api/study/group/check-name/${encodedGroupName}`, {
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
            // URL 인코딩 처리
            const encodedNickName = encodeURIComponent(formData.nickName);
            const response = await axios.get(`${host}/api/study/group/check-nickname/${encodedNickName}`, {
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
    // groupDto 객체를 만듭니다.
    const groupDto = {
      groupName: formData.groupName,
      nickName: formData.nickName,
      category: formData.category,
      maxMembers: formData.maxMembers,
      studyMode: formData.studyMode,
      region: formData.region,
      contact: formData.contact,
      groupIntroduction: formData.groupIntroduction,
      groupOwnerId: formData.groupOwnerId,
    };

    // FormData에 JSON Blob으로 추가
    const formPayload = new FormData();
    formPayload.append('groupDto', new Blob([JSON.stringify(groupDto)], { type: 'application/json' }));

    // 썸네일 파일 추가
    if (formData.thumbnail && formData.thumbnail instanceof File) {
      formPayload.append('thumbnail', formData.thumbnail);
    }

    console.log('서버에 보낼 데이터:', formPayload);

    // 요청 보내기
    const response = await axios.post(`${host}/api/study`, formPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
                submitLabel="작성하기"
            />
        </main>
    );
}

export default GroupCreate;
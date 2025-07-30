import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';

// 퀴즈 작성 기본값 초기화
const RESET_FORM = {
    study_name: '',
    nick_name: '',
    category: '',
    member_count: '',
    progress_type: '',
    location: '',
    contact_method: '',
    deadline: '',
    start: '',
    end: '',
    description: '',
    image: null
};

//사용자가 반드시 입력해야 하는 필드 목록
const REQUIRED_FIELDS = [
    'study_name', 'nick_name', 'category', 'member_count',
    'progress_type', 'location', 'contact_method', 'deadline', 'start', 'end'
];

function GroupCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(RESET_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        if (name === 'study_name') {
            setIsDuplicateChecked(false);
            setDuplicateMessage('');
        }
    };

    const checkStudyNameDuplicate = async () => {
        if (!formData.study_name.trim()) {
            setDuplicateMessage('스터디 이름을 입력해주세요.');
            return;
        }
        setIsCheckingDuplicate(true);
        setDuplicateMessage('');

        try {
            const response = await axios.get(`/api/study-groups/check-name/${formData.study_name}`);
            
            if (response.data.isDuplicate) {
                setDuplicateMessage('이미 사용 중인 스터디 이름입니다.');
                setIsDuplicateChecked(false);
            } else {
                setDuplicateMessage('사용 가능한 스터디 이름입니다.');
                setIsDuplicateChecked(true);
            }
        } catch (error) {
            console.error('중복 확인 실패:', error);
            setDuplicateMessage('중복 확인 중 오류가 발생했습니다.');
            setIsDuplicateChecked(false);
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // 필수 필드 검사
        for (const field of REQUIRED_FIELDS) {
            if (!formData[field]) {
                setSubmitMessage('필수 필드를 모두 입력해주세요.');
                return;
            }
        }
        
        // 중복 확인 검사
        if (!isDuplicateChecked) {
            setSubmitMessage('스터디 이름 중복 확인을 해주세요.');
            return;
        }

        // 바로 제출 처리
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const response = await axios.post('/api/study-groups', formData);

            if (response.status === 200 || response.status === 201) {
                setSubmitMessage('스터디 그룹이 성공적으로 등록되었습니다.');
                
                // 2초 후 홍보글 작성 페이지로 이동하겠냐고 물어보거나 바로 목록으로 이동
                setTimeout(() => {
                    const goToPromotion = window.confirm('홍보글을 작성하시겠습니까?');
                    if (goToPromotion) {
                        navigate('/promotion-create', { 
                            state: { 
                                studyGroupId: formData.study_name,
                                studyGroupName: formData.study_name 
                            } 
                        });
                    } else {
                        navigate('/study-groups');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('스터디 그룹 등록 실패:', error);
            setSubmitMessage(`등록 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
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
                isCheckingDuplicate={isCheckingDuplicate}
                isDuplicateChecked={isDuplicateChecked}
                duplicateMessage={duplicateMessage}
                submitLabel="작성하기"
            />
        </main>
    );
}

export default GroupCreate;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './group.css';
import StudyForm from './StudyForm';

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

const REQUIRED_FIELDS = [
    'study_name', 'nick_name', 'category', 'member_count',
    'progress_type', 'location', 'contact_method', 'deadline', 'start', 'end'
];

const DISABLED_FIELDS = ['category', 'progress_type', 'location', 'start'];


const MODAL_TYPES = {
    SUBMIT: 'update'
};

function GroupUpdate() {
    const navigate = useNavigate();
    const {gid} = useParams();

    const[formData,setFormData] = useState(RESET_FORM);
    const[isSubmitting, setIsSubmitting] = useState(false);
    const[isLoading, setIsLoading] = useState(true);
    const[submitMessage, setSubmitMessage] = useState('');
    const[modalType, setModalType] = useState(null);

    useEffect(() => {
        const fetchStudyData = async () => {
            try{
                setIsLoading(true);
                
                const response = await axios.get(`/api/study-groups/${gid}`);

                if(response.data) {
                    setFormData({
                        study_name: response.data.study_name || '',
                        nick_name: response.data.nick_name || '',
                        category: response.data.category || '',
                        member_count: response.data.member_count || '',
                        progress_type: response.data.progress_type || '',
                        location: response.data.location || '',
                        contact_method: response.data.contact_method || '',
                        deadline: response.data.deadline || '',
                        start: response.data.start || '',
                        end: response.data.end || ''
                    });
                }
            } catch(error){
                console.error('스터디 그룹 데이터 불러오기 실패:', error);
                setSubmitMessage(`데이터 불러오기 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
            }finally{
                setIsLoading(false);
            }
        };
        
        if(gid) {
            fetchStudyData();
        }
    },[gid]);

    const handleInputChange = (e) => {
        const { name,value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openSubmitModal = () => {
        for (const field of REQUIRED_FIELDS){
            if(!formData[field]) {
                setSubmitMessage('필수 필드를 모두 입력해주세요.');
                return;
            }
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

        try{
            const response = await axios.put(`/api/study-groups/${gid}`,formData);
            if (response.status === 200) {
                setSubmitMessage('스터디 그룹이 성공적으로 수정되었습니다!');
                // 1초 후 스터디 목록 페이지로 이동
                setTimeout(() => navigate('/study-groups'), 1000);
            }

        } catch (error) {
            console.error('스터디 그룹 수정 실패:', error);
            setSubmitMessage(`수정 실패: ${error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="group-container">
            <StudyForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleFormSubmit}
            submitMessage={submitMessage}
            modalType={modalType}
            onConfirm={handleConfirmSubmit}
            onCancel={closeModal}
            isSubmitting={isSubmitting}
            disabledFields={DISABLED_FIELDS}
            submitLabel="수정하기"
            />
        </div>
    );
}

export default GroupUpdate;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 사용자 인증 정보를 가져오는 커스텀 훅
import ConfirmModal from "./modal/ConfirmModal"; // 확인/성공 모달 컴포넌트
import axios from 'axios'; // HTTP 클라이언트 (fetch 대신 사용)
import './MyEdit.css'; // 스타일 파일

/**
 * MyEdit 컴포넌트
 * - 사용자 프로필 수정 페이지
 * - 프로필 이미지, 닉네임, 비밀번호, 자기소개 수정 가능
 * - 수정 전 확인 모달, 수정 완료 모달 제공
 */
function MyEdit() {
    // === 인증 정보 가져오기 ===
    // useAuth 커스텀 훅에서 사용자 정보와 인증 상태 가져오기
    const { user, isAuthenticated, isLoading } = useAuth();

    // === 프로필 이미지 경로 결정 ===
    // 헤더 및 마이페이지와 동일한 로직 적용
    const defaultProfileImageSrc = user?.profileImage ? 
        user.profileImage : 
        "/images/default-profile.png";

    // === 상태 관리 ===
    
    /**
     * 사용자 입력 폼 데이터 상태
     * - 수정할 수 있는 모든 필드들을 하나의 객체로 관리
     */
    const [formData, setFormData] = useState({
        id: null,                // 사용자 고유 ID (수정 불가)
        userId: '',             // 사용자 아이디 (수정 불가)
        nickname: '',           // 닉네임 (수정 가능)
        newPassword: '',        // 새 비밀번호 (수정 가능)
        confirmPassword: '',    // 새 비밀번호 확인 (수정 가능)
        introduction: '',       // 자기소개 (수정 가능)
        profileImage: null      // 프로필 이미지 (수정 가능)
    });

    /**
     * Base64 형태의 프로필 이미지 상태
     * - 이미지 미리보기를 위해 별도로 관리
     * - FileReader로 읽은 Base64 문자열 저장
     */
    const [profileImage, setProfileImage] = useState(null);

    /**
     * 모달 상태 관리
     */
    const [showModal, setShowModal] = useState(false);        // 수정 전 확인 모달
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 수정 성공 모달

    /**
     * 컴포넌트 마운트 시 사용자 정보 로딩
     * - user와 isAuthenticated가 변경될 때마다 실행
     * - 로그인된 사용자의 정보를 폼에 미리 채워넣기
     */
    useEffect(() => {
        if (user && isAuthenticated) {
            loadUserProfile(); // 사용자 정보를 폼에 설정
        }
    }, [user, isAuthenticated]); // 의존성 배열: user, isAuthenticated 변경 시 재실행

    /**
     * 사용자 정보를 폼에 채우는 함수
     * - 기존 사용자 정보를 formData 상태에 설정
     * - 취소 버튼 클릭 시나 수정 실패 시 원본 데이터 복원용으로도 사용
     */
    const loadUserProfile = () => {
        setFormData({
            id: user.id,
            userId: user.userId || '',
            nickname: user.nickname || '',
            newPassword: '',                    // 비밀번호는 항상 빈 문자열로 시작
            confirmPassword: '',               // 비밀번호 확인도 항상 빈 문자열로 시작
            introduction: user.introduction || '',
            profileImage: user.profileImage
        });

        // 프로필 이미지 설정 - 사용자 이미지가 있으면 사용, 없으면 기본 이미지
        const imageToSet = user.profileImage || "/images/default-profile.png";
        setProfileImage(imageToSet);
    };

    /**
     * input, textarea 입력 시 상태 변경 처리 함수
     * - 모든 텍스트 입력 필드에서 공통으로 사용
     * - event.target의 name과 value를 사용하여 해당 필드 업데이트
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,            // 기존 상태 유지
            [name]: value       // 변경된 필드만 업데이트 (computed property names 사용)
        }));
    };

    /**
     * 이미지 파일 선택 시 이미지 미리보기 처리 함수
     * - 파일 선택 시 FileReader API를 사용하여 Base64로 변환
     * - 변환된 이미지를 미리보기로 표시
     */
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // 선택한 첫 번째 파일
        if (file) {
            const reader = new FileReader(); // 파일 읽기 객체 생성
            
            // 파일 읽기 완료 시 실행되는 콜백
            reader.onload = (e) => {
                setProfileImage(e.target.result); // Base64로 변환된 이미지 데이터 저장
            };
            
            reader.readAsDataURL(file); // 파일을 Base64 Data URL로 읽기 시작
        }
    };

    /**
     * 저장하기 버튼 클릭 시 확인 모달 표시
     * - 바로 서버 요청하지 않고 사용자에게 한 번 더 확인 받음
     */
    const handleSubmit = () => {
        setShowModal(true);
    };

    /**
     * 확인 모달에서 "확인" 버튼 클릭 시 실제 서버 요청 함수
     * - 실제 프로필 수정 API 호출
     * - 비밀번호 일치 검증 및 서버 통신 에러 처리 포함
     */
    const handleConfirm = async () => {
        // === 클라이언트 사이드 검증 ===
        
        // 비밀번호와 비밀번호 확인이 일치하는지 체크
        if (formData.newPassword !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return; // 일치하지 않으면 서버 요청하지 않고 함수 종료
        }

        // === 서버에 보낼 데이터 준비 ===
        
        // 기본적으로 보낼 데이터 (항상 포함)
        const dataToSend = {
            id: formData.id,
            nickname: formData.nickname,
            introduction: formData.introduction,
        };

        // profileImage는 이미지가 Base64 (즉, 실제 변경된 경우)일 때만 포함
        if (profileImage && profileImage.startsWith('data:image')) {
            dataToSend.profileImage = profileImage;
        }

        // 비밀번호 변경이 있을 경우에만 password 필드 추가
        if (formData.newPassword) {
            dataToSend.password = formData.newPassword;
        }

        // 요청 보내기 전 payload 로그 찍기
        console.log('서버로 보내는 프로필 수정 데이터:', dataToSend);

        try {
            // === 서버에 PUT 요청으로 정보 수정 요청 ===
            const response = await axios.put('http://localhost:8081/api/user/update', dataToSend, {
                withCredentials: true, // 쿠키 포함 (인증 정보)
                headers: {
                    'Content-Type': 'application/json' // JSON 형태로 전송
                },
                timeout: 10000 // 10초 타임아웃
            });

            // === 성공 처리 ===
            if (response.status === 200) {
                setShowSuccessModal(true); // 성공 모달 표시
            }
            
        } catch (err) {
            // === 에러 처리 ===
            console.error('프로필 수정 오류:', err);
            
            // 에러 발생 시 폼을 원래 데이터로 복원
            loadUserProfile();

            // axios 에러 객체의 구조에 따른 세분화된 에러 처리
            if (err.response) {
                // 서버가 응답했지만 에러 상태 코드를 반환한 경우
                const status = err.response.status;
                const errorMessage = err.response.data?.message;
                
                if (status === 401) {
                    // 인증 실패 (로그인 만료 등)
                    alert('로그인이 필요합니다. 다시 로그인해주세요.');
                } else if (status === 403) {
                    // 권한 없음 (다른 사용자의 프로필 수정 시도 등)
                    alert('권한이 없습니다. 본인의 프로필만 수정할 수 있습니다.');
                } else {
                    // 기타 서버 에러
                    alert(errorMessage || '프로필 수정에 실패했습니다.');
                }
            } else if (err.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러)
                alert('서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
            } else {
                // 요청 설정 중 에러가 발생한 경우
                alert('프로필 수정 중 오류가 발생했습니다.');
            }
        } finally {
            // 성공/실패 관계없이 확인 모달 닫기
            setShowModal(false);
        }
    };

    /**
     * 확인 모달에서 "취소" 버튼 클릭 시
     * - 모달만 닫고 폼 데이터는 그대로 유지
     */
    const handleModalCancel = () => {
        setShowModal(false);
    };

    /**
     * 성공 모달에서 "확인" 버튼 클릭 시
     * - 페이지 새로고침하여 변경된 사용자 정보 반영
     */
    const handleSuccessConfirm = () => {
        setShowSuccessModal(false);
        // window.location.reload(); // 새로고침으로 변경사항 반영 (Context 재로딩)
    };

    /**
     * "취소" 버튼 클릭 시 원래 데이터로 복원
     * - 사용자가 입력한 모든 변경사항을 되돌림
     */
    const handleCancel = () => {
        loadUserProfile(); // 원본 사용자 정보로 폼 초기화
    };

    // === 조건부 렌더링 ===

    // 인증 정보 로딩 중일 때
    if (isLoading) {
        return (
            <div className="myedit-container">
                <div className="myedit-loading">로딩 중...</div>
            </div>
        );
    }

    // 로그인하지 않은 사용자일 때
    if (!isAuthenticated) {
        return (
            <div className="myedit-container">
                <div className="myedit-error">로그인이 필요합니다.</div>
            </div>
        );
    }

    // === 메인 JSX 렌더링 ===
    return (
        <div className="myedit-container">
            <div className="myedit-form">

                {/* 프로필 이미지 및 닉네임 표시 영역 */}
                <div className="myedit-profile-section">
                    <div className="myedit-profile-image-wrapper">
                        {/* 프로필 이미지 미리보기 - 수정된 부분 */}
                        <div className="myedit-profile-image">
                            <img 
                                src={profileImage || defaultProfileImageSrc} 
                                alt="프로필" 
                                onError={(e) => {
                                    // 이미지 로드 실패 시 기본 이미지로 대체
                                    e.target.src = "/images/default-profile.png";
                                }}
                            />
                        </div>

                        {/* 이미지 변경 버튼 - 숨겨진 파일 input과 연결된 label */}
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*"          // 이미지 파일만 선택 가능
                            onChange={handleImageChange}
                            style={{ display: 'none' }} // 실제 input은 숨김
                        />
                        {/* label을 버튼처럼 스타일링하여 파일 선택 UI 제공 */}
                        <label htmlFor="profileImage" className="myedit-image-change-btn">
                            {/* 편집 아이콘 SVG */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </label>
                    </div>

                    {/* 현재 사용자 닉네임 표시 (읽기 전용) */}
                    <div className="myedit-profile-name">{user.nickname || user.userId}</div>
                </div>

                {/* 프로필 수정 입력 폼 */}
                <div className="myedit-form-fields">
                    
                    {/* 아이디 필드 (수정 불가) */}
                    <div className="myedit-field-group">
                        <label className="myedit-field-label">아이디</label>
                        <input
                            type="text"
                            value={formData.userId}
                            disabled                    // 수정 불가능하도록 비활성화
                            className="myedit-field-input myedit-disabled"
                        />
                    </div>

                    {/* 닉네임 수정 필드 */}
                    <div className="myedit-field-group">
                        <label className="myedit-field-label">
                            닉네임 <span className="myedit-required">*</span> {/* 필수 필드 표시 */}
                        </label>
                        <input
                            type="text"
                            name="nickname"             // handleInputChange에서 사용할 name 속성
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="myedit-field-input"
                        />
                    </div>

                    {/* 비밀번호 변경 필드 */}
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

                    {/* 비밀번호 확인 필드 */}
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
                        {/* 실시간 비밀번호 불일치 체크 및 에러 메시지 표시 */}
                        {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="myedit-password-error">비밀번호를 확인해주세요.</p>
                        )}
                    </div>

                    {/* 자기소개 필드 */}
                    <div className="myedit-field-group">
                        <label className="myedit-field-label">자기소개</label>
                        <textarea
                            name="introduction"
                            value={formData.introduction}
                            onChange={handleInputChange}
                            placeholder="자기소개를 입력해주세요."
                            rows={4}                    // 텍스트 영역 높이
                            className="myedit-field-textarea"
                        />
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="myedit-button-group">
                    {/* 취소 버튼 - 변경사항 되돌리기 */}
                    <button onClick={handleCancel} className="myedit-cancel-btn">
                        취소
                    </button>
                    {/* 저장 버튼 - 확인 모달 표시 */}
                    <button onClick={handleSubmit} className="myedit-submit-btn">
                        저장하기
                    </button>
                </div>
            </div>

            {/* 저장 전 확인 모달 */}
            <ConfirmModal
                isOpen={showModal}              // 모달 표시 여부
                onCancel={handleModalCancel}    // 취소 버튼 클릭 핸들러
                onConfirm={handleConfirm}       // 확인 버튼 클릭 핸들러
                userName={formData.nickname}    // 모달에 표시할 사용자명
                profileImage={profileImage}    // 모달에 표시할 프로필 이미지
                type="editProfile"             // 모달 타입 (ConfirmModal 컴포넌트에서 사용)
            />

            {/* 저장 성공 모달 */}
            <ConfirmModal
                isOpen={showSuccessModal}       // 성공 모달 표시 여부
                userName={formData.nickname}    // 모달에 표시할 사용자명
                profileImage={profileImage}    // 모달에 표시할 프로필 이미지
                type="editProfile"             // 모달 타입
                isSuccess={true}               // 성공 모달임을 표시
                onSuccessConfirm={handleSuccessConfirm} // 성공 모달 확인 버튼 핸들러
            />
        </div>
    );
}

export default MyEdit;

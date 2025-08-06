import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.css';

/**
 * ConfirmModal 컴포넌트
 * - 사용자 액션에 대한 확인 및 성공 모달을 표시하는 재사용 가능한 컴포넌트
 * - 두 가지 모드: 확인 모달(취소/확인 버튼), 성공 모달(확인 버튼만)
 * - 프리셋을 통해 다양한 타입의 모달을 쉽게 구현 가능
 */
function ConfirmModal({
    isOpen,           // 모달 표시 여부 (boolean)
    onCancel,         // 취소 버튼 클릭 시 실행할 함수
    onConfirm,        // 확인 버튼 클릭 시 실행할 함수 (확인 모달용)
    type = 'editProfile', // 모달 타입 (프리셋 결정) - 기본값: 'editProfile'
    userName,         // 사용자 이름 (문자열)
    profileImage,     // 프로필 이미지 URL (문자열 또는 null)
    customText = {},  // 프리셋 텍스트를 오버라이드할 커스텀 텍스트 객체
    isSuccess = false, // 성공 모달 여부 (true: 성공 모달, false: 확인 모달)
    onSuccessConfirm, // 성공 모달의 확인 버튼 핸들러 (선택적)
}) {
    // 모달이 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // 모달이 열려있지 않으면 아무것도 렌더링하지 않음 (조건부 렌더링)
    if (!isOpen) return null;

    // ========================================
    // 성공 모달용 프리셋 정의
    // - 작업 완료 후 결과를 알리는 모달의 텍스트들
    // ========================================
    const successPresets = {
        editProfile: {
            title: '수정 완료',
            subtitle: `${userName}님의 정보가 성공적으로 수정되었습니다.`,
            description: '변경된 내용이 저장되었습니다.',
            actionText: '확인',
        },
        accept: {
            title: '수락 완료',
            subtitle: `${userName}님이 스터디에 수락되었습니다.`,
            description: '멤버로 성공적으로 등록되었습니다.',
            actionText: '확인',
        },
        kick: {
            title: '추방 완료',
            subtitle: `${userName}님이 스터디에서 제거되었습니다.`,
            description: '처리가 완료되었습니다.',
            actionText: '확인',
        },
        leave: {
            title: '탈퇴 완료',
            subtitle: '스터디 탈퇴가 완료되었습니다.',
            description: '이용해 주셔서 감사합니다.',
            actionText: '확인',
        }
    };

    // ========================================
    // 확인 모달용 프리셋 정의
    // - 작업 실행 전 사용자에게 확인을 받는 모달의 텍스트들
    // ========================================
    const modalPresets = {
        editProfile: {
            title: '회원정보 수정',
            subtitle: `${userName}님의 정보를 변경합니다.`,
            description: '수정된 내용이 저장됩니다.\n계속하시겠습니까?',
            actionText: '수정',
        },
        accept: {
            title: '회원 수락',
            subtitle: `${userName}님을 스터디에 수락합니다.`,
            description: '수락 시 멤버로 등록됩니다.\n계속하시겠습니까?',
            actionText: '수락',
        },
        kick: {
            title: '회원 추방',
            subtitle: `${userName}님을 스터디에서 제거합니다.`,
            description: '추방된 사용자는 다시 가입할 수 없습니다.\n계속하시겠습니까?',
            actionText: '추방',
        },
        leave: {
            title: '스터디 탈퇴',
            subtitle: `${userName}님, 정말 탈퇴하시겠습니까?`,
            description: '스터디에서 완전히 나가게 됩니다.\n복구는 불가합니다.',
            actionText: '탈퇴',
        }
        // 새로운 타입이 필요하면 여기에 추가 가능
    };

    // ========================================
    // 프리셋 선택 로직
    // - isSuccess 값에 따라 성공 모달 또는 확인 모달 프리셋 선택
    // ========================================
    const presets = isSuccess ? successPresets : modalPresets;
    
    // ========================================
    // 최종 텍스트 생성
    // - 프리셋과 customText를 병합하여 최종 텍스트 결정
    // - 스프레드 연산자(...)를 사용해 customText가 프리셋을 오버라이드
    // ========================================
    const { title, subtitle, description, actionText } = {
        ...presets[type],  // 프리셋 텍스트를 기본값으로 사용
        ...customText      // customText로 오버라이드 (있는 경우에만)
    };

    // ========================================
    // Portal을 사용해 document.body에 직접 렌더링
    // ========================================
    return createPortal(
        // 모달 오버레이 - 화면 전체를 덮는 반투명 배경
        <div className="confirm-modal-overlay">
            {/* 모달 메인 콘텐츠 박스 */}
            <div className="modal-content">
                
                {/* ========================================
                    프로필 섹션 - 사용자 이미지와 이름 표시
                    ======================================== */}
                <div className="modal-profile">
                    {/* 프로필 이미지 컨테이너 */}
                    <div className="modal-profile-image">
                        {profileImage ? (
                            // 프로필 이미지가 있는 경우: img 태그로 표시
                            <img src={profileImage} alt="프로필" />
                        ) : (
                            // 프로필 이미지가 없는 경우: 기본 프로필 div 표시
                            <div className="default-profile-modal" />
                        )}
                    </div>
                    {/* 사용자 이름 표시 */}
                    <div className="modal-name">{userName}</div>
                </div>

                {/* ========================================
                    메시지 섹션 - 모달의 주요 텍스트 내용
                    ======================================== */}
                <div className="modal-message">
                    {/* 모달 제목 */}
                    <div className="modal-greeting">{title}</div>
                    {/* 모달 설명 텍스트 */}
                    <div className="modal-sub-message">
                        {/* 
                            줄바꿈 처리 로직:
                            1. description을 '\n'으로 분할하여 배열 생성
                            2. map()으로 각 줄을 순회
                            3. React.Fragment로 감싸서 key 속성 제공
                            4. 마지막 줄이 아니면 <br /> 태그 추가
                        */}
                        {description.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {/* 마지막 줄이 아닌 경우에만 줄바꿈 추가 */}
                                {i < description.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ========================================
                    질문 섹션 - 확인 모달에서만 표시
                    성공 모달에서는 조건부 렌더링으로 숨김
                    ======================================== */}
                {!isSuccess && (
                    <div className="modal-question">
                        해당 작업을
                        {/* highlight 클래스로 액션 텍스트 강조 */}
                        <span className="highlight"> {actionText} </span>
                        하시겠습니까?
                    </div>
                )}

                {/* ========================================
                    버튼 섹션 - 모달 타입에 따라 다른 버튼 구성
                    ======================================== */}
                <div className="modal-buttons">
                    {isSuccess ? (
                        // ========================================
                        // 성공 모달: 확인 버튼만 표시
                        // ========================================
                        <button 
                            onClick={onSuccessConfirm || onCancel} // onSuccessConfirm이 없으면 onCancel 사용
                            className="modal-confirm-btn"
                        >
                            {actionText}
                        </button>
                    ) : (
                        // ========================================
                        // 확인 모달: 취소/확인 버튼 모두 표시
                        // React Fragment(<>)로 감싸서 단일 부모 요소 규칙 준수
                        // ========================================
                        <>
                            {/* 취소 버튼 */}
                            <button 
                                onClick={onCancel} 
                                className="modal-cancel-btn"
                            >
                                취소
                            </button>
                            {/* 확인 버튼 */}
                            <button 
                                onClick={onConfirm} 
                                className="modal-confirm-btn"
                            >
                                {actionText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body // body에 직접 렌더링
    );
}

export default ConfirmModal;
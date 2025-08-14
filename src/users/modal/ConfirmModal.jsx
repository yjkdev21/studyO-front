import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.css';

function ConfirmModal({
    isOpen,                // 모달 표시 여부
    onCancel,              // 취소 버튼 클릭 시 실행 함수
    onConfirm,             // 확인 버튼 클릭 시 실행 함수
    type = 'editProfile',  // 모달 종류
    userName,              // 사용자 이름
    profileImage,          // 프로필 이미지 URL
    customText = {},       // 커스텀 텍스트 설정
    isSuccess = false,     // 성공 모드 여부
    onSuccessConfirm,      // 성공 모드에서 확인 버튼 클릭 시 실행 함수
}) {
    // 모달이 열릴 때 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null; // 모달이 닫혀있으면 렌더링 안 함

    // 성공 모드 프리셋 텍스트
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

    // 기본 모드 프리셋 텍스트
    const modalPresets = {
        editProfile: {
            title: '회원정보 수정',
            subtitle: `${userName}님의 정보를 변경합니다.`,
            description: '수정된 내용이 저장됩니다.\n계속하시겠습니까?',
            actionText: '수정',
        },
        editProfileSimple: {
            title: <>프로필을 <span className="highlight">수정</span>하시겠습니까?</>,
            subtitle: '',
            description: '',
            actionText: '수정',
            showProfile: false,
            showDescription: false,
            showExclamation: true,
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
    };

    // 현재 모드에 맞는 프리셋 선택
    const presets = isSuccess ? successPresets : modalPresets;
    
    // 프리셋과 커스텀 텍스트 병합
    const { 
        title, 
        subtitle, 
        description, 
        actionText,
        showProfile = true,
        showDescription = true,
        showExclamation = false
    } = {
        ...presets[type],
        ...customText
    };

    // 위험한 작업 여부(추방, 탈퇴)
    const isDangerousAction = type === 'kick' || type === 'leave';

    // 모달 렌더링
    return createPortal(
        <div className="confirm-modal-overlay">
            <div className="modal-content">
                <div className="modal-body">
                    {/* 프로필 영역 */}
                    {showProfile && (
                        <div className="modal-profile">
                            <div className="modal-profile-image">
                                {profileImage ? (
                                    <img src={profileImage} alt="프로필" />
                                ) : (
                                    <div className="default-profile-modal" />
                                )}
                            </div>
                            <div className="modal-name">{userName}</div>
                        </div>
                    )}

                    {/* 경고 아이콘 */}
                    {showExclamation && (
                        <div className="modal-exclamation">
                            <div className="exclamation-icon">!</div>
                        </div>
                    )}

                    {/* 메시지 영역 */}
                    <div className={`modal-message ${showDescription && subtitle ? 'with-background' : ''}`}>
                        <div className="modal-greeting">{title}</div>
                        {showDescription && subtitle && (
                            <div className="modal-sub-message">
                                {description.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i < description.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 일반 모드일 경우 확인 질문 표시 */}
                    {!isSuccess && showDescription && (
                        <div className="modal-question">
                            해당 작업을
                            <span className={`highlight ${isDangerousAction ? 'danger' : ''}`}> {actionText} </span>
                            하시겠습니까?
                        </div>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className="modal-buttons">
                    {isSuccess ? (
                        <button 
                            onClick={onSuccessConfirm || onCancel}
                            className={`modal-confirm-btn ${isDangerousAction ? 'danger' : ''}`}
                        >
                            {actionText}
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={onCancel} 
                                className="modal-cancel-btn"
                            >
                                취소
                            </button>
                            <button 
                                onClick={onConfirm} 
                                className={`modal-confirm-btn ${isDangerousAction ? 'danger' : ''}`}
                            >
                                {actionText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmModal;

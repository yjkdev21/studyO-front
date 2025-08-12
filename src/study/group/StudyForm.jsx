// StudyForm 컴포넌트에서 닉네임 부분만 수정

const StudyForm = ({
    // ... 다른 props들
    onEditClick, // 새로 추가된 prop
    // ... 기존 props들
}) => {
    // ... 기존 코드들

    return (
        <>
            {/* ... 기존 코드들 */}
            
            <div id="studygroup-form-grid">
                {/* ... 다른 필드들 */}

                {/* 닉네임 - 수정 버튼만 있는 간단한 버전 */}
                <div id="studygroup-form-group">
                    <label id="studygroup-nickname-label">닉네임 설정</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            id="studygroup-nickname-input"
                            type="text"
                            name="nickname"
                            value={formData.nickname || ''}
                            onChange={onChange}
                            disabled={isFieldDisabled('nickname')}
                            placeholder="스터디에서 사용할 닉네임을 6글자 이내로 입력하세요."
                            required
                        />
                        {/* 수정 모드일 때만 수정 버튼 표시 */}
                        {mode === 'update' && onEditClick && (
                            <button
                                type="button"
                                onClick={onEditClick}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                수정
                            </button>
                        )}
                    </div>
                    {/* 원본 닉네임과 다를 때만 표시 */}
                    {userNickname && formData.nickname && formData.nickname !== userNickname && (
                        <small id="studygroup-nickname-help">
                            원본 닉네임: {userNickname}
                        </small>
                    )}
                </div>

                {/* ... 다른 필드들 */}
            </div>

            {/* ... 기존 코드들 */}
        </>
    );
};
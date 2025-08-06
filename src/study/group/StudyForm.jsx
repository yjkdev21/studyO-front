import React, { useState, useEffect } from 'react';
import FileInput from '../../common/form/FileInput';

const StudyForm = ({
    formData,
    onChange,
    onFileChange,
    onSubmit,
    isSubmitting,
    submitLabel,
    disabledFields = [],
    mode,
    onDelete,
    userNickname
}) => {
    const [imagePreview, setImagePreview] = useState(null);

    // 기존 썸네일이 있는 경우 미리보기 설정 (수정 모드)
    useEffect(() => {
        if (formData.thumbnailUrl && !imagePreview) {
            setImagePreview(formData.thumbnailUrl);
        }
    }, [formData.thumbnailUrl]);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);

            // 부모 컴포넌트의 파일 변경 핸들러 호출
            if (onFileChange) {
                onFileChange(file);
            } else {
                // 기존 방식 fallback
                onChange({
                    target: {
                        name: 'thumbnail',
                        value: file,
                        type: 'file'
                    },
                });
            }
        }
    };

    const isFieldDisabled = (fieldName) => {
        return disabledFields.includes(fieldName) || isSubmitting;
    };

    return (
        <>
            {/* 스터디 기본 정보 섹션 헤더 */}
            <div id="studygroup-basic-info-header">
                <div id="studygroup-basic-info-icon"></div>
                스터디 기본 정보
            </div>

            <form id="studygroup-main-form" onSubmit={onSubmit} encType="multipart/form-data">
                
                {/* 썸네일 업로드 섹션 */}
                <div id="studygroup-thumbnail-section">
                    <div id="studygroup-thumbnail-container">
                        {imagePreview ? (
                            <>
                                <img
                                    id="studygroup-thumbnail-image"
                                    src={imagePreview}
                                    alt="썸네일 미리보기"
                                />
                                <button
                                    id="studygroup-thumbnail-remove-btn"
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        if (onFileChange) {
                                            onFileChange(null);
                                        }
                                    }}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div id="studygroup-thumbnail-placeholder">
                                이미지를 업로드하세요
                            </div>
                        )}
                    </div>

                    <input
                        id="studygroup-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        disabled={isSubmitting}
                    />
                    <label id="studygroup-file-input-label" htmlFor="studygroup-file-input">
                        파일선택
                    </label>
                </div>

                <div id="studygroup-form-grid">
                    {/* 스터디 이름 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-groupname-label">스터디 이름</label>
                        <input
                            id="studygroup-groupname-input"
                            type="text"
                            name="groupName"
                            value={formData.groupName || ''}
                            onChange={onChange}
                            disabled={isFieldDisabled('groupName')}
                            placeholder="6글자 이내"
                            required
                        />
                    </div>

                    {/* 닉네임 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-nickname-label">닉네임 설정</label>
                        <input
                            id="studygroup-nickname-input"
                            type="text"
                            name="nickname"
                            value={formData.nickname || ''}
                            onChange={onChange}
                            disabled={isFieldDisabled('nickname')}
                            placeholder="스터디에서 사용할  닉네임을  6글자 이내로 입력하세요."
                            required
                        />
                        {userNickname && formData.nickname !== userNickname && (
                            <small id="studygroup-nickname-help">
                                닉네임: {userNickname}
                            </small>
                        )}
                    </div>

                    {/* 분야 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-category-label">분야</label>
                        <select
                            id="studygroup-category-select"
                            name="category"
                            value={formData.category || ''}
                            onChange={onChange}
                            disabled={disabledFields.includes('category')}
                            required
                        >
                            <option value="">카테고리를 선택하세요</option>
                            <option value="IT">IT</option>
                            <option value="자격증">자격증</option>
                            <option value="언어">언어</option>
                            <option value="전공">전공</option>
                            <option value="취업/면접">취업/면접</option>
                            <option value="취미">취미</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    {/* 모집인원 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-maxmembers-label">모집인원</label>
                        <select
                            id="studygroup-maxmembers-input"
                            name="maxMembers"
                            value={formData.maxMembers || ''}
                            onChange={onChange}
                            disabled={isFieldDisabled('maxMembers')}
                            required
                        >
                            <option value="">인원을 선택해주세요</option>
                            {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num}명</option>
                            ))}
                        </select>
                    </div>

                    {/* 진행방식 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-studymode-label">진행방식</label>
                        <select
                            id="studygroup-studymode-select"
                            name="studyMode"
                            value={formData.studyMode || ''}
                            onChange={onChange}
                            disabled={disabledFields.includes('studyMode')}
                            required
                        >
                            <option value="">진행 방식을 선택하세요</option>
                            <option value="온라인">온라인</option>
                            <option value="오프라인">오프라인</option>
                            <option value="온오프">온오프</option>
                        </select>
                    </div>

                    {/* 지역 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-region-label">지역</label>
                        <input
                            id="studygroup-region-input"
                            type="text"
                            name="region"
                            value={formData.region || ''}
                            onChange={onChange}
                            disabled={disabledFields.includes('region') || formData.studyMode === '온라인'}
                            required={formData.studyMode === '오프라인' || formData.studyMode === '온오프'}
                            placeholder={
                                formData.studyMode === '온라인'
                                    ? '온라인 모드에서는 지역이 자동으로 무효화됩니다'
                                    : '지역을 입력하세요'
                            }
                        />
                        {formData.studyMode === '온라인' && (
                            <small id="studygroup-region-help">온라인 모드에서는 지역 정보가 필요하지 않습니다.</small>
                        )}
                    </div>

                    {/* 연락방법 */}
                    <div id="studygroup-form-group">
                        <label id="studygroup-contact-label">연락방법</label>
                        <input
                            id="studygroup-contact-input"
                            type="text"
                            name="contact"
                            value={formData.contact || ''}
                            onChange={onChange}
                            disabled={isFieldDisabled('contact')}
                            required
                        />
                    </div>
                </div>

                {/* 스터디 소개 섹션 */}
                <div id="studygroup-content-header">
                    <div id="studygroup-content-icon"></div>
                    스터디 소개
                </div>

                <div id="studygroup-form-group-full">
                    <textarea
                        id="studygroup-introduction-textarea"
                        name="groupIntroduction"
                        value={formData.groupIntroduction || ''}
                        onChange={onChange}
                        disabled={isFieldDisabled('groupIntroduction')}
                        placeholder="200자 내외로 스터디를 소개하세요"
                        required
                        rows="4"
                    />
                </div>

                {/* 버튼 그룹 */}
                <div id="studygroup-button-group">
                    <button
                        id="studygroup-cancel-btn"
                        type="button"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    
                    <button
                        id="studygroup-submit-btn"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '처리중...' : (submitLabel || '작성하기')}
                    </button>

                    {mode === 'update' && onDelete && (
                        <button
                            id="studygroup-delete-btn"
                            type="button"
                            onClick={onDelete}
                            disabled={isSubmitting}
                        >
                            삭제
                        </button>
                    )}
                </div>
            </form>
        </>
    );
};

export default StudyForm;
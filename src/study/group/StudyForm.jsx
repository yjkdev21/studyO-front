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
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <div>
                <label>스터디명 *</label>
                <input
                    type="text"
                    name="groupName"
                    value={formData.groupName || ''}
                    onChange={onChange}
                    disabled={isFieldDisabled('groupName')}
                    required
                />
            </div>

            <div>
                <label>카테고리 *</label>
                <select
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

            <div>
                <label>최대 인원 *</label>
                <input
                    type="number"
                    name="maxMembers"
                    value={formData.maxMembers || ''}
                    onChange={onChange}
                    disabled={isFieldDisabled('maxMembers')}
                    min="1"
                    max="100"
                    required
                />
            </div>

            <div>
                <label>스터디 방식 *</label>
                <select
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

            <div>
                <label>지역 {formData.studyMode === '온라인' ? '' : '*'}</label>
                <input
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
                    <small>온라인 모드에서는 지역 정보가 필요하지 않습니다.</small>
                )}
            </div>

            <div>
                <label>연락 방법 *</label>
                <input
                    type="text"
                    name="contact"
                    value={formData.contact || ''}
                    onChange={onChange}
                    disabled={isFieldDisabled('contact')}
                    required
                />
            </div>

            <div>
                <label>스터디 소개 *</label>
                <textarea
                    name="groupIntroduction"
                    value={formData.groupIntroduction || ''}
                    onChange={onChange}
                    disabled={isFieldDisabled('groupIntroduction')}
                    required
                    rows="5"
                />
            </div>

            <div>
                <div>
                    {imagePreview ? (
                        <div>
                            <img
                                src={imagePreview}
                                alt="썸네일 미리보기"
                            />
                            <button
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
                        </div>
                    ) : (
                        <div>
                            📁 썸네일 업로드
                        </div>
                    )}
                </div>

                <FileInput
                    id="thumbnail"
                    label="썸네일 업로드"
                    multiple={false}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '처리중...' : (submitLabel || '제출')}
                </button>

                {mode === 'update' && onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isSubmitting}
                        style={{ marginLeft: '1rem', backgroundColor: 'red', color: 'white' }}
                    >
                        삭제
                    </button>
                )}
            </div>
        </form>
    );
};

export default StudyForm;
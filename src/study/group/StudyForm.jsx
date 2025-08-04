import React, { useState } from 'react';

const StudyForm = ({ formData, onChange, onSubmit, isSubmitting, submitLabel }) => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // 부모에 파일 정보 전달
      onChange({
        target: {
          name: 'thumbnail',
          value: file,
        },
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: 200, height: 120, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 120,
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            📁
          </div>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '등록중...' : submitLabel || '제출'}
      </button>
    </form>
  );
};

export default StudyForm;

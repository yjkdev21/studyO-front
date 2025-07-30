import React, { useState } from 'react';

const StudyForm = ({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  submitMessage,
  onCheckDuplicate,
  isCheckingDuplicate,
  isDuplicateChecked,
  duplicateMessage,
  submitLabel,
  disabledFields = [],
}) => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 부모 컴포넌트에 파일 정보 전달
      onChange({
        target: {
          name: 'image',
          value: file
        }
      });
    }
  };

  const categories = [
    '카테고리선택', '프로그래밍', '디자인', '마케팅', '언어', '자격증', '취업준비', '기타'
  ];

  const progressTypes = [
    '온라인/오프라인', '온라인', '오프라인', '혼합'
  ];

  const memberCounts = [
    '인원을 선택하세요', '2명', '3명', '4명', '5명', '5명 이상'
  ];

  const contactMethods = [
    '카테고리', '카카오톡', '이메일', '전화'
  ];

  return (
    <div className="study-form-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#f8f9fa'
    }}>
      <form onSubmit={onSubmit}>
        <div className="form-section" style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '30px',
            color: '#333',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#ffa500',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              fontSize: '12px'
            }}>
              1
            </span>
            스터디 기본 정보
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '200px',
                height: '120px',
                border: '2px dashed #ddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '10px'
              }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <div style={{ color: '#ccc', fontSize: '40px' }}>
                    📁
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => document.querySelector('input[type="file"]').click()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffa500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                파일선택
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px 40px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                스터디 이름
              </label>
              <input
                type="text"
                name="study_name"
                value={formData.study_name}
                onChange={onChange}
                placeholder="스터디 이름 입력"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
              {duplicateMessage && (
                <div style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: isDuplicateChecked ? 'green' : 'red'
                }}>
                  {duplicateMessage}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                닉네임 설정
              </label>
              <input
                type="text"
                name="nick_name"
                value={formData.nick_name}
                onChange={onChange}
                placeholder="스터디에서 사용할 닉네임을 6글자 이내로 입력하세요."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                분야
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                disabled={disabledFields?.includes("category")}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category === '카테고리선택' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                모집인원
              </label>
              <select
                name="member_count"
                value={formData.member_count}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {memberCounts.map(count => (
                  <option key={count} value={count === '인원을 선택하세요' ? '' : count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                진행방식
              </label>
              <select
                name="progress_type"
                value={formData.progress_type}
                onChange={onChange}
                disabled={disabledFields?.includes("progress_type")}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {progressTypes.map(type => (
                  <option key={type} value={type === '온라인/오프라인' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                지역
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={onChange}
                disabled={disabledFields?.includes("location")}
                placeholder="지역"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                연락방법
              </label>
              <select
                name="contact_method"
                value={formData.contact_method}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {contactMethods.map(method => (
                  <option key={method} value={method === '카테고리' ? '' : method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                모집마감
              </label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={onChange}
                placeholder="카테고리"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                시작일
              </label>
              <input
                type="date"
                name="start"
                value={formData.start}
                onChange={onChange}
                disabled={disabledFields?.includes("start")}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                종료일
              </label>
              <input
                type="date"
                name="end"
                value={formData.end}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-section" style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '30px',
            color: '#333',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: '#ffa500',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              fontSize: '12px'
            }}>
              2
            </span>
            스터디 소개
          </h2>

          <textarea
            name="description"
            value={formData.description || ''}
            onChange={onChange}
            placeholder="2024년 내년도 프론트엔드 직무 공부"
            rows={8}
            style={{
              width: '100%',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              backgroundColor: '#fff',
              lineHeight: '1.5'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            style={{
              padding: '12px 24px',
              backgroundColor: '#e0e0e0',
              color: '#666',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffa500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? '등록중...' : submitLabel || '제출'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyForm;
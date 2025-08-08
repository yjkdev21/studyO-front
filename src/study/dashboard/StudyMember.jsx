import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./StudyMember.css";

export default function StudyMember() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState("홍길동"); // 실제 저장값
  const [tempNickname, setTempNickname] = useState(nickname); // 편집중 값
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // 편집 모드 들어가면 자동 포커스 및 텍스트 전체 선택
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 수정 버튼 클릭
  const handleEditClick = () => {
    setTempNickname(nickname);
    setIsEditing(true);
  };

  // 저장 버튼 클릭
  const handleSaveClick = () => {
    setNickname(tempNickname);
    setIsEditing(false);
    // TODO: 여기에 서버 API 호출 등 저장 로직 넣기
    window.alert("닉네임이 수정되었습니다.");

    // 선택된 텍스트 있으면 선택 해제
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
    }
  };

  // 취소 버튼 클릭
  const handleCancelClick = () => {
    setTempNickname(nickname);
    setIsEditing(false);
  };


  console.log("user정보", user);

  // 프로필 이미지 경로 - null일 시 기본 이미지
  const imageSrc = user?.profileImage
    ? user?.profileImage
    : "/images/default-profile.png";

  return (
    <div id="study-member">
      {/* 내 정보 */}
      <div className="!mb-[40px]">
        <h3 className="text-3xl !mb-5">내 정보</h3>
        <div className="dashboard-my-info">
          {/* 이미지 */}
          <div className="profile-image rounded-full overflow-hidden">
            <img className="w-full block" src={`${imageSrc}`} alt="이미지" />
          </div>
          {/* 텍스트 */}
          <div className="profile-text">
            <div className="edit-nickname-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                name="nickname-input"
                className={`nickname-input ${isEditing ? "editing" : ""}`}
                readOnly={!isEditing}
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                ref={inputRef}
              />
              {!isEditing ? (
                <button onClick={handleEditClick} type="button" className="nickname-btn" aria-label="수정">
                  <span className="material-symbols-rounded !text-3xl">Stylus</span>
                </button>
              ) : (
                <div>
                  <button onClick={handleSaveClick} type="button" className="nickname-btn save" aria-label="저장">
                    <span className="material-symbols-rounded !text-3xl">check</span>
                  </button>
                  <button onClick={handleCancelClick} type="button" className="nickname-btn cancel" aria-label="취소">
                    <span className="material-symbols-rounded !text-3xl">close</span>
                  </button>
                </div>
              )}
            </div>
            <p className="text-[#666] !pl-2">자기소개</p>
          </div>
        </div>
      </div>
      {/* 신청목록 -- 방장일 경우에만 */}
      <div>
        <div className="!mb-8 flex justify-between items-center">
          <h3 className="text-3xl">
            신청목록
            <span className="text-sm text-[#666] font-normal !ml-2">23</span>
          </h3>
          <div className="request-btn-wrap">
            <button type="button" className="request-btn-prev"><span class="material-symbols-rounded !text-4xl">keyboard_arrow_left</span></button>
            <button type="button" className="request-btn-next"><span class="material-symbols-rounded !text-4xl">keyboard_arrow_right</span></button>
          </div>
        </div>
        <ul className="dashboard-member-wrap">
          <li className="dashboard-member-list">
            <div className="profile-image rounded-full overflow-hidden">
              <img className="w-full block" src={`${imageSrc}`} alt="이미지" />
            </div>
            <div>
              <p>이름</p>
              <p>작성사유길면자르기</p>
            </div>
            <button type="button" className="member-btn">보기</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import ConfirmModal from '../../users/modal/ConfirmModal';

import { getUserRequests, approveUserRequest, rejectUserRequest } from "./studyMemberApi";

import "./StudyMember.css";

export default function StudyMember() {
  const { user } = useAuth();
  const { groupId } = useParams();


  // 상태 관리
  const [nickname, setNickname] = useState("멤버십닉네임");
  const [tempNickname, setTempNickname] = useState("멤버십닉네임");
  const [isEditing, setIsEditing] = useState(false);

  const [userRequests, setUserRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  // 프로필 이미지 (없으면 기본 이미지)
  const imageSrc = user?.profileImage ?? "/images/default-profile.png";

  // 모달 관련 상태
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  /** 데이터 가져오기 */
  const fetchUserRequests = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getUserRequests(groupId);
      setUserRequests(data.list || []);
      setMessage(data.message || "");
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        setError(
          status === 401
            ? "로그인이 필요합니다."
            : status === 403
              ? "접근 권한이 없습니다."
              : status === 404
                ? "요청한 리소스를 찾을 수 없습니다."
                : "서버 오류가 발생했습니다."
        );
      } else if (err.request) {
        setError("서버에 연결할 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  /** 선택 해제 */
  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) selection.removeAllRanges();
  };

  /** 닉네임 수정 모드 */
  const handleEditClick = () => {
    setTempNickname(nickname);
    setIsEditing(true);
  };

  /** 닉네임 저장 */
  const handleSaveClick = () => {
    setNickname(tempNickname);
    setIsEditing(false);
    clearSelection();
    alert("대시보드 닉네임이 수정되었습니다.(미완성)");
  };

  /** 닉네임 수정 취소 */
  const handleCancelClick = () => {
    setTempNickname(nickname);
    setIsEditing(false);
    clearSelection();
  };

  /** 마운트/GroupId 변경 시 신청 목록 불러오기 */
  useEffect(() => {
    fetchUserRequests();
  }, [groupId]);

  /** 편집 모드 진입 시 포커스 */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /** 모달 */
  /** 모달 취소 핸들러 */
  const handleModalCancel = () => {
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
  };

  /** 모달 확인 핸들러 */
  const handleModalConfirm = async (req) => {

    if (!selectedRequest) return;

    try {
      setLoading(true);

      if (isAcceptModalOpen) {
        // 수락 처리 로직 (API 호출 등)
        console.log('수락:', selectedRequest);
        const result = await approveUserRequest(selectedRequest.id);
        alert(result.message || `${selectedRequest?.nickname}님의 신청을 수락했습니다.`);
      } else if (isRejectModalOpen) {
        // 거절 처리 로직 (API 호출 등)
        console.log('거절:', selectedRequest);
        const result = await rejectUserRequest(selectedRequest.id);
        alert(result.message || `${selectedRequest?.nickname}님의 신청을 거절했습니다.`);
      }

      // 모달 닫기
      setIsAcceptModalOpen(false);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);

      // 목록 새로고침
      fetchUserRequests();
    } catch (error) {
      console.error('처리 중 오류:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };



  return (
    <div id="study-member">
      {/* 내 정보 */}
      <div className="info-container !mb-[40px]">
        <h3 className="text-3xl !mb-5">내 정보</h3>
        <div className="dashboard-my-info">
          {/* 프로필 이미지 */}
          <div className="profile-image rounded-full overflow-hidden">
            <img className="w-full block" src={imageSrc} alt="프로필" />
          </div>

          {/* 닉네임 */}
          <div className="profile-text">
            <div className="edit-nickname-wrap">
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
                <button
                  onClick={handleEditClick}
                  type="button"
                  className="nickname-btn"
                  aria-label="수정"
                >
                  <span className="material-symbols-rounded !text-3xl">Stylus</span>
                </button>
              ) : (
                <div>
                  <button
                    onClick={handleSaveClick}
                    type="button"
                    className="nickname-btn save"
                    aria-label="저장"
                  >
                    <span className="material-symbols-rounded !text-3xl">check</span>
                  </button>
                  <button
                    onClick={handleCancelClick}
                    type="button"
                    className="nickname-btn cancel"
                    aria-label="취소"
                  >
                    <span className="material-symbols-rounded !text-3xl">close</span>
                  </button>
                </div>
              )}
            </div>
            <p className="text-[#666] !pl-2">{user?.introduction}</p>
          </div>
        </div>
      </div>

      {/* 신청목록 */}
      <div className="request-container !mb-[40px]">
        <div className="!mb-8 flex justify-between items-center">
          <h3 className="text-3xl">
            신청목록
            <span className="text-sm text-[#666] font-normal !ml-2">
              {userRequests.length}
            </span>
          </h3>

          <div className="request-btn-wrap">
            <button type="button" className="request-btn-prev">
              <span className="material-symbols-rounded !text-4xl">keyboard_arrow_left</span>
            </button>
            <button type="button" className="request-btn-next">
              <span className="material-symbols-rounded !text-4xl">keyboard_arrow_right</span>
            </button>
          </div>
        </div>
        {/* 신청 목록 불러오기 */}
        <ul className="dashboard-member-wrap">
          {userRequests.length > 0 ? (
            userRequests.map((req, idx) => (
              <li key={req.id || idx} className="dashboard-member-list justify-between">
                <div className="profile-image rounded-full overflow-hidden">
                  <img className="w-full block" src={req.profileImage ?? imageSrc} alt="프로필" />
                </div>
                <div className="member-info">
                  <p className="font-bold text-[#333]">{req.nickname}</p>
                  <p className="text-sm text-[#666] truncate">{req.applicationMessage}</p>
                </div>
                <div className="flex">
                  <button type="button" className="member-btn !mr-2"
                    onClick={() => {
                      setSelectedRequest(req);
                      setIsAcceptModalOpen(true);
                    }}>수락</button>
                  <button type="button" className="member-btn"
                    onClick={() => {
                      setSelectedRequest(req);
                      setIsRejectModalOpen(true);
                    }}>거절</button>
                </div>
              </li>
            ))
          )
            :
            (<li className="text-[#666]">신청자가 없습니다.</li>)
          }
        </ul>
      </div>

      {/* 멤버목록 */}
      <div className="member-container">
        <h3 className="text-3xl !mb-8">
          멤버목록
          <span className="text-sm text-[#666] font-normal !ml-2">23</span>
        </h3>
        <ul className="dashboard-member-wrap">
          <li className="dashboard-member-list justify-start">
            <div className="profile-image rounded-full overflow-hidden">
              <img className="w-full block" src={imageSrc} alt="프로필" />
            </div>
            <div className="member-info">
              <p className="font-bold text-[#333]">이름</p>
            </div>
          </li>
        </ul>
      </div>

      {/* 수락 모달 - ConfirmModal 컴포넌트 */}
      <ConfirmModal
        isOpen={isAcceptModalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        type="accept"
        userName={selectedRequest?.nickname || selectedRequest?.userId || ''}
        profileImage={selectedRequest?.profileImage}
        customText={{
          title: "",
          description: selectedRequest?.applicationMessage
        }}
      />
      {/* 거절 모달 - ConfirmModal 컴포넌트 */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        type="accept"
        userName={selectedRequest?.nickname || selectedRequest?.userId || ''}
        profileImage={selectedRequest?.profileImage}
        customText={{
          title: "",
          description: selectedRequest?.applicationMessage,
          actionText: "거절"
        }}
      />
    </div>
  );
}

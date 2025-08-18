import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useStudy } from '../../contexts/StudyContext';
import { useParams } from "react-router-dom";
import ConfirmModal from '../../users/modal/ConfirmModal';
import { getProfileImageSrc } from "../../utils/imageUtils";

import { getUserRequests, approveUserRequest, rejectUserRequest, fetchGroupMembers, updateNickname, leaveGroup } from "./studyMemberApi";

import "./StudyMember.css";

export default function StudyMember() {
  const { user } = useAuth();
  const { groupId } = useParams();
  const { studyInfo } = useStudy();

  const navigate = useNavigate();

  /* ========== 상태 관리 ========== */
  // 닉네임 관련 상태
  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [memberId, setMemberId] = useState(null);

  // 데이터 관련 상태
  const [userRequests, setUserRequests] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  // ref
  const inputRef = useRef(null);

  // 모달 관련 상태
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // 현재 사용자 멤버십 정보
  const myMembership = useMemo(() => {
    return groupMembers.find(member => member?.userId === user?.id);
  }, [groupMembers, user?.id]);

  // 신청목록 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 현재 페이지의 데이터 계산
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return userRequests.slice(start, end);
  }, [userRequests, currentPage]);

  const totalPages = Math.ceil(userRequests.length / itemsPerPage);

  /* ========== API 호출 함수 ========== */
  // 회원 신청 목록
  const fetchUserRequests = async () => {
    try {
      const data = await getUserRequests(groupId);
      setUserRequests(data.list || []);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 그룹 멤버 목록
  const loadGroupMembers = async () => {
    try {
      const data = await fetchGroupMembers(groupId);
      setGroupMembers(data || []);
    } catch (error) {
      handleApiError(error);
    }
  }

  // API 에러 처리
  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorMessage =
        status === 401 ? "로그인이 필요합니다." :
          status === 403 ? "접근 권한이 없습니다." :
            status === 404 ? "요청한 리소스를 찾을 수 없습니다." : "서버 오류가 발생했습니다.";
      alert(errorMessage);
    } else if (error.request) {
      alert("서버에 연결할 수 없습니다.");
    } else {
      alert("알 수 없는 오류가 발생했습니다.");
    }
  };

  // 데이터 리로드
  const reloadData = async () => {
    if (!groupId) return;
    try {
      await Promise.all([
        fetchUserRequests(),
        loadGroupMembers()
      ]);
    } catch (err) {
      handleApiError(err);
    }
  };

  /* ========== 닉네임 수정 관련 ========== */

  /** 닉네임 수정 모드 */
  const handleEditClick = () => {
    setTempNickname(nickname);
    setIsEditing(true);
  };

  /** 엔터키 처리 */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveClick();
    }
  }

  /** 닉네임 저장 */
  const handleSaveClick = async () => {
    try {

      const result = await updateNickname(groupId, tempNickname);

      // 성공 시 UI 업데이트
      setNickname(tempNickname);
      setIsEditing(false);
      clearSelection();

      alert(result.message || "닉네임이 성공적으로 수정되었습니다.");

      // 멤버 목록 새로고침 
      await loadGroupMembers();
    } catch (error) {
      console.error("닉네임 수정 실패:", error);

      // 에러 메시지 표시
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("닉네임 수정에 실패했습니다.");
      }

      // 실패 시 원래 닉네임으로 되돌리기
      setTempNickname(nickname);
    }
  };

  /** 닉네임 수정 취소 */
  const handleCancelClick = () => {
    setTempNickname(nickname);
    setIsEditing(false);
    clearSelection();
  };

  // 선택 해제
  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) selection.removeAllRanges();
  };

  /** 마운트/GroupId 변경 시 신청 목록 불러오기 */
  useEffect(() => {
    reloadData();
  }, [groupId]);

  // userRequests가 변경되고 현재 페이지가 유효하지 않을 때만 초기화
  useEffect(() => {
    const maxPage = Math.ceil(userRequests.length / itemsPerPage) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [userRequests, currentPage, itemsPerPage]);

  // 닉네임 로드
  useEffect(() => {
    if (myMembership?.nickname) {
      setNickname(myMembership.nickname);
      setTempNickname(myMembership.nickname);
      setMemberId(myMembership.id);
    }
  }, [myMembership]);


  /** 편집 모드 진입 시 포커스 */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /* ========== 모달 ========== */
  /** 스터디 탈퇴 핸들러 */
  const handleLeaveStudy = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      const result = await leaveGroup(groupId);
      alert(result.message || "그룹에서 성공적으로 탈퇴했습니다.");

      // 탈퇴 성공 시 페이지 이동
      navigate("/");

    } catch (error) {
      console.error("스터디 탈퇴 실패:", error);

      // 에러 메시지 표시
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("스터디 탈퇴에 실패했습니다.");
      }
    } finally {
      setIsLeaveModalOpen(false);
    }
  };

  /** 신청 모달 취소 핸들러 */
  const handleModalCancel = () => {
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsLeaveModalOpen(false);
    setSelectedRequest(null);
  };

  /** 신청 모달 확인 핸들러 */
  const handleModalConfirm = async () => {
    if (!selectedRequest && !isLeaveModalOpen) return;

    try {
      if (isAcceptModalOpen) {
        // 수락 처리 로직
        const result = await approveUserRequest(selectedRequest.id);
        alert(result.message || `${selectedRequest?.nickname}님의 신청을 수락했습니다.`);
      } else if (isRejectModalOpen) {
        // 거절 처리 로직 
        const result = await rejectUserRequest(selectedRequest.id);
        alert(result.message || `${selectedRequest?.nickname}님의 신청을 거절했습니다.`);
      } else if (isLeaveModalOpen) {
        // 스터디 탈퇴 처리
        await handleLeaveStudy();
        return; // handleLeaveStudy에서 모달 닫기 처리함
      }

      // 모달 닫기
      setIsAcceptModalOpen(false);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);

      // 목록 새로고침
      fetchUserRequests();
      loadGroupMembers();
    } catch (error) {
      console.error('처리 중 오류:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  /* ========== 페이지 이동 함수 ========== */
  const goPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div id="study-member">
      {/* 내 정보 */}
      <div className="info-container !mb-[40px]">
        <h3 className="text-3xl !mb-5">내 정보</h3>
        <div className="dashboard-my-info">
          {/* 프로필 이미지 */}
          <div className="profile-image rounded-full overflow-hidden">
            <img className="w-full block" src={getProfileImageSrc(user?.profileImage)} alt="프로필" />
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
                onKeyDown={handleKeyDown}
                maxLength={8}
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
            <p className="text-[#666] !px-2">{user?.introduction}</p>
          </div>
        </div>
      </div>

      {/* 신청목록 */}
      {studyInfo?.groupOwnerId === user?.id ? (
        <div className="request-container !mb-[40px]">
          <div className="!mb-8 flex justify-between items-center">
            <h3 className="text-3xl">
              신청목록
              <span className="text-sm text-[#666] font-normal !ml-2">
                {userRequests.length}
              </span>
            </h3>
            <div className="request-btn-wrap">
              <button type="button" className="request-btn-prev" onClick={goPrevPage}
                disabled={currentPage === 1 || userRequests.length === 0}>
                <span className="material-symbols-rounded !text-4xl">keyboard_arrow_left</span>
              </button>
              <button type="button" className="request-btn-next" onClick={goNextPage}
                disabled={currentPage === totalPages || userRequests.length === 0}>
                <span className="material-symbols-rounded !text-4xl">keyboard_arrow_right</span>
              </button>
            </div>
          </div>
          {/* 신청 목록 불러오기 */}
          <ul className="dashboard-member-wrap">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((req, idx) => (
                <li key={req.id || idx} className="dashboard-member-list justify-between">
                  <div className="profile-image rounded-full overflow-hidden">
                    <img className="w-full block"
                      src={getProfileImageSrc(req.profileImage)} alt="프로필" />
                  </div>
                  <div className="member-info request">
                    <p className="font-bold text-[#333]">{req.nickname}</p>
                    <p className="text-sm text-[#666] truncate">{req.applicationMessage}</p>
                  </div>
                  <div className="flex">
                    <button type="button" className="member-btn !mr-2"
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsAcceptModalOpen(true);
                      }}>수락</button>
                    <button type="button" className="member-btn rejected"
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
          {paginatedRequests.length > 0 ? (
            <div className="text-center text-sm text-[#999] font-normal !mt-4">({currentPage}/{totalPages})</div>
          ) : ""}
        </div>
      ) : ""}
      {/* 멤버목록 */}
      <div className="member-container">
        <h3 className="text-3xl !mb-8">
          멤버목록
          <span className="text-sm text-[#666] font-normal !ml-2">{groupMembers?.length || 0}</span>
        </h3>
        <ul className="dashboard-member-wrap">
          {groupMembers.length > 0 ? (
            groupMembers.map((member, idx) => (
              <li key={member?.id || idx} className={`dashboard-member-list justify-start  ${member?.userId === user?.id ? 'me' : ''}`}>
                <div className="profile-image rounded-full overflow-hidden">
                  <img className="w-full block" src={getProfileImageSrc(member?.profileImage)} alt="프로필" />
                </div>
                <div className="member-info">
                  <p className="font-bold text-[#333]">
                    {member?.memberRole === "ADMIN" ? (<span className="leader-tag">방장</span>) : ""}
                    {member?.nickname}
                  </p>
                  <span className="text-xs text-[#999] absolute bottom-4 right-4">
                    {member?.joinedAt ? member.joinedAt.substring(0, 10) : ""}
                  </span>
                </div>
              </li>
            ))
          ) :
            (<li className="text-[#666]">멤버가 없습니다.</li>)
          }
        </ul>
      </div>
      {/* 스터디 탈퇴 버튼 - 멤버에게만 */}
      {studyInfo?.groupOwnerId !== user?.id ? (
        <div className="!mt-40 text-center">
          <button type="button"
            className="study-leave-btn md:float-right"
            onClick={() => setIsLeaveModalOpen(true)}
          >스터디 탈퇴
          </button>
        </div>
      ) : <></>}
      {/* 수락 모달 - ConfirmModal 컴포넌트 */}
      <ConfirmModal
        isOpen={isAcceptModalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        type="accept"
        userName={selectedRequest?.nickname || selectedRequest?.userId || ''}
        profileImage={getProfileImageSrc(selectedRequest?.profileImage)}
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
        type="kick"
        userName={selectedRequest?.nickname || selectedRequest?.userId || ''}
        profileImage={getProfileImageSrc(selectedRequest?.profileImage)}
        customText={{
          title: "",
          description: selectedRequest?.applicationMessage,
          actionText: "거절"
        }}
      />
      {/* 스터디 탈퇴 모달 - ConfirmModal 컴포넌트 */}
      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        type="kick"
        userName={user?.nickname || ""}
        profileImage={getProfileImageSrc(user?.profileImage)}
        customText={{
          title: "스터디 탈퇴",
          description: "정말로 이 스터디에서 탈퇴하시겠습니까?\n탈퇴 후에는 재가입을 할 수 없습니다.",
          actionText: "탈퇴"
        }}
      />
    </div>
  );
}
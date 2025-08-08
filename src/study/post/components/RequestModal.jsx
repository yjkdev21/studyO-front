import React, { useEffect, useState } from "react";
import "./RequestModal.css";
import axios from "axios";

const RequestModal = ({
  isOpen,
  groupId,
  msg,
  onChange,
  onConfirm,
  onClose,
}) => {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const [groupDto, setGroupDto] = useState(null);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await axios.get(
          `${host}/api/userRequest/group/${groupId}`
        );
        setGroupDto(response.data.groupDto);
      } catch (error) {
        console.error("그룹정보 확인 실패:", error?.message || error);
        setGroupDto(null);
      }
    };
    fetchGroupInfo();
  }, [host, groupId]);

  if (!isOpen) {
    return <></>;
  }

  const handleMsgChange = (e) => {
    onChange(e.target.value);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = () => {
    onConfirm();
  };

  return (
    <div className="request-modal-overlay">
      <div className="request-modal-content">
        <div className="request-modal-header">
          <img
            src={
              groupDto?.thumbnail ||
              "https://placehold.co/40x40/E5E5E5/000000?text=User"
            }
            alt="Group Thumbnail"
            className="request-group-thumbnail"
          />
          <span className="group-name">
            {groupDto?.groupName || "스터디 명"}
          </span>
        </div>
        <div className="request-modal-body">
          <textarea
            className="application-textarea"
            placeholder="가입 신청 내용을 입력해주세요."
            value={msg}
            onChange={handleMsgChange}
          />
        </div>
        <div className="request-modal-buttons">
          <button className="modal-cancel-btn" onClick={handleCancel}>
            취소
          </button>
          <button className="modal-submit-btn" onClick={handleSubmit}>
            신청
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;

import axios from "axios";


const host = import.meta.env.VITE_AWS_API_HOST;

// 신청 목록 API 호출
export const getUserRequests = async (groupId) => {
  try {
    const response = await axios.get(`${host}/api/userRequest/list/${groupId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user requests:", error);
    throw error;
  }
};

// 가입신청 승인
export const approveUserRequest = async (requestId) => {
  try {
    const response = await axios.post(`${host}/api/userRequest/approve/${requestId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error approving user request:", error);
    throw error;
  }
};

// 가입신청 거절
export const rejectUserRequest = async (requestId) => {
  try {
    const response = await axios.post(`${host}/api/userRequest/reject/${requestId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting user request:", error);
    throw error;
  }
};

// 그룹의 멤버 목록 조회 
export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await axios.get(`${host}/api/membership/group/${groupId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("그룹의 멤버 목록 조회 에러:", error);
    throw error;
  }
};

// 스터디 그룹 내 닉네임 수정
export const updateNickname = async (groupId, nickname) => {
  try {
    const response = await axios.put(`${host}/api/membership/nickname`, {
      groupId: groupId.toString(),
      nickname: nickname
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("닉네임 수정 에러:", error);
    throw error;
  }
};

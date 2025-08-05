import { useState } from 'react';
import axios from 'axios';

export const studySidebarApi = {
  getStudyInfo: async (groupId) => {  // 함수명, 매개변수명 수정
    const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);

    try {
      const response = await axios.get(`${host}/api/sidebar/study/${groupId}`);
      return response.data;

    } catch (error) {
      console.error('스터디 정보 API 호출 실패:', error);

      return null;
    }
  }
};
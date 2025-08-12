/*
스터디 정보를 전역으로 관리하는 Context API
- 여러 컴포넌트에서 동일한 스터디 정보를 공유
- API 호출 중복 제거

사용법
1. studyProvider로 컴포넌트들을 감쌈
2. 하위 컴포넌트에서 useStudy() 훅 사용

*/
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const StudyContext = createContext();

export const StudyProvider = ({ children, groupId }) => {

  const [studyInfo, setStudyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);

  const baseConfig = {
    timeout: 10000,
    headers: {
      "Content-Type": "application/json"
    }
  };

  const studyApi = axios.create({
    ...baseConfig,
    baseURL: `${host}/api/study`,
  });

  const fetchStudyInfo = async () => {
    try {
      setIsLoading(true);

      const response = await studyApi.get(`/${groupId}`);

      const data = response.data;

      // 성공처리
      if (data && data.data) {
        setStudyInfo(data.data);
        setError(null);
        return { success: true, data: data.data};
      }else {
        setError('스터디 정보를 찾을 수 없습니다.');
        return {success: false, message: '스터디 정보를 찾을 수 없습니다.'};
      }
    } catch (error) {
      console.error('스터디 정보 가져오기 실패:', error);

      // 상세한 에러처리
      let errorMessage = '스터디 정보를 불러오는데 실패했습니다.'
    
      if(error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "요청 시간이 초과되었습니다.";
      } else if (!error.response) {
        errorMessage = "네트워크 오류가 발생했습니다.";
      }

      setError(errorMessage);
      return { success: false, message: errorMessage};
    } finally {
      setIsLoading(false);
    }
  };
  // 스터디 정보 새로고침 함수 (외부에서 호출 가능한 공개 함수)
  const refreshStudyInfo = async () => {
    return await fetchStudyInfo();
  };

  // Effect 훅
  useEffect(() => {
    if (groupId) {
      fetchStudyInfo();
    } else {
      // groupId 없으면 초기화
      setStudyInfo(null);
      setError(null);
      setIsLoading(false);
    }
  }, [groupId]);

  // context value
  const value = {
    studyInfo,
    isLoading,
    error,
    refreshStudyInfo, // 새로고침 함수
    host,
  };

  //provider 렌더링
  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};

//custom 훅
export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

/*
사용 예시
1. Provider 설정 (Wrapper)
<StudyProvider groupId={groupId}>
  <StudyMain />
  <StudyCalendar />
  .
  .

</StudyProvider>


2. 컴포넌트에서 사용
function StudyMain() {
  const { studyInfo, isLoading, error } = useStudy();
  
  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!studyInfo) return <div>데이터 없음</div>;
  
  return <div>{studyInfo.groupName}</div>;
}
*/
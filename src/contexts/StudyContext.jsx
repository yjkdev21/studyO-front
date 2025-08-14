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
  const [studyMembers, setStudyMembers] = useState([]);
  const [memberNicknames, setMemberNicknames] = useState({})
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
        return { success: true, data: data.data };
      } else {
        setError('스터디 정보를 찾을 수 없습니다.');
        return { success: false, message: '스터디 정보를 찾을 수 없습니다.' };
      }
    } catch (error) {
      console.error('스터디 정보 가져오기 실패:', error);

      // 상세한 에러처리
      let errorMessage = '스터디 정보를 불러오는데 실패했습니다.'

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "요청 시간이 초과되었습니다.";
      } else if (!error.response) {
        errorMessage = "네트워크 오류가 발생했습니다.";
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // 스터디 멤버 정보 가져오기
  const fetchStudyMembers = async () => {
    try {
      const response = await studyApi.get(`/group/${groupId}/members`);

      if (response.data) {
        setStudyMembers(response.data);

        //닉네임 매핑 객체 생성
        const nicknameMap = {};
        response.data.forEach(member => {
          // 스터디 닉네임 우선, 없으면 일반 닉네임 사용
          nicknameMap[member.userId] = member.studyNickname || member.nickname || '사용자';
        });
        setMemberNicknames(nicknameMap);

        console.log('스터디 멤버 정보:', response.data);
        console.log('닉네임 매핑:', nicknameMap);

        return { success: true, data: response.data };
      }
      return { success: false, message: '멤버 정보가 없습니다.' };
    } catch (error) {
      console.error('스터디 멤버 정보 가져오기 실패:', error);

      let errorMessage = '멤버 정보를 불러오는데 실패했습니다.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      return { success: false, message: errorMessage };
    }
  };

  // 득정 사용자의 스터디 닉네임 가져오기
  const getStudyNickname = (userId) => {
    return memberNicknames[userId] || '사용자';
  };

  // 프로필 이미지 URL 처리 함수
  const getProfileImageUrl = (post, user) => {
    // 작성자 프로필 이미지
    if (post.writerProfileImage) {
      if (post.writerProfileImage.startsWith('/')) {
        return `${host}${post.writerProfileImage}`;
      }
      return post.writerProfileImage;
    }

    // 현재 사용자의 프로필 이미지 (본인 글일 경우)
    if (post.userId === user?.id && user?.profileImage) {
      if (user.profileImage.startsWith('/')) {
        return `${host}${user.profileImage}`;
      }
      return user.profileImage;
    }

    return '/images/default-profile.png';
  }

  // 게시글 작성자 닉네임 가져오기
  const getPostWriterNickname = (post, user) => {
    //api 응당 스터디 닉네임
    if (post.studyNickname) {
      return post.studyNickname;
    }

    // 2순위: API 응답의 작성자 닉네임
    if (post.writerNickname) {
      return post.writerNickname;
    }

    // 3순위: 멤버 목록에서 스터디 닉네임 찾기
    const writerId = post.userId || post.writerId;
    if (writerId && memberNicknames[writerId]) {
      return memberNicknames[writerId];
    }

    // 4순위: 현재 사용자 닉네임 (본인 글인 경우)
    if (writerId === user?.id && user?.nickname) {
      return user.nickname;
    }

    // 5순위: 기본값
    return '사용자';
  }

  // 스터디 정보 새로고침 함수 (외부에서 호출 가능한 공개 함수)
  const refreshStudyInfo = async () => {
    return await fetchStudyInfo();
  };



  // Effect 훅
  useEffect(() => {
    if (groupId) {
      // 스터디 정보와 멤버 정보를 동시에 가져오기
      Promise.all([
        fetchStudyInfo(),
        fetchStudyMembers()
      ]).then(([studyResult, memberResult]) => {
        console.log('스터디 정보 로딩 완료:', studyResult);
        console.log('멤버 정보 로딩 완료:', memberResult);
      });
    } else {
      // groupId 없으면 초기화
      setStudyInfo(null);
      setStudyMembers([]);
      setMemberNicknames({});
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

    // 새로 추가된 값들
    studyMembers,
    memberNicknames,
    getStudyNickname,
    getProfileImageUrl,
    getPostWriterNickname,
    fetchStudyMembers,
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
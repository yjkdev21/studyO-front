import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getProfileImageSrc } from '../utils/imageUtils';

const StudyContext = createContext();

export const StudyProvider = ({ children, groupId }) => {
  const [studyInfo, setStudyInfo] = useState(null);
  const [studyMembers, setStudyMembers] = useState([]);
  const [memberNicknames, setMemberNicknames] = useState({})
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [host] = useState(import.meta.env.VITE_AWS_API_HOST);

  const baseConfig = {
    timeout: 10000,
    headers: {
      "Content-Type": "application/json"
    }
  };

  const api = axios.create({
    ...baseConfig,
    baseURL: host,
  });

  // 유틸리티 함수
  const getUserId = (post) => post.userId || post.writerId || post.writer_id;

  /********** 스터디 기본 정보 **********/
  const fetchStudyInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/study/${groupId}`);

      if (response.data?.data) {
        setStudyInfo(response.data.data);
        setError(null);
      } else {
        setError('스터디 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('스터디 정보 가져오기 실패:', error);
      setError('스터디 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /********** 멤버 관련 함수들 **********/
  const fetchStudyMembers = async () => {
    try {
      const memberResponse = await api.get(`/api/membership/group/${groupId}`);

      if (memberResponse.data && Array.isArray(memberResponse.data)) {
        processMemberData(memberResponse.data);
      }
    } catch (error) {
      setStudyMembers([]);
      setMemberNicknames({});
    }
  };

  const processMemberData = (memberData) => {
    setStudyMembers(memberData);

    const nicknameMap = {};
    memberData.forEach(member => {
      nicknameMap[member.userId] = member.studyNickname || member.nickname || '사용자';
    });

    setMemberNicknames(nicknameMap);
  };

  const enhanceNicknamesFromPosts = (posts) => {
    const currentMap = { ...memberNicknames };

    posts.forEach(post => {
      const userId = getUserId(post);
      if (userId && !currentMap[userId]) {
        const nickname = post.studyNickname || post.writerNickname || post.nickname;
        if (nickname && nickname !== '사용자') {
          currentMap[userId] = nickname;
        }
      }
    });

    setMemberNicknames(currentMap);
  };

  /********** 닉네임/프로필 **********/
  const getPostWriterNickname = (post) => {
    const writerId = getUserId(post);

    if (writerId && memberNicknames[writerId]) {
      return memberNicknames[writerId];
    }
    return '(알 수 없음)';
  };

  const getProfileImageUrl = (post) => {
    const member = studyMembers.find(m => m.userId === getUserId(post));
    if (member && member.profileImage) {
      return getProfileImageSrc(member.profileImage);
    }
    return getProfileImageSrc(null);
  };

  /********** 새로고침 함수 **********/
  const refreshStudyInfo = async () => {
    await Promise.all([fetchStudyInfo(), fetchStudyMembers()]);
  };

  useEffect(() => {
    if (groupId) {
      fetchStudyInfo();
      fetchStudyMembers();
    } else {
      setStudyInfo(null);
      setStudyMembers([]);
      setMemberNicknames({});
      setError(null);
      setIsLoading(false);
    }
  }, [groupId]);

  const value = {
    studyInfo,
    isLoading,
    error,
    refreshStudyInfo,
    host,
    studyMembers,
    memberNicknames,
    getProfileImageUrl,
    getPostWriterNickname,
    fetchStudyMembers,
    enhanceNicknamesFromPosts,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
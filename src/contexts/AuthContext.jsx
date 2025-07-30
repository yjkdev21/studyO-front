import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// AuthProvider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 처음에 true로 시작
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE = "http://localhost:8081/api/auth";

  //axios 기본 설정
  const apiClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 로그인 상태 확인 (앱 시작시 한 번만)
  const checkLoginStatus = async () => {
    try {
      const response = await apiClient.get('/check');
      const data = response.data;

      if (data.success && data.isLoggedIn) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // console.error('로그인 상태 확인 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // 여기서 로딩을 끝냄
    }
  };

  // 로그인
  const login = async (formData) => {
    try {
      const response = await apiClient.post('/login', formData);
      const data = response.data;

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('로그인 오류:', error);

      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || '로그인에 실패했습니다.' };
      } else {
        return { success: false, message: '네트워크 오류가 발생했습니다.' };
      }
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      const response = await apiClient.post('/logout');
      const data = response.data;

      setUser(null);
      setIsAuthenticated(false);

      return { success: true, message: data.message || '로그아웃되었습니다.' };
    } catch (error) {
      console.error('로그아웃 오류:', error);

      // 에러가 발생해도 프론트엔드에서는 로그아웃 처리
      setUser(null);
      setIsAuthenticated(false);

      return { success: false, message: '로그아웃 중 오류가 발생했습니다.' };
    }
  };

  // 앱 시작시 딱 한 번만 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
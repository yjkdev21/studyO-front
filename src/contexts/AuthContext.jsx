import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// AuthProvider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const host = import.meta.env.VITE_AWS_API_HOST;

  const [skipAuthCheck, setSkipAuthCheck] = useState(false);


  //axios 기본 설정
  const baseConfig = {
    withCredentials: true,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json"
    }
  }
  // auth 패키지 API
  const authApi = axios.create({
    ...baseConfig,
    baseURL: `${host}/api/auth`,
  });

  // user 패키지 API
  const userApi = axios.create({
    ...baseConfig,
    baseURL: `${host}/api/user`,
  });


  // 로그인 상태 확인 
  const checkLoginStatus = async () => {
    try {
      const response = await authApi.get("/check");
      const data = response.data;

      if (data.success && data.isLoggedIn) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인
  const login = async (formData) => {
    try {
      const response = await authApi.post("/login", formData);
      const data = response.data;

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("로그인 오류:", error);

      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || "로그인에 실패했습니다." };
      } else {
        return { success: false, message: "네트워크 오류가 발생했습니다." };
      }
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      const response = await authApi.post("/logout");

      setUser(null);
      setIsAuthenticated(false);
      setSkipAuthCheck(true);

      return { success: true, message: response.data.message || "로그아웃되었습니다." };
    } catch (error) {
      console.error("로그아웃 오류:", error);

      // 에러가 발생해도 프론트엔드에서는 로그아웃 처리
      setUser(null);
      setIsAuthenticated(false);
      setSkipAuthCheck(true);

      return { success: false, message: "로그아웃 중 오류가 발생했습니다." };
    }
  };

  const clearAuthCheck = () => setSkipAuthCheck(false);

  // 아이디 찾기
  const findUserId = async (email) => {
    try {
      const response = await authApi.post("/find-id", { email });
      return response.data;
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      return { success: false, message: "네트워크 오류가 발생했습니다." };
    }
  }

  // 비밀번호 찾기 - 1단계: 계정 검증
  const verifyAccount = async (userId, email) => {
    try {
      const response = await authApi.post("/verify-account", {
        userId,
        email
      });
      return response.data;
    } catch (error) {
      console.error("계정 검증 오류:", error);
      const message =
        error.response?.data?.message || "네트워크 오류가 발생했습니다.";
      return { success: false, message };
    }
  };

  // 비밀번호 찾기 - 2단계: 비밀번호 재설정
  const resetPassword = async (userId, email, newPassword) => {
    try {
      const response = await authApi.post("/reset-password", {
        userId,
        email,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      const message =
        error.response?.data?.message || "네트워크 오류가 발생했습니다.";
      return { success: false, message };
    }
  };

  // 비밀번호 찾기 - 비밀번호 변경
  // const resetPassword = async (userId, email, newPassword) => {
  //   try {
  //     const response = await authApi.post("/find-password", {
  //       userId,
  //       email,
  //       newPassword
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error("비밀번호 변경 오류:", error);
  //     // 서버에서 내려준 message가 있다면 사용하고, 없으면 기본 메시지 사용
  //     const message =
  //       error.response?.data?.message || "네트워크 오류가 발생했습니다.";
  //     return { success: false, message };
  //   }
  // };
  
  // 회원 탈퇴
  const deleteAccount = async () => {
    try {
      const response = await userApi.delete("/delete");
      const data = response.data;

      if (data.success) {
        setUser(null);
        setIsAuthenticated(false);


        return { success: true, message: data.message || '회원 탈퇴가 완료되었습니다.' };
      } else {
        return { success: false, message: data.message || '탈퇴 처리에 실패했습니다.' };
      }

    } catch (error) {
      console.error('회원 탈퇴 오류:', error);

      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || '탈퇴 처리에 실패했습니다.' };
      } else {
        return { success: false, message: '네트워크 오류가 발생했습니다.' };
      }
    }
  }

  // 초기 렌더링 시 로그인 상태 체크
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    deleteAccount,
    findUserId,
    verifyAccount,    // 추가: 1단계 계정 검증
    resetPassword,    // 수정: 2단계 비밀번호 재설정
    skipAuthCheck,
    clearAuthCheck,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
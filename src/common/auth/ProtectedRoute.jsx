import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return <main><div className="main-center"></div></main>;
  }

  // 로그인이 안 되어 있을 경우 빈 화면 잠깐 보여줌
  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
}

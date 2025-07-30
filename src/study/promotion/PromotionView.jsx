import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import "./Promotion.css";

export default function PromotionView() {
<<<<<<< HEAD
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("API Host:", host); // 디버깅을 위해 호스트 값 출력

=======
  // page parameter..
>>>>>>> obama
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const paramPage = parseInt(queryParams.get("page")) || 1;
  const paramPageSize = parseInt(queryParams.get("pageSize")) || 3;

  const { postId } = useParams();
  const [post, setPost] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태 추가
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태 추가
=======
  const [error, setError] = useState("");
>>>>>>> obama
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
<<<<<<< HEAD
      setLoading(true);
      setErrorMessage(""); // 새로운 요청 전에 오류 메시지 초기화
      try {
        const response = await axios.get(
          `${host}/api/study/promotion/${postId}`,
          {
            withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
          }
        );
        setPost(response.data);
      } catch (err) {
        console.error("게시글 조회 실패:", err);
        setErrorMessage(
          "❌ 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      // postId가 있을 때만 fetchPost 호출
      fetchPost();
    }
  }, [postId, host]); // host도 의존성 배열에 추가하여 변경 시 재호출되도록 함

  const handleDownLoadFile = (storedFileName) => {
    // host 변수를 사용하여 동적으로 다운로드 URL 생성
    const downloadUrl = `${host}/api/study/promotion/download/${storedFileName}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", storedFileName); // 파일 이름으로 다운로드되도록 설정
=======
      try {
        const response = await axios.get(
          `http://localhost:8081/api/study/promotion/${postId}`
        );
        setPost(response.data);
      } catch (err) {
        console.error("조회 실패:", err);
        setError("❌ 게시글을 불러오지 못했습니다.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleDownLoadFile = (storedFileName) => {
    const downloadUrl = `http://localhost:8081/editorexample/download/${storedFileName}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", storedFileName);
>>>>>>> obama
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
<<<<<<< HEAD
    setErrorMessage(""); // 메시지 초기화
    setSuccessMessage(""); // 메시지 초기화

    // window.confirm 대신 커스텀 모달 또는 console.log로 대체
    // 실제 앱에서는 사용자에게 확인을 받는 UI를 구현해야 합니다.
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?"); // 임시로 window.confirm 유지, 실제 서비스에서는 커스텀 모달 사용 권장
    if (!confirmed) return;

    try {
      await axios.delete(`${host}/api/study/promotion/${postId}`, {
        withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
      });
      setSuccessMessage("게시글이 성공적으로 삭제되었습니다."); // alert 대신 상태 업데이트
      // 성공 메시지를 잠시 보여준 후 목록으로 이동
      setTimeout(() => {
        navigate("/study/promotion/list");
      }, 1000); // 1초 후 이동
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      setErrorMessage(
        "❌ 게시글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  if (loading) {
=======
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8081/api/study/promotion/${postId}`);
      alert("게시글이 삭제되었습니다.");
      navigate("/study/promotion/list");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("❌ 게시글 삭제에 실패했습니다.");
    }
  };

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  if (!post) {
>>>>>>> obama
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">게시글을 불러오는 중...</p>
      </div>
    );
  }

<<<<<<< HEAD
  // 로딩이 끝났는데 오류 메시지가 있다면 오류 표시
  if (errorMessage && !loading) {
    return <div className="alert alert-danger text-center">{errorMessage}</div>;
  }

  // 게시글이 없으면 (예: 404 Not Found)
  if (!post) {
    return (
      <div className="alert alert-info text-center">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="promotion-container">
      {/* 오류 메시지 표시 */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      {/* 성공 메시지 표시 */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <h2 className="mb-3">{post.title}</h2>
      <p className="text-muted">
        작성일: {new Date(post.regDate).toLocaleString("ko-KR")}
=======
  return (
    <div className="promotion-container">
      <h2 className="mb-3">{post.title}</h2>
      <p className="text-muted">
        작성일: {new Date(post.regDate).toLocaleString()}
>>>>>>> obama
      </p>

      <div
        className="ql-editor border rounded p-3 promotion-view-container"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.attachFile && post.attachFile.length > 0 && (
        <div className="attachment-section">
          <label className="attachment-header">첨부파일</label>
          <ul className="attachment-list">
            {post.attachFile.map((file) => (
              <li className="attachment-item" key={file.storedFileName}>
                {file.fileName}
                <button
                  type="button"
                  onClick={() => handleDownLoadFile(file.storedFileName)}
                  className="btn-base btn-primary margin-left-1 pdding-03"
                >
                  다운로드
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="button-container">
        <Link
          to={`/study/promotion/list?page=${paramPage}&pageSize=${paramPageSize}`}
          className="btn-base btn-gray"
        >
          목록으로
        </Link>

        <Link
          to={`/study/promotion/edit/${post.id}`}
          className="btn-base btn-primary margin-left-1"
        >
          수정
        </Link>

        <button
          className="btn-base btn-dark-orange margin-left-1"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

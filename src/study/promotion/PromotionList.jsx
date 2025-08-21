import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

export default function PromotionList() {
  // VITE_AWS_API_HOST는 빌드 시점에 결정되므로, useState의 초기값으로만 사용합니다.
  // 런타임에 동적으로 변경하려면 Context API 등을 사용해야 합니다.
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("API Host:", host); // 디버깅을 위해 호스트 값 출력

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태 추가

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const paramPage = parseInt(queryParams.get("page")) || 1;
  const paramPageSize = parseInt(queryParams.get("pageSize")) || 3;

  const [currentPage, setCurrentPage] = useState(paramPage);
  const [pageSize] = useState(paramPageSize); // pageSize는 변경되지 않으므로 useState만 사용
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const pageBlockSize = 5;
  const navigate = useNavigate();

  // currentPage 또는 pageSize가 변경될 때마다 게시글을 다시 불러옵니다.
  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize, host]); // host도 의존성 배열에 추가하여 변경 시 재호출되도록 함

  const fetchPosts = async () => {
    setLoading(true);
    setErrorMessage(""); // 새로운 요청 전에 오류 메시지 초기화
    try {
      const response = await axios.get(`${host}/api/study/promotion`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
        withCredentials: true, // <<<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
      });

      const { list, totalCount: fetchedTotalCount } = response.data;
      setPosts(list);
      setTotalCount(fetchedTotalCount);

      const calculatedTotalPages = Math.ceil(fetchedTotalCount / pageSize);
      setTotalPages(calculatedTotalPages);

      const calculatedStartPage =
        Math.floor((currentPage - 1) / pageBlockSize) * pageBlockSize + 1;
      setStartPage(calculatedStartPage);

      const calculatedEndPage = Math.min(
        calculatedStartPage + pageBlockSize - 1,
        calculatedTotalPages
      );
      setEndPage(calculatedEndPage);
    } catch (error) {
      console.error("게시글 목록을 불러오는 중 오류 발생:", error);
      // alert 대신 사용자에게 보이는 메시지 상태 업데이트
      setErrorMessage(
        "게시글 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
      // CORS 오류의 경우, 네트워크 탭에서 실제 오류 메시지를 확인하는 것이 중요합니다.
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`?page=${page}&pageSize=${pageSize}`);
  };

  const handleCreatePost = () => {
    navigate("/study/promotion/post");
  };

  const handleViewPost = (id) => {
    navigate(
      `/study/promotion/view/${id}?page=${currentPage}&pageSize=${pageSize}`
    );
  };

  const handleEditPost = (id) => {
    navigate(`/study/promotion/edit/${id}`);
  };

  const handleDeletePost = async (id) => {
    // window.confirm 대신 커스텀 모달 또는 console.log로 대체
    // 실제 앱에서는 사용자에게 확인을 받는 UI를 구현해야 합니다.
    // console.log(`게시글 ID ${id}를 삭제 요청합니다.`);
    const confirmDelete = window.confirm(
      "정말로 이 게시글을 삭제하시겠습니까?"
    ); // 임시로 window.confirm 유지, 실제 서비스에서는 커스텀 모달 사용 권장

    if (confirmDelete) {
      try {
        await axios.delete(`${host}/api/study/promotion/${id}`, {
          withCredentials: true, // <<<<<<< 이 부분 추가: 자격 증명(쿠키 등)을 요청에 포함
        });
        // console.log("게시글이 성공적으로 삭제되었습니다.");
        // alert 대신 사용자에게 보이는 메시지 상태 업데이트
        setErrorMessage("게시글이 성공적으로 삭제되었습니다.");
        fetchPosts(); // 삭제 후 목록 새로고침
      } catch (error) {
        console.error("게시글 삭제 중 오류 발생:", error);
        setErrorMessage("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary">All Posts</h1>
        <button className="btn-base btn-primary" onClick={handleCreatePost}>
          새 게시글 작성
        </button>
      </div>

      {/* 오류 메시지 표시 */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          게시글이 없습니다.
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {posts.map((post) => (
              <div key={post.id} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h2 className="card-title text-success">{post.title}</h2>
                    <p className="card-subtitle mb-2 text-muted">
                      {new Date(post.regDate).toLocaleString("ko-KR")}
                    </p>

                    <div className="mt-auto d-flex flex-wrap gap-2">
                      <button
                        className="btn-base btn-gray"
                        onClick={() => handleViewPost(post.id)}
                      >
                        View
                      </button>
                      <button
                        className="btn-base btn-primary"
                        onClick={() => handleEditPost(post.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-base btn-dark-orange"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top">
                    <small className="text-muted">ID: {post.id}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startPage={startPage}
            endPage={endPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

export default function PromotionList() {
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("host: ", host);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const paramPage = parseInt(queryParams.get("page")) || 1;
  const paramPageSize = parseInt(queryParams.get("pageSize")) || 3;

  const [currentPage, setCurrentPage] = useState(paramPage);
  const [pageSize] = useState(paramPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const pageBlockSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${host}/api/study/promotion`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
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
      console.error("Error fetching posts:", error);
      alert("게시글 목록을 불러오는 중 오류가 발생했습니다.");
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
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${host}/api/study/promotion/${id}`);
        alert("게시글이 성공적으로 삭제되었습니다.");
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
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

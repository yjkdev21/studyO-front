import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import "./Promotion.css";

export default function PromotionView() {
  console.log(import.meta.env.VITE_AWS_API_HOST);
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  // page parameter..
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const paramPage = parseInt(queryParams.get("page")) || 1;
  const paramPageSize = parseInt(queryParams.get("pageSize")) || 3;

  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${host}/api/study/promotion/${postId}`
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await axios.delete(`${host}/api/study/promotion/${postId}`);
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
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="promotion-container">
      <h2 className="mb-3">{post.title}</h2>
      <p className="text-muted">
        작성일: {new Date(post.regDate).toLocaleString()}
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

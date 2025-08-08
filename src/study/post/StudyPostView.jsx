import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Post.css";
import AttachmentManager from "./components/AttachmentManager";
import { useAuth } from "../../contexts/AuthContext";

export default function StudyPostView({
  groupId,
  onPostEdit,
  onPostDeleted,
  onStudyJoin,
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const host = import.meta.env.VITE_AWS_API_HOST;
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hasApplied, setHasApplied] = useState(false); // 기존가입여부

  useEffect(() => {
    const fetchPostAndGroup = async () => {
      if (!groupId) {
        setError("그룹 ID가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${host}/api/study-groups/post/${groupId}`,
          { withCredentials: true }
        );
        const { groupDto, postDto } = response.data;

        if (groupDto) {
          setGroup(groupDto);
        }
        if (postDto) {
          //console.log("AAAAA postId", postDto.studyPostId);
          setPost(postDto);
          setError(null);

          if (groupId && userId) {
            checkApplicationStatus(postDto.studyPostId);
          }
        } else {
          setError("게시글 정보를 찾을 수 없습니다.");
          setPost(null);
        }
      } catch (err) {
        console.error("데이터를 가져오는 중 오류 발생:", err);
        setError("데이터를 가져오는 데 실패했습니다.");
        setGroup(null);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndGroup();

    // 가입신청 또는 가입한 이력이 있는 지 확인...
    const checkApplicationStatus = async (postId) => {
      // console.log(
      //   `checkApplicationStatus = ${host}/api/userRequest/exist/${groupId}/${userId}/${postId}`
      // );

      try {
        const response = await axios.get(
          `${host}/api/userRequest/exist/${groupId}/${userId}/${postId}`
        );

        // console.log(
        //   "exists: ",
        //   response.data.exists,
        //   "g: ",
        //   groupId,
        //   "u:",
        //   userId
        // );
        setHasApplied(response.data.exists);
      } catch (error) {
        console.error("가입 신청 여부 확인 실패:", error?.message || error);
        setHasApplied(false);
      }
    };
  }, [groupId, host]);

  const handleDownLoadFile = async (storedFileName, originalFileName) => {
    try {
      // originalFileName을 URL 쿼리 파라미터로 추가하여 서버로 전달
      const response = await axios.get(
        `${host}/api/file/download/${storedFileName}?originalFileName=${encodeURIComponent(
          originalFileName
        )}`,
        {
          responseType: "blob", // 바이너리 데이터로 응답 받기
          withCredentials: true, // 쿠키 등 인증 정보 포함
        }
      );

      // 응답으로 받은 Blob 데이터를 사용하여 다운로드 링크 생성
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("파일 다운로드 실패:", err);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 게시글을 삭제하시겠습니까?")) {
      try {
        if (!post?.studyPostId) {
          alert("삭제할 게시글 정보가 없습니다.");
          return;
        }
        await axios.delete(`${host}/api/study-groups/post/${post.groupId}`, {
          withCredentials: true,
        });
        alert("게시글이 성공적으로 삭제되었습니다.");
        if (onPostDeleted) {
          onPostDeleted();
        }
      } catch (err) {
        console.error("게시글 삭제 실패:", err);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 날짜 포맷팅
  const recruitStartDate = post?.recruitStartDate
    ? formatDate(post.recruitStartDate)
    : "날짜 미정";
  const recruitEndDate = post?.recruitEndDate
    ? formatDate(post.recruitEndDate)
    : "날짜 미정";
  const updatedAt = post?.updatedAt ? formatDate(post.updatedAt) : "날짜 미정";
  const createdAt = post?.createdAt ? formatDate(post.createdAt) : "날짜 미정";

  return (
    <div className="study-post-main-content">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">게시글을 불러오는 중입니다...</div>
        </div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : !post || !group ? (
        <div className="alert alert-warning">
          게시글 정보가 존재하지 않습니다.
        </div>
      ) : (
        <>
          <div className="view-header-section">
            <h1 className="view-title">{post.title}</h1>
            <div className="view-author-info">
              <img
                src={post.profileImage || "/default-profile.png"}
                alt="프로필 이미지"
                className="view-profile-image"
              />
              <span className="view-author">{group.nickName}</span>
              <span className="view-date"> | {createdAt}</span>
            </div>
            <div className="view-meta-info-flex">
              <div className="meta-item">
                <span className="meta-label">카테고리</span>
                <span className="meta-value">{group.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">모집인원</span>
                <span className="meta-value">{group.maxMembers}명</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">진행방식</span>
                <span className="meta-value">{group.studyMode}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">지역</span>
                <span className="meta-value">{group.region}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">연락방법</span>
                <span className="meta-value">{group.contact}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">수정일</span>
                <span className="meta-value">{updatedAt}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">모집시작일</span>
                <span className="meta-value">{recruitStartDate}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">모집종료일</span>
                <span className="meta-value">{recruitEndDate}</span>
              </div>
            </div>
          </div>
          <div className="view-body-section">
            <h3 className="section-title">스터디 소개</h3>
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
          <AttachmentManager
            files={post.attachFile || []}
            mode="view"
            onDownload={handleDownLoadFile}
          />

          <div className="button-container">
            {onStudyJoin != null && hasApplied == false && post != null && (
              <button
                className="btn-base btn-dark-orange margin-left-1"
                onClick={() => {
                  onStudyJoin(post?.studyPostId);
                }}
              >
                가입신청
              </button>
            )}

            {onPostEdit != null && (
              <Link
                to={`/study-groups/post/edit/${post.studyPostId}`}
                className="btn-base btn-primary margin-left-1"
              >
                수정
              </Link>
            )}

            {onPostDeleted != null && (
              <button
                className="btn-base btn-dark-orange margin-left-1"
                onClick={handleDelete}
              >
                삭제
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Post.css";
import AttachmentManager from "./components/AttachmentManager";
import { useAuth } from "../../contexts/AuthContext";
import BookMarkViewCnt from "./components/BookMarkViewCnt";
import PromotionSummary from "./components/PromotionSummary";

export default function StudyPostView({
  groupId,
  onPostEdit,
  onPostDeleted,
  onStudyJoin,
}) {
  const { user } = useAuth();
  const userId = user?.id;
  const host = import.meta.env.VITE_AWS_API_HOST;
  const [post, setPost] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // 스터디 가입여부

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
          setPost(postDto);

          if (groupId && userId) {
            // 모집 마감일 확인
            if (postDto.recruitEndDate) {
              const endDate = new Date(postDto.recruitEndDate);
              endDate.setDate(endDate.getDate() + 1); // 하루 더해서 0시 보정

              const today = new Date();
              if (endDate <= today) {
                if (onStudyJoin) {
                  // 가입신청 handler 가 props 에 존재하면
                  setError("모집마감일이 지나 신청이 마감되었습니다.");
                  setHasApplied(true);
                } else {
                  // 가입신청 버튼 handler 가 없는 개설자 인 경우..
                  setError(
                    "모집마감일 만료! \n 모집마감일 과 모집인원을 수정하여 신규 멤버를 유치해 보세요."
                  );
                }
                return;
              }
            }

            if (onStudyJoin) {
              // 가입신청 View 인 경우...
              // 모집 마감일이 지나지 않았다면 가입 신청 여부 확인
              checkApplicationStatus(postDto.studyPostId);
            }
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

    // 가입신청 가능 여부 확인
    const checkApplicationStatus = async (postId) => {
      try {
        const response = await axios.get(
          `${host}/api/userRequest/exist/${groupId}/${userId}/${postId}`
        );
        if (!response.data.joinAble) {
          setError(response.data.errorMessage);
          setHasApplied(true); // 가입신청 불가로 / 신청버튼 hidden state
        } else {
          setError(null);
          setHasApplied(false); // 가입신청 가능
        }
      } catch (error) {
        console.error("가입 신청 여부 확인 실패:", error?.message || error);
        setHasApplied(false);
      }
    };

    fetchPostAndGroup();
  }, [groupId, userId, host]);

  const handleDownLoadFile = async (storedFileName, originalFileName) => {
    try {
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

  return (
    <div className="study-post-main-content">
      {error == null || (
        <div className="alert alert-error-message">⚠️ {error}</div>
      )}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">게시글을 불러오는 중입니다...</div>
        </div>
      ) : !post || !group ? (
        <div className="alert alert-error-message">
          ⚠️ 게시글 정보가 존재하지 않습니다.
        </div>
      ) : (
        <>
          <div className="view-header-section">
            <div className="promotion-view-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="35"
                height="35"
                fill="#a5a5a5"
                class="bi bi-megaphone"
                viewBox="0 0 16 16"
              >
                <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 75 75 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0m-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233q.27.015.537.036c2.568.189 5.093.744 7.463 1.993zm-9 6.215v-4.13a95 95 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A61 61 0 0 1 4 10.065m-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68 68 0 0 0-1.722-.082z" />
              </svg>
              <span>{post.title}</span>
            </div>

            {onPostEdit || <BookMarkViewCnt post={post} />}

            {/* 그룹기본정보 */}
            <PromotionSummary group={group} post={post} />
          </div>
          <div className="view-body-section">
            <h3 className="section-title">스터디 소개</h3>
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* 첨부한 파일 목록 */}
          <AttachmentManager
            files={post.attachFile || []}
            mode="view"
            onDownload={handleDownLoadFile}
          />

          {/* 하단 버튼 목록 - 핸들러가 props로 주입된 경우만 노출되도록 구현하였다 */}
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

            {onPostEdit && (
              <button
                className="btn-base btn-primary margin-left-1"
                onClick={() => {
                  onPostEdit(groupId);
                }} // 클릭 시 부모 컴포넌트의 콜백 함수를 호출합니다.
              >
                수정
              </button>
            )}

            {onPostDeleted && (
              <button
                className="btn-base btn-dark-orange margin-left-1"
                onClick={handleDelete} // 삭제 로직을 호출합니다.
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

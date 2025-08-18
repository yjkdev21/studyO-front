import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../main/Search.css";
import axios from "axios";

export default function BookMarkViewCnt({ post }) {
  const host = import.meta.env.VITE_AWS_API_HOST;
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const groupId = post.groupId;

  const [postBookmarksCnt, setPostBookmarkCnt] = useState(0);
  const [bookMark, setBookMark] = useState(false);
  const [userBookmarks, setUserBookmarks] = useState([]);

  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!isAuthenticated || !user?.id) {
        return;
      }

      try {
        const res = await axios.get(`${host}/api/bookmark/user/${userId}`, {
          withCredentials: true,
        });
        // console.log("사용자 북마크 API 응답:", res.data);
        if (res.data.success && Array.isArray(res.data.data)) {
          const bookmarkGroupIds = res.data.data.map(
            (bookmark) => bookmark.groupId
          );

          if (bookmarkGroupIds.includes(groupId)) {
            // console.log("include :", groupId);
            setBookMark(true);
            setUserBookmarks(bookmarkGroupIds);
          }
        }
      } catch (error) {
        console.error("사용자 북마크 조회 실패", error);
        throw new Error("북마크 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchUserBookmarks();
  }, [bookMark]);

  // 조회수 올리기
  useEffect(() => {
    const fetchPostViewIncrement = async () => {
      try {
        const res = await axios.put(
          `${host}/api/study-groups/increment-view/${post.studyPostId}`,
          {
            withCredentials: true,
          }
        );

        if (res.data === "View count incremented.") {
          // console.log("view count increment!");
        } else {
        }
      } catch (error) {
        console.error("view count fail!", error);
      }
    };

    fetchPostViewIncrement();
    postBookmarkCnt();
  }, []);

  const postBookmarkCnt = async () => {
    try {
      const res = await axios.get(
        `${host}/api/study-groups/bookmark-count/${groupId}`,
        {
          withCredentials: true,
        }
      );
      //console.log("aaa:", res.data);
      setPostBookmarkCnt(res.data);
    } catch (error) {
      console.error("view count fail!", error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    try {
      if (userBookmarks.includes(groupId)) {
        await axios.delete(`${host}/api/bookmark/${userId}/${groupId}`, {
          withCredentials: true,
        });
        alert("북마크가 삭제되었습니다.");
        setBookMark(false);
        setUserBookmarks([]);
      } else {
        const payload = { userId: userId, groupId };
        await axios.post(`${host}/api/bookmark`, payload, {
          withCredentials: true,
        });
        alert("북마크가 추가되었습니다.");
        setBookMark(true);
      }
    } catch (error) {
      console.error("북마크 토글 실패", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }

    postBookmarkCnt();
  };

  return (
    <div className="p-bookmark-post-count-container">
      <div
        className="bookmark-post-button-container"
        onClick={(e) => {
          e.preventDefault();
          handleBookmarkToggle();
        }}
      >
        <p className="bookmark-title">북마크</p>
        {bookMark ? (
          <svg
            className="g-bookmark-svg g-bookmarked"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
          </svg>
        ) : (
          <svg
            className="g-bookmark-svg g-not-bookmarked"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
          </svg>
        )}
      </div>

      <div className="bookmark-postview-count-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-eye"
          viewBox="0 0 16 16"
        >
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
        </svg>
        <p>{post.viewCount}</p>
        <span></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-bookmark-check"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"
          />
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z" />
        </svg>

        <p>{postBookmarksCnt}</p>
      </div>
    </div>
  );
}

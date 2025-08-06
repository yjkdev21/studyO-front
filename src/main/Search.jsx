import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Search.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 경로에 맞게 수정

function Search() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [filters, setFilters] = useState({
    category: "",
    studyMode: "",
    region: "",
    search: "",
    recruitmentCount: "",
    recruitingOnly: true,
  });

  const [posts, setPosts] = useState([]);
  const [bookmarkViewList, setBookmarkViewList] = useState([]);

  // AuthContext에서 로그인 상태와 사용자 정보를 가져옵니다.
  const { user, isAuthenticated } = useAuth();
  const userId = isAuthenticated ? user?.id : null; // 숫자 ID 사용

  console.log("Auth user object: ", user);
  console.log("user.id (number): ", user?.id);
  console.log("user.userId (string): ", user?.userId);

  const [userBookmarks, setUserBookmarks] = useState([]);

  const debounceTimer = useRef(null);
  const DEFAULT_THUMBNAIL_URL = "https://placehold.co/150x100?text=No+Image";

  const getMinMaxMembers = (recruitmentCount) => {
    if (recruitmentCount === "1~5") return { minMembers: 1, maxMembers: 4 };
    if (recruitmentCount === "5~10") return { minMembers: 5, maxMembers: 10 };
    if (recruitmentCount === "10이상")
      return { minMembers: 11, maxMembers: null };
    return { minMembers: null, maxMembers: null };
  };

  const fetchPosts = async (filterParams) => {
    // isAuthenticated 상태를 사용하여 로그인 여부를 확인합니다.
    if (!isAuthenticated) {
      setPosts([]);
      return;
    }

    try {
      const { minMembers, maxMembers } = getMinMaxMembers(
        filterParams.recruitmentCount
      );
      const recruitingOnlyInt = filterParams.recruitingOnly ? 1 : 0;

      const params = {};
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.studyMode) params.studyMode = filterParams.studyMode;
      if (filterParams.region) params.region = filterParams.region;
      if (filterParams.search) params.search = filterParams.search;
      if (filterParams.recruitingOnly !== undefined)
        params.recruitingOnly = recruitingOnlyInt;
      if (minMembers !== null) params.minMembers = minMembers;
      if (maxMembers !== null) params.maxMembers = maxMembers;

      const res = await axios.get("http://localhost:8081/api/searchPosts", {
        params,
      });
      console.log("포스트 API 응답:", res.data);

      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        setPosts([]);
        console.warn("포스트 응답 데이터가 배열이 아닙니다.");
      }
    } catch (error) {
      console.error("포스트 조회 실패", error);
      setPosts([]);
    }
  };

  // AuthContext에서 받아온 userId가 string일 수도 있으니 숫자로 변환
  const userIdNum = userId ? Number(userId) : null;

  const fetchUserBookmarks = async () => {
    if (!user || !user.id) {
      console.log("userId가 유효하지 않습니다.");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8081/api/bookmark/user/${user.id}`
      );
      console.log("사용자 북마크 API 응답:", res.data);
      if (res.data.success && Array.isArray(res.data.data)) {
        const bookmarkGroupIds = res.data.data.map(
          (bookmark) => bookmark.groupId
        );
        setUserBookmarks(bookmarkGroupIds);
      } else {
        setUserBookmarks([]);
        console.warn("사용자 북마크 응답 데이터가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("사용자 북마크 조회 실패", error);
      setUserBookmarks([]);
    }
  };

  const fetchBookmarkViewCounts = async () => {
    // isAuthenticated 상태를 사용하여 로그인 여부를 확인합니다.
    if (!isAuthenticated) {
      setBookmarkViewList([]);
      return;
    }
    try {
      const res = await axios.get("http://localhost:8081/api/bookmark/counts");
      console.log("북마크+조회수 API 응답:", res.data);
      if (res.data.success && Array.isArray(res.data.data)) {
        setBookmarkViewList(res.data.data);
      } else {
        setBookmarkViewList([]);
        console.warn("북마크+조회수 응답 데이터가 배열이 아닙니다.");
      }
    } catch (error) {
      console.error("북마크+조회수 조회 실패", error);
      setBookmarkViewList([]);
    }
  };

  const handleBookmarkToggle = async (groupId) => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const userId = user.id;

    try {
      if (userBookmarks.includes(groupId)) {
        await axios.delete(
          `http://localhost:8081/api/bookmark/${userId}/${groupId}`
        );
        alert("북마크가 삭제되었습니다.");
      } else {
        const payload = { userId, groupId };
        await axios.post(`http://localhost:8081/api/bookmark`, payload);
        alert("북마크가 추가되었습니다.");
      }

      await fetchUserBookmarks();
      await fetchBookmarkViewCounts(); // ★ 북마크 수 새로고침 추가
    } catch (error) {
      console.error("북마크 토글 실패", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  const handleRecruitmentCountChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      recruitmentCount: value,
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // 로그인 상태와 필터가 변경될 때마다 데이터를 가져오도록 수정
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchPosts(filters);
      fetchBookmarkViewCounts();
      fetchUserBookmarks();
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters, isAuthenticated]);

  const mergedPosts = posts.map((post) => {
    const bookmarkView = bookmarkViewList.find(
      (b) => String(b.groupId) === String(post.groupId)
    );

    // userBookmarks 배열에 groupId가 포함되어 있는지 확인
    const isBookmarked = userBookmarks.includes(post.groupId);
    const viewCount =
      post.viewCount ?? (bookmarkView ? bookmarkView.viewCount : 0);
    const bookmarkCount = bookmarkView ? bookmarkView.bookmarkCount : 0;
    return {
      ...post,
      viewCount: viewCount,
      bookmarkCount: bookmarkCount,
      isBookmarked: isBookmarked,
    };
  });

  return (
    <div className="search-filter">
      <div className="category-tabs">
        {[
          "전체",
          "자격증",
          "IT",
          "언어",
          "전공",
          "취업/면접",
          "취미",
          "기타",
        ].map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => {
              const newCategory = cat === "전체" ? "" : cat;
              setSelectedCategory(cat);
              handleFilterChange({ ...filters, category: newCategory });
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <select
        className="gselect"
        name="studyMode"
        value={filters.studyMode}
        onChange={(e) =>
          handleFilterChange({ ...filters, studyMode: e.target.value })
        }
      >
        <option value="">진행방식</option>
        <option value="온라인">온라인</option>
        <option value="오프라인">오프라인</option>
        <option value="온/오프">온/오프</option>
      </select>
      <select
        className="gselect"
        name="region"
        value={filters.region}
        onChange={(e) => {
          const selectedRegion =
            e.target.value === "전체" ? "" : e.target.value;
          handleFilterChange({ ...filters, region: selectedRegion });
        }}
      >
        <option value="">지역</option>
        <option value="서울">서울</option>
        <option value="부산">부산</option>
        <option value="대구">대구</option>
        <option value="인천">인천</option>
        <option value="광주">광주</option>
        <option value="대전">대전</option>
        <option value="울산">울산</option>
        <option value="세종">세종</option>
        <option value="경기">경기</option>
        <option value="강원">강원</option>
        <option value="충북">충북</option>
        <option value="충남">충남</option>
        <option value="전북">전북</option>
        <option value="전남">전남</option>
        <option value="경북">경북</option>
        <option value="경남">경남</option>
        <option value="제주">제주</option>
      </select>
      <select
        className="gselect"
        name="recruitmentCount"
        value={filters.recruitmentCount}
        onChange={(e) => handleRecruitmentCountChange(e.target.value)}
      >
        <option value="">모집인원</option>
        <option value="1~5">1~5</option>
        <option value="5~10">5~10</option>
        <option value="10이상">10이상</option>
      </select>
      <button
        type="button"
        className={
          filters.recruitingOnly ? "recruiting-btn active" : "recruiting-btn"
        }
        onClick={() =>
          handleFilterChange({
            ...filters,
            recruitingOnly: !filters.recruitingOnly,
          })
        }
        style={{
          marginLeft: 10,
          padding: "5px 10px",
          border: "2px solid",
          borderColor: filters.recruitingOnly ? "orange" : "#ccc",
          backgroundColor: filters.recruitingOnly ? "#fff7e6" : "transparent",
          color: filters.recruitingOnly ? "orange" : "#666",
          cursor: "pointer",
          borderRadius: 4,
          fontWeight: "bold",
        }}
        title="모집중만 보기 토글"
      >
        모집중만 보기
      </button>
      <div className="write-button-wrapper">
        <Link to="/studyPost" className="btn-write-g">
          글 작성하기
        </Link>
      </div>
      <input
        type="text"
        name="search"
        placeholder="제목, 글 내용 등 검색해보세요"
        value={filters.search}
        onChange={(e) =>
          handleFilterChange({ ...filters, search: e.target.value })
        }
        style={{ marginTop: 10, width: "100%", padding: "5px 10px" }}
      />

      {/* 로그인하지 않았을 때 메시지를 표시 */}
      {!isAuthenticated ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            border: "1px solid #ddd",
            marginTop: "20px",
          }}
        >
          <div className="login-message-container">
            <p>로그인해야 게시물을 볼 수 있습니다.</p>
            <p>
              로그인 페이지로 이동하시려면 <Link to="/login">여기</Link>를
              클릭하세요.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {mergedPosts.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            mergedPosts.map((post) => (
              <div
                key={post.studyPostId}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: 10,
                  position: "relative",
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={post.thumbnail || DEFAULT_THUMBNAIL_URL}
                  alt={`${post.title} 썸네일`}
                  style={{
                    width: "250px",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
                <div>
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      cursor: "pointer",
                      color: post.isBookmarked ? "orange" : "#ddd",
                      fontSize: "24px",
                    }}
                    onClick={() =>
                      handleBookmarkToggle(post.groupId, post.isBookmarked)
                    }
                  >
                    {post.isBookmarked ? "★" : "☆"}
                  </div>

                  <h3>{post.title}</h3>
                  <p>작성자: {post.authorName ?? "알 수 없음"}</p>
                  <p>카테고리: {post.category}</p>
                  <p>진행방식: {post.studyMode}</p>
                  <p>모집인원: {post.maxMembers}</p>
                  <p>지역: {post.region || "지역 미정 (온라인)"}</p>
                  <p>
                    모집 마감일:{" "}
                    {post.recruitEndDate
                      ? new Date(post.recruitEndDate).toLocaleDateString()
                      : "마감일 없음"}
                  </p>
                  <p>
                    모집 기간:{" "}
                    {post.recruitStartDate
                      ? new Date(post.recruitStartDate).toLocaleDateString()
                      : "미정"}{" "}
                    ~{" "}
                    {post.recruitEndDate
                      ? new Date(post.recruitEndDate).toLocaleDateString()
                      : "미정"}
                  </p>
                  <p>{post.content}</p>
                  <div
                    style={{ marginTop: 10, fontSize: "0.9em", color: "#555" }}
                  >
                    <span style={{ marginRight: 15 }}>
                      조회수: <strong>{post.viewCount ?? 0}</strong>
                    </span>
                    <span style={{ marginRight: 15 }}>
                      북마크: <strong>{post.bookmarkCount ?? 0}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Search;

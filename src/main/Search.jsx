import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom"; // useLocation 추가
import { useAuth } from "../contexts/AuthContext";
import "./Search.css";

function Search() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const debounceTimer = useRef(null);

  // 헤더에서 전달된 카테고리 상태를 초기값으로 사용합니다.
  const initialCategoryFromHeader = location.state?.category || "전체";

  // 상태 변수를 통합하고 초기화 로직을 개선합니다.
  const [filters, setFilters] = useState({
    category:
      initialCategoryFromHeader === "전체" ? "" : initialCategoryFromHeader,
    studyMode: "",
    region: "",
    search: "",
    recruitmentCount: "",
    recruitingOnly: true,
  });

  const [posts, setPosts] = useState([]);
  const [countsData, setCountsData] = useState({});
  const [userBookmarks, setUserBookmarks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_THUMBNAIL_URL = "https://placehold.co/150x100?text=No+Image";
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 2;

  // 헤더에서 카테고리를 클릭했을 때 필터 상태를 업데이트하는 로직
  useEffect(() => {
    const newCategory = location.state?.category;
    if (newCategory !== undefined) {
      setFilters((prev) => ({
        ...prev,
        category: newCategory === "전체" ? "" : newCategory,
      }));
    }
  }, [location.state]);

  const getMinMaxMembers = (recruitmentCount) => {
    if (recruitmentCount === "1~5") return { minMembers: 1, maxMembers: 4 };
    if (recruitmentCount === "5~10") return { minMembers: 5, maxMembers: 10 };
    if (recruitmentCount === "10이상")
      return { minMembers: 10, maxMembers: null };
    return { minMembers: null, maxMembers: null };
  };

  const fetchPosts = async (filterParams) => {
    const { minMembers, maxMembers } = getMinMaxMembers(
      filterParams.recruitmentCount
    );
    const recruitingOnlyInt = filterParams.recruitingOnly ? 1 : 0;

    const params = {
      ...filterParams,
      category: filterParams.category || "",
      recruitingOnly: recruitingOnlyInt,
      minMembers: minMembers,
      maxMembers: maxMembers,
      search: filterParams.search || "",
    };

    try {
      const res = await axios.get("http://localhost:8081/api/searchPosts", {
        params,
      });
      console.log("포스트 API 응답:", res.data);
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else if (res.data?.posts && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        setPosts([]);
        console.warn("포스트 응답 데이터가 배열이 아닙니다.");
      }
    } catch (error) {
      console.error("포스트 조회 실패", error);
      throw new Error("포스트를 불러오는 데 실패했습니다.");
    }
  };

  const fetchUserBookmarks = async () => {
    if (!isAuthenticated || !user?.id) {
      setUserBookmarks([]);
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
      }
    } catch (error) {
      console.error("사용자 북마크 조회 실패", error);
      throw new Error("북마크 정보를 불러오는 데 실패했습니다.");
    }
  };

  const fetchBookmarkViewCounts = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/bookmark/counts");
      console.log("북마크+조회수 API 응답:", res.data);
      if (res.data.success && Array.isArray(res.data.data)) {
        const newCountsData = res.data.data.reduce((acc, item) => {
          const groupId = item.GROUPID;
          if (groupId !== undefined && groupId !== null) {
            acc[groupId] = {
              viewCount: 0,
              bookmarkCount: item.BOOKMARKCOUNT,
            };
          }
          return acc;
        }, {});
        setCountsData(newCountsData);
        console.log("변환된 countsData:", newCountsData);
      } else {
        setCountsData({});
      }
    } catch (error) {
      console.error("북마크 수 조회 실패", error);
      throw new Error("북마크 정보를 불러오는 데 실패했습니다.");
    }
  };

  const handleBookmarkToggle = async (groupId) => {
    if (!isAuthenticated || !user) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    try {
      if (userBookmarks.includes(groupId)) {
        await axios.delete(
          `http://localhost:8081/api/bookmark/${user.id}/${groupId}`
        );
        alert("북마크가 삭제되었습니다.");
      } else {
        const payload = { userId: user.id, groupId };
        await axios.post(`http://localhost:8081/api/bookmark`, payload);
        alert("북마크가 추가되었습니다.");
      }
      await Promise.all([fetchUserBookmarks(), fetchBookmarkViewCounts()]);
    } catch (error) {
      console.error("북마크 토글 실패", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // 모든 API 호출을 한 번에 처리하는 메인 useEffect 훅
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        await Promise.all([
          fetchPosts(filters),
          fetchBookmarkViewCounts(),
          isAuthenticated && user?.id
            ? fetchUserBookmarks()
            : Promise.resolve(),
        ]);
      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setIsLoading(false);
      }
      setCurrentPage(1);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters, isAuthenticated, user?.id]);

  // 헤더에서 카테고리 클릭 시 필터 상태 업데이트
  useEffect(() => {
    const newCategory = location.state?.category;
    if (newCategory !== undefined) {
      setFilters((prev) => ({
        ...prev,
        category: newCategory === "전체" ? "" : newCategory,
      }));
    }
  }, [location.state]);

  const mergedPosts = posts.map((post) => {
    const counts = countsData[post.groupId] || {
      viewCount: 0,
      bookmarkCount: 0,
    };
    const isBookmarked = userBookmarks.includes(post.groupId);

    return {
      ...post,
      viewCount: counts.viewCount,
      bookmarkCount: counts.bookmarkCount,
      isBookmarked: isBookmarked,
    };
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = mergedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(mergedPosts.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="search-filter">
      <div className="category-tabs" style={{ display: "none" }}>
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
            className={
              (filters.category === "" && cat === "전체") ||
              filters.category === cat
                ? "active"
                : ""
            }
            onClick={() => {
              const newCategory = cat === "전체" ? "" : cat;
              setFilters({ ...filters, category: newCategory });
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
        onChange={(e) =>
          handleFilterChange({ ...filters, recruitmentCount: e.target.value })
        }
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
        <Link to="/groupCreate" className="btn-write-g">
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
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px", fontSize: "20px" }}>
          데이터를 불러오는 중입니다...
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "red",
            border: "1px solid #ddd",
            marginTop: "20px",
          }}
        >
          <p>{error}</p>
        </div>
      ) : !isAuthenticated ? (
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
            <>
              {currentPosts.map((post) => (
                <Link
                  to={`/study/postView/${post.groupId}`}
                  key={post.groupId}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    borderBottom: "1px solid #ddd",
                    padding: 10,
                    gap: "20px",
                    alignItems: "flex-start",
                    position: "relative",
                  }}
                >
                  <img
                    src={post.thumbnail || DEFAULT_THUMBNAIL_URL}
                    alt={`${post.groupName} 썸네일`}
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
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookmarkToggle(post.groupId);
                      }}
                    >
                      {post.isBookmarked ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="orange"
                          strokeWidth={1.5}
                        >
                          <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#bbb"
                          strokeWidth={1}
                        >
                          <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
                        </svg>
                      )}
                    </div>
                    <h3>{post.groupName}</h3>
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
                    <p className="gtruncated-text">{post.groupIntroduction}</p>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: "0.9em",
                        color: "#555",
                      }}
                    >
                      <span style={{ marginRight: 15 }}>
                        조회수: <strong>{post.viewCount ?? 0}</strong>
                      </span>
                      <span style={{ marginRight: 15 }}>
                        북마크: <strong>{post.bookmarkCount ?? 0}</strong>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    margin: "0 3px",
                    padding: "5px 8px",
                    backgroundColor: "white",
                    color: currentPage === 1 ? "#aaa" : "black",
                    cursor: currentPage === 1 ? "default" : "pointer",
                  }}
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    margin: "0 3px",
                    padding: "5px 8px",
                    backgroundColor: "white",
                    color: currentPage === 1 ? "#aaa" : "black",
                    cursor: currentPage === 1 ? "default" : "pointer",
                  }}
                >
                  &lt;
                </button>
                {[...Array(5)].map((_, i) => {
                  const startPage = Math.max(
                    1,
                    Math.min(currentPage - 2, totalPages - 4)
                  );
                  const pageNumber = startPage + i;
                  if (pageNumber > totalPages) return null;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{
                        margin: "0 3px",
                        padding: "5px 10px",
                        borderRadius: 4,
                        border:
                          pageNumber === currentPage
                            ? "2px solid orange"
                            : "none",
                        backgroundColor:
                          pageNumber === currentPage ? "orange" : "white",
                        color: pageNumber === currentPage ? "white" : "black",
                        cursor: "pointer",
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    margin: "0 3px",
                    padding: "5px 8px",
                    backgroundColor: "white",
                    color: currentPage === totalPages ? "#aaa" : "black",
                    cursor: currentPage === totalPages ? "default" : "pointer",
                  }}
                >
                  &gt;
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    margin: "0 3px",
                    padding: "5px 8px",
                    backgroundColor: "white",
                    color: currentPage === totalPages ? "#aaa" : "black",
                    cursor: currentPage === totalPages ? "default" : "pointer",
                  }}
                >
                  &raquo;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Search.css";

// Dropdown 컴포넌트는 기존과 동일
const Dropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleItemClick = (itemValue) => {
    onChange(itemValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: placeholder,
    value: "",
  };

  return (
    <div className="g-dropdown-container" ref={dropdownRef}>
      <button
        className={`g-dropdown-button ${isOpen ? "g-active" : ""}`}
        onClick={toggleDropdown}
      >
        <span>{selectedOption.label}</span>
        <svg
          className="g-dropdown-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <ul className="g-dropdown-menu g-active">
          <li
            className={`g-dropdown-item ${value === "" ? "g-selected" : ""}`}
            onClick={() => handleItemClick("")}
          >
            {placeholder}
          </li>
          {options.map((option) => (
            <li
              key={option.value}
              className={`g-dropdown-item ${
                value === option.value ? "g-selected" : ""
              }`}
              onClick={() => handleItemClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 메인 Search 컴포넌트
function Search() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const debounceTimer = useRef(null);
  const scrollPositionRef = useRef(0);

  const initialCategoryFromHeader = location.state?.category || "전체";

  const [filters, setFilters] = useState({
    studyMode: "",
    region: "",
    recruitmentCount: "",
    recruitingOnly: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(
    initialCategoryFromHeader === "전체" ? "" : initialCategoryFromHeader
  );

  const [posts, setPosts] = useState([]);
  const [popularStudies, setPopularStudies] = useState([]);
  const [urgentStudies, setUrgentStudies] = useState([]);
  const [countsData, setCountsData] = useState({});
  const [userBookmarks, setUserBookmarks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_THUMBNAIL_URL = "/images/default-thumbnail.png";
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const isShowingAll = initialCategoryFromHeader === "전체";
  const popularRef = useRef(null);
  const urgentRef = useRef(null);
  const host = import.meta.env.VITE_AWS_API_HOST;
  const [showPopularLeft, setShowPopularLeft] = useState(false);
  const [showPopularRight, setShowPopularRight] = useState(false);
  const [showUrgentLeft, setShowUrgentLeft] = useState(false);
  const [showUrgentRight, setShowUrgentRight] = useState(false);

  const scrollHorizontally = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      const currentScroll = ref.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? Math.max(0, currentScroll - scrollAmount)
          : currentScroll + scrollAmount;

      ref.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  const checkScrollPosition = (ref, setLeft, setRight) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setLeft(scrollLeft > 0);
      setRight(Math.round(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const getThumbnailUrl = (post) => {
    if (!post) {
      return "/images/default-thumbnail.png";
    }
    if (post.thumbnailFullPath && !post.thumbnailFullPath.includes("default")) {
      return post.thumbnailFullPath;
    }
    if (post.thumbnail && !post.thumbnail.includes("default")) {
      const s3Url = `https://upload-bucket-study.s3.ap-northeast-2.amazonaws.com/uploads/studygroupimg/${post.thumbnail}`;
      return s3Url;
    }
    return "/images/default-thumbnail.png";
  };

  useEffect(() => {
    const newCategory = location.state?.category;
    if (newCategory !== undefined) {
      setCategoryFilter(newCategory === "전체" ? "" : newCategory);
    }
  }, [location.state]);

  const getMinMaxMembers = (recruitmentCount) => {
    if (recruitmentCount === "1~5") return { minMembers: 1, maxMembers: 4 };
    if (recruitmentCount === "5~10") return { minMembers: 5, maxMembers: 10 };
    if (recruitmentCount === "10이상")
      return { minMembers: 10, maxMembers: null };
    return { minMembers: null, maxMembers: null };
  };

  const fetchAllData = async (filterParams) => {
    const { minMembers, maxMembers } = getMinMaxMembers(
      filterParams.recruitmentCount
    );
    const recruitingOnlyInt = filterParams.recruitingOnly ? 1 : 0;

    const params = {
      category: filterParams.category || null,
      studyMode: filterParams.studyMode || null,
      region: filterParams.region || null,
      search: filterParams.search || null,
      recruitingOnly: recruitingOnlyInt,
      minMembers: minMembers,
      maxMembers: maxMembers,
    };

    const mainPostsPromise = axios.get(`${host}/api/searchPosts`, { params });
    const countsPromise = axios.get(`${host}/api/bookmarks`);

    const userBookmarksPromise =
      isAuthenticated && user?.id
        ? axios.get(`${host}/api/bookmark/user/${user.id}`)
        : Promise.resolve({ data: { success: true, data: [] } });

    const specialPromises =
      isShowingAll && categoryFilter === "" && searchQuery === ""
        ? [
            axios.get(`${host}/api/popularStudies`),
            axios.get(`${host}/api/urgentStudies`),
          ]
        : [
            Promise.resolve({ data: { studies: [] } }),
            Promise.resolve({ data: { studies: [] } }),
          ];

    try {
      const [
        mainPostsRes,
        countsRes,
        userBookmarksRes,
        popularStudiesRes,
        urgentStudiesRes,
      ] = await Promise.all([
        mainPostsPromise,
        countsPromise,
        userBookmarksPromise,
        ...specialPromises,
      ]);

      setPosts(mainPostsRes.data?.posts || mainPostsRes.data || []);

      if (countsRes.data && Array.isArray(countsRes.data)) {
        const newCountsData = countsRes.data.reduce((acc, item) => {
          const groupId = item.studyGroupId || item.STUDYGROUPID;
          if (groupId !== undefined && groupId !== null) {
            acc[groupId] = {
              viewCount: item.viewCount || item.VIEWCOUNT,
              bookmarkCount: item.bookmarkCount || item.BOOKMARKCOUNT,
            };
          }
          return acc;
        }, {});
        setCountsData(newCountsData);
      } else {
        setCountsData({});
      }

      if (
        userBookmarksRes?.data?.success &&
        Array.isArray(userBookmarksRes.data.data)
      ) {
        const bookmarkGroupIds = userBookmarksRes.data.data.map(
          (bookmark) => bookmark.groupId
        );
        setUserBookmarks(bookmarkGroupIds);
      } else {
        setUserBookmarks([]);
      }

      setPopularStudies(
        popularStudiesRes.data?.studies || popularStudiesRes.data || []
      );
      setUrgentStudies(
        urgentStudiesRes.data?.studies || urgentStudiesRes.data || []
      );
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
      throw error;
    }
  };

  const handleBookmarkToggle = async (groupId) => {
    if (!isAuthenticated || !user) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    try {
      if (userBookmarks.includes(groupId)) {
        await axios.delete(`${host}/api/bookmark/${user.id}/${groupId}`);
      } else {
        const payload = { userId: user.id, groupId };
        await axios.post(`${host}/api/bookmark`, payload);
      }
      await fetchAllData({
        ...filters,
        category: categoryFilter,
        search: searchQuery,
      });
    } catch (error) {
      console.error("북마크 토글 실패", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  const fetchDataWithFilters = async (
    currentFilters,
    currentCategory,
    currentSearch
  ) => {
    // 검색 시작 시 스크롤 위치 저장
    if (!isSearching && currentSearch.trim() !== "") {
      scrollPositionRef.current = window.scrollY;
    }

    setIsSearching(true);
    setIsLoading(true);
    setError(null);

    const combinedFilters = {
      ...currentFilters,
      category: currentCategory,
      search: currentSearch,
    };

    try {
      const fetchPromise = fetchAllData(combinedFilters);
      const minDelayPromise = new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      await Promise.all([fetchPromise, minDelayPromise]);

      setIsLoading(false);
      setIsSearching(false);
      setIsInitialLoading(false);
      setCurrentPage(1);
    } catch (err) {
      setError("데이터를 불러오는 데 실패했습니다.");
      setIsLoading(false);
      setIsSearching(false);
      setIsInitialLoading(false);
      console.error("데이터 불러오기 실패:", err);
    }
  };

  // 🚨 스크롤 위치 복원 로직
  // `isSearching` 상태가 `true`에서 `false`로 변경될 때만 실행
  useEffect(() => {
    if (!isSearching && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
      scrollPositionRef.current = 0; // 스크롤 복원 후 초기화
    }
  }, [isSearching]);

  // Effect 1: 카테고리/드롭다운 필터 변경 시 실행
  useEffect(() => {
    if (!isInitialLoading) {
      fetchDataWithFilters(filters, categoryFilter, searchQuery);
    }
  }, [filters, categoryFilter, isAuthenticated, user?.id]);

  // Effect 2: 검색어 입력 시 디바운싱 적용
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim() === "") {
      fetchDataWithFilters(filters, categoryFilter, searchQuery);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchDataWithFilters(filters, categoryFilter, searchQuery);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleFilterChange = (key, value) => {
    if (key === "search") {
      setSearchQuery(value);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  useEffect(() => {
    checkScrollPosition(popularRef, setShowPopularLeft, setShowPopularRight);
    checkScrollPosition(urgentRef, setShowUrgentLeft, setShowUrgentRight);

    const popularElement = popularRef.current;
    const urgentElement = urgentRef.current;

    const handlePopularScroll = () =>
      checkScrollPosition(popularRef, setShowPopularLeft, setShowPopularRight);
    const handleUrgentScroll = () =>
      checkScrollPosition(urgentRef, setShowUrgentLeft, setShowUrgentRight);

    if (popularElement) {
      popularElement.addEventListener("scroll", handlePopularScroll);
    }
    if (urgentElement) {
      urgentElement.addEventListener("scroll", handleUrgentScroll);
    }

    return () => {
      if (popularElement) {
        popularElement.removeEventListener("scroll", handlePopularScroll);
      }
      if (urgentElement) {
        urgentElement.removeEventListener("scroll", handleUrgentScroll);
      }
    };
  }, [popularStudies, urgentStudies]);

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

  const mergedPopularStudies = popularStudies.map((post) => {
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

  const mergedUrgentStudies = urgentStudies.map((post) => {
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

  const renderStudyCard = (post) => (
    <Link
      to={`/study/postView/${post.groupId}`}
      key={post.groupId}
      className="g-post-item"
    >
      <div className="g-post-tags">
        <span className="g-tag">{post.studyMode}</span>
        <span className="g-tag">{post.region || "지역 미정 (온라인)"}</span>
        <span className="g-tag">모집인원 &nbsp; {post.maxMembers}</span>
      </div>
      <img
        src={getThumbnailUrl(post)}
        alt={`${post.title} 썸네일`}
        className="g-post-thumbnail"
        onError={(e) => {
          e.target.src = DEFAULT_THUMBNAIL_URL;
        }}
      />
      <div className="g-post-info">
        <div
          className="g-bookmark-toggle"
          onClick={(e) => {
            e.preventDefault();
            handleBookmarkToggle(post.groupId);
          }}
        >
          {post.isBookmarked ? (
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
        <h3>{post.title}</h3>
        <div className="g-post-meta">
          <span className="g-meta-authorone">
            <strong>{post.authorName ?? "알 수 없음"}</strong>
          </span>
          <div className="g-meta-row">
            <div className="g-meta-item g-recruit-end-date">
              {post.hashTag && (
                <span className="g-hashtag-text">{post.hashTag}</span>
              )}
              <span className="g-deadline-text">
                모집 마감일:{" "}
                {post.recruitEndDate
                  ? new Date(post.recruitEndDate).toLocaleDateString()
                  : "마감일 없음"}
              </span>
            </div>
            <div className="g-meta-vb">
              <div className="g-meta-item g-views">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather-eye"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>
                  <strong>{post.viewCount ?? 0}</strong>
                </span>
              </div>
              <div className="g-meta-item g-bookmarks">
                <svg
                  className="g-bookmark-svg1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
                </svg>
                <span>
                  <strong>{post.bookmarkCount ?? 0}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderStudyCardOne = (post) => (
    <Link
      to={`/study/postView/${post.groupId}`}
      key={post.groupId}
      className="g-post-itemone"
    >
      <div className="g-post-tags">
        <span className="g-tag">{post.studyMode}</span>
        <span className="g-tag">{post.region || "지역 미정 (온라인)"}</span>
        <span className="g-tag">모집인원 &nbsp; {post.maxMembers}</span>
      </div>

      <div className="g-post-infoone">
        <div
          className="g-bookmark-toggle"
          onClick={(e) => {
            e.preventDefault();
            handleBookmarkToggle(post.groupId);
          }}
        >
          {post.isBookmarked ? (
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
        <h3>{post.title}</h3>
        <div className="g-post-metaone">
          <span className="g-meta-authorone">
            <strong>{post.authorName ?? "알 수 없음"}</strong>
          </span>
          <div className="g-meta-bottom-rowone">
            <div className="g-meta-recruit-end-dateone">
              모집 마감일:{" "}
              {post.recruitEndDate
                ? new Date(post.recruitEndDate).toLocaleDateString()
                : "마감일 없음"}
            </div>
            <div className="g-meta-vbone">
              <div className="g-meta-itemone g-views">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather-eye"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>
                  <strong>{post.viewCount ?? 0}</strong>
                </span>
              </div>
              <div className="g-meta-itemone g-bookmarks">
                <svg
                  className="g-bookmark-svg1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z" />
                </svg>
                <span>
                  <strong>{post.bookmarkCount ?? 0}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const studyModeOptions = [
    { label: "온라인", value: "온라인" },
    { label: "오프라인", value: "오프라인" },
    { label: "온/오프", value: "온/오프" },
  ];
  const regionOptions = [
    { label: "서울", value: "서울" },
    { label: "부산", value: "부산" },
    { label: "대구", value: "대구" },
    { label: "인천", value: "인천" },
    { label: "광주", value: "광주" },
    { label: "대전", value: "대전" },
    { label: "울산", value: "울산" },
    { label: "세종", value: "세종" },
    { label: "경기", value: "경기" },
    { label: "강원", value: "강원" },
    { label: "충북", value: "충북" },
    { label: "충남", value: "충남" },
    { label: "전북", value: "전북" },
    { label: "전남", value: "전남" },
    { label: "경북", value: "경북" },
    { label: "경남", value: "경남" },
    { label: "제주", value: "제주" },
  ];
  const recruitmentCountOptions = [
    { label: "1~5", value: "1~5" },
    { label: "5~10", value: "5~10" },
    { label: "10이상", value: "10이상" },
  ];

  return (
    <div className="g-search-filter">
      {!(isShowingAll && isLoading) && (
        <>
          {isShowingAll && isAuthenticated && (
            <>
              <div className="g-special-section">
                <h2 className="g-section-title">인기 스터디</h2>
                {mergedPopularStudies.length > 0 ? (
                  <div className="g-special-studies-wrapper">
                    {showPopularLeft && (
                      <button
                        className="g-scroll-btn g-scroll-btn-left"
                        onClick={() => scrollHorizontally(popularRef, "left")}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <div className="g-special-studies" ref={popularRef}>
                      {mergedPopularStudies.map(renderStudyCardOne)}
                    </div>
                    {showPopularRight && (
                      <button
                        className="g-scroll-btn g-scroll-btn-right"
                        onClick={() => scrollHorizontally(popularRef, "right")}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="g-no-special-results">
                    관련 스터디 데이터가 없습니다.
                  </p>
                )}
              </div>

              <div className="g-special-section">
                <h2 className="g-section-title">마감임박 스터디</h2>
                {mergedUrgentStudies.length > 0 ? (
                  <div className="g-special-studies-wrapper">
                    {showUrgentLeft && (
                      <button
                        className="g-scroll-btn g-scroll-btn-left"
                        onClick={() => scrollHorizontally(urgentRef, "left")}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <div className="g-special-studies" ref={urgentRef}>
                      {mergedUrgentStudies.map(renderStudyCardOne)}
                    </div>
                    {showUrgentRight && (
                      <button
                        className="g-scroll-btn g-scroll-btn-right"
                        onClick={() => scrollHorizontally(urgentRef, "right")}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="g-no-special-results">
                    관련 스터디가 없습니다.
                  </p>
                )}
              </div>
            </>
          )}

          <h2 className="g-section-title">스터디</h2>
          <div className="g-filter-and-search">
            <div className="g-filter-controls">
              <Dropdown
                options={studyModeOptions}
                value={filters.studyMode}
                onChange={(value) => handleFilterChange("studyMode", value)}
                placeholder="진행방식"
              />
              <Dropdown
                options={regionOptions}
                value={filters.region}
                onChange={(value) => handleFilterChange("region", value)}
                placeholder="지역"
              />
              <Dropdown
                options={recruitmentCountOptions}
                value={filters.recruitmentCount}
                onChange={(value) =>
                  handleFilterChange("recruitmentCount", value)
                }
                placeholder="모집인원"
              />

              <button
                type="button"
                className={`g-recruiting-btn ${
                  filters.recruitingOnly ? "g-active" : ""
                }`}
                onClick={() =>
                  handleFilterChange("recruitingOnly", !filters.recruitingOnly)
                }
              >
                모집중만 보기
              </button>
            </div>

            <div className="g-search-input-wrapper">
              <input
                type="text"
                name="search"
                placeholder="제목, 해시태그 검색해보세요"
                className="g-search-input"
                value={searchQuery}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {isLoading || isSearching ? (
        <div
          className={`g-loading-container ${
            isShowingAll ? "is-loading-all" : ""
          }`}
        >
          <div className="g-loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="g-error-message">
          <p>{error}</p>
        </div>
      ) : error ? (
        <div className="g-error-message">
                    <p>{error}</p>       {" "}
        </div>
      ) : (
        <div className="g-main-content">
          {mergedPosts.length === 0 ? (
            <p className="g-no-results">검색 결과가 없습니다.</p>
          ) : (
            <>{currentPosts.map(renderStudyCard)}</>
          )}

          {mergedPosts.length === 0 ? (
            ""
          ) : (
            <div className="g-pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="g-pagination-btn"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="g-pagination-btn"
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
                    className={`g-pagination-btn ${
                      pageNumber === currentPage ? "g-active" : ""
                    }`}
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
                className="g-pagination-btn"
              >
                &gt;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="g-pagination-btn"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;

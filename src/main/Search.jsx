import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Search.css";
import { Link } from "react-router-dom";

function Search() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [filters, setFilters] = useState({
    category: "",
    studyMode: "", // mode 대신 studyMode만 사용
    region: "",
    search: "",
    recruitmentCount: "",
    recruitingOnly: true,
  });

  const [posts, setPosts] = useState([]);
  const [bookmarkViewList, setBookmarkViewList] = useState([]); // 북마크+조회수 리스트

  const debounceTimer = useRef(null);

  // 모집인원 범위 수정: 경계값 겹치지 않도록 변경
  const getMinMaxMembers = (recruitmentCount) => {
    if (recruitmentCount === "1~5") return { minMembers: 1, maxMembers: 4 };
    if (recruitmentCount === "5~10") return { minMembers: 5, maxMembers: 10 };
    if (recruitmentCount === "10이상")
      return { minMembers: 11, maxMembers: null };
    return { minMembers: null, maxMembers: null };
  };

  const fetchPosts = async (filterParams) => {
    try {
      const { minMembers, maxMembers } = getMinMaxMembers(
        filterParams.recruitmentCount
      );
      const recruitingOnlyInt = filterParams.recruitingOnly ? 1 : 0;

      const params = {};
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.studyMode) params.studyMode = filterParams.studyMode; // studyMode만 넘김
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

  const fetchBookmarkViewCounts = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/bookmarks");

      console.log("북마크+조회수 API 응답:", res.data);

      if (Array.isArray(res.data)) {
        setBookmarkViewList(res.data);
      } else {
        setBookmarkViewList([]);
        console.warn("북마크+조회수 응답 데이터가 배열이 아닙니다.");
      }
    } catch (error) {
      console.error("북마크+조회수 조회 실패", error);
      setBookmarkViewList([]);
    }
  };

  // 모집인원 선택 시 필터 업데이트 함수
  const handleRecruitmentCountChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      recruitmentCount: value,
      // minMembers, maxMembers는 fetchPosts 내부에서 계산하므로 여기선 제외
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchPosts(filters);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters]);

  useEffect(() => {
    fetchPosts(filters);
    fetchBookmarkViewCounts();
  }, []);

  // posts에 bookmarkCount, viewCount 병합
  const mergedPosts = posts.map((post) => {
    const bookmarkView = bookmarkViewList.find(
      (b) => b.studyPostId === post.studyPostId
    );

    return {
      ...post,
      viewCount: bookmarkView?.viewCount ?? 0,
      bookmarkCount: bookmarkView?.bookmarkCount ?? 0,
    };
  });

  return (
    <div className="search-filter">
      {/* 카테고리 탭 */}
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

      {/* 진행방식 */}
      <select
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

      {/* 지역 */}
      <select
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

      {/* 모집인원 */}
      <select
        name="recruitmentCount"
        value={filters.recruitmentCount}
        onChange={(e) => handleRecruitmentCountChange(e.target.value)}
      >
        <option value="">모집인원</option>
        <option value="1~5">1~5</option>
        <option value="5~10">5~10</option>
        <option value="10이상">10이상</option>
      </select>

      {/* 모집중만 보기 토글 */}
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

      {/* 검색 */}
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

      {/* 리스트 출력 */}
      <div style={{ marginTop: 20 }}>
        {mergedPosts.length === 0 ? (
          <p>검색 결과가 없습니다.</p>
        ) : (
          mergedPosts.map((post) => (
            <div
              key={post.studyPostId}
              style={{ borderBottom: "1px solid #ddd", padding: 10 }}
            >
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
              <div style={{ marginTop: 10, fontSize: "0.9em", color: "#555" }}>
                <span style={{ marginRight: 15 }}>
                  조회수: <strong>{post.viewCount ?? 0}</strong>
                </span>
                <span style={{ marginRight: 15 }}>
                  북마크: <strong>{post.bookmarkCount ?? 0}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Search;

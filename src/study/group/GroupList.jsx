import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

const localAPIHost = "http://localhost:8081";

export default function GroupList() {
  const [host] = useState(localAPIHost);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const paramPage = parseInt(queryParams.get("page")) || 1;
  const paramPageSize = parseInt(queryParams.get("pageSize")) || 6;

  const [currentPage, setCurrentPage] = useState(paramPage);
  const [pageSize] = useState(paramPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const pageBlockSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [currentPage, pageSize]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // API 경로 수정
      const response = await axios.get(`${host}/study-groups/api/list`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });

      const { list, totalCount: fetchedTotalCount } = response.data;
      setGroups(list);
      setTotalCount(fetchedTotalCount);

      const total = Math.ceil(fetchedTotalCount / pageSize);
      setTotalPages(total);

      const start = Math.floor((currentPage - 1) / pageBlockSize) * pageBlockSize + 1;
      const end = Math.min(start + pageBlockSize - 1, total);
      setStartPage(start);
      setEndPage(end);
    } catch (error) {
      console.error("Error fetching groups:", error);
      alert("그룹 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`?page=${page}&pageSize=${pageSize}`);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-primary mb-4">스터디 그룹 목록</h1>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="alert alert-info text-center">그룹이 없습니다.</div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {groups.map((group) => (
              <div key={group.id} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{group.groupName}</h5>
                    <p className="card-text">
                      모집 인원: {group.maxMembers}명<br />
                      진행 방식: {group.studyMode}<br />
                      카테고리: {group.category}
                    </p>
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
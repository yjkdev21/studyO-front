import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  startPage,
  endPage,
  onPageChange,
}) {
  return (
    <nav aria-label="Page navigation" className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const page = startPage + index;
          return (
            <li
              key={page}
              className={`page-item ${page === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            </li>
          );
        })}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

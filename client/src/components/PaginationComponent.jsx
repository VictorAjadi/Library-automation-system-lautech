import React from "react";
import { Pagination } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

const PaginationComponent = ({ totalPages }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get the current page from the URL, default to 1
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // Handler to update the `page` query parameter
  const handlePageChange = (page) => {
    setSearchParams({ page });
  };

  return (
    <Pagination>
      {/* Previous Button */}
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Pagination.Prev>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        return (
          <Pagination.Item
            key={pageNumber}
            active={pageNumber === currentPage}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </Pagination.Item>
        );
      })}

      {/* Next Button */}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Pagination.Next>
    </Pagination>
  );
};

export default PaginationComponent;

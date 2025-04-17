import React from "react";

interface PaginationProps {
  totalPosts: number;

  setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPosts,

  setCurrentPage,
}) => {
  const postsOnFirstPage = 9;
  const postsOnOtherPages = 18;

  // Subtract postsOnFirstPage from totalPosts to get what's left after page 1
  const remainingPosts = Math.max(totalPosts - postsOnFirstPage, 0);

  // Calculate pages needed after first
  const additionalPages = Math.ceil(remainingPosts / postsOnOtherPages);

  // Total pages = first page + additional pages
  const totalPages = totalPosts <= postsOnFirstPage ? 1 : 1 + additionalPages;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  console.log(totalPages);
  return (
    <div>
      {pages.map((page, index) => (
        <button
          key={index}
          className="page-button"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;

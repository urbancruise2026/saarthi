import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void; // ← optional kar diya
}

export const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  onLimitChange,
}: PaginationProps) => {
  if (totalPages <= 1 && total <= limit) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
    )
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50">
      {/* Left Side */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {total === 0 ? 0 : (currentPage - 1) * limit + 1}–
            {Math.min(currentPage * limit, total)}
          </span>{" "}
          of <span className="font-medium text-gray-700">{total}</span>
        </p>

        {/* Limit Selector — sirf tab render ho jab onLimitChange pass ho */}
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((item, idx) =>
          item === "..." ? (
            <span key={`dots-${idx}`} className="px-1 text-gray-400 text-xs">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                currentPage === item
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-white text-gray-600"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

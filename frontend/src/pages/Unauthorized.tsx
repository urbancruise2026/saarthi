import { useNavigate } from "react-router-dom";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50">
      <div className="text-6xl">🚫</div>
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="text-gray-500">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Go Back
      </button>
    </div>
  );
}

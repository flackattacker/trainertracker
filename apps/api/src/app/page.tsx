export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Trainer Tracker API</h1>
        <p className="text-gray-600 mb-4">
          This is the API server for the Trainer Tracker application.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>Status:</strong> Running
          </p>
          <p className="text-sm text-gray-500">
            <strong>Version:</strong> 1.0.0
          </p>
          <p className="text-sm text-gray-500">
            <strong>Environment:</strong> Development
          </p>
        </div>
      </div>
    </div>
  );
} 
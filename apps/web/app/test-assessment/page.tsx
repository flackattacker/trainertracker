export default function TestAssessmentPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Assessment Form Test</h1>
      <p>This is a simple test page to verify the application is working.</p>
      <div className="mt-4">
        <label className="block text-sm font-medium">Test Select</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Select an option</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      </div>
    </div>
  );
} 
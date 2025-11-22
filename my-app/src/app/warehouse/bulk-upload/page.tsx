"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react";

type UploadResult = {
  trackingNumber?: string;
  ok: boolean;
  error?: string;
};

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [results, setResults] = useState<UploadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });

  function downloadTemplate() {
    const template = [
      {
        trackingNumber: "TAS12345",
        userCode: "CUST001",
        weight: 5.5,
        shipper: "DHL",
        description: "Electronics",
        length: 30,
        width: 20,
        height: 15,
        warehouse: "Main Warehouse",
        receivedBy: "John Doe"
      },
      {
        trackingNumber: "TAS12346",
        userCode: "CUST002",
        weight: 3.2,
        shipper: "FedEx",
        description: "Documents"
      }
    ];
    
    const json = JSON.stringify({ packages: template }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-upload-template.json";
    a.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsonText(text);
      };
      reader.readAsText(selectedFile);
    }
  }

  async function handleUpload() {
    if (!jsonText.trim()) {
      alert("Please select a file or paste JSON data");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const data = JSON.parse(jsonText);
      
      const response = await fetch("/api/warehouse/packages/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (response.ok) {
        setResults(result.results || []);
        setSummary({
          total: result.total || 0,
          success: result.success || 0,
          failed: result.failed || 0
        });
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Invalid JSON format");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] text-white mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E67919] rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bulk Package Upload</h1>
              <p className="text-blue-100 mt-1">Upload multiple packages at once using JSON format</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Upload Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload a JSON file with packages array</li>
                <li>• Required fields: trackingNumber, userCode</li>
                <li>• Optional fields: weight, shipper, description, length, width, height, warehouse, receivedBy</li>
                <li>• Download the template below to see the correct format</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0f4d8a] to-[#0a3d6e] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Upload File</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON File
              </label>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                />
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Template
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste JSON Data
              </label>
              <textarea
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d8a] focus:border-transparent"
                rows={12}
                placeholder='{"packages": [{"trackingNumber": "TAS12345", "userCode": "CUST001", ...}]}'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !jsonText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#E67919] hover:bg-[#d66e15] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Packages
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Total Processed</p>
                <p className="text-3xl font-bold text-[#0f4d8a]">{summary.total}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-3xl font-bold text-green-600">{summary.success}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#E67919] to-[#d66e15] px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Upload Results</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tracking Number</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {result.ok ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">Failed</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <code className="font-mono text-sm">
                            {result.trackingNumber || "-"}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {result.error || "Package created successfully"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
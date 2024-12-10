import { Download, FileText, Trash2 } from 'lucide-react';
import React from 'react';

interface FileDisplayProps {
  files: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({ files, onDelete, readOnly = false }) => {
  if (!files?.length) return null;

  const handleDownload = (url: string) => {
    window.open(url);
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
      <div className="space-y-2">
        {files.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 truncate max-w-xs">
                {decodeURIComponent(url.split('/').pop() || '')}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleDownload(url)}
                className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                title="Download file"
              >
                <Download className="h-5 w-5" />
              </button>
              {!readOnly && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(url)}
                  className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                  title="Delete file"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
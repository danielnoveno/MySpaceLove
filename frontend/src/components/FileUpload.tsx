'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  preview?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = 'image/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  preview = true,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File "${file.name}" exceeds ${formatSize(maxSize)} limit`);
      return false;
    }
    return true;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);
      const newFiles: FileWithPreview[] = [];

      Array.from(fileList).forEach((file) => {
        if (validateFile(file)) {
          const fileWithPreview = file as FileWithPreview;
          if (preview && file.type.startsWith('image/')) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }
          newFiles.push(fileWithPreview);
        }
      });

      if (newFiles.length > 0) {
        const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
        setFiles(updatedFiles);
        onFileSelect(updatedFiles);
      }
    },
    [files, multiple, onFileSelect, preview, maxSize]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-pink-400 bg-pink-50'
            : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isDragActive ? 'bg-pink-100' : 'bg-gray-100'
            }`}
          >
            <Upload
              size={24}
              className={isDragActive ? 'text-pink-500' : 'text-gray-400'}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive
                ? 'Drop your files here'
                : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {formatSize(maxSize)}
              {multiple && ' • Multiple files allowed'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              {preview && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : file.type.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <FileImage size={18} className="text-pink-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <File size={18} className="text-gray-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>

              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

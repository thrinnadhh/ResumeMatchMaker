
import React, { useState, useCallback, ReactNode } from 'react';

interface FileInputProps {
  id: string;
  onFilesSelected: (files: File[]) => void;
  label: string;
  icon: ReactNode;
}

const FileInput: React.FC<FileInputProps> = ({ id, onFilesSelected, label, icon }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setFileNames(files.map(f => f.name));
      onFilesSelected(files);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files);
      setFileNames(files.map(f => f.name));
      onFilesSelected(files);
    }
  }, [onFilesSelected]);
  
  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };


  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors ${isDragOver ? 'border-blue-500 bg-slate-700' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
          {icon}
          <p className="mb-2 text-sm"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
          <p className="text-xs">{label}</p>
        </div>
        <input id={id} type="file" multiple className="hidden" onChange={handleFileChange} />
      </label>
      {fileNames.length > 0 && (
        <div className="mt-2 text-xs text-slate-400">
          <p className="font-semibold">{fileNames.length} file(s) selected:</p>
          <ul className="list-disc list-inside max-h-20 overflow-y-auto">
            {fileNames.map((name, index) => <li key={index} className="truncate">{name}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileInput;

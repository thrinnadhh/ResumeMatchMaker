
import { FileData } from '../types';

export const readFilesAsText = (files: File[]): Promise<FileData[]> => {
  const promises = files.map(file => {
    return new Promise<FileData>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          content: reader.result as string,
        });
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      reader.readAsText(file);
    });
  });
  return Promise.all(promises);
};


import { MatchResult } from '../types';

export const downloadAsCSV = (results: MatchResult[], jobFileName: string): void => {
  if (!results.length) return;

  const headers = [
    'Resume File',
    'Name',
    'Email',
    'Phone',
    'LinkedIn',
    'GitHub',
    'Address',
    'Matching Score',
    'Justification',
  ];
  
  const csvRows = [headers.join(',')];

  results.forEach(result => {
    const values = [
      result.details.fileName,
      result.details.name,
      result.details.email,
      result.details.phone,
      result.details.linkedin_url,
      result.details.github_url,
      result.details.address,
      result.score,
      `"${result.justification.replace(/"/g, '""')}"`, // Escape double quotes
    ];
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeJobFileName = jobFileName.replace(/\.[^/.]+$/, ""); // remove extension
  link.setAttribute('download', `matching_results_${safeJobFileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

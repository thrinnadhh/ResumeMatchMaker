
import React, { useState } from 'react';
import { JobMatchResults, MatchResult } from '../types';
import { downloadAsCSV } from '../utils/csvHelper';
import { DownloadIcon, GithubIcon, LinkedInIcon } from './icons';
import Spinner from './Spinner';

const ResultsTable: React.FC<{ results: MatchResult[] }> = ({ results }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left text-slate-300">
      <thead className="text-xs text-slate-400 uppercase bg-slate-700">
        <tr>
          <th scope="col" className="px-6 py-3">Name</th>
          <th scope="col" className="px-6 py-3">Contact</th>
          <th scope="col" className="px-6 py-3">Links</th>
          <th scope="col" className="px-6 py-3 text-center">Score</th>
          <th scope="col" className="px-6 py-3">AI Justification</th>
        </tr>
      </thead>
      <tbody>
        {results.sort((a,b) => b.score - a.score).map((result, index) => (
          <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{result.details.name || 'N/A'}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span>{result.details.email || 'N/A'}</span>
                    <span className="text-slate-400">{result.details.phone || 'N/A'}</span>
                </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-3">
                {result.details.linkedin_url && (
                  <a href={result.details.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    <LinkedInIcon />
                  </a>
                )}
                {result.details.github_url && (
                  <a href={result.details.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">
                    <GithubIcon />
                  </a>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-center">
              <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full border-4 ${result.score > 80 ? 'border-green-500' : result.score > 60 ? 'border-yellow-500' : 'border-red-500'}`}>
                <span className="text-xl font-bold">{result.score}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-slate-400">{result.justification}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface ResultsDisplayProps {
  results: JobMatchResults[];
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading }) => {
  const [activeJobIndex, setActiveJobIndex] = useState(0);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center"><Spinner /></div>;
  }

  if (results.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-400">Results will appear here</h3>
        <p>Upload your files and start the matching process to see the analysis.</p>
      </div>
    );
  }

  const activeJobResult = results[activeJobIndex];

  return (
    <div className="bg-slate-800/50 rounded-lg p-1 md:p-4 w-full h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                {results.map((job, index) => (
                    <button
                    key={job.jobFileName}
                    onClick={() => setActiveJobIndex(index)}
                    className={`${
                        index === activeJobIndex
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                    {job.jobFileName}
                    </button>
                ))}
                </nav>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto">
            {activeJobResult && (
                <div>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xl font-bold text-white">Matching Report for <span className="text-blue-400">{activeJobResult.jobFileName}</span></h3>
                    <button
                        onClick={() => downloadAsCSV(activeJobResult.results, activeJobResult.jobFileName)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={!activeJobResult.results || activeJobResult.results.length === 0}
                    >
                        <DownloadIcon className="h-5 w-5" />
                        Download CSV
                    </button>
                  </div>
                  <ResultsTable results={activeJobResult.results} />
                </div>
            )}
        </div>
    </div>
  );
};

export default ResultsDisplay;

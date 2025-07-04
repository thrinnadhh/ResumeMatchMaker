import { MatchingType, JobMatchResults, FileData, MatchResult, ResumeDetails } from '../types';
import { advancedMatch, extractDetailsFromResume } from './geminiService';
import { traditionalMatch, extractDetailsTraditionally } from './matcherService';

interface MatchingEngineParams {
    resumeData: FileData[];
    jobDescData: FileData[];
    matchingType: MatchingType;
    customKeywords: string;
}

export const runMatchingProcess = async ({
    resumeData,
    jobDescData,
    matchingType,
    customKeywords,
}: MatchingEngineParams): Promise<JobMatchResults[]> => {

    // Step 1: Extract details from all resumes first to avoid redundant API calls.
    // This is done sequentially to avoid hitting rate limits.
    const allResumeDetails: ResumeDetails[] = [];
    for (const resume of resumeData) {
        let details: Omit<ResumeDetails, 'fileName'>;
        if (matchingType === MatchingType.ADVANCED) {
            details = await extractDetailsFromResume(resume.content);
        } else {
            details = extractDetailsTraditionally(resume.content);
        }
        allResumeDetails.push({ ...details, fileName: resume.name });
    }

    const allJobMatchResults: JobMatchResults[] = [];

    // Step 2: Iterate through each job and match against the pre-processed resumes sequentially.
    for (const job of jobDescData) {
        const currentJobResults: MatchResult[] = [];

        for (let i = 0; i < resumeData.length; i++) {
            const resume = resumeData[i];
            const details = allResumeDetails[i];

            let match: { score: number; justification: string };

            if (matchingType === MatchingType.ADVANCED) {
                // Match each resume sequentially
                match = await advancedMatch(resume.content, job.content, customKeywords);
            } else {
                match = traditionalMatch(resume.content, job.content, customKeywords);
            }

            currentJobResults.push({
                details,
                score: match.score,
                justification: match.justification,
            });
        }

        allJobMatchResults.push({
            jobFileName: job.name,
            jobContent: job.content,
            results: currentJobResults,
        });
    }
    
    return allJobMatchResults;
};

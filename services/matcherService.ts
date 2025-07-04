import { ResumeDetails } from '../types';

const extractKeywords = (text: string): Set<string> => {
  return new Set(text.toLowerCase().match(/\b(\w{3,})\b/g) || []);
};

export const traditionalMatch = (resumeText: string, jobDescText: string, customKeywords?: string): { score: number; justification: string } => {
  const combinedJobText = `${jobDescText} ${customKeywords || ''}`;
  const jobKeywords = extractKeywords(combinedJobText);
  const resumeKeywords = extractKeywords(resumeText);
  
  if (jobKeywords.size === 0) {
    return { score: 0, justification: "No keywords found in job description or custom keywords." };
  }
  
  let matchedKeywords = 0;
  jobKeywords.forEach(keyword => {
    if (resumeKeywords.has(keyword)) {
      matchedKeywords++;
    }
  });
  
  const score = Math.round((matchedKeywords / jobKeywords.size) * 100);

  return {
    score,
    justification: `Matched ${matchedKeywords} out of ${jobKeywords.size} keywords.`,
  };
};

export const extractDetailsTraditionally = (resumeText: string): Omit<ResumeDetails, 'fileName'> => {
    // Look for a line that likely contains the name (e.g., at the top, 2-4 words, capitalized)
    const lines = resumeText.split('\n').slice(0, 5); // check first 5 lines
    let name = 'N/A';
    for (const line of lines) {
        // Simple heuristic: 2 to 4 words, all starting with a capital letter, no weird characters
        if (/^([A-Z][a-z'-]+(?:\s|$)){2,4}$/.test(line.trim())) {
            name = line.trim();
            break;
        }
    }
    // Fallback for simple Firstname Lastname format
    if (name === 'N/A') {
      const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
      if(nameMatch) name = nameMatch[0];
    }

    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = resumeText.match(/(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/);
    const linkedinMatch = resumeText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
    const githubMatch = resumeText.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/);

    // Look for a potential address line: City, ST ZIPCODE
    const addressMatch = resumeText.match(/[A-Z][a-zA-Z\s.-]+,\s[A-Z]{2}\s\d{5}/);

    return {
        name,
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        linkedin_url: linkedinMatch ? linkedinMatch[0] : null,
        github_url: githubMatch ? githubMatch[0] : null,
        address: addressMatch ? addressMatch[0] : null,
    };
};
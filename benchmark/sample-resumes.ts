/**
 * Sample Resume Test Cases
 * 
 * These represent realistic resume scenarios with expected score ranges
 * based on human evaluation by recruiters and ATS experts.
 */

import type { BenchmarkResume } from './ats-benchmark';

export const SAMPLE_RESUMES: BenchmarkResume[] = [
  {
    name: 'Strong All-Around Senior Engineer',
    targetRole: 'Senior Full-Stack Engineer',
    atsCompatibility: 90,
    keywordMatch: 85,
    skillsScore: 88,
    projectScore: 87,
    expectedRange: [85, 92],
    notes: 'Excellent resume, all components strong. Should score in high 80s.',
  },
  
  {
    name: 'Great Skills, Weak Keywords',
    targetRole: 'Frontend Developer',
    atsCompatibility: 90,
    keywordMatch: 45,
    skillsScore: 85,
    projectScore: 80,
    expectedRange: [72, 78],
    notes: '3 out of 4 components strong. Current formula may over-penalize the single weak keyword score.',
  },
  
  {
    name: 'Keyword-Heavy, Weak Experience',
    targetRole: 'React Developer',
    atsCompatibility: 70,
    keywordMatch: 95,
    skillsScore: 60,
    projectScore: 55,
    expectedRange: [65, 72],
    notes: 'Resume stuffed with keywords but lacking real project depth. Should be mid-range.',
  },
  
  {
    name: 'Balanced Mediocre Resume',
    targetRole: 'Java Developer',
    atsCompatibility: 70,
    keywordMatch: 70,
    skillsScore: 70,
    projectScore: 70,
    expectedRange: [68, 72],
    notes: 'Consistently average across all dimensions. Should score around 70.',
  },
  
  {
    name: 'Junior with Potential',
    targetRole: 'Software Engineer Intern',
    atsCompatibility: 75,
    keywordMatch: 60,
    skillsScore: 70,
    projectScore: 68,
    expectedRange: [66, 72],
    notes: 'Decent junior resume. Skills/projects should carry more weight than keyword gaps.',
  },
  
  {
    name: 'Career Switcher - Different Domain',
    targetRole: 'Frontend Developer',
    atsCompatibility: 85,
    keywordMatch: 35,
    skillsScore: 55,
    projectScore: 50,
    expectedRange: [50, 58],
    notes: 'Data analyst switching to frontend. Good formatting, but skills not aligned. Should be low-mid range.',
  },
  
  {
    name: 'Excellent Student Projects',
    targetRole: 'Entry-Level Software Engineer',
    atsCompatibility: 80,
    keywordMatch: 65,
    skillsScore: 78,
    projectScore: 82,
    expectedRange: [72, 78],
    notes: 'Strong student with great projects. Projects should be valued highly for entry-level.',
  },
  
  {
    name: 'Senior Engineer, Minimal Keywords',
    targetRole: 'Staff Engineer',
    atsCompatibility: 95,
    keywordMatch: 50,
    skillsScore: 90,
    projectScore: 85,
    expectedRange: [74, 80],
    notes: 'Very experienced but resume lacks keyword optimization. Experience should outweigh keyword gaps.',
  },
  
  {
    name: 'Perfect Keyword Match',
    targetRole: 'DevOps Engineer',
    atsCompatibility: 85,
    keywordMatch: 100,
    skillsScore: 80,
    projectScore: 75,
    expectedRange: [83, 89],
    notes: 'Resume perfectly aligned with JD keywords. Should score high but not ignore moderate project score.',
  },
  
  {
    name: 'Weak Formatting, Strong Content',
    targetRole: 'Backend Developer',
    atsCompatibility: 55,
    keywordMatch: 80,
    skillsScore: 85,
    projectScore: 82,
    expectedRange: [73, 79],
    notes: 'Poor formatting but strong technical content. Real work should matter more than formatting issues.',
  },
  
  {
    name: 'One Critical Gap - Keywords',
    targetRole: 'Data Scientist',
    atsCompatibility: 88,
    keywordMatch: 30,
    skillsScore: 80,
    projectScore: 75,
    expectedRange: [60, 68],
    notes: 'Major keyword mismatch is a red flag. Current formula may be harsh, but gap is real.',
  },
  
  {
    name: 'One Critical Gap - Projects',
    targetRole: 'ML Engineer',
    atsCompatibility: 85,
    keywordMatch: 80,
    skillsScore: 78,
    projectScore: 30,
    expectedRange: [62, 70],
    notes: 'Lists ML keywords but no projects to back them up. Should be penalized.',
  },
  
  {
    name: 'Spiked Excellence',
    targetRole: 'Full-Stack Developer',
    atsCompatibility: 95,
    keywordMatch: 50,
    skillsScore: 90,
    projectScore: 85,
    expectedRange: [76, 82],
    notes: 'Exceptional skills/projects with decent keyword coverage. Should score mid-to-high 70s.',
  },
  
  {
    name: 'Fresh Graduate - CS Major',
    targetRole: 'Frontend Developer Intern',
    atsCompatibility: 70,
    keywordMatch: 55,
    skillsScore: 65,
    projectScore: 60,
    expectedRange: [60, 66],
    notes: 'Typical fresh grad resume. Modest across all dimensions. Should be in low 60s.',
  },
  
  {
    name: 'Over-Qualified Senior',
    targetRole: 'Junior Developer',
    atsCompatibility: 90,
    keywordMatch: 95,
    skillsScore: 92,
    projectScore: 88,
    expectedRange: [88, 94],
    notes: 'Senior applying for junior role. Perfect fit on paper. Should score very high.',
  },
  
  {
    name: 'Bootcamp Graduate',
    targetRole: 'Full-Stack Developer',
    atsCompatibility: 75,
    keywordMatch: 70,
    skillsScore: 72,
    projectScore: 75,
    expectedRange: [70, 76],
    notes: 'Bootcamp grad with solid portfolio projects. Projects should be weighted meaningfully.',
  },
  
  {
    name: 'Freelancer with Diverse Experience',
    targetRole: 'React Developer',
    atsCompatibility: 80,
    keywordMatch: 75,
    skillsScore: 80,
    projectScore: 85,
    expectedRange: [78, 84],
    notes: 'Strong project portfolio from freelance work. Should score in high 70s to low 80s.',
  },
  
  {
    name: 'Technical Writer Pivoting to Dev',
    targetRole: 'Frontend Developer',
    atsCompatibility: 85,
    keywordMatch: 40,
    skillsScore: 50,
    projectScore: 45,
    expectedRange: [48, 56],
    notes: 'Well-formatted but minimal technical skills. Should score low due to weak fundamentals.',
  },
  
  {
    name: 'Open Source Contributor',
    targetRole: 'Software Engineer',
    atsCompatibility: 88,
    keywordMatch: 72,
    skillsScore: 82,
    projectScore: 90,
    expectedRange: [80, 86],
    notes: 'Excellent open source projects. Strong projects should lift overall score significantly.',
  },
  
  {
    name: 'FAANG Veteran - Minimal Resume',
    targetRole: 'Staff Engineer',
    atsCompatibility: 70,
    keywordMatch: 60,
    skillsScore: 85,
    projectScore: 82,
    expectedRange: [72, 78],
    notes: 'Experienced engineer with sparse resume. Experience quality matters more than keyword density.',
  },
];

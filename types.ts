export enum ActiveView {
  TitlePage = 'TITLE_PAGE',
  ApprovalPage = 'APPROVAL_PAGE',
  StatementPage = 'STATEMENT_PAGE',
  Preface = 'PREFACE',
  Abstract = 'ABSTRACT',
  TableOfContents = 'TABLE_OF_CONTENTS',
  Chapter = 'CHAPTER',
  Stats = 'STATS',
  Bibliography = 'BIBLIOGRAPHY',
  Appendices = 'APPENDICES',
  FormattingGuide = 'FORMATTING_GUIDE',
  ThinkingFrameworkVisualizer = 'THINKING_FRAMEWORK_VISUALIZER',
}

export interface AuthorInfo {
  studentName: string;
  studentId: string;
  institutionName: string;
  facultyName: string;
  studyProgram: string;
  submissionYear: string;
}

export interface BibliographyItem {
    id: string; // e.g., 'kotler-2017'
    apa: string; // The full APA 7 formatted string
}

export type ChartData = {
  chartType: 'bar' | 'line' | 'pie';
  dataKey: string;
  data: { name: string; value: number }[];
};


export interface AppendixItem {
  id: string;
  title: string;
  type: 'table' | 'chart';
  content: string; // HTML content for 'table', stringified JSON for 'chart'
}

export interface StatementPageData {
  studentName: string;
  studentId:string;
  statementDate: string;
}

export interface ApprovalData {
  studentName: string;
  studentId: string;
  studyProgram: string;
  supervisor1Name: string;
  supervisor1Id: string;
  supervisor2Name: string;
  supervisor2Id: string;
  approvalDate: string;
}

export interface ProjectData {
  title: string;
  academicLevel: string;
  authorInfo: AuthorInfo;
  outline: {
    background: string;
    problem: string;
    objective: string;
    benefits: string;
    writingSystematics: string;
    thinkingFramework: string;
  };
  preface: string;
  abstract: string;
  // Key: chapter name, Value: generated HTML content
  chapters: Record<string, string>;
  bibliography: BibliographyItem[];
  appendices: AppendixItem[];
  statementPageData?: StatementPageData | null;
  approvalData?: ApprovalData | null;
  isActivated?: boolean;
}

export interface StatisticSuggestion {
  recommendation: string;
  reason: string;
  formula: string;
  symbols: string;
  visualizationData?: {
    type: 'bar' | 'line';
    data: { name: string; value: number }[];
    dataKey: string;
  };
}

export interface PageInfoDetail {
    start: number | string;
    end?: number | string;
    isRoman: boolean;
}

export type PageInfo = Record<string, PageInfoDetail>;

import { ActiveView, ProjectData, PageInfo } from '../types';

// Heuristic value for characters per page, considering 12pt Times New Roman, double-spaced.
const CHARS_PER_PAGE = 2500;

const frontMatterOrder: ActiveView[] = [
    ActiveView.TitlePage,
    ActiveView.ApprovalPage,
    ActiveView.StatementPage,
    ActiveView.Preface,
    ActiveView.Abstract,
    ActiveView.TableOfContents
];

const chapterOrder = [
    'BAB I PENDAHULUAN',
    'BAB II LANDASAN TEORI',
    'BAB III METODOLOGI PENELITIAN',
    'BAB IV HASIL PENELITIAN DAN PEMBAHASAN',
    'BAB V PENUTUP (KESIMPULAN DAN SARAN)',
    'BAB VI DAFTAR PUSTAKA',
];

/**
 * Converts a number to a lowercase Roman numeral.
 * @param num The number to convert.
 * @returns The Roman numeral as a string.
 */
function toRoman(num: number): string {
    if (isNaN(num) || num < 1) return '';
    const roman: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (const i of Object.keys(roman)) {
        const q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }
    return str.toLowerCase();
}


export const calculatePageNumbers = (projectData: ProjectData | null): PageInfo => {
    const pageInfo: PageInfo = {};
    if (!projectData) return pageInfo;
    
    let currentPageRoman = 1;

    // Assign Roman numerals to front matter pages
    frontMatterOrder.forEach(key => {
        pageInfo[key] = { start: toRoman(currentPageRoman), isRoman: true };
        currentPageRoman++;
    });

    let currentPageArabic = 1;

    // Calculate Arabic numerals for main chapters
    chapterOrder.forEach(chapterKey => {
        const content = projectData.chapters[chapterKey];
        if (content) {
            // Strip HTML tags for a more accurate text length count
            const textContent = content.replace(/<[^>]*>/g, '');
            const numPages = Math.max(1, Math.ceil(textContent.length / CHARS_PER_PAGE));
            const endPage = currentPageArabic + numPages - 1;
            
            pageInfo[chapterKey] = {
                start: currentPageArabic,
                end: endPage,
                isRoman: false,
            };
            currentPageArabic = endPage + 1;
        }
    });

    return pageInfo;
};
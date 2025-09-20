import React from 'react';
import { PageInfo, ActiveView } from '../types';
import Card from './common/Card';
import PageFooter from './common/PageFooter';
import { useProject } from '../contexts/ProjectContext';

const chapterOrder = [
    'BAB I PENDAHULUAN',
    'BAB II LANDASAN TEORI',
    'BAB III METODOLOGI PENELITIAN',
    'BAB IV HASIL PENELITIAN DAN PEMBAHASAN',
    'BAB V PENUTUP (KESIMPULAN DAN SARAN)',
];

interface TocItem {
    level: 1 | 2;
    text: string;
    page: string | number;
    view?: ActiveView;
    chapterKey?: string;
    anchorId?: string;
}

const TableOfContents: React.FC<{ 
    pageInfo: PageInfo;
    setActiveView: (view: ActiveView) => void;
    setActiveChapter: (chapter: string) => void;
    pageNumber?: string | number;
}> = ({ pageInfo, setActiveView, setActiveChapter, pageNumber }) => {
    const { projectData } = useProject();
    
    const tocStructure = React.useMemo<TocItem[]>(() => {
        if (!projectData || !pageInfo) return [];

        const structure: TocItem[] = [];

        // Halaman Awal
        structure.push({ level: 1, text: 'HALAMAN JUDUL', page: pageInfo[ActiveView.TitlePage]?.start ?? '', view: ActiveView.TitlePage });
        structure.push({ level: 1, text: 'HALAMAN PERSETUJUAN', page: pageInfo[ActiveView.ApprovalPage]?.start ?? '', view: ActiveView.ApprovalPage });
        structure.push({ level: 1, text: 'HALAMAN PERNYATAAN', page: pageInfo[ActiveView.StatementPage]?.start ?? '', view: ActiveView.StatementPage });
        structure.push({ level: 1, text: 'KATA PENGANTAR', page: pageInfo[ActiveView.Preface]?.start ?? '', view: ActiveView.Preface });
        structure.push({ level: 1, text: 'ABSTRAK', page: pageInfo[ActiveView.Abstract]?.start ?? '', view: ActiveView.Abstract });
        structure.push({ level: 1, text: 'DAFTAR ISI', page: pageInfo[ActiveView.TableOfContents]?.start ?? '', view: ActiveView.TableOfContents });
        
        // Bab-bab
        chapterOrder.forEach(chapterKey => {
            const chapterContent = projectData.chapters[chapterKey];
            if (chapterContent) {
                const chapterPageInfo = pageInfo[chapterKey];
                structure.push({ level: 1, text: chapterKey, page: chapterPageInfo?.start ?? '', chapterKey });

                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(chapterContent, 'text/html');
                    const headings = doc.querySelectorAll('h2');
                    headings.forEach(h2 => {
                        if(h2.textContent) {
                            structure.push({ level: 2, text: h2.textContent, page: chapterPageInfo?.start ?? '', chapterKey, anchorId: h2.id });
                        }
                    });
                } catch (e) {
                    console.error("Error parsing chapter content for TOC:", e);
                }
            }
        });
        
        // Halaman Akhir
        if (projectData.bibliography.length > 0 || projectData.chapters['BAB VI DAFTAR PUSTAKA']) {
            const bibPageInfo = pageInfo['BAB VI DAFTAR PUSTAKA'];
            structure.push({ level: 1, text: 'DAFTAR PUSTAKA', page: bibPageInfo?.start ?? '', chapterKey: 'BAB VI DAFTAR PUSTAKA' });
        }
        if (projectData.appendices.length > 0) {
             structure.push({ level: 1, text: 'LAMPIRAN', page: '', view: ActiveView.Appendices }); // Appendices don't have a single page number
        }

        return structure;
    }, [projectData, pageInfo]);

    const handleTocClick = (item: TocItem) => {
        if (item.view) {
            setActiveView(item.view);
        } else if (item.chapterKey) {
            setActiveChapter(item.chapterKey);
            setActiveView(ActiveView.Chapter);
            if (item.anchorId) {
                setTimeout(() => {
                    const element = document.getElementById(item.anchorId);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    };


    if (!projectData) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card><div className="p-6 text-center text-text-secondary font-serif">Proyek belum dimuat.</div></Card>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Daftar Isi</h1>
                <p className="text-text-secondary font-serif">Berikut adalah pratinjau daftar isi yang dibuat secara otomatis. Klik pada entri untuk navigasi cepat.</p>
            </header>
            
            <Card className="relative">
                <div className="p-8 font-serif text-text-primary leading-loose bg-white">
                    <h2 className="text-center font-bold text-lg uppercase mb-8">DAFTAR ISI</h2>
                    {tocStructure.map((item, index) => (
                        <div key={index} 
                            className={`flex justify-between items-center border-b border-dotted border-slate-300 py-1 ${item.chapterKey || item.view ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                             onClick={() => handleTocClick(item)}
                        >
                            <span className={item.level === 1 ? 'uppercase font-medium' : 'pl-8'}>
                                {item.text}
                            </span>
                            <span className="font-medium">{item.page}</span>
                        </div>
                    ))}
                </div>
                {pageNumber && <PageFooter pageNumber={pageNumber} />}
            </Card>
        </div>
    );
};

export default TableOfContents;

import React from 'react';
import { ActiveView, PageInfo } from './types';
import Sidebar from './components/Sidebar';
import ChapterGenerator from './components/ChapterGenerator';
import StatsHelper from './components/StatsHelper';
import BibliographyManager from './components/BibliographyFormatter';
import Appendices from './components/Appendices';
import FormattingGuide from './components/FormattingGuide';
import StatementPage from './components/StatementPage';
import ApprovalPage from './components/ApprovalPage';
import NewProjectForm from './components/NewProjectForm';
import PrefacePage from './components/PrefacePage';
import AbstractPage from './components/AbstractPage';
import TitlePage from './components/TitlePage';
import ThinkingFrameworkVisualizer from './components/ThinkingFrameworkVisualizer';
import TableOfContents from './components/TableOfContents';
import { calculatePageNumbers } from './services/pageNumberingService';
import { useProject } from './contexts/ProjectContext';

const chapterOptions = [
    'BAB I PENDAHULUAN',
    'BAB II LANDASAN TEORI',
    'BAB III METODOLOGI PENELITIAN',
    'BAB IV HASIL PENELITIAN DAN PEMBAHASAN',
    'BAB V PENUTUP (KESIMPULAN DAN SARAN)',
    'BAB VI DAFTAR PUSTAKA',
];

const MainContent: React.FC<{
    activeView: ActiveView;
    activeChapter: string;
    setActiveChapter: (chapter: string) => void;
    setActiveView: (view: ActiveView) => void;
    pageInfo: PageInfo;
}> = ({ activeView, activeChapter, setActiveChapter, setActiveView, pageInfo }) => {
    const chapterPageInfo = pageInfo[activeChapter];
    switch (activeView) {
        case ActiveView.TitlePage:
            return <TitlePage pageNumber={pageInfo[ActiveView.TitlePage]?.start} />;
        case ActiveView.ApprovalPage:
            return <ApprovalPage pageNumber={pageInfo[ActiveView.ApprovalPage]?.start} />;
        case ActiveView.StatementPage:
            return <StatementPage pageNumber={pageInfo[ActiveView.StatementPage]?.start} />;
        case ActiveView.Preface:
            return <PrefacePage pageNumber={pageInfo[ActiveView.Preface]?.start} />;
        case ActiveView.Abstract:
            return <AbstractPage pageNumber={pageInfo[ActiveView.Abstract]?.start} />;
        case ActiveView.TableOfContents:
            return <TableOfContents pageInfo={pageInfo} setActiveView={setActiveView} setActiveChapter={setActiveChapter} pageNumber={pageInfo[ActiveView.TableOfContents]?.start} />;
        case ActiveView.Chapter:
            return <ChapterGenerator
                activeChapter={activeChapter}
                setActiveChapter={setActiveChapter}
                setActiveView={setActiveView}
                startPage={chapterPageInfo?.start as number}
                endPage={chapterPageInfo?.end as number}
            />;
        case ActiveView.Stats:
            return <StatsHelper />;
        case ActiveView.Bibliography:
            return <BibliographyManager />;
        case ActiveView.Appendices:
            return <Appendices />;
        case ActiveView.FormattingGuide:
            return <FormattingGuide />;
        case ActiveView.ThinkingFrameworkVisualizer:
            return <ThinkingFrameworkVisualizer />;
        
        default:
            return <TitlePage pageNumber={pageInfo[ActiveView.TitlePage]?.start} />;
    }
};

const App: React.FC = () => {
    const { projectData } = useProject();
    const [activeView, setActiveView] = React.useState<ActiveView>(ActiveView.TitlePage);
    const [activeChapter, setActiveChapter] = React.useState<string>(chapterOptions[0]);
    const [pageInfo, setPageInfo] = React.useState<PageInfo>({});

    React.useEffect(() => {
        if (projectData) {
            const newPageInfo = calculatePageNumbers(projectData);
            setPageInfo(newPageInfo);
        }
    }, [projectData]);
    
    // Reset view to title page when project is reset/nulled
    React.useEffect(() => {
        if(!projectData) {
            setActiveView(ActiveView.TitlePage);
            setActiveChapter(chapterOptions[0]);
        }
    }, [projectData]);


    if (!projectData) {
        return <NewProjectForm />;
    }

    return (
        <div className="flex h-screen font-sans bg-background text-text-primary">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                setActiveChapter={setActiveChapter}
                activeChapter={activeChapter}
            />
            <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto">
                <MainContent
                    activeView={activeView}
                    activeChapter={activeChapter}
                    setActiveChapter={setActiveChapter}
                    setActiveView={setActiveView}
                    pageInfo={pageInfo}
                />
            </main>
        </div>
    );
};

export default App;

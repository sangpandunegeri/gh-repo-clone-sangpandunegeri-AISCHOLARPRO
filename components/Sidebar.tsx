import React from 'react';
import { ActiveView } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import ListIcon from './icons/ListIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import RulerIcon from './icons/RulerIcon';
import DocumentCheckIcon from './icons/DocumentCheckIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { useProject } from '../contexts/ProjectContext';
import ShieldCheckIcon from './icons/ShieldCheckIcon';


const frontMatterItems = [
  { view: ActiveView.TitlePage, icon: <DocumentTextIcon />, label: 'Halaman Judul' },
  { view: ActiveView.ApprovalPage, icon: <DocumentCheckIcon />, label: 'Halaman Persetujuan' },
  { view: ActiveView.StatementPage, icon: <DocumentCheckIcon />, label: 'Halaman Pernyataan' },
  { view: ActiveView.Preface, icon: <DocumentTextIcon />, label: 'Kata Pengantar' },
  { view: ActiveView.Abstract, icon: <DocumentTextIcon />, label: 'Abstrak' },
  { view: ActiveView.TableOfContents, icon: <ListIcon />, label: 'Daftar Isi' },
];

const chapterOptions = [
  'BAB I PENDAHULUAN',
  'BAB II LANDASAN TEORI',
  'BAB III METODOLOGI PENELITIAN',
  'BAB IV HASIL PENELITIAN DAN PEMBAHASAN',
  'BAB V PENUTUP (KESIMPULAN DAN SARAN)',
  'BAB VI DAFTAR PUSTAKA',
];

const mainContentItems = [
    { view: ActiveView.Chapter, icon: <BookOpenIcon />, label: 'Generator Bab' },
    { view: ActiveView.Bibliography, icon: <ListIcon />, label: 'Daftar Pustaka' },
    { view: ActiveView.Appendices, icon: <PaperclipIcon />, label: 'Lampiran' },
]

const utilityItems = [
    { view: ActiveView.Stats, icon: <CalculatorIcon />, label: 'Asisten Statistik' },
    { view: ActiveView.ThinkingFrameworkVisualizer, icon: <ChartBarIcon />, label: 'Visualisasi Kerangka' },
    { view: ActiveView.PlagiarismChecker, icon: <ShieldCheckIcon />, label: 'Cek Orisinalitas' },
    { view: ActiveView.FormattingGuide, icon: <RulerIcon />, label: 'Panduan Format' },
];


interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  setActiveChapter: (chapter: string) => void;
  activeChapter: string;
}

// Helper function to check if chapter content is substantial
const isChapterContentSufficient = (content?: string): boolean => {
    if (!content) return false;
    // A chapter is considered "complete" if it has text content, not just empty HTML tags.
    // We strip HTML tags and check if the remaining trimmed text has any length.
    return content.replace(/<[^>]+>/g, '').trim().length > 0;
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, setActiveChapter, activeChapter }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { projectData, startNewProject, importProject, exportProject } = useProject();
  
  const handleChapterClick = (chapterName: string, isUnlocked: boolean) => {
      if(isUnlocked) {
          setActiveChapter(chapterName);
          setActiveView(ActiveView.Chapter);
      }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          importProject(text);
        } catch (error) {
          console.error("Error processing imported file:", error);
          alert("Gagal memproses file. Pastikan file tersebut adalah file proyek yang valid.");
        }
      };
      reader.onerror = () => {
        alert("Gagal membaca file.");
      };
      reader.readAsText(file);
    }
    // Reset input value to allow re-uploading the same file name
    if (event.target) {
      event.target.value = '';
    }
  };

  const NavButton: React.FC<{item: {view: ActiveView, icon: JSX.Element, label: string}, isActive: boolean}> = ({ item, isActive }) => (
     <button
        onClick={() => setActiveView(item.view)}
        title={`Buka ${item.label}`}
        className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 w-full ${
          isActive
            ? 'bg-primary shadow-inner'
            : 'hover:bg-primary-dark'
        }`}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </button>
  );


  return (
    <aside className="w-80 bg-primary-darkest text-white flex flex-col p-4 shadow-lg overflow-y-auto">
      <div className="flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3.03058C6.93815 3.03058 3.56242 6.57832 2.25 10.5C3.56242 14.4217 6.93815 17.9694 12 17.9694C17.0618 17.9694 20.4376 14.4217 21.75 10.5C20.4376 6.57832 17.0618 3.03058 12 3.03058ZM12 15.75C9.06692 15.75 6.75 13.4331 6.75 10.5C6.75 7.56692 9.06692 5.25 12 5.25C14.9331 5.25 17.25 7.56692 17.25 10.5C17.25 13.4331 14.9331 15.75 12 15.75Z" />
              <path d="M12 21C9.69612 21 7.4471 20.5752 5.25 19.7259V19.7259C7.45639 20.1832 9.69837 20.4287 12 20.4287C14.3016 20.4287 16.5436 20.1832 18.75 19.7259V19.7259C16.5529 20.5752 14.3039 21 12 21Z" />
          </svg>
          <div>
            <h1 className="text-xl font-bold">AI Scholar Pro</h1>
            <p className="text-xs text-blue-300 -mt-1">by Sang Pandu Negeri</p>
          </div>
        </div>
      
        <div className="flex justify-between items-center px-2 mb-2">
            <h2 className="text-xs font-semibold tracking-wider text-blue-300 uppercase">Proyek Anda</h2>
            <div className="flex items-center space-x-1">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,application/json"
                    className="hidden"
                    aria-hidden="true"
                />
                <button onClick={handleImportClick} className="p-1 rounded-full hover:bg-primary-dark text-blue-300 hover:text-white" title="Impor Proyek (.json)"><UploadIcon className="h-4 w-4" /></button>
                <button onClick={exportProject} disabled={!projectData} className="p-1 rounded-full hover:bg-primary-dark text-blue-300 hover:text-white disabled:text-blue-600 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Ekspor Proyek (.json)"><DownloadIcon className="h-4 w-4" /></button>
                <button onClick={startNewProject} className="p-1 rounded-full hover:bg-primary-dark text-blue-300 hover:text-white" title="Mulai Proyek Baru"><TrashIcon className="h-4 w-4" /></button>
            </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6">
        <div>
            <h3 className="px-3 text-xs font-semibold tracking-wider text-blue-300 uppercase mb-2">Halaman Awal</h3>
            <nav className="flex flex-col space-y-1">
                {frontMatterItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} />)}
            </nav>
        </div>

        <div>
            <h3 className="px-3 text-xs font-semibold tracking-wider text-blue-300 uppercase mb-2">Isi Naskah</h3>
            <NavButton item={mainContentItems[0]} isActive={activeView === ActiveView.Chapter} />
             <div className="space-y-1 mt-1 pl-4 border-l-2 border-blue-800">
              {chapterOptions.map((chapterName, index) => {
                const isCompleted = isChapterContentSufficient(projectData?.chapters?.[chapterName]);
                
                // A chapter is unlocked if it's the first one, if the previous one is complete,
                // or if the chapter itself already has content (e.g., from an imported project).
                const isUnlocked = index === 0 
                    || isChapterContentSufficient(projectData?.chapters?.[chapterOptions[index - 1]]) 
                    || isCompleted;

                const isActive = activeView === ActiveView.Chapter && activeChapter === chapterName;
                
                const getTitle = () => {
                    if (isCompleted) return `${chapterName} (Selesai)`;
                    if (!isUnlocked) return `Selesaikan ${chapterOptions[index - 1]} untuk membuka`;
                    return chapterName;
                };
                
                const chapterClasses = isActive
                  ? 'bg-primary text-white'
                  : isCompleted
                  ? 'text-teal-200 hover:bg-primary-dark'
                  : isUnlocked
                  ? 'hover:bg-primary-dark text-white'
                  : 'opacity-60 text-blue-300';


                return (
                  <div key={chapterName} className={`rounded-lg transition-colors ${chapterClasses}`}>
                    <div 
                        onClick={() => handleChapterClick(chapterName, isUnlocked)}
                        className={`flex items-center p-2 space-x-2 ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        aria-disabled={!isUnlocked}
                        title={getTitle()}
                    >
                        <div className="flex-shrink-0">
                            {isCompleted ? <CheckCircleIcon className="h-5 w-5 text-teal-400" /> : !isUnlocked ? <LockClosedIcon className="h-5 w-5" /> : <div className="h-5 w-5 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-300"></div></div> }
                        </div>
                        <span className="text-sm font-medium flex-grow">
                             {`${chapterName.split(' ')[0]} ${chapterName.split(' ')[1]}`}
                        </span>
                    </div>
                  </div>
                );
              })}
            </div>
             <NavButton item={mainContentItems[1]} isActive={activeView === ActiveView.Bibliography} />
             <NavButton item={mainContentItems[2]} isActive={activeView === ActiveView.Appendices} />
        </div>
        
        <div>
            <h3 className="px-3 text-xs font-semibold tracking-wider text-blue-300 uppercase mb-2">Utilitas</h3>
            <nav className="flex flex-col space-y-1">
                {utilityItems.map(item => <NavButton key={item.view} item={item} isActive={activeView === item.view} />)}
            </nav>
        </div>
      </div>


      <div className="flex-shrink-0 mt-auto pt-4 text-center text-blue-300 text-xs">
        <p>Powered by Gemini</p>
      </div>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import ReactQuill from 'react-quill';
import { generateChapter, humanizeText } from '../services/geminiService';
import { ActiveView, ProjectData } from '../types';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';
import SaveIcon from './icons/SaveIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useProject } from '../contexts/ProjectContext';
import ResearchOutlineForm from './ResearchOutlineForm';
import ActivationModal from './ActivationModal';

const Quill = (ReactQuill as any).Quill;

type OutlineField = keyof ProjectData['outline'];


interface ChapterGeneratorProps {
    activeChapter: string;
    setActiveChapter: (chapter: string) => void;
    setActiveView: (view: ActiveView) => void;
    startPage?: number;
    endPage?: number;
}

const loadingMessages = [
  'Menganalisis kerangka...',
  'Menelusuri Google untuk referensi valid...',
  'Menyusun argumen logis...',
  'Menulis draf awal...',
  'Memvalidasi kutipan...',
  'Memformat keluaran akhir...',
];

// Register custom humanize icon for Quill toolbar
const userIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
if (Quill && Quill.import('ui/icons')['humanize'] === undefined) {
    Quill.import('ui/icons')['humanize'] = userIconSvg;
}


const ChapterGenerator: React.FC<ChapterGeneratorProps> = ({ activeChapter, setActiveView, startPage, endPage }) => {
  const { projectData, onProjectUpdate, isHumanizingCooldown, startHumanizingCooldown } = useProject();
  
  // Local UI state
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState(loadingMessages[0]);
  const [isParagraphHumanizing, setIsParagraphHumanizing] = React.useState(false);
  const [showActivationModal, setShowActivationModal] = React.useState(false);


  // Local state for chapter-specific settings and editor content
  const [minReferences, setMinReferences] = React.useState(7);
  const [minCharacters, setMinCharacters] = React.useState(5000);
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);
  const quillRef = React.useRef<ReactQuill>(null);

  const hasBab1 = !!projectData?.chapters['BAB I PENDAHULUAN'];
  const isOutlineLocked = hasBab1;
  const isBibChapter = activeChapter === 'BAB VI DAFTAR PUSTAKA';

  // Sync editor content when props change
  React.useEffect(() => {
    setGeneratedContent(projectData?.chapters[activeChapter] || '');
  }, [projectData, activeChapter]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[messageIndex]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Effect to manage the disabled state of the custom Quill toolbar button.
  React.useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const humanizeButton = document.querySelector('.ql-toolbar button.ql-humanize') as HTMLButtonElement | null;
    if (!humanizeButton) return;

    const updateButtonState = () => {
      const range = editor.getSelection();
      // Disable if no cursor/selection, if already processing, OR if in global cooldown.
      const shouldBeDisabled = !range || isParagraphHumanizing || isHumanizingCooldown;
      humanizeButton.disabled = shouldBeDisabled;
       if (shouldBeDisabled) {
         humanizeButton.classList.add('ql-disabled');
         if(isHumanizingCooldown) {
            humanizeButton.title = "Harap tunggu sebelum mencoba lagi";
         } else {
            humanizeButton.title = "Humanisasi Paragraf";
         }
       } else {
         humanizeButton.classList.remove('ql-disabled');
         humanizeButton.title = "Humanisasi Paragraf";
       }
    };
    
    updateButtonState(); // Set initial state for the button
    editor.on('selection-change', updateButtonState);

    return () => {
      editor.off('selection-change', updateButtonState);
    };
  }, [isParagraphHumanizing, isHumanizingCooldown, generatedContent]); // Rerun when humanizing state changes or when the editor content itself changes

  
  const handleOutlineChange = (field: OutlineField, value: string) => {
    if (projectData && !isOutlineLocked) {
      const newOutline = { ...projectData.outline, [field]: value };
      onProjectUpdate({ ...projectData, outline: newOutline });
    }
  };

  const handleHumanizeParagraph = React.useCallback(async () => {
        const editor = quillRef.current?.getEditor();
        if (!editor || isParagraphHumanizing || isHumanizingCooldown) return;

        const range = editor.getSelection();
        if (!range) {
            // This check is a safeguard; the button should already be disabled.
            return;
        }

        const [line] = editor.getLine(range.index);
        const text = line.domNode.textContent;

        if (!text || !text.trim()) return;

        setIsParagraphHumanizing(true);
        startHumanizingCooldown();
        try {
            const humanizedText = await humanizeText(text);
            const lineStartIndex = editor.getIndex(line);
            const lineLength = line.length();

            // Using Delta for safer updates that preserve history
            const delta = new (Quill.import('delta'))()
                .retain(lineStartIndex)
                .delete(lineLength)
                .insert(humanizedText);
            
            editor.updateContents(delta, 'user');
            
            // Manually sync state because programmatic updates
            // might not trigger the ReactQuill onChange handler reliably.
            const newContent = editor.root.innerHTML;
            setGeneratedContent(newContent);
        } catch (error) {
            console.error("Failed to humanize paragraph:", error);
            alert((error as Error).message);
        } finally {
            setIsParagraphHumanizing(false);
        }
    }, [isParagraphHumanizing, isHumanizingCooldown, startHumanizingCooldown]);

    const quillModules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{ 'align': [] }],
                ['link'],
                ['clean'],
                [{ 'humanize': 'humanize' }] // Custom button
            ],
            handlers: {
                'humanize': handleHumanizeParagraph
            }
        },
    }), [handleHumanizeParagraph]);

    const proceedWithGeneration = async () => {
        if (!projectData) return;

        setIsLoading(true);
        setGeneratedContent('');
        try {
            const result = await generateChapter(
                projectData.title,
                projectData.outline.background,
                projectData.outline.problem,
                projectData.outline.objective,
                projectData.outline.benefits,
                projectData.outline.writingSystematics,
                projectData.outline.thinkingFramework,
                projectData.academicLevel,
                activeChapter,
                isBibChapter ? 0 : minReferences,
                isBibChapter ? 0 : minCharacters,
                isBibChapter ? projectData.bibliography : undefined
            );

            const updatedChapters = { ...projectData.chapters, [activeChapter]: result.content };
            
            const existingBib = projectData.bibliography || [];
            const newBibItems = result.references.filter(newItem => 
                !existingBib.some(oldItem => oldItem.apa.trim() === newItem.apa.trim())
            );
            const updatedBibliography = newBibItems.length > 0 ? [...existingBib, ...newBibItems] : existingBib;

            const newProjectData = {
                ...projectData,
                chapters: updatedChapters,
                bibliography: updatedBibliography
            };
            onProjectUpdate(newProjectData);

            const coreChapters = [
                'BAB I PENDAHULUAN',
                'BAB II LANDASAN TEORI',
                'BAB III METODOLOGI PENELITIAN',
                'BAB IV HASIL PENELITIAN DAN PEMBAHASAN',
                'BAB V PENUTUP (KESIMPULAN DAN SARAN)',
            ];

            const allCoreChaptersDone = coreChapters.every(chapter =>
                Object.keys(newProjectData.chapters).includes(chapter) && newProjectData.chapters[chapter]
            );
            
            const isLastCoreChapterJustFinished = coreChapters.includes(activeChapter) && allCoreChaptersDone;

            if (isLastCoreChapterJustFinished) {
                setTimeout(() => {
                    setActiveView(ActiveView.Appendices);
                }, 1500);
            }

        } catch (error) {
            setGeneratedContent('<p>Gagal menghasilkan konten. Silakan coba lagi.</p>');
        } finally {
            setIsLoading(false);
        }
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData) return;

    const needsActivation = activeChapter === 'BAB III METODOLOGI PENELITIAN' && !projectData.isActivated;
    if(needsActivation) {
        setShowActivationModal(true);
        return;
    }

    await proceedWithGeneration();
  };

  const handleActivationSuccess = () => {
      setShowActivationModal(false);
      proceedWithGeneration();
  };

  const handleSaveChanges = () => {
    if (!projectData) return;
    const updatedChapters = { ...projectData.chapters, [activeChapter]: generatedContent };
    onProjectUpdate({ ...projectData, chapters: updatedChapters });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const isFormIncomplete = !projectData || minReferences <= 0 || minCharacters <= 0;

  if (!projectData) {
      return (
        <Card>
            <div className="p-6 text-center">
                <p className="text-text-secondary font-serif">Silakan mulai proyek baru untuk menggunakan fitur ini.</p>
            </div>
        </Card>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ActivationModal 
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSuccess={handleActivationSuccess}
      />
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
            Generator Bab
        </h1>
        <p className="text-text-secondary font-serif">
            Anda sedang mengerjakan: <strong>{activeChapter}</strong> untuk proyek "{projectData.title}"
        </p>
      </header>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <ResearchOutlineForm
              outline={projectData.outline}
              onOutlineChange={handleOutlineChange}
              isLocked={isOutlineLocked}
            />

            <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-text-primary mb-4">Konfigurasi Penulisan Bab</p>
                {isBibChapter ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800 font-serif">
                            Bab ini akan menyusun semua referensi yang telah Anda kumpulkan ke dalam daftar pustaka akhir. Cukup klik tombol di bawah untuk membuatnya.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label htmlFor="chapterName" className="block text-sm font-medium text-text-primary mb-1">Bab Aktif</label>
                        <input
                            id="chapterName"
                            type="text"
                            value={activeChapter}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"
                        />
                        </div>
                        <div>
                        <label htmlFor="academicLevel" className="block text-sm font-medium text-text-primary mb-1">Tingkat Akademik</label>
                        <input
                            id="academicLevel"
                            type="text"
                            value={projectData.academicLevel}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"
                        />
                        </div>
                        <div>
                        <label htmlFor="minReferences" className="block text-sm font-medium text-text-primary mb-1">Minimal Referensi</label>
                        <input
                            id="minReferences"
                            type="number"
                            value={minReferences}
                            onChange={(e) => setMinReferences(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        </div>
                        <div>
                        <label htmlFor="minCharacters" className="block text-sm font-medium text-text-primary mb-1">Minimal Karakter</label>
                        <input
                            id="minCharacters"
                            type="number"
                            value={minCharacters}
                            onChange={(e) => setMinCharacters(parseInt(e.target.value, 10) || 0)}
                            step="500"
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        </div>
                    </div>
                )}
            </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || (isBibChapter ? !projectData : isFormIncomplete)}
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
              <span className="ml-2">{isLoading ? loadingMessage : isBibChapter ? 'Susun Daftar Pustaka' : `Buat Draf ${activeChapter.split(' ')[1]}`}</span>
            </button>
          </div>
        </form>
      </Card>

      {(isLoading || generatedContent) && projectData && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Hasil Draf: {activeChapter}</h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-text-secondary py-10">
                <LoadingSpinner size="h-8 w-8" color="text-primary"/>
                <p className="mt-4 font-serif">{loadingMessage}</p>
              </div>
            )}
            {!isLoading && generatedContent && (
              <>
               <ReactQuill
                ref={quillRef}
                theme="snow"
                value={generatedContent}
                onChange={setGeneratedContent}
                modules={quillModules}
              />
               <div className="flex justify-end mt-4 pt-4 border-t border-border">
                  <div className="flex items-center">
                    {isSaved && (
                        <div className="flex items-center text-green-600 mr-4 transition-opacity duration-300 animate-fade-in-down">
                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Tersimpan!</span>
                        </div>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary hover:bg-primary-dark focus:ring-primary`}
                    >
                        <SaveIcon className="h-5 w-5 mr-2"/>
                        Simpan Perubahan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
           {(startPage !== undefined && endPage !== undefined) && (
             <div className="p-2 bg-slate-50 border-t border-border text-right font-serif text-sm text-text-secondary pr-4">
                {startPage === endPage ? `Halaman ${startPage}` : `Halaman ${startPage} - ${endPage}`}
            </div>
           )}
        </Card>
      )}
    </div>
  );
};

export default ChapterGenerator;
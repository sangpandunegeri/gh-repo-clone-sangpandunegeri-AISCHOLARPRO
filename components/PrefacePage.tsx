import React from 'react';
import ReactQuill from 'react-quill';
import { humanizeText } from '../services/geminiService';
import Card from './common/Card';
import SaveIcon from './icons/SaveIcon';
import PageFooter from './common/PageFooter';
import { useProject } from '../contexts/ProjectContext';

const Quill = (ReactQuill as any).Quill;

// Register custom humanize icon for Quill toolbar
const userIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
if (Quill && Quill.import('ui/icons')['humanize'] === undefined) {
    Quill.import('ui/icons')['humanize'] = userIconSvg;
}

const PrefacePage: React.FC<{ pageNumber?: string | number; }> = ({ pageNumber }) => {
    const { projectData, onProjectUpdate, isHumanizingCooldown, startHumanizingCooldown } = useProject();
    const [content, setContent] = React.useState('');
    const [isSaved, setIsSaved] = React.useState(false);
    const [isHumanizing, setIsHumanizing] = React.useState(false);
    const quillRef = React.useRef<ReactQuill>(null);
    
    React.useEffect(() => {
        if (projectData) {
            setContent(projectData.preface);
        }
    }, [projectData]);
    
    // Effect to manage the disabled state of the custom Quill toolbar button.
    React.useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const humanizeButton = document.querySelector('.ql-toolbar button.ql-humanize') as HTMLButtonElement | null;
        if (!humanizeButton) return;

        const updateButtonState = () => {
          const range = editor.getSelection();
          const shouldBeDisabled = !range || isHumanizing || isHumanizingCooldown;
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
        
        updateButtonState();
        editor.on('selection-change', updateButtonState);

        return () => {
          editor.off('selection-change', updateButtonState);
        };
    }, [isHumanizing, isHumanizingCooldown, content]);


    const handleContentChange = (value: string) => {
        setContent(value);
    };

    const handleSave = () => {
        if (!projectData) return;
        onProjectUpdate({ ...projectData, preface: content });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleHumanizeParagraph = React.useCallback(async () => {
        const editor = quillRef.current?.getEditor();
        if (!editor || isHumanizing || isHumanizingCooldown) return;

        const range = editor.getSelection();
        if (!range) return;

        const [line] = editor.getLine(range.index);
        const text = line.domNode.textContent;

        if (!text || !text.trim()) return;

        setIsHumanizing(true);
        startHumanizingCooldown();
        try {
            const humanizedText = await humanizeText(text);
            const lineStartIndex = editor.getIndex(line);
            const lineLength = line.length();

            const delta = new (Quill.import('delta'))()
                .retain(lineStartIndex)
                .delete(lineLength)
                .insert(humanizedText);
            
            editor.updateContents(delta, 'user');
            setContent(editor.root.innerHTML);
        } catch (error) {
            console.error("Failed to humanize paragraph:", error);
            alert((error as Error).message);
        } finally {
            setIsHumanizing(false);
        }
    }, [isHumanizing, isHumanizingCooldown, startHumanizingCooldown]);

     const quillModules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{ 'align': [] }],
                ['link'],
                ['clean'],
                [{ 'humanize': 'humanize' }]
            ],
            handlers: {
                'humanize': handleHumanizeParagraph
            }
        },
    }), [handleHumanizeParagraph]);


    if (!projectData) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Kata Pengantar</h1>
                <p className="text-text-secondary font-serif">AI telah membuatkan draf awal untuk kata pengantar Anda. Silakan sunting dan sesuaikan.</p>
            </header>
            
            <Card className="relative">
                <div className="p-6">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={content}
                        onChange={handleContentChange}
                        modules={quillModules}
                    />
                    <div className="flex justify-end mt-6 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <SaveIcon />
                            <span className="ml-2">{isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                </div>
                 {pageNumber && <PageFooter pageNumber={pageNumber} />}
            </Card>
        </div>
    );
};
export default PrefacePage;
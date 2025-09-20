import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectData, AuthorInfo } from '../types';
import { initializeNewProject } from '../services/geminiService';

// --- Helper to get initial data ---
const getInitialData = (): ProjectData | null => {
    try {
        const savedProject = localStorage.getItem('academicProject');
        if (savedProject) {
            const parsedProject = JSON.parse(savedProject);
            if (parsedProject.title && parsedProject.authorInfo) {
                // Perform compatibility checks on the loaded data
                if (!parsedProject.bibliography) parsedProject.bibliography = [];
                if (!parsedProject.appendices) parsedProject.appendices = [];
                if (!parsedProject.statementPageData) parsedProject.statementPageData = null;
                if (!parsedProject.approvalData) parsedProject.approvalData = null;
                if (!parsedProject.preface) parsedProject.preface = '<p>Kata Pengantar belum dibuat.</p>';
                if (!parsedProject.abstract) parsedProject.abstract = '<p>Abstrak belum dibuat.</p>';
                if (parsedProject.isActivated === undefined) parsedProject.isActivated = false;
                return parsedProject;
            }
        }
        // If there is no project in localStorage, or if it's invalid, return null to start fresh.
        return null;
    } catch (error) {
        console.error("Failed to load project from localStorage, starting fresh:", error);
        // On any error, also return null to ensure a clean start.
        return null;
    }
};


// --- Context Type Definition ---
interface ProjectContextType {
    projectData: ProjectData | null;
    isCreatingProject: boolean;
    isImportModalOpen: boolean;
    importPreview: ProjectData | null;
    importError: string | null;
    onProjectUpdate: (newData: ProjectData) => void;
    startNewProject: () => void;
    createProject: (formData: AuthorInfo & { title: string; academicLevel: string }) => Promise<void>;
    importProject: (data: ProjectData) => void;
    exportProject: () => void;
    isHumanizingCooldown: boolean;
    startHumanizingCooldown: () => void;
    activateProject: (key: string) => boolean;
    handleFileUpload: (file: File) => void;
    closeImportModal: () => void;
}

// --- Context Creation ---
const ProjectContext = createContext<ProjectContextType | null>(null);


// --- Provider Component ---
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectData, setProjectData] = useState<ProjectData | null>(getInitialData);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isHumanizingCooldown, setIsHumanizingCooldown] = useState(false);
    
    // State for Import Modal
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importPreview, setImportPreview] = useState<ProjectData | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const validKeys = new Set([
        'SPN-CgbInU4mmneUddLHFI0vtWueQTDBMZpQ', 'SPN-AHU6wZNqIQfwpoj78bgf3GrNTgKEEK1u',
        'SPN-ImFQ7zIvJELSihGh0iQ8f0vHwrfhHpFm', 'SPN-QwhkgrbQNKrGe9G5PCADWPe8MH8YjAYl',
        'SPN-NUkARi3j0xhGwYoEKQPGNXMfKnPJ1ofh', 'SPN-dDcVQSmvdfB6n0Kdxs7t13ZXi7H1R4rb',
        'SPN-qvZYsh3bNrnAIxiPXTLlVrWg1vOX46bk', 'SPN-oIah1uLoT6AN9YK81ioBySoKwxamZPuL',
        'SPN-f1izd4xwLVibzlTlhe0khY0ksHcnLO8Z', 'SPN-SBPdsBtL3d1oRUFH0EddUaOk0byX5hpo'
    ]);

    useEffect(() => {
        if (projectData) {
            localStorage.setItem('academicProject', JSON.stringify(projectData));
        } else {
            localStorage.removeItem('academicProject');
        }
    }, [projectData]);

    const onProjectUpdate = useCallback((newProjectData: ProjectData) => {
        setProjectData(newProjectData);
    }, []);
    
    const startNewProject = useCallback(() => {
        if (window.confirm('Apakah Anda yakin ingin memulai proyek baru? Semua progres akan dihapus.')) {
            localStorage.removeItem('academicProject'); // Clear storage
            setProjectData(null);
        }
    }, []);

    const createProject = async (formData: AuthorInfo & { title: string; academicLevel: string }) => {
        setIsCreatingProject(true);
        try {
            const { title, academicLevel, ...authorInfo } = formData;
            const newProject = await initializeNewProject(authorInfo, title, academicLevel);
            setProjectData(newProject);
        } catch (error) {
            console.error("Failed to initialize new project:", error);
            alert(`Gagal membuat proyek baru. Error: ${(error as Error).message}`);
        } finally {
            setIsCreatingProject(false);
        }
    };
    
    const startHumanizingCooldown = useCallback(() => {
        setIsHumanizingCooldown(true);
        // Set a 15-second cooldown to prevent API rate limit errors
        setTimeout(() => {
            setIsHumanizingCooldown(false);
        }, 15000);
    }, []);

    const activateProject = (key: string): boolean => {
        if (validKeys.has(key.trim())) {
            if (projectData) {
                onProjectUpdate({ ...projectData, isActivated: true });
            }
            return true;
        }
        return false;
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportPreview(null);
        setImportError(null);
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const importedData = JSON.parse(text);
                // Basic validation
                if (importedData.title && importedData.authorInfo && importedData.outline && importedData.chapters) {
                    setImportPreview(importedData);
                    setImportError(null);
                    setIsImportModalOpen(true);
                } else {
                    throw new Error('Struktur file tidak valid. Pastikan file berisi data proyek yang lengkap.');
                }
            } catch (error) {
                setImportPreview(null);
                setImportError(`Gagal mem-parsing file. ${(error as Error).message}`);
                setIsImportModalOpen(true);
            }
        };
        reader.onerror = () => {
            setImportPreview(null);
            setImportError("Terjadi kesalahan saat membaca file.");
            setIsImportModalOpen(true);
        };
        reader.readAsText(file);
    };

    const importProject = useCallback((dataToImport: ProjectData) => {
        try {
            // Add compatibility checks for potentially missing fields in older project files
            if (!dataToImport.bibliography) dataToImport.bibliography = [];
            if (!dataToImport.appendices) dataToImport.appendices = [];
            if (!dataToImport.statementPageData) dataToImport.statementPageData = null;
            if (!dataToImport.approvalData) dataToImport.approvalData = null;
            if (!dataToImport.preface) dataToImport.preface = '<p>Kata Pengantar belum dibuat.</p>';
            if (!dataToImport.abstract) dataToImport.abstract = '<p>Abstrak belum dibuat.</p>';
            if (dataToImport.isActivated === undefined) dataToImport.isActivated = false;

            setProjectData(dataToImport);
            closeImportModal();
            alert('Proyek berhasil diimpor!');
        } catch (error) {
            console.error("Failed to finalize import:", error);
            closeImportModal();
            alert(`Gagal mengimpor proyek. Error: ${(error as Error).message}`);
        }
    }, []);

    const exportProject = useCallback(() => {
        if (!projectData) {
            alert('Tidak ada proyek aktif untuk diekspor.');
            return;
        }
        try {
            const jsonString = JSON.stringify(projectData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const sanitizedTitle = projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const fileName = `proyek-akademik-${sanitizedTitle || 'tanpa-judul'}.json`;
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export project:", error);
            alert('Gagal mengekspor proyek.');
        }
    }, [projectData]);

    const value: ProjectContextType = {
        projectData,
        isCreatingProject,
        isImportModalOpen,
        importPreview,
        importError,
        onProjectUpdate,
        startNewProject,
        createProject,
        importProject,
        exportProject,
        isHumanizingCooldown,
        startHumanizingCooldown,
        activateProject,
        handleFileUpload,
        closeImportModal,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

// --- Custom Hook ---
export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectData, AuthorInfo } from '../types';
import { initializeNewProject } from '../services/geminiService';
import { initialProjectData } from '../src/data/initialProject';

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
        return initialProjectData;
    } catch (error) {
        console.error("Failed to load project from localStorage, using initial data:", error);
        return initialProjectData;
    }
};


// --- Context Type Definition ---
interface ProjectContextType {
    projectData: ProjectData | null;
    isCreatingProject: boolean;
    onProjectUpdate: (newData: ProjectData) => void;
    startNewProject: () => void;
    createProject: (formData: AuthorInfo & { title: string; academicLevel: string }) => Promise<void>;
    importProject: (fileContent: string) => void;
    exportProject: () => void;
    loadProject: (data: ProjectData) => void;
    isHumanizingCooldown: boolean;
    startHumanizingCooldown: () => void;
    activateProject: (key: string) => boolean;
}

// --- Context Creation ---
const ProjectContext = createContext<ProjectContextType | null>(null);


// --- Provider Component ---
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectData, setProjectData] = useState<ProjectData | null>(getInitialData);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isHumanizingCooldown, setIsHumanizingCooldown] = useState(false);

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
    
    const loadProject = useCallback((data: ProjectData) => {
        setProjectData(data);
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

    const importProject = useCallback((fileContent: string) => {
         const performImport = () => {
             try {
                const importedData = JSON.parse(fileContent);
                if (importedData.title && importedData.outline && importedData.chapters && importedData.authorInfo) {
                    // Add compatibility checks for new fields
                    if (!importedData.bibliography) importedData.bibliography = [];
                    if (!importedData.appendices) importedData.appendices = [];
                    if (!importedData.statementPageData) importedData.statementPageData = null;
                    if (!importedData.approvalData) importedData.approvalData = null;
                    if (!importedData.preface) importedData.preface = '<p>Kata Pengantar belum dibuat.</p>';
                    if (!importedData.abstract) importedData.abstract = '<p>Abstrak belum dibuat.</p>';
                    if (importedData.isActivated === undefined) importedData.isActivated = false;

                    setProjectData(importedData);
                    alert('Proyek berhasil diimpor!');
                } else {
                    throw new Error('Struktur file tidak valid atau file rusak.');
                }
            } catch (error) {
                console.error("Failed to import project:", error);
                alert(`Gagal mengimpor proyek. Pastikan file JSON valid dan berasal dari aplikasi ini. Error: ${(error as Error).message}`);
            }
        };
        
        if (projectData) {
             if (window.confirm('Mengimpor proyek baru akan menimpa pekerjaan Anda saat ini. Lanjutkan?')) {
                performImport();
            }
        } else {
             performImport();
        }
    }, [projectData]);

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
        onProjectUpdate,
        startNewProject,
        createProject,
        importProject,
        exportProject,
        loadProject,
        isHumanizingCooldown,
        startHumanizingCooldown,
        activateProject,
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
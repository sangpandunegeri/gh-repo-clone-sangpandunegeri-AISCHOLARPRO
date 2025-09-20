import React from 'react';
import { useProject } from '../contexts/ProjectContext';
import Card from './common/Card';
import CloseIcon from './icons/CloseIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationIcon from './icons/ExclamationIcon';

const ImportPreviewModal: React.FC = () => {
    const { 
        projectData,
        isImportModalOpen, 
        importPreview, 
        importError, 
        importProject, 
        closeImportModal 
    } = useProject();

    if (!isImportModalOpen) {
        return null;
    }

    const handleConfirmImport = () => {
        if (!importPreview) return;
        
        if (projectData && !window.confirm('Mengimpor proyek baru akan menimpa pekerjaan Anda saat ini. Lanjutkan?')) {
            return;
        }
        
        importProject(importPreview);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            aria-labelledby="import-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <Card className="w-full max-w-lg animate-fade-in-down">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        {importError ? (
                            <div className="flex items-center">
                                <ExclamationIcon className="h-7 w-7 mr-3 text-red-500" />
                                <h2 id="import-modal-title" className="text-xl font-bold text-text-primary">
                                    Gagal Mengimpor File
                                </h2>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-7 w-7 mr-3 text-green-500" />
                                <h2 id="import-modal-title" className="text-xl font-bold text-text-primary">
                                    Konfirmasi Impor Proyek
                                </h2>
                            </div>
                        )}
                         <button onClick={closeImportModal} className="p-1 rounded-full hover:bg-slate-200 text-text-secondary">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {importError ? (
                        <div className="space-y-4">
                            <p className="text-text-secondary font-serif">
                                File yang Anda unggah tampaknya rusak atau tidak dalam format yang benar. Harap pastikan Anda menggunakan file <code>.json</code> yang diekspor dari aplikasi ini.
                            </p>
                            <pre className="bg-slate-100 p-3 rounded-md text-sm text-red-700 whitespace-pre-wrap">
                                <code>Detail Kesalahan: {importError}</code>
                            </pre>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={closeImportModal}
                                    className="px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-slate-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    ) : (
                        importPreview && (
                            <div className="space-y-4">
                                <p className="text-text-secondary font-serif">
                                    Anda akan mengimpor proyek berikut. Jika Anda memiliki proyek yang sedang berjalan, progresnya akan ditimpa.
                                </p>
                                <div className="p-4 bg-slate-50 border border-border rounded-lg space-y-2">
                                    <div>
                                        <span className="font-semibold text-text-secondary text-sm">Judul Proyek:</span>
                                        <p className="font-medium text-text-primary">{importPreview.title}</p>
                                    </div>
                                     <div>
                                        <span className="font-semibold text-text-secondary text-sm">Penulis:</span>
                                        <p className="font-medium text-text-primary">{importPreview.authorInfo.studentName}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2 space-x-3">
                                    <button
                                        onClick={closeImportModal}
                                        className="px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                     <button
                                        onClick={handleConfirmImport}
                                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                                    >
                                        Impor Proyek
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ImportPreviewModal;

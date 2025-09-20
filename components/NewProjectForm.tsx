import React from 'react';
import { AuthorInfo } from '../types';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';
import UploadIcon from './icons/UploadIcon';
import CloseIcon from './icons/CloseIcon';
import { useProject } from '../contexts/ProjectContext';

const NewProjectForm: React.FC = () => {
  const { createProject, importProject, isCreatingProject } = useProject();
  const [formData, setFormData] = React.useState({
    title: '',
    studentName: '',
    studentId: '',
    institutionName: '',
    facultyName: '',
    studyProgram: '',
    submissionYear: new Date().getFullYear().toString(),
    academicLevel: 'SARJANA/S1',
  });
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importedFileContent, setImportedFileContent] = React.useState<string | null>(null);
  const [importedFileName, setImportedFileName] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject(formData);
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
        setImportedFileContent(text);
        setImportedFileName(file.name);
      };
      reader.onerror = () => {
        alert("Gagal membaca file.");
        setImportedFileContent(null);
        setImportedFileName(null);
      };
      reader.readAsText(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handlePerformImport = () => {
    if (importedFileContent) {
      importProject(importedFileContent);
    }
  };

  const handleCancelImport = () => {
    setImportedFileContent(null);
    setImportedFileName(null);
  };

  const isFormIncomplete = !formData.title || !formData.studentName || !formData.studentId || !formData.institutionName || !formData.facultyName || !formData.studyProgram || !formData.submissionYear;

  const ImportButton: React.FC = () => (
     <button
        type="button"
        onClick={handleImportClick}
        className={'w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md shadow-sm text-text-primary bg-surface hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'}
    >
        <UploadIcon className="h-5 w-5 mr-2" />
        Buka Proyek dari File
    </button>
  );

  const ImportConfirmation: React.FC = () => (
     <div className={'flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-border w-full sm:w-auto'}>
        <p className="text-sm text-text-secondary truncate max-w-[120px] sm:max-w-[150px]" title={importedFileName || ''}>
            {importedFileName}
        </p>
        <button
            onClick={handlePerformImport}
            className="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark"
        >
            Buka
        </button>
        <button onClick={handleCancelImport} className="p-1 text-slate-400 hover:text-slate-600 rounded-full" title="Batal">
            <CloseIcon className="h-4 w-4" />
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" aria-hidden="true" />
        <header className="text-center mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3.03058C6.93815 3.03058 3.56242 6.57832 2.25 10.5C3.56242 14.4217 6.93815 17.9694 12 17.9694C17.0618 17.9694 20.4376 14.4217 21.75 10.5C20.4376 6.57832 17.0618 3.03058 12 3.03058ZM12 15.75C9.06692 15.75 6.75 13.4331 6.75 10.5C6.75 7.56692 9.06692 5.25 12 5.25C14.9331 5.25 17.25 7.56692 17.25 10.5C17.25 13.4331 14.9331 15.75 12 15.75Z" />
                    <path d="M12 21C9.69612 21 7.4471 20.5752 5.25 19.7259V19.7259C7.45639 20.1832 9.69837 20.4287 12 20.4287C14.3016 20.4287 16.5436 20.1832 18.75 19.7259V19.7259C16.5529 20.5752 14.3039 21 12 21Z" />
                </svg>
                <h1 className="text-4xl font-bold text-text-primary">AI Scholar Pro</h1>
            </div>
            <p className="text-text-secondary font-serif">Asisten Akademik Berbasis AI</p>
        </header>
        <Card>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">Judul Penelitian</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} placeholder="cth: Analisis Pengaruh Media Sosial Terhadap Prestasi Akademik" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-text-primary mb-1">Nama Mahasiswa</label>
                <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleChange} placeholder="cth: Budi Sanjaya" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-text-primary mb-1">Nomor Induk Mahasiswa (NIM)</label>
                <input type="text" name="studentId" id="studentId" value={formData.studentId} onChange={handleChange} placeholder="cth: 1901234567" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="institutionName" className="block text-sm font-medium text-text-primary mb-1">Nama Universitas</label>
                <input type="text" name="institutionName" id="institutionName" value={formData.institutionName} onChange={handleChange} placeholder="cth: Universitas Indonesia" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
               <div>
                <label htmlFor="facultyName" className="block text-sm font-medium text-text-primary mb-1">Nama Fakultas</label>
                <input type="text" name="facultyName" id="facultyName" value={formData.facultyName} onChange={handleChange} placeholder="cth: Fakultas Ilmu Sosial dan Ilmu Politik" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studyProgram" className="block text-sm font-medium text-text-primary mb-1">Program Studi</label>
                <input type="text" name="studyProgram" id="studyProgram" value={formData.studyProgram} onChange={handleChange} placeholder="cth: Ilmu Komunikasi" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
              <div>
                <label htmlFor="submissionYear" className="block text-sm font-medium text-text-primary mb-1">Tahun Ajaran/Pengajuan</label>
                <input type="text" name="submissionYear" id="submissionYear" value={formData.submissionYear} onChange={handleChange} className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="w-full sm:w-auto">
                    {importedFileName ? <ImportConfirmation /> : <ImportButton />}
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                     <select
                        id="academicLevel"
                        name="academicLevel"
                        value={formData.academicLevel}
                        onChange={handleChange}
                        className="px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="SARJANA/S1">Sarjana (S1)</option>
                        <option value="MAGISTER/S2">Magister (S2)</option>
                        <option value="DOKTOR/S3">Doktor (S3)</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isCreatingProject || isFormIncomplete}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isCreatingProject ? <LoadingSpinner /> : <SparklesIcon />}
                        <span className="ml-2">{isCreatingProject ? 'Menginisialisasi...' : 'Buat Proyek'}</span>
                    </button>
                </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewProjectForm;

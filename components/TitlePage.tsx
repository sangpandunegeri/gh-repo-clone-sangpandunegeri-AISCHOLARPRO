import React from 'react';
import Card from './common/Card';
import PageFooter from './common/PageFooter';
import { useProject } from '../contexts/ProjectContext';

const TitlePage: React.FC<{ pageNumber?: string | number; }> = ({ pageNumber }) => {
    const { projectData } = useProject();
    
    if (!projectData) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Halaman Judul</h1>
                    <p className="text-text-secondary font-serif">Buat halaman sampul skripsi Anda.</p>
                </header>
                <Card>
                    <div className="p-6 text-center">
                        <p className="text-text-secondary font-serif">Proyek belum dibuat. Silakan mulai proyek baru.</p>
                    </div>
                </Card>
            </div>
        );
    }
    
    const { title, authorInfo } = projectData;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Halaman Judul</h1>
                <p className="text-text-secondary font-serif">Ini adalah pratinjau halaman judul Anda berdasarkan informasi proyek yang Anda berikan.</p>
            </header>
            
            <Card className="relative">
                <div className="p-8 font-serif text-text-primary leading-loose bg-white aspect-[1/1.414] flex flex-col items-center justify-between">
                    <div className="text-center w-full">
                        <h1 className="font-bold uppercase text-lg">{title}</h1>
                        <p className="mt-4">SKRIPSI</p>
                        <p>Diajukan sebagai salah satu syarat untuk memperoleh gelar Sarjana</p>
                    </div>
                    
                    <div className="text-center w-full my-8">
                         <div className="mx-auto h-28 w-28 flex items-center justify-center bg-slate-200 text-slate-500 text-xs">
                                [Logo Institusi]
                         </div>
                    </div>
                    
                    <div className="text-center w-full">
                        <p className="font-bold uppercase">{authorInfo.studentName}</p>
                        <p className="uppercase">NIM: {authorInfo.studentId}</p>
                    </div>

                    <div className="text-center w-full mt-auto pt-8">
                        <p className="font-bold uppercase">{authorInfo.institutionName}</p>
                        <p className="font-bold uppercase">{authorInfo.facultyName}</p>
                        <p className="font-bold uppercase">{authorInfo.studyProgram}</p>
                        <p className="uppercase">{authorInfo.submissionYear}</p>
                    </div>
                </div>
                {pageNumber && <PageFooter pageNumber={pageNumber} />}
            </Card>
        </div>
    );
};
export default TitlePage;

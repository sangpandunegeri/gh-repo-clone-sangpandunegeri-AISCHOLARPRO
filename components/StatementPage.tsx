import React from 'react';
import { StatementPageData } from '../types';
import Card from './common/Card';
import SaveIcon from './icons/SaveIcon';
import PageFooter from './common/PageFooter';
import { useProject } from '../contexts/ProjectContext';

const StatementPage: React.FC<{ pageNumber?: string | number; }> = ({ pageNumber }) => {
    const { projectData, onProjectUpdate } = useProject();
    const [date, setDate] = React.useState(
        new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    );
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        setDate(projectData?.statementPageData?.statementDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, [projectData]);

    const handleSave = () => {
        if (!projectData) return;
        const newStatementData: StatementPageData = {
            studentName: projectData.authorInfo.studentName,
            studentId: projectData.authorInfo.studentId,
            statementDate: date,
        };
        onProjectUpdate({ ...projectData, statementPageData: newStatementData });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    if (!projectData) {
        return null;
    }
    
    const { authorInfo, title } = projectData;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Halaman Pernyataan Keaslian</h1>
                <p className="text-text-secondary font-serif">Buat surat pernyataan orisinalitas karya tulis ilmiah Anda.</p>
            </header>
            
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Nama Mahasiswa</label>
                            <input type="text" value={authorInfo.studentName} readOnly className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">NIM</label>
                            <input type="text" value={authorInfo.studentId} readOnly className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"/>
                        </div>
                        <div>
                            <label htmlFor="statementDate" className="block text-sm font-medium text-text-primary mb-1">Tanggal Pernyataan</label>
                            <input type="text" name="statementDate" id="statementDate" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                        </div>
                    </div>
                     <div className="flex justify-end mt-6 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <SaveIcon />
                            <span className="ml-2">{isSaved ? 'Tersimpan!' : 'Simpan Data'}</span>
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="relative">
                <div className="p-8 font-serif text-text-primary leading-loose bg-white">
                    <h2 className="text-center font-bold text-lg uppercase">SURAT PERNYATAAN ORISINALITAS</h2>
                    <br />

                    <p className="text-justify">
                        Saya yang bertanda tangan di bawah ini:
                    </p>
                    <table className="w-full my-4">
                        <tbody>
                            <tr><td className="w-1/4 pl-8">Nama</td><td>: {authorInfo.studentName}</td></tr>
                            <tr><td className="pl-8">NIM</td><td>: {authorInfo.studentId}</td></tr>
                        </tbody>
                    </table>

                    <p className="text-justify">
                        Dengan ini menyatakan bahwa skripsi saya yang berjudul <strong>"{title}"</strong> adalah benar-benar karya saya sendiri dan bukan merupakan plagiat atau saduran dari karya orang lain. Apabila di kemudian hari terbukti bahwa pernyataan ini tidak benar, saya bersedia menerima sanksi akademik sesuai dengan peraturan yang berlaku.
                    </p>
                    <br /><br />
                    
                    <p className="text-justify">
                        Demikian surat pernyataan ini saya buat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya.
                    </p>
                    <br /><br />

                    <div className="flex justify-end">
                        <div className="text-left w-2/5">
                            <p>Jakarta, {date}</p>
                            <p>Yang menyatakan,</p>
                            <br />
                            <p className="h-10 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">Materai 10000</p>
                            <br />
                            <p><strong>{authorInfo.studentName}</strong></p>
                            <p>NIM. {authorInfo.studentId}</p>
                        </div>
                    </div>
                </div>
                {pageNumber && <PageFooter pageNumber={pageNumber} />}
            </Card>
        </div>
    );
};
export default StatementPage;

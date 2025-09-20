import React from 'react';
import { ApprovalData } from '../types';
import Card from './common/Card';
import SaveIcon from './icons/SaveIcon';
import PageFooter from './common/PageFooter';
import { useProject } from '../contexts/ProjectContext';

const ApprovalPage: React.FC<{ pageNumber?: string | number; }> = ({ pageNumber }) => {
    const { projectData, onProjectUpdate } = useProject();

    const [formData, setFormData] = React.useState<Omit<ApprovalData, 'studentName' | 'studentId' | 'studyProgram'>>({
        supervisor1Name: '',
        supervisor1Id: '',
        supervisor2Name: '',
        supervisor2Id: '',
        approvalDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        if (projectData?.approvalData) {
            // Ensure we don't spread the entire authorInfo into the form state
            const { studentName, studentId, studyProgram, ...restOfApprovalData } = projectData.approvalData;
            setFormData(restOfApprovalData);
        }
    }, [projectData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!projectData) return;
        const fullApprovalData: ApprovalData = {
            ...formData,
            studentName: projectData.authorInfo.studentName,
            studentId: projectData.authorInfo.studentId,
            studyProgram: projectData.authorInfo.studyProgram,
        };
        onProjectUpdate({ ...projectData, approvalData: fullApprovalData });
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
                <h1 className="text-3xl font-bold text-text-primary mb-2">Halaman Persetujuan</h1>
                <p className="text-text-secondary font-serif">Isi detail berikut untuk membuat lembar persetujuan skripsi.</p>
            </header>
            
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Nama Mahasiswa</label>
                                <input type="text" value={authorInfo.studentName} readOnly className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">NIM</label>
                                <input type="text" value={authorInfo.studentId} readOnly className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Program Studi</label>
                                <input type="text" value={authorInfo.studyProgram} readOnly className="w-full px-3 py-2 bg-slate-100 text-text-secondary border border-border rounded-md shadow-sm cursor-default"/>
                            </div>
                            <div>
                                <label htmlFor="approvalDate" className="block text-sm font-medium text-text-primary mb-1">Tanggal Persetujuan</label>
                                <input type="text" name="approvalDate" id="approvalDate" value={formData.approvalDate} onChange={handleChange} placeholder="cth: 17 Agustus 2024" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                            </div>
                        </div>
                        {/* Column 2 */}
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="supervisor1Name" className="block text-sm font-medium text-text-primary mb-1">Nama Pembimbing I</label>
                                <input type="text" name="supervisor1Name" id="supervisor1Name" value={formData.supervisor1Name} onChange={handleChange} placeholder="cth: Dr. Rina Purnamasari, M.Si." className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                            </div>
                            <div>
                                <label htmlFor="supervisor1Id" className="block text-sm font-medium text-text-primary mb-1">NIP Pembimbing I</label>
                                <input type="text" name="supervisor1Id" id="supervisor1Id" value={formData.supervisor1Id} onChange={handleChange} placeholder="cth: 197801012005012001" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                            </div>
                             <div>
                                <label htmlFor="supervisor2Name" className="block text-sm font-medium text-text-primary mb-1">Nama Pembimbing II (Opsional)</label>
                                <input type="text" name="supervisor2Name" id="supervisor2Name" value={formData.supervisor2Name} onChange={handleChange} placeholder="cth: Budi Hartono, S.Kom., M.Kom." className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                            </div>
                            <div>
                                <label htmlFor="supervisor2Id" className="block text-sm font-medium text-text-primary mb-1">NIP Pembimbing II (Opsional)</label>
                                <input type="text" name="supervisor2Id" id="supervisor2Id" value={formData.supervisor2Id} onChange={handleChange} placeholder="cth: 198502022010121002" className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end mt-6 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!formData.supervisor1Name || !formData.supervisor1Id || !formData.approvalDate}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <SaveIcon />
                            <span className="ml-2">{isSaved ? 'Tersimpan!' : 'Simpan Data'}</span>
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="relative">
                <div className="p-8 font-serif text-text-primary leading-loose bg-white">
                    <h2 className="text-center font-bold text-lg uppercase">LEMBAR PERSETUJUAN</h2>
                    <br /><br />

                    <p className="text-justify indent-8">
                        Skripsi dengan judul <strong>"{title}"</strong> yang disusun oleh:
                    </p>
                    <table className="w-full my-4">
                        <tbody>
                            <tr><td className="w-1/4 pl-8">Nama</td><td>: {authorInfo.studentName}</td></tr>
                            <tr><td className="pl-8">NIM</td><td>: {authorInfo.studentId}</td></tr>
                            <tr><td className="pl-8">Program Studi</td><td>: {authorInfo.studyProgram}</td></tr>
                        </tbody>
                    </table>

                    <p className="text-justify">
                        telah diperiksa dan disetujui untuk diajukan dalam sidang ujian skripsi.
                    </p>
                    <br /><br />

                    <p>{formData.approvalDate || '[Tanggal Persetujuan]'}</p>
                    <br />

                    <div className="flex justify-around">
                        <div className="text-center w-1/2">
                            <p>Pembimbing I,</p>
                            <br /><br /><br /><br />
                            <p><strong>{formData.supervisor1Name || '[Nama Pembimbing I]'}</strong></p>
                            <p>NIP. {formData.supervisor1Id || '[NIP Pembimbing I]'}</p>
                        </div>
                        {formData.supervisor2Name && (
                            <div className="text-center w-1/2">
                                <p>Pembimbing II,</p>
                                <br /><br /><br /><br />
                                <p><strong>{formData.supervisor2Name}</strong></p>
                                <p>NIP. {formData.supervisor2Id}</p>
                            </div>
                        )}
                    </div>
                </div>
                 {pageNumber && <PageFooter pageNumber={pageNumber} />}
            </Card>
        </div>
    );
};
export default ApprovalPage;

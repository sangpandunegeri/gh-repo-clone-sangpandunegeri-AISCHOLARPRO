import React from 'react';
import { AppendixItem, ChartData } from '../types';
import Card from './common/Card';
import { generateHtmlTable, generateChartData } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';
import TrashIcon from './icons/TrashIcon';
import RenderChartComponent from './common/RenderChartComponent';
import { useProject } from '../contexts/ProjectContext';


const Appendices: React.FC = () => {
  const { projectData, onProjectUpdate } = useProject();

  // State for Table Generator
  const [tableTitle, setTableTitle] = React.useState('');
  const [tableDescription, setTableDescription] = React.useState('');
  const [generatedTable, setGeneratedTable] = React.useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = React.useState(false);

  // State for Chart Generator
  const [chartTitle, setChartTitle] = React.useState('');
  const [chartDescription, setChartDescription] = React.useState('');
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'pie' | ''>('');
  const [generatedChartData, setGeneratedChartData] = React.useState<ChartData | null>(null);
  const [isChartLoading, setIsChartLoading] = React.useState(false);
  const [chartError, setChartError] = React.useState<string | null>(null);


  const handleGenerateTable = async () => {
    if (!tableDescription.trim()) return;
    setIsTableLoading(true);
    setGeneratedTable(null);
    try {
      const tableHtml = await generateHtmlTable(tableDescription);
      setGeneratedTable(tableHtml);
    } catch (error) {
      console.error("Failed to generate table:", error);
      setGeneratedTable('<p class="text-red-500">Gagal membuat tabel. Silakan coba lagi.</p>');
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleSaveTableAppendix = () => {
    if (!projectData || !tableTitle.trim() || !generatedTable) return;
    const newAppendix: AppendixItem = {
      id: `appendix_table_${Date.now()}`,
      title: tableTitle,
      type: 'table',
      content: generatedTable,
    };
    const updatedAppendices = [...(projectData.appendices || []), newAppendix];
    onProjectUpdate({ ...projectData, appendices: updatedAppendices });
    
    // Reset form
    setTableTitle('');
    setTableDescription('');
    setGeneratedTable(null);
  };

  const handleGenerateChart = async () => {
    if (!chartDescription.trim()) return;
    setIsChartLoading(true);
    setGeneratedChartData(null);
    setChartError(null);
    try {
        const selectedChartType = chartType === '' ? undefined : chartType;
        const chartData = await generateChartData(chartDescription, selectedChartType);
        setGeneratedChartData(chartData);
    } catch (error) {
        console.error("Failed to generate chart data:", error);
        setChartError((error as Error).message || 'Gagal membuat data bagan.');
        setGeneratedChartData(null);
    } finally {
        setIsChartLoading(false);
    }
  };

  const handleSaveChartAppendix = () => {
    if (!projectData || !chartTitle.trim() || !generatedChartData) return;
    const newAppendix: AppendixItem = {
      id: `appendix_chart_${Date.now()}`,
      title: chartTitle,
      type: 'chart',
      content: JSON.stringify(generatedChartData),
    };
    const updatedAppendices = [...(projectData.appendices || []), newAppendix];
    onProjectUpdate({ ...projectData, appendices: updatedAppendices });

    // Reset form
    setChartTitle('');
    setChartDescription('');
    setChartType('');
    setGeneratedChartData(null);
    setChartError(null);
  };

  const handleDeleteAppendix = (appendixId: string) => {
    if (!projectData || !window.confirm('Apakah Anda yakin ingin menghapus lampiran ini?')) return;
    
    const updatedAppendices = projectData.appendices.filter(app => app.id !== appendixId);
    onProjectUpdate({ ...projectData, appendices: updatedAppendices });
  };

  const bibliography = projectData?.bibliography || [];
  const appendices = projectData?.appendices || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Lampiran</h1>
        <p className="text-text-secondary font-serif">Kelola materi pendukung dan daftar pustaka akhir untuk proyek Anda.</p>
      </header>
      
      {!projectData && (
         <Card>
            <div className="p-6 text-center">
                 <p className="text-text-secondary font-serif">Silakan mulai proyek baru untuk menggunakan fitur lampiran.</p>
            </div>
        </Card>
      )}
      
      {projectData && (
        <>
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Buat Lampiran Tabel Statistik</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="appendixTitle" className="block text-sm font-medium text-text-primary mb-1">Judul Lampiran</label>
                            <input
                            id="appendixTitle"
                            type="text"
                            value={tableTitle}
                            onChange={(e) => setTableTitle(e.target.value)}
                            placeholder="cth: Tabel 1. Karakteristik Responden"
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                         <div>
                            <label htmlFor="dataDescription" className="block text-sm font-medium text-text-primary mb-1">Deskripsi Data untuk Tabel</label>
                            <textarea
                            id="dataDescription"
                            value={tableDescription}
                            onChange={(e) => setTableDescription(e.target.value)}
                            rows={4}
                            placeholder="cth: Buat tabel demografi responden dengan kolom untuk Jenis Kelamin (Laki-laki, Perempuan), Usia (dalam rentang), dan Tingkat Pendidikan (SMA, S1, S2)."
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                         <div className="flex justify-end">
                            <button
                            type="button"
                            onClick={handleGenerateTable}
                            disabled={isTableLoading || !tableDescription.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                            {isTableLoading ? <LoadingSpinner size="h-5 w-5"/> : <SparklesIcon />}
                            <span className="ml-2">{isTableLoading ? 'Membuat...' : 'Buat Tabel'}</span>
                            </button>
                        </div>
                    </div>
                     {(isTableLoading || generatedTable) && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Pratinjau Tabel</h3>
                            {isTableLoading && (
                                <div className="flex items-center justify-center text-text-secondary py-4">
                                    <LoadingSpinner size="h-6 w-6" color="text-primary"/>
                                    <p className="ml-2">AI sedang membuat tabel Anda...</p>
                                </div>
                            )}
                            {generatedTable && !isTableLoading && (
                                <>
                                <div className="prose prose-sm max-w-none border border-border rounded-md p-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: generatedTable }} />
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveTableAppendix}
                                        disabled={!tableTitle.trim()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-400 disabled:cursor-not-allowed"
                                    >
                                    Simpan ke Proyek
                                    </button>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Buat Lampiran Bagan Kustom</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="chartTitle" className="block text-sm font-medium text-text-primary mb-1">Judul Bagan</label>
                            <input
                            id="chartTitle"
                            type="text"
                            value={chartTitle}
                            onChange={(e) => setChartTitle(e.target.value)}
                            placeholder="cth: Gambar 1. Perbandingan Penjualan"
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="chartDescription" className="block text-sm font-medium text-text-primary mb-1">Deskripsi Data untuk Bagan</label>
                            <textarea
                            id="chartDescription"
                            value={chartDescription}
                            onChange={(e) => setChartDescription(e.target.value)}
                            rows={4}
                            placeholder="cth: Buat bagan batang yang menunjukkan penjualan produk A, B, dan C selama empat kuartal terakhir."
                            className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="chartType" className="block text-sm font-medium text-text-primary mb-1">Tipe Bagan (Opsional)</label>
                             <select
                                id="chartType"
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'pie' | '')}
                                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                              >
                                <option value="">Biarkan AI yang Menentukan</option>
                                <option value="bar">Bar Chart</option>
                                <option value="line">Line Chart</option>
                                <option value="pie">Pie Chart</option>
                              </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                            type="button"
                            onClick={handleGenerateChart}
                            disabled={isChartLoading || !chartDescription.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                            {isChartLoading ? <LoadingSpinner size="h-5 w-5"/> : <SparklesIcon />}
                            <span className="ml-2">{isChartLoading ? 'Membuat...' : 'Buat Bagan'}</span>
                            </button>
                        </div>
                    </div>
                     {(isChartLoading || generatedChartData || chartError) && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Pratinjau Bagan</h3>
                            {isChartLoading && (
                                <div className="flex items-center justify-center text-text-secondary py-4">
                                    <LoadingSpinner size="h-6 w-6" color="text-primary"/>
                                    <p className="ml-2">AI sedang menganalisis dan memvisualisasikan data Anda...</p>
                                </div>
                            )}
                            {chartError && !isChartLoading && (
                                <p className="text-red-600 bg-red-100 p-3 rounded-md font-medium">{chartError}</p>
                            )}
                            {generatedChartData && !isChartLoading && (
                                <>
                                <RenderChartComponent data={generatedChartData} />
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveChartAppendix}
                                        disabled={!chartTitle.trim()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-400 disabled:cursor-not-allowed"
                                    >
                                    Simpan ke Proyek
                                    </button>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Lampiran Tersimpan</h2>
                    {appendices.length > 0 ? (
                        <div className="space-y-4">
                            {appendices.map(app => (
                                <div key={app.id} className="p-4 border border-border rounded-lg bg-slate-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-primary">{app.title}</h3>
                                        <button 
                                            onClick={() => handleDeleteAppendix(app.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                                            title="Hapus Lampiran"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {app.type === 'chart' ? (
                                        (() => {
                                            try {
                                                const chartData = JSON.parse(app.content) as ChartData;
                                                return <RenderChartComponent data={chartData} />;
                                            } catch (e) {
                                                return <p className="text-red-500">Gagal merender bagan.</p>;
                                            }
                                        })()
                                    ) : (
                                        <div className="prose prose-sm max-w-none overflow-x-auto" dangerouslySetInnerHTML={{ __html: app.content }}/>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                            <p className="text-text-secondary font-serif">Belum ada lampiran kustom yang dibuat.</p>
                            <p className="text-sm text-text-secondary">Gunakan generator di atas untuk membuat lampiran baru.</p>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">DAFTAR PUSTAKA</h2>
                    {bibliography.length > 0 ? (
                        <ul className="space-y-3">
                        {bibliography.map((item) => (
                            <li key={item.id} className="font-serif text-text-primary text-justify" dangerouslySetInnerHTML={{ __html: item.apa }} />
                        ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                            <p className="text-text-secondary font-serif">Daftar pustaka masih kosong.</p>
                             <p className="text-sm text-text-secondary">Buat draf bab untuk mengisinya secara otomatis.</p>
                        </div>
                    )}
                </div>
            </Card>
        </>
      )}
    </div>
  );
};

export default Appendices;

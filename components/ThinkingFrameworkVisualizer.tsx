import React from 'react';
import { AppendixItem, ChartData } from '../types';
import Card from './common/Card';
import { generateThinkingFrameworkChart } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';
import RenderChartComponent from './common/RenderChartComponent';
import { useProject } from '../contexts/ProjectContext';

const ThinkingFrameworkVisualizer: React.FC = () => {
  const { projectData, onProjectUpdate } = useProject();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [generatedChart, setGeneratedChart] = React.useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePopulateFramework = () => {
    if (projectData?.outline?.thinkingFramework) {
      setDescription(projectData.outline.thinkingFramework);
      setTitle('Bagan Kerangka Pemikiran Penelitian');
    }
  };

  const handleGenerateChart = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setGeneratedChart(null);
    setError(null);
    try {
      const chartData = await generateThinkingFrameworkChart(description);
      setGeneratedChart(chartData);
    } catch (err) {
      console.error("Failed to generate thinking framework chart data:", err);
      setError((err as Error).message || 'Gagal membuat data bagan kerangka pemikiran.');
      setGeneratedChart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppendix = () => {
    if (!projectData || !title.trim() || !generatedChart) return;
    const newAppendix: AppendixItem = {
      id: `appendix_chart_${Date.now()}`,
      title: title,
      type: 'chart',
      content: JSON.stringify(generatedChart),
    };
    const updatedAppendices = [...(projectData.appendices || []), newAppendix];
    onProjectUpdate({ ...projectData, appendices: updatedAppendices });

    // Reset form
    setTitle('');
    setDescription('');
    setGeneratedChart(null);
    setError(null);
    alert('Bagan berhasil disimpan ke lampiran!');
  };
  
  if (!projectData) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Visualisasi Kerangka Pemikiran</h1>
                <p className="text-text-secondary font-serif">Alat untuk mengubah deskripsi kerangka pemikiran Anda menjadi bagan visual.</p>
            </header>
            <Card>
                <div className="p-6 text-center">
                    <p className="text-text-secondary font-serif">Silakan mulai proyek baru untuk menggunakan fitur ini.</p>
                </div>
            </Card>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Visualisasi Kerangka Pemikiran</h1>
        <p className="text-text-secondary font-serif">Ubah deskripsi naratif kerangka pemikiran Anda menjadi bagan batang visual untuk memperjelas hubungan antar variabel.</p>
      </header>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Generator Bagan</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">Judul Bagan</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Gambar 2. Kerangka Pemikiran Penelitian"
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-text-primary">Deskripsi Kerangka Pemikiran</label>
                {projectData?.outline?.thinkingFramework && (
                  <button type="button" onClick={handlePopulateFramework} className="text-xs font-semibold text-primary hover:underline">
                    Gunakan dari Kerangka Proyek
                  </button>
                )}
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="cth: Variabel Media Sosial (X) berpengaruh langsung terhadap Prestasi Akademik (Y). Pengaruh ini dimediasi oleh variabel Motivasi Belajar (Z)."
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateChart}
                disabled={isLoading || !description.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="h-5 w-5" /> : <SparklesIcon />}
                <span className="ml-2">{isLoading ? 'Membuat...' : 'Buat Bagan'}</span>
              </button>
            </div>
          </div>
          {(isLoading || generatedChart || error) && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Pratinjau Bagan</h3>
              {isLoading && (
                <div className="flex items-center justify-center text-text-secondary py-4">
                  <LoadingSpinner size="h-6 w-6" color="text-primary" />
                  <p className="ml-2">AI sedang memvisualisasikan kerangka pemikiran Anda...</p>
                </div>
              )}
              {error && !isLoading && (
                <p className="text-red-600 bg-red-100 p-3 rounded-md font-medium">{error}</p>
              )}
              {generatedChart && !isLoading && (
                <>
                  <RenderChartComponent data={generatedChart} />
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleSaveAppendix}
                      disabled={!title.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      Simpan ke Lampiran
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ThinkingFrameworkVisualizer;

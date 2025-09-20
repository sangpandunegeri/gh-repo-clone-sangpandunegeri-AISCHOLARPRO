import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { suggestStatistic } from '../services/geminiService';
import { StatisticSuggestion } from '../types';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';

const StatsHelper: React.FC = () => {
  const [variables, setVariables] = React.useState('');
  const [dataType, setDataType] = React.useState('');
  const [objective, setObjective] = React.useState('');
  const [suggestion, setSuggestion] = React.useState<StatisticSuggestion | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestion(null);
    setError(null);
    try {
      const result = await suggestStatistic(variables, dataType, objective);
      setSuggestion(result);
    } catch (err) {
      setError((err as Error).message || 'Gagal mendapatkan rekomendasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormIncomplete = !variables || !dataType || !objective;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Asisten Statistik</h1>
        <p className="text-text-secondary font-serif">Dapatkan rekomendasi uji statistik yang tepat untuk data penelitian Anda.</p>
      </header>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="variables" className="block text-sm font-medium text-text-primary mb-1">Variabel Penelitian</label>
            <textarea
              id="variables"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              rows={3}
              placeholder="cth: Variabel independen: Intensitas Penggunaan Media Sosial. Variabel dependen: Tingkat Prestasi Akademik."
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dataType" className="block text-sm font-medium text-text-primary mb-1">Jenis Data</label>
              <select
                id="dataType"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Pilih Jenis Data</option>
                <option value="Nominal">Nominal</option>
                <option value="Ordinal">Ordinal</option>
                <option value="Interval">Interval</option>
                <option value="Rasio">Rasio</option>
              </select>
            </div>
             <div>
              <label htmlFor="objective" className="block text-sm font-medium text-text-primary mb-1">Tujuan Analisis</label>
              <input
                id="objective"
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="cth: Menguji hubungan, melihat perbedaan rata-rata"
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isFormIncomplete}
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
              <span className="ml-2">{isLoading ? 'Menganalisis...' : 'Dapatkan Rekomendasi'}</span>
            </button>
          </div>
        </form>
      </Card>

      {(isLoading || suggestion || error) && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Rekomendasi Uji Statistik</h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-text-secondary py-10">
                <LoadingSpinner size="h-8 w-8" color="text-primary"/>
                <p className="mt-4 font-serif">AI sedang melakukan perhitungan... Mohon tunggu.</p>
              </div>
            )}
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md font-medium">{error}</p>}
            {suggestion && !isLoading && (
               <>
                <div className="space-y-4 font-serif text-text-primary">
                    <div>
                        <h4 className="font-sans font-bold text-md text-text-secondary uppercase tracking-wider">Uji Statistik</h4>
                        <p className="text-lg">{suggestion.recommendation}</p>
                    </div>
                    <div>
                        <h4 className="font-sans font-bold text-md text-text-secondary uppercase tracking-wider">Alasan Pemilihan</h4>
                        <p>{suggestion.reason}</p>
                    </div>
                    <div>
                        <h4 className="font-sans font-bold text-md text-text-secondary uppercase tracking-wider">Formula Matematis</h4>
                        <pre className="bg-slate-100 p-3 rounded-md text-sm whitespace-pre-wrap mt-1"><code>{suggestion.formula}</code></pre>
                    </div>
                    <div>
                        <h4 className="font-sans font-bold text-md text-text-secondary uppercase tracking-wider">Keterangan Simbol</h4>
                        <pre className="bg-slate-100 p-3 rounded-md text-sm whitespace-pre-wrap mt-1"><code>{suggestion.symbols}</code></pre>
                    </div>
                </div>
                
                {suggestion.visualizationData && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Visualisasi Data Hipotetis</h3>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <ResponsiveContainer width="100%" height={300}>
                          {suggestion.visualizationData.type === 'bar' ? (
                            <BarChart data={suggestion.visualizationData.data.map(d => ({ name: d.name, [suggestion.visualizationData.dataKey]: d.value }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" stroke="#475569" />
                              <YAxis stroke="#475569" />
                              <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                              <Legend />
                              <Bar dataKey={suggestion.visualizationData.dataKey} fill="#1D4ED8" />
                            </BarChart>
                          ) : (
                            <LineChart data={suggestion.visualizationData.data.map(d => ({ name: d.name, [suggestion.visualizationData.dataKey]: d.value }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" stroke="#475569" />
                              <YAxis stroke="#475569" />
                              <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                              <Legend />
                              <Line type="monotone" dataKey={suggestion.visualizationData.dataKey} stroke="#1D4ED8" activeDot={{ r: 8 }} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsHelper;
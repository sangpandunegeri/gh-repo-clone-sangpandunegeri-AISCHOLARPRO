import React from 'react';
import { paraphraseText, checkGrammar, checkSimilarity } from '../services/geminiService';
import { SimilarityResult } from '../types';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';

type Tool = 'paraphrase' | 'grammar' | 'similarity';

const PlagiarismChecker: React.FC = () => {
  const [inputText, setInputText] = React.useState('');
  const [activeTool, setActiveTool] = React.useState<Tool>('paraphrase');
  const [result, setResult] = React.useState<string | SimilarityResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let apiResult: string | SimilarityResult;
      switch (activeTool) {
        case 'paraphrase':
          apiResult = await paraphraseText(inputText);
          break;
        case 'grammar':
          apiResult = await checkGrammar(inputText);
          break;
        case 'similarity':
          apiResult = await checkSimilarity(inputText);
          break;
        default:
          throw new Error('Alat tidak valid dipilih.');
      }
      setResult(apiResult);
    } catch (err) {
      setError((err as Error).message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getToolDescription = (tool: Tool) => {
      switch(tool) {
          case 'paraphrase': return 'Tulis ulang naskah Anda untuk meningkatkan keaslian dan alur tulisan.';
          case 'grammar': return 'Periksa dan perbaiki kesalahan tata bahasa dan ejaan pada naskah Anda.';
          case 'similarity': return 'Perkirakan persentase kesamaan naskah Anda dengan sumber online.';
      }
  }

  const renderResult = () => {
    if (!result) return null;

    if (activeTool === 'similarity' && typeof result === 'object') {
      const similarityResult = result as SimilarityResult;
      const percentage = similarityResult.similarity_percentage;
      const progressColor = percentage > 60 ? 'bg-red-500' : percentage > 30 ? 'bg-amber-500' : 'bg-green-500';

      return (
        <div className="space-y-4">
          <p className="font-serif text-text-primary">{similarityResult.summary}</p>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div
              className={`${progressColor} h-4 rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-right text-lg font-bold text-text-primary">{percentage.toFixed(2)}% Kesamaan</p>
          {similarityResult.sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Sumber Teridentifikasi:</h4>
              <ul className="list-disc list-inside space-y-2">
                {similarityResult.sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (typeof result === 'string') {
        return <div className="prose prose-sm max-w-none font-serif" dangerouslySetInnerHTML={{ __html: result }} />;
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Pemeriksa Orisinalitas</h1>
        <p className="text-text-secondary font-serif">{getToolDescription(activeTool)}</p>
      </header>

      <Card>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="inputText" className="sr-only">Teks untuk dianalisis</label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              placeholder="Tempelkan naskah Anda di sini..."
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary font-serif"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-2 p-1 bg-slate-100 rounded-lg">
              {(['paraphrase', 'grammar', 'similarity'] as Tool[]).map(tool => (
                <button
                  key={tool}
                  onClick={() => setActiveTool(tool)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTool === tool ? 'bg-white text-primary shadow' : 'text-text-secondary hover:bg-slate-200'
                  }`}
                >
                  {tool === 'paraphrase' ? 'Parafrase' : tool === 'grammar' ? 'Tata Bahasa' : 'Cek Kesamaan'}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleProcess}
              disabled={isLoading || !inputText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
              <span className="ml-2">{isLoading ? 'Menganalisis...' : 'Proses Teks'}</span>
            </button>
          </div>
        </div>
      </Card>
      
      {(isLoading || result || error) && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Hasil Analisis</h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-text-secondary py-10">
                <LoadingSpinner size="h-8 w-8" color="text-primary"/>
                <p className="mt-4 font-serif">AI sedang bekerja... Mohon tunggu sebentar.</p>
              </div>
            )}
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md font-medium">{error}</p>}
            {!isLoading && result && renderResult()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlagiarismChecker;

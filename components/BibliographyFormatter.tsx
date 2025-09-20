import React from 'react';
import { formatBibliography } from '../services/geminiService';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import SparklesIcon from './icons/SparklesIcon';
import { BibliographyItem } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import { useProject } from '../contexts/ProjectContext';

type SourceType = 'buku' | 'jurnal' | 'situs_web';

const sourceFields: Record<SourceType, { key: string; label: string; placeholder: string }[]> = {
  buku: [
    { key: 'penulis', label: 'Penulis', placeholder: 'cth: Haryatmoko' },
    { key: 'tahun', label: 'Tahun Terbit', placeholder: 'cth: 2011' },
    { key: 'judul', label: 'Judul Buku', placeholder: 'cth: Etika Komunikasi' },
    { key: 'kota', label: 'Kota Penerbit', placeholder: 'cth: Yogyakarta' },
    { key: 'penerbit', label: 'Nama Penerbit', placeholder: 'cth: Kanisius' },
  ],
  jurnal: [
    { key: 'penulis', label: 'Penulis', placeholder: 'cth: Lestari, P., & Susanto, E. H.' },
    { key: 'tahun', label: 'Tahun Publikasi', placeholder: 'cth: 2019' },
    { key: 'judul_artikel', label: 'Judul Artikel', placeholder: 'cth: Pengaruh Terpaan...' },
    { key: 'nama_jurnal', label: 'Nama Jurnal', placeholder: 'cth: Jurnal Komunikasi' },
    { key: 'volume', label: 'Volume', placeholder: 'cth: 13' },
    { key: 'nomor', label: 'Nomor', placeholder: 'cth: 2' },
    { key: 'halaman', label: 'Halaman', placeholder: 'cth: 123-135' },
  ],
  situs_web: [
    { key: 'penulis', label: 'Penulis/Organisasi', placeholder: 'cth: Badan Pusat Statistik' },
    { key: 'tahun', label: 'Tahun Publikasi', placeholder: 'cth: 2023' },
    { key: 'judul_halaman', label: 'Judul Halaman/Artikel', placeholder: 'cth: Indeks Pembangunan Manusia' },
    { key: 'nama_situs', label: 'Nama Situs Web', placeholder: 'cth: BPS' },
    { key: 'url', label: 'URL', placeholder: 'https://...' },
  ],
};

const BibliographyManager: React.FC = () => {
  const { projectData, onProjectUpdate } = useProject();
  const [sourceType, setSourceType] = React.useState<SourceType>('buku');
  const [details, setDetails] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const currentFields = React.useMemo(() => sourceFields[sourceType], [sourceType]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as SourceType;
    setSourceType(newType);
    setDetails({});
  };

  const handleDetailChange = (key: string, value: string) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };
  
  const isFormIncomplete = currentFields.some(field => !details[field.key]);
  
  const getCanonicalString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData) return;

    setIsLoading(true);
    try {
      const result = await formatBibliography(sourceType, details);
      
      const isDuplicate = projectData.bibliography.some(
          item => getCanonicalString(item.apa) === getCanonicalString(result)
      );

      if (isDuplicate) {
          alert('Sumber ini tampaknya sudah ada dalam daftar pustaka Anda.');
          setIsLoading(false);
          return;
      }

      const newItem: BibliographyItem = {
        id: `manual_${Date.now()}`,
        apa: result,
      };

      const updatedBibliography = [...projectData.bibliography, newItem];
      onProjectUpdate({ ...projectData, bibliography: updatedBibliography });
      setDetails({}); // Reset form
    } catch (error) {
      console.error('Failed to format and add bibliography item:', error);
      alert('Gagal memformat sumber. Silakan periksa kembali detail yang Anda masukkan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (item: BibliographyItem) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = item.apa;
    const plainText = tempEl.textContent || tempEl.innerText || '';

    navigator.clipboard.writeText(plainText.trim());
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const bibliography = projectData?.bibliography || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Manajer Daftar Pustaka (APA 7)</h1>
        <p className="text-text-secondary font-serif">Lihat daftar pustaka yang terkumpul dari semua bab atau tambahkan sumber baru secara manual.</p>
      </header>

      <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Daftar Pustaka Proyek ({bibliography.length})</h2>
            {bibliography.length > 0 ? (
                <ul className="space-y-4">
                    {bibliography.map((item) => (
                        <li key={item.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-border">
                           <p className="font-serif text-text-primary pr-4" dangerouslySetInnerHTML={{ __html: item.apa }} />
                           <button 
                                onClick={() => handleCopy(item)}
                                className="flex-shrink-0 p-2 rounded-full hover:bg-slate-200 transition-colors"
                                title="Salin"
                            >
                               {copiedId === item.id ? 
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg> :
                                 <ClipboardIcon className="h-5 w-5 text-text-secondary" />
                                }
                           </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                    <p className="text-text-secondary font-serif">Daftar pustaka masih kosong.</p>
                    <p className="text-sm text-text-secondary">Buat draf bab untuk mengisinya secara otomatis, atau tambahkan sumber secara manual di bawah ini.</p>
                </div>
            )}
          </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Tambah Sumber Manual</h2>
          <div className="mb-6">
            <label htmlFor="sourceType" className="block text-sm font-medium text-text-primary mb-1">Jenis Sumber</label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={handleTypeChange}
              className="w-full md:w-1/2 px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="buku">Buku</option>
              <option value="jurnal">Artikel Jurnal</option>
              <option value="situs_web">Situs Web</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {currentFields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-text-primary mb-1">{label}</label>
                <input
                  id={key}
                  type="text"
                  value={details[key] || ''}
                  onChange={(e) => handleDetailChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isFormIncomplete || !projectData}
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
              <span className="ml-2">{isLoading ? 'Memformat...' : 'Tambah ke Proyek'}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BibliographyManager;

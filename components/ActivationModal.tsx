import React from 'react';
import { useProject } from '../contexts/ProjectContext';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import CloseIcon from './icons/CloseIcon';
import KeyIcon from './icons/KeyIcon';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activateProject } = useProject();
  const [serialKey, setSerialKey] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSerialKey('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleVerify = () => {
    if (!serialKey.trim()) {
      setError('Kunci serial tidak boleh kosong.');
      return;
    }
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const success = activateProject(serialKey);
      if (success) {
        onSuccess();
      } else {
        setError('Kunci serial tidak valid atau salah.');
        setIsLoading(false);
      }
    }, 500); // Simulate network delay for better UX
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      aria-labelledby="activation-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md animate-fade-in-down">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="activation-modal-title" className="text-xl font-bold text-text-primary flex items-center">
              <KeyIcon className="h-6 w-6 mr-3 text-accent" />
              Aktivasi Diperlukan
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-text-secondary">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-text-secondary font-serif mb-4">
            Untuk melanjutkan pembuatan draf ke Bab III dan seterusnya, harap masukkan kunci serial Anda.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="serialKey" className="sr-only">Kunci Serial</label>
              <input
                id="serialKey"
                type="text"
                value={serialKey}
                onChange={(e) => setSerialKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan kunci serial di sini..."
                className={`w-full px-3 py-2 bg-surface text-text-primary border rounded-md shadow-sm focus:ring-primary focus:border-primary ${error ? 'border-red-500' : 'border-border'}`}
                autoFocus
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : null}
              <span className={isLoading ? 'ml-2' : ''}>Verifikasi</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivationModal;
import React from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import UserIcon from './icons/UserIcon';
import { humanizeText } from '../services/geminiService';
import { ProjectData } from '../types';
import { useProject } from '../contexts/ProjectContext';

type OutlineField = keyof ProjectData['outline'];

interface ResearchOutlineFormProps {
  outline: ProjectData['outline'];
  onOutlineChange: (field: OutlineField, value: string) => void;
  isLocked: boolean;
}

const ResearchOutlineForm: React.FC<ResearchOutlineFormProps> = ({ outline, onOutlineChange, isLocked }) => {
  const { isHumanizingCooldown, startHumanizingCooldown } = useProject();
  const [isHumanizing, setIsHumanizing] = React.useState({
    background: false,
    problem: false,
    objective: false,
    benefits: false,
    writingSystematics: false,
    thinkingFramework: false,
  });

  const handleHumanize = async (field: OutlineField) => {
    if (isLocked || !outline[field]?.trim() || isHumanizingCooldown) return;

    setIsHumanizing(prev => ({ ...prev, [field]: true }));
    startHumanizingCooldown();
    try {
      const humanizedText = await humanizeText(outline[field]);
      onOutlineChange(field, humanizedText);
    } catch (error) {
      console.error(`Failed to humanize ${field}:`, error);
      alert((error as Error).message);
    } finally {
      setIsHumanizing(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="pt-4">
      <p className="text-sm font-medium text-text-primary mb-4">Kerangka Penelitian (Dikunci setelah Bab I dibuat)</p>
      <div className="space-y-6">
        <div>
          <label htmlFor="background" className="block text-sm font-medium text-text-primary mb-1">Latar Belakang</label>
          <div className="relative w-full">
            <textarea
              id="background"
              value={outline.background}
              onChange={(e) => onOutlineChange('background', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
              disabled={isLocked}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => handleHumanize('background')}
                disabled={!outline.background.trim() || isHumanizing.background || isHumanizingCooldown}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Humanisasi Latar Belakang"
                title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
              >
                {isHumanizing.background ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-text-primary mb-1">Rumusan Masalah</label>
            <div className="relative w-full">
              <textarea
                id="problem"
                value={outline.problem}
                onChange={(e) => onOutlineChange('problem', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
                disabled={isLocked}
              />
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => handleHumanize('problem')}
                  disabled={!outline.problem.trim() || isHumanizing.problem || isHumanizingCooldown}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Humanisasi Rumusan Masalah"
                  title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
                >
                  {isHumanizing.problem ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-text-primary mb-1">Tujuan Penelitian</label>
            <div className="relative w-full">
              <textarea
                id="objective"
                value={outline.objective}
                onChange={(e) => onOutlineChange('objective', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
                disabled={isLocked}
              />
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => handleHumanize('objective')}
                  disabled={!outline.objective.trim() || isHumanizing.objective || isHumanizingCooldown}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Humanisasi Tujuan Penelitian"
                  title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
                >
                  {isHumanizing.objective ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="thinkingFramework" className="block text-sm font-medium text-text-primary mb-1">Kerangka Pemikiran</label>
          <div className="relative w-full">
            <textarea
              id="thinkingFramework"
              value={outline.thinkingFramework}
              onChange={(e) => onOutlineChange('thinkingFramework', e.target.value)}
              rows={4}
              placeholder="Jelaskan alur pikir logis yang menghubungkan teori dan variabel..."
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
              disabled={isLocked}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => handleHumanize('thinkingFramework')}
                disabled={!outline.thinkingFramework.trim() || isHumanizing.thinkingFramework || isHumanizingCooldown}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Humanisasi Kerangka Pemikiran"
                title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
              >
                {isHumanizing.thinkingFramework ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-text-primary mb-1">Manfaat Penelitian</label>
          <div className="relative w-full">
            <textarea
              id="benefits"
              value={outline.benefits}
              onChange={(e) => onOutlineChange('benefits', e.target.value)}
              rows={3}
              placeholder="Manfaat akademis dan praktis dari penelitian ini..."
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
              disabled={isLocked}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => handleHumanize('benefits')}
                disabled={!outline.benefits.trim() || isHumanizing.benefits || isHumanizingCooldown}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Humanisasi Manfaat Penelitian"
                title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
              >
                {isHumanizing.benefits ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="writingSystematics" className="block text-sm font-medium text-text-primary mb-1">Sistematika Penulisan</label>
          <div className="relative w-full">
            <textarea
              id="writingSystematics"
              value={outline.writingSystematics}
              onChange={(e) => onOutlineChange('writingSystematics', e.target.value)}
              rows={3}
              placeholder="Penjelasan singkat dari Bab I hingga Bab V..."
              className="w-full px-3 py-2 bg-surface text-text-primary border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-slate-100 disabled:cursor-not-allowed pr-10"
              disabled={isLocked}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => handleHumanize('writingSystematics')}
                disabled={!outline.writingSystematics.trim() || isHumanizing.writingSystematics || isHumanizingCooldown}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Humanisasi Sistematika Penulisan"
                title={isHumanizingCooldown ? "Harap tunggu sebelum mencoba lagi" : "Humanisasi"}
              >
                {isHumanizing.writingSystematics ? <LoadingSpinner size="h-4 w-4" color="text-primary" /> : <UserIcon className="h-4 w-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchOutlineForm;
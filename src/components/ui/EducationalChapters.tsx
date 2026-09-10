import React, { useState } from 'react';
import { EDUCATIONAL_CHAPTERS } from '../../data/subsystemData';
import { SubsystemId, ViewMode } from '../../types/powertrain';
import { ChevronLeft, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface EducationalChaptersProps {
  onClose: () => void;
  onApplyChapterState: (
    bookmark: SubsystemId,
    explodeFactor: number,
    viewMode: ViewMode
  ) => void;
}

export const EducationalChapters: React.FC<EducationalChaptersProps> = ({
  onClose,
  onApplyChapterState,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const chapter = EDUCATIONAL_CHAPTERS[currentIdx];

  const handleNext = () => {
    if (currentIdx < EDUCATIONAL_CHAPTERS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextChap = EDUCATIONAL_CHAPTERS[nextIdx];
      onApplyChapterState(
        nextChap.cameraBookmark,
        nextChap.recommendedExplode,
        nextChap.recommendedViewMode
      );
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      const prevChap = EDUCATIONAL_CHAPTERS[prevIdx];
      onApplyChapterState(
        prevChap.cameraBookmark,
        prevChap.recommendedExplode,
        prevChap.recommendedViewMode
      );
    }
  };

  const handleApply = () => {
    onApplyChapterState(
      chapter.cameraBookmark,
      chapter.recommendedExplode,
      chapter.recommendedViewMode
    );
  };

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-25 flex flex-col p-4 bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white w-96 md:w-[540px] max-w-[calc(100vw-24px)] max-h-[82vh] pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-400 text-xs">
            {chapter.id}
          </span>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider">
              Educational Walkthrough • Chapter {chapter.id} of {EDUCATIONAL_CHAPTERS.length}
            </span>
            <h3 className="text-sm md:text-base font-bold text-slate-100">{chapter.title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          title="Close Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chapter Body */}
      <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-3 text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <div className="text-cyan-300 font-medium mb-1">{chapter.subtitle}</div>
          <p className="text-slate-300 leading-relaxed">{chapter.description}</p>
        </div>

        {/* Key Engineering Principles */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-[11px] font-semibold text-slate-200">Engineering Mechanisms</h4>
          <ul className="flex flex-col gap-1.5">
            {chapter.bulletPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-800/60 text-slate-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formula Box */}
        {chapter.formulaLatex && (
          <div className="bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/30 font-mono">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-sans mb-1">
              {chapter.formulaTitle || 'Governing Physics Equation'}
            </span>
            <div className="text-cyan-200 font-bold text-xs">{chapter.formulaLatex}</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              {chapter.formulaExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
        <button
          onClick={handleApply}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-sm shadow-cyan-600/30"
          title="Auto-orient camera and view settings for this chapter"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply View Settings</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
              currentIdx === 0
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIdx === EDUCATIONAL_CHAPTERS.length - 1}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
              currentIdx === EDUCATIONAL_CHAPTERS.length - 1
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-700/80 border-cyan-500/60 text-white hover:bg-cyan-600'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

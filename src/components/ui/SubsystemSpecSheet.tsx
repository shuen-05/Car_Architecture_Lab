import React from 'react';
import { SubsystemId } from '../../types/powertrain';
import { SUBSYSTEM_SPECS } from '../../data/subsystemData';
import { X, CheckCircle2, Cpu, Wrench } from 'lucide-react';

interface SubsystemSpecSheetProps {
  subsystemId: SubsystemId;
  onClose: () => void;
}

export const SubsystemSpecSheet: React.FC<SubsystemSpecSheetProps> = ({
  subsystemId,
  onClose,
}) => {
  const spec = SUBSYSTEM_SPECS[subsystemId] || SUBSYSTEM_SPECS.all;

  return (
    <div className="w-full flex flex-col p-3 bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white pointer-events-auto overflow-hidden flex-1 min-h-0 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 shrink-0">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400">
            {spec.category}
          </span>
          <h2 className="text-xs md:text-sm font-bold text-slate-100">{spec.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Spec Sheet"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 text-xs">
        {/* Short Description */}
        <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 text-[11px]">
          {spec.shortDescription}
        </p>

        {/* Key Specs Grid */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Architectural Specifications</span>
          </h4>
          <div className="grid grid-cols-2 gap-1 font-mono">
            {spec.keySpecs.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-1.5 rounded border border-slate-800/70 flex flex-col"
              >
                <span className="text-[9px] text-slate-400 font-sans">{item.label}</span>
                <span className="text-slate-200 font-bold text-[10px] mt-0.5" title={item.value}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Details */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Engineering Highlights</span>
          </h4>
          <ul className="flex flex-col gap-1 text-slate-300">
            {spec.engineeringDetails.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-1.5 bg-slate-900/40 p-1.5 rounded border border-slate-800/50">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-[11px]">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Materials Used */}
        <div>
          <h4 className="text-[10px] font-semibold text-slate-200 mb-1">
            Materials & Metallurgy
          </h4>
          <div className="flex flex-wrap gap-1">
            {spec.materials.map((mat, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[9px] font-mono"
              >
                {mat}
              </span>
            ))}
          </div>
        </div>

        {/* Governing Formula */}
        {spec.governingFormula && (
          <div className="bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/30">
            <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wide">
              Governing Equation
            </span>
            <div className="text-cyan-200 font-mono font-bold text-[11px] mt-0.5">
              {spec.governingFormula.formula}
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              {spec.governingFormula.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

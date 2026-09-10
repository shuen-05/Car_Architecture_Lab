import React from 'react';
import { SubsystemId } from '../../types/powertrain';
import { SUBSYSTEM_SPECS } from '../../data/subsystemData';
import { Sliders, RotateCcw } from 'lucide-react';

interface ViewControlsProps {
  explodeFactor: number;
  onSetExplodeFactor: (factor: number) => void;
  selectedSubsystem: SubsystemId;
  onSelectSubsystem: (id: SubsystemId) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  explodeFactor,
  onSetExplodeFactor,
  selectedSubsystem,
  onSelectSubsystem,
}) => {
  const subsystems: { id: SubsystemId; label: string }[] = [
    { id: 'all', label: 'Full Vehicle (M3 Touring)' },
    { id: 'rolling_chassis', label: 'Rolling Chassis (Drivetrain)' },
    { id: 'exterior', label: 'Exterior & Aero' },
    { id: 'chassis_suspension', label: 'M Adaptive Suspension' },
    { id: 'engine_bay', label: 'S58 3.0L Twin-Turbo' },
    { id: 'valvetrain', label: 'Double-VANOS Valvetrain' },
    { id: 'rotating_assembly', label: 'Forged Crank & Pistons' },
    { id: 'turbocharger', label: 'Twin Mono-Scroll Turbos' },
    { id: 'transmission', label: 'ZF 8HP76 Steptronic' },
    { id: 'torque_converter', label: 'M xDrive Transfer Case' },
    { id: 'driveshaft', label: 'CFRP Driveshaft' },
    { id: 'differential', label: 'Active M Differential' },
    { id: 'brakes_wheels', label: 'M Ceramic Brakes & Wheels' },
    { id: 'exhaust', label: 'M Active Dual Exhaust' },
  ];

  return (
    <div className="absolute top-14 left-3 z-20 flex flex-col gap-2 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white w-72 md:w-80 max-w-[calc(100vw-24px)] pointer-events-auto">
      {/* Exploded View Slider */}
      <div className="flex flex-col gap-1 pb-2 border-b border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Exploded Assembly</span>
          </span>
          <span className="font-mono text-xs text-cyan-400 font-bold">
            {Math.round(explodeFactor * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodeFactor}
          onChange={(e) => onSetExplodeFactor(parseFloat(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
          <span>0% Assembled</span>
          <span>50% Peel</span>
          <span>100% Micro-Exploded</span>
        </div>
      </div>

      {/* Subsystem Focal Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Subsystem Focus:</span>
          <button
            onClick={() => onSelectSubsystem('all')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 hover:bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-500/40 transition-colors"
            title="Snap to the authentic 3/4 M3 Touring beauty angle"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>M3 Hero Angle</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
          {subsystems.map((sub) => {
            const isSelected = selectedSubsystem === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubsystem(sub.id)}
                className={`text-left px-2 py-1 rounded text-[11px] truncate transition-all ${
                  isSelected
                    ? 'bg-cyan-600/90 text-white font-medium border border-cyan-400/50 shadow-sm'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                }`}
                title={SUBSYSTEM_SPECS[sub.id]?.shortDescription || sub.label}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

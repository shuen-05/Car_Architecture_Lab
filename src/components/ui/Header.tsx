import { Volume2, VolumeX, Eye, BookOpen, Activity, Layers, Scissors, Disc, LayoutDashboard } from 'lucide-react';
import { ViewMode } from '../../types/powertrain';

interface HeaderProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showDiagrams: boolean;
  onToggleDiagrams: () => void;
  showSpecSheet: boolean;
  onToggleSpecSheet: () => void;
  showChapters: boolean;
  onToggleChapters: () => void;
  showHud: boolean;
  onToggleHud: () => void;
  paintColor: string;
  onSelectPaintColor: (color: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onSetViewMode,
  soundEnabled,
  onToggleSound,
  showDiagrams,
  onToggleDiagrams,
  showSpecSheet,
  onToggleSpecSheet,
  showChapters,
  onToggleChapters,
  showHud,
  onToggleHud,
  paintColor,
  onSelectPaintColor,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex flex-col md:flex-row items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white gap-2 pointer-events-auto">
      {/* BMW M3 Competition Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg shadow-sm">
          {/* M Tri-Color Stripes */}
          <div className="flex items-center h-4 w-3.5 -skew-x-12 mr-1.5 overflow-hidden">
            <span className="w-1/3 h-full bg-[#008ac9]" />
            <span className="w-1/3 h-full bg-[#26256c]" />
            <span className="w-1/3 h-full bg-[#e40521]" />
          </div>
          <span className="font-bold text-white text-sm tracking-tighter">M3</span>
          <span className="text-[9px] font-mono text-cyan-400 ml-1 font-semibold">G81</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold tracking-wide text-slate-100 flex items-center gap-2">
              <span>BMW M3 Competition Touring</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/50 text-blue-300 font-mono font-normal">
                M xDrive
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            3.0L S58 Twin-Turbo I6 (503 HP) • 8-Speed M Steptronic • Active M Differential
          </p>
        </div>
      </div>

      {/* View Mode Selectors */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onSetViewMode('exterior')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
            viewMode === 'exterior'
              ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Complete Exterior Body"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Exterior</span>
        </button>

        <button
          onClick={() => onSetViewMode('cutaway')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
            viewMode === 'cutaway'
              ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Cross-Section Cutaway View"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Cutaway</span>
        </button>

        <button
          onClick={() => onSetViewMode('xray')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
            viewMode === 'xray'
              ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Holographic X-Ray Blueprint"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>X-Ray</span>
        </button>

        <button
          onClick={() => onSetViewMode('exploded')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
            viewMode === 'exploded'
              ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Exploded Assembly View"
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Exploded</span>
        </button>
      </div>

      {/* BMW M Authentic Paint Swatches */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-400 font-medium mr-1">Paint:</span>
        {[
          { name: 'Isle of Man Green', hex: '#134d3c' },
          { name: 'Brooklyn Grey', hex: '#9ea5ad' },
          { name: 'Toronto Red', hex: '#a81414' },
          { name: 'Portimao Blue', hex: '#1a438a' },
          { name: 'Frozen Pure Grey', hex: '#444950' },
          { name: 'Black Sapphire', hex: '#0f1115' },
          { name: 'Alpine White', hex: '#f0f2f5' },
          { name: 'Sao Paulo Yellow', hex: '#cfd835' },
        ].map((c) => {
          const isSelected = paintColor.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.hex}
              onClick={() => onSelectPaintColor(c.hex)}
              className={`w-4 h-4 rounded-full transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-400 scale-110 shadow-sm'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          );
        })}
      </div>

      {/* Auxiliary Action Toggles */}
      <div className="flex items-center gap-1.5">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={soundEnabled ? 'Mute engine audio' : 'Enable engine audio synthesizer'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
        </button>

        {/* Guided Chapters */}
        <button
          onClick={onToggleChapters}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
            showChapters
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Guided Engineering Chapters"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Chapters</span>
        </button>

        {/* Telemetry / Dyno Diagrams */}
        <button
          onClick={onToggleDiagrams}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
            showDiagrams
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Animated Dyno & Powertrain Diagrams"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Diagrams</span>
        </button>

        {/* Specs Sheet */}
        <button
          onClick={onToggleSpecSheet}
          className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
            showSpecSheet
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Technical Spec Sheets"
        >
          Specs
        </button>

        {/* HUD Toggle (Zen / Cinema mode) */}
        <button
          onClick={onToggleHud}
          className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-all ${
            showHud
              ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
          }`}
          title={showHud ? 'Hide HUD panels (Cinema View)' : 'Show HUD panels'}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{showHud ? 'HUD' : 'Show UI'}</span>
        </button>
      </div>
    </header>
  );
};

import { Power, Gauge, Compass } from 'lucide-react';
import { PowertrainState, GearMode, MXDriveMode, DrivelogicMode } from '../../types/powertrain';

interface CockpitControlsProps {
  state: PowertrainState;
  onSetThrottle: (val: number) => void;
  onSetBrake: (val: number) => void;
  onSetSteeringAngle: (angle: number) => void;
  onToggleEngine: () => void;
  onSetGearMode: (mode: GearMode) => void;
  onShiftUp: () => void;
  onShiftDown: () => void;
  onSetMXDriveMode?: (mode: MXDriveMode) => void;
  onSetDrivelogicMode?: (mode: DrivelogicMode) => void;
}

export const CockpitControls: React.FC<CockpitControlsProps> = ({
  state,
  onSetThrottle,
  onSetBrake,
  onSetSteeringAngle,
  onToggleEngine,
  onSetGearMode,
  onShiftUp,
  onShiftDown,
  onSetMXDriveMode,
  onSetDrivelogicMode,
}) => {
  return (
    <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-2 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white w-80 md:w-96 max-w-[calc(100vw-24px)] pointer-events-auto">
      {/* Top Row: Engine Start/Stop & Gear Selector */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        {/* Engine Start/Stop Push Button */}
        <button
          onClick={onToggleEngine}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs tracking-wider transition-all border ${
            state.isStarting
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-400 text-white shadow-md shadow-amber-600/40 animate-pulse'
              : state.isEngineRunning
              ? 'bg-gradient-to-r from-red-600 to-amber-600 border-red-400 text-white shadow-md shadow-red-600/30'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
          title={state.isStarting ? 'Engine is cranking...' : state.isEngineRunning ? 'Stop S58 Twin-Turbo Inline-6' : 'Start S58 Twin-Turbo Inline-6'}
        >
          <Power className={`w-4 h-4 ${state.isEngineRunning || state.isStarting ? 'animate-pulse' : ''}`} />
          <span>{state.isStarting ? 'CRANKING S58...' : state.isEngineRunning ? 'S58 RUNNING' : 'START S58'}</span>
        </button>

        {/* Transmission PRNDM Selector */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
          {(['P', 'R', 'N', 'D', 'M'] as GearMode[]).map((mode) => {
            const isActive = state.gearMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onSetGearMode(mode)}
                className={`px-2 py-1 text-xs font-mono font-bold rounded transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* M xDrive & Drivelogic Selector Row */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-800/80 text-[11px]">
        {/* M xDrive mode */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-medium">M xDrive:</span>
          {(['4wd', '4wd_sport', '2wd'] as MXDriveMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onSetMXDriveMode?.(m)}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition-all ${
                state.mXDriveMode === m
                  ? m === '2wd'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
              title={m === '2wd' ? 'Pure 100% Rear-Wheel Drive (M Drift Analyzer)' : `${m.toUpperCase()} AWD Mode (Press X to cycle)`}
            >
              {m === '4wd' ? '4WD' : m === '4wd_sport' ? 'SPORT' : '2WD'}
            </button>
          ))}
        </div>

        {/* Drivelogic Shift Speed */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-medium">Drivelogic:</span>
          {([1, 2, 3] as const).map((d) => (
            <button
              key={d}
              onClick={() => onSetDrivelogicMode?.(d)}
              className={`w-4 h-4 rounded font-mono text-[10px] font-bold flex items-center justify-center transition-all ${
                String(state.drivelogicMode).includes(String(d))
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
              title={`Drivelogic Level ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Paddle Shifters (in M mode or preview) */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Active Gear:</span>
          <span className="font-mono font-bold text-cyan-300 text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {state.gearMode === 'P'
              ? 'PARK'
              : state.gearMode === 'N'
              ? 'NEUTRAL'
              : state.gearMode === 'R'
              ? 'REV'
              : `GEAR ${state.currentGear}`}
          </span>
        </div>

        {state.gearMode === 'M' && (
          <div className="flex items-center gap-1">
            <button
              onClick={onShiftDown}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold border border-slate-700 text-xs"
              title="Downshift (Q key)"
            >
              - [Q]
            </button>
            <button
              onClick={onShiftUp}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold border border-slate-700 text-xs"
              title="Upshift (E key)"
            >
              + [E]
            </button>
          </div>
        )}
      </div>

      {/* Throttle & Brake Pedals */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Throttle Slider */}
        <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-medium">Throttle (W / ↑)</span>
            <span className="font-mono text-slate-300">{Math.round(state.throttle * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.throttle}
            onChange={(e) => onSetThrottle(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Brake Slider */}
        <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rose-400 font-medium">Brake (S / Space)</span>
            <span className="font-mono text-slate-300">{Math.round(state.brake * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.brake}
            onChange={(e) => onSetBrake(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Steering Angle Slider */}
      <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-cyan-400 font-medium flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Steering Angle (A / D)</span>
          </span>
          <span className="font-mono text-slate-300">
            {state.steeringAngle > 0 ? `L +${state.steeringAngle.toFixed(0)}°` : state.steeringAngle < 0 ? `R ${state.steeringAngle.toFixed(0)}°` : '0°'}
          </span>
        </div>
        <input
          type="range"
          min="-35"
          max="35"
          step="1"
          value={state.steeringAngle}
          onChange={(e) => onSetSteeringAngle(parseFloat(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
          <span>◄ Left 35°</span>
          <span>Center</span>
          <span>Right 35° ►</span>
        </div>
      </div>

      {/* Speed & RPM Mini Summary */}
      <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Speed:</span>
          <span className="text-cyan-300 font-bold">{state.vehicleSpeedKmh.toFixed(1)} km/h</span>
        </div>
        <div>
          <span className="text-slate-400">RPM: </span>
          <span className={`font-bold ${state.engineRpm > 5500 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
            {Math.round(state.engineRpm)}
          </span>
        </div>
      </div>
    </div>
  );
};

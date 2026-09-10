import React from 'react';
import { PowertrainState } from '../../types/powertrain';
import { ZF_8HP76_GEAR_RATIOS, FINAL_DRIVE_RATIO } from '../../utils/math';
import { Gauge, Zap, Wind, Disc, Fuel, Thermometer, Compass } from 'lucide-react';

interface TelemetryHUDProps {
  state: PowertrainState;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ state }) => {
  const currentRatio = ZF_8HP76_GEAR_RATIOS[state.currentGear] ?? 0;
  const torqueLbFt = state.engineTorqueNm * 0.737562;
  const speedMph = state.vehicleSpeedKmh * 0.621371;

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white pointer-events-auto shrink-0">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-xs font-semibold text-blue-400">
        <span className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" />
          <span>BMW M Live Telemetry</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/50 text-blue-300 uppercase font-bold">
            {state.mXDriveMode === '4wd' ? '4WD' : state.mXDriveMode === '4wd_sport' ? '4WD Sport' : '2WD (RWD)'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            60 Hz
          </span>
        </div>
      </div>

      {/* Grid of Readouts */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Engine RPM (S58 7,200 RPM redline) */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">S58 Engine RPM</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold ${
                state.engineRpm > 6500 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {Math.round(state.engineRpm)}
            </span>
            <span className="text-[10px] text-slate-400">RPM</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                state.engineRpm > 6500 ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (state.engineRpm / 7200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Twin Mono-Scroll Turbo Boost */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
            <Wind className="w-2.5 h-2.5 text-blue-400" />
            <span>Twin Turbos</span>
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold ${
                state.boostPressureBar > 1.0 ? 'text-blue-300' : 'text-slate-300'
              }`}
            >
              {state.boostPressureBar >= 0
                ? `+${state.boostPressureBar.toFixed(2)}`
                : state.boostPressureBar.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">bar</span>
          </div>
          <div className="text-[9px] text-slate-400 flex justify-between">
            <span>{state.boostPressurePsi.toFixed(1)} PSI</span>
            <span>WG: {state.wastegateDutyPercent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Engine Torque & Power */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            <span>S58 Output</span>
          </span>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {state.engineTorqueNm.toFixed(0)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">Nm</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {torqueLbFt.toFixed(0)} lb-ft • {state.enginePowerHp.toFixed(0)} HP
          </div>
        </div>

        {/* ZF 8HP76 Transmission & Drivelogic */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
            <Disc className="w-2.5 h-2.5 text-blue-400" />
            <span>ZF 8HP76</span>
          </span>
          <div className="text-sm font-bold text-blue-300 mt-0.5">
            Ratio: {currentRatio !== 0 ? `${Math.abs(currentRatio).toFixed(3)}:1` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Drivelogic:</span>
            <span className="font-semibold text-emerald-400">
              {String(state.drivelogicMode).includes('1') ? 'D1 Smooth' : String(state.drivelogicMode).includes('3') ? 'S3 Track' : 'S2 Sport'}
            </span>
          </div>
        </div>

        {/* Driveshaft RPM */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">CFRP Prop-Shaft</span>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {Math.round(state.propShaftRpm)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">RPM</span>
          </div>
          <div className="text-[10px] text-slate-400">Final Drive: {FINAL_DRIVE_RATIO.toFixed(3)}:1</div>
        </div>

        {/* Road Speed */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">Vehicle Speed</span>
          <div className="text-sm font-bold text-blue-300 mt-0.5">
            {state.vehicleSpeedKmh.toFixed(1)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400">{speedMph.toFixed(1)} MPH</div>
        </div>
      </div>

      {/* M xDrive & Active M Differential Card */}
      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex flex-col gap-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
          <span className="flex items-center gap-1">
            <Compass className="w-2.5 h-2.5 text-blue-400" />
            <span>M xDrive Torque Vectoring</span>
          </span>
          <span className="text-blue-400 font-medium">
            Front: {state.frontTorqueSplitPercent}% | Rear: {100 - state.frontTorqueSplitPercent}%
          </span>
        </div>

        {/* Torque Split Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden flex">
          <div
            className="bg-cyan-500 h-full transition-all duration-100"
            style={{ width: `${state.frontTorqueSplitPercent}%` }}
            title={`Front: ${state.frontTorqueSplitPercent}%`}
          />
          <div
            className="bg-blue-600 h-full transition-all duration-100"
            style={{ width: `${100 - state.frontTorqueSplitPercent}%` }}
            title={`Rear: ${100 - state.frontTorqueSplitPercent}%`}
          />
        </div>

        {/* Active M Diff Lock & Wheel Speeds */}
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5 border-t border-slate-800/60">
          <div>
            <span className="text-slate-400">Active M Diff: </span>
            <span className="text-emerald-400 font-bold">{state.activeMDiffLockPercent.toFixed(0)}% Lock</span>
          </div>
          <div>
            <span className="text-slate-400">Rear L/R: </span>
            <span className="text-slate-200 font-bold">{Math.round(state.leftWheelRpm)} / {Math.round(state.rightWheelRpm)}</span>
          </div>
        </div>
      </div>

      {/* Fuel & Temperatures */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
        <div className="flex items-center gap-1">
          <Fuel className="w-2.5 h-2.5 text-amber-400" />
          <span>Fuel: {state.fuelFlowRateLph.toFixed(1)} L/h</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-2.5 h-2.5 text-rose-400" />
          <span>Oil: {state.oilTempC}°C</span>
          <span>•</span>
          <span>Coolant: {state.coolantTempC}°C</span>
        </div>
      </div>
    </div>
  );
};

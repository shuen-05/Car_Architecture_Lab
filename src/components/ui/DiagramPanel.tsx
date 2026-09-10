import React, { useState } from 'react';
import { PowertrainState } from '../../types/powertrain';
import { ZF_8HP76_GEAR_RATIOS, FINAL_DRIVE_RATIO } from '../../utils/math';
import { X, TrendingUp, Wind, BarChart2, Split } from 'lucide-react';

interface DiagramPanelProps {
  state: PowertrainState;
  onClose: () => void;
}

type DiagramTab = 'dyno' | 'turbo' | 'gearratios' | 'differential';

export const DiagramPanel: React.FC<DiagramPanelProps> = ({ state, onClose }) => {
  const [activeTab, setActiveTab] = useState<DiagramTab>('dyno');

  const currentRatio = ZF_8HP76_GEAR_RATIOS[state.currentGear] || 0;
  const tcFactor = state.torqueConverterLockup === 'Locked' ? 1.0 : state.torqueConverterLockup === 'Slipping' ? 1.2 : 1.8;
  const totalTorqueAtWheels = (state.engineTorqueNm * tcFactor * Math.abs(currentRatio) * FINAL_DRIVE_RATIO);

  return (
    <div className="absolute bottom-3 right-3 z-20 flex flex-col p-3.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800/90 shadow-2xl text-white w-80 md:w-[440px] max-w-[calc(100vw-24px)] max-h-[520px] pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <h3 className="text-xs md:text-sm font-semibold text-slate-100">
            S58 & M xDrive Engineering Diagrams
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          title="Close Diagram Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-3 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveTab('dyno')}
          className={`flex items-center justify-center gap-1 py-1 rounded transition-all ${
            activeTab === 'dyno'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Dyno</span>
        </button>

        <button
          onClick={() => setActiveTab('turbo')}
          className={`flex items-center justify-center gap-1 py-1 rounded transition-all ${
            activeTab === 'turbo'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Wind className="w-3 h-3" />
          <span>Turbos</span>
        </button>

        <button
          onClick={() => setActiveTab('gearratios')}
          className={`flex items-center justify-center gap-1 py-1 rounded transition-all ${
            activeTab === 'gearratios'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-3 h-3" />
          <span>ZF 8HP</span>
        </button>

        <button
          onClick={() => setActiveTab('differential')}
          className={`flex items-center justify-center gap-1 py-1 rounded transition-all ${
            activeTab === 'differential'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Split className="w-3 h-3" />
          <span>M Diff</span>
        </button>
      </div>

      {/* Diagram Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* TAB 1: DYNO POWER & TORQUE CURVES */}
        {activeTab === 'dyno' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">S58B30T0 Dyno Curves (503 HP / 650 Nm)</span>
              <span className="text-blue-300 font-mono text-[11px]">
                {state.enginePowerHp.toFixed(0)} HP @ {Math.round(state.engineRpm)} RPM
              </span>
            </div>

            {/* SVG Dyno Curve */}
            <div className="relative w-full h-44 bg-slate-900/90 rounded-lg border border-slate-800/90 p-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 140">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="310" y2="20" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="50" x2="310" y2="50" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="80" x2="310" y2="80" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="110" x2="310" y2="110" stroke="#334155" />
                <line x1="30" y1="10" x2="30" y2="110" stroke="#334155" />

                {/* X Axis Labels (RPM) */}
                <text x="30" y="125" fill="#64748b" fontSize="8" textAnchor="middle">1k</text>
                <text x="80" y="125" fill="#64748b" fontSize="8" textAnchor="middle">2.75k</text>
                <text x="140" y="125" fill="#64748b" fontSize="8" textAnchor="middle">4k</text>
                <text x="210" y="125" fill="#64748b" fontSize="8" textAnchor="middle">5.5k</text>
                <text x="255" y="125" fill="#64748b" fontSize="8" textAnchor="middle">6.25k</text>
                <text x="305" y="125" fill="#ef4444" fontSize="8" textAnchor="middle">7.2k</text>

                {/* Y Axis Labels */}
                <text x="26" y="24" fill="#f59e0b" fontSize="7" textAnchor="end">650 Nm</text>
                <text x="26" y="54" fill="#38bdf8" fontSize="7" textAnchor="end">503 HP</text>
                <text x="26" y="112" fill="#64748b" fontSize="7" textAnchor="end">0</text>

                {/* Peak 650 Nm Torque Curve (Amber) - 2750-5500 RPM flat plateau */}
                <path
                  d="M 30,85 C 50,65 70,30 80,24 L 210,24 C 235,28 270,55 305,75"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />

                {/* Horsepower Curve (Blue/Cyan) - peaks at 6250 RPM */}
                <path
                  d="M 30,105 C 70,95 140,70 200,45 C 235,28 255,20 265,20 L 305,35"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Live Operating Point Dot */}
                {(() => {
                  const rpmNorm = Math.max(0, Math.min(1, (state.engineRpm - 1000) / 6200));
                  const markerX = 30 + rpmNorm * 275;
                  const powerNorm = Math.min(1, state.enginePowerHp / 520);
                  const markerY = 110 - powerNorm * 90;
                  return (
                    <g>
                      <line
                        x1={markerX}
                        y1="10"
                        x2={markerX}
                        y2="110"
                        stroke="#3b82f6"
                        strokeWidth="1.2"
                        strokeDasharray="3,2"
                      />
                      <circle cx={markerX} cy={markerY} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Formula & Explanations */}
            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              <div className="text-blue-300 font-bold mb-0.5">S58 Output Architecture:</div>
              <div>HP = (Torque_Nm × RPM) / 7127</div>
              <div className="text-[10px] text-slate-400 font-sans mt-1">
                Colossal 650 Nm plateau from 2,750 to 5,500 RPM with forged crankshaft and wire-arc spray-bore cylinders allowing sustained high-RPM track operation up to 7,200 RPM redline.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TURBO BOOST PRESSURE MAP */}
        {activeTab === 'turbo' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Twin Mono-Scroll Turbos (Cyl 1-3 & 4-6)</span>
              <span className="text-blue-300 font-mono text-[11px]">
                {state.boostPressurePsi.toFixed(1)} PSI (+{state.boostPressureBar.toFixed(2)} bar)
              </span>
            </div>

            {/* Radial Boost Meter Gauge */}
            <div className="flex items-center justify-center p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Gauge Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeDasharray="226"
                    strokeDashoffset="75"
                  />
                  {/* Boost Fill */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke={state.boostPressureBar > 1.2 ? '#ef4444' : '#3b82f6'}
                    strokeWidth="8"
                    strokeDasharray="226"
                    strokeDashoffset={
                      226 - ((Math.max(-0.6, state.boostPressureBar) + 0.6) / 2.3) * 151
                    }
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Value */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-blue-300">
                    {state.boostPressureBar >= 0
                      ? `+${state.boostPressureBar.toFixed(2)}`
                      : state.boostPressureBar.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">BAR BOOST</span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    {state.boostPressurePsi.toFixed(1)} PSI
                  </span>
                </div>
              </div>

              {/* Wastegate & Shaft Speed Stats */}
              <div className="flex flex-col gap-1.5 ml-3 text-xs font-mono">
                <div className="bg-slate-800/70 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 font-sans">Turbine Shaft Speed:</span>
                  <div className="font-bold text-slate-200">
                    {Math.round(state.turboShaftSpeedRpm).toLocaleString()} RPM
                  </div>
                </div>
                <div className="bg-slate-800/70 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 font-sans">Electronic Wastegate:</span>
                  <div className="font-bold text-amber-400">
                    {state.wastegateDutyPercent.toFixed(0)}% Open
                  </div>
                </div>
                <div className="bg-slate-800/70 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 font-sans">Pressure Ratio:</span>
                  <div className="font-bold text-blue-300">
                    {((state.boostPressureBar + 1.013) / 1.013).toFixed(2)}:1
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              <div className="text-blue-300 font-bold mb-0.5">Dual Mono-Scroll Layout:</div>
              <div className="text-[10px] text-slate-400 font-sans">
                Dedicated mono-scroll turbochargers for cylinders 1-3 and 4-6 minimize exhaust interference and turbine backpressure, delivering peak 1.70 bar boost with water-to-air charge cooling.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ZF 8HP76 STEPPED GEAR REDUCTIONS */}
        {activeTab === 'gearratios' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">ZF 8HP76 M Steptronic Ratios</span>
              <span className="text-blue-300 font-mono text-[11px]">
                {currentRatio !== 0 ? `Active: ${Math.abs(currentRatio).toFixed(3)}:1` : 'Neutral'}
              </span>
            </div>

            {/* Stepped Gear Ratio Bar Chart */}
            <div className="flex flex-col gap-1 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((gear) => {
                const ratio = ZF_8HP76_GEAR_RATIOS[gear];
                const isActive = state.currentGear === gear && state.gearMode !== 'P' && state.gearMode !== 'N';
                const percent = (ratio / 5.000) * 100;

                return (
                  <div key={gear} className="flex items-center gap-2 text-[11px] font-mono">
                    <span className={`w-8 ${isActive ? 'text-blue-300 font-bold' : 'text-slate-400'}`}>
                      G{gear}:
                    </span>
                    <div className="flex-1 bg-slate-800 h-3 rounded overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${
                          isActive ? 'bg-blue-500 shadow-sm' : 'bg-slate-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`w-14 text-right ${isActive ? 'text-blue-300 font-bold' : 'text-slate-300'}`}>
                      {ratio.toFixed(3)}:1
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Torque Multiplication */}
            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              <div className="text-blue-300 font-bold mb-0.5">Total Axle Torque Multiplication:</div>
              <div>T_wheel = T_eng × R_gear × R_final</div>
              <div className="text-slate-200 mt-1 font-bold">
                = {state.engineTorqueNm.toFixed(0)} Nm × {Math.abs(currentRatio).toFixed(2)} × {FINAL_DRIVE_RATIO} ={' '}
                <span className="text-amber-400">{Math.round(totalTorqueAtWheels)} Nm</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: M XDRIVE & ACTIVE M DIFFERENTIAL */}
        {activeTab === 'differential' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Active M Differential & M xDrive Split</span>
              <span className="text-blue-300 font-mono text-[11px]">
                Lock: {state.activeMDiffLockPercent.toFixed(0)}%
              </span>
            </div>

            {/* Visual Balance Bar */}
            <div className="flex flex-col gap-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Rear Left Wheel</span>
                  <span className="text-blue-300 font-bold text-sm">
                    {Math.round(state.leftWheelRpm)} RPM
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-slate-400 text-[10px]">Rear Right Wheel</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {Math.round(state.rightWheelRpm)} RPM
                  </span>
                </div>
              </div>

              {/* Dynamic split balance indicator */}
              <div className="w-full bg-slate-800 h-4 rounded relative overflow-hidden flex">
                {(() => {
                  const total = state.leftWheelRpm + state.rightWheelRpm || 1;
                  const leftPercent = (state.leftWheelRpm / total) * 100;
                  return (
                    <>
                      <div className="bg-blue-500 h-full" style={{ width: `${leftPercent}%` }} />
                      <div className="bg-amber-500 h-full" style={{ width: `${100 - leftPercent}%` }} />
                    </>
                  );
                })()}
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{((state.leftWheelRpm / (state.leftWheelRpm + state.rightWheelRpm || 1)) * 100).toFixed(1)}% Share</span>
                <span>{((state.rightWheelRpm / (state.leftWheelRpm + state.rightWheelRpm || 1)) * 100).toFixed(1)}% Share</span>
              </div>
            </div>

            {/* Differential Kinematic Formula */}
            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              <div className="text-blue-300 font-bold mb-0.5">Active Multi-Plate Clutch Lockup:</div>
              <div className="text-[10px] text-slate-400 font-sans">
                The Active M Differential uses an electric actuator motor and multi-plate clutch pack capable of locking from 0% (open) to 100% (fully locked) within milliseconds, preventing inside wheel spin and optimizing traction out of high-G corners.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useCallback } from 'react';
import { usePowertrainSimulation } from './hooks/usePowertrainSimulation';
import { useEngineAudio } from './hooks/useEngineAudio';
import { CarCanvas } from './components/3d/CarCanvas';
import { Header } from './components/ui/Header';
import { CockpitControls } from './components/ui/CockpitControls';
import { ViewControls } from './components/ui/ViewControls';
import { TelemetryHUD } from './components/ui/TelemetryHUD';
import { DiagramPanel } from './components/ui/DiagramPanel';
import { SubsystemSpecSheet } from './components/ui/SubsystemSpecSheet';
import { EducationalChapters } from './components/ui/EducationalChapters';
import { SubsystemId, ViewMode } from './types/powertrain';

export function App() {
  const {
    state,
    setThrottle,
    setBrake,
    setSteeringAngle,
    toggleEngine,
    setGearMode,
    setMXDriveMode,
    setDrivelogicMode,
    shiftUp,
    shiftDown,
    toggleSound,
  } = usePowertrainSimulation();

  // Procedural audio synthesizer
  useEngineAudio(state);

  // View & UI states
  const [viewMode, setViewMode] = useState<ViewMode>('exterior');
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemId>('all');
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [paintColor, setPaintColor] = useState('#134d3c'); // BMW Isle of Man Green Metallic

  // When user toggles exploded view mode from header
  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'exploded') {
      setExplodeFactor((prev) => (prev < 0.2 ? 0.55 : prev));
    } else if (mode === 'exterior') {
      setExplodeFactor(0);
    }
  }, []);

  // When user selects a subsystem
  const handleSelectSubsystem = useCallback((id: SubsystemId) => {
    setSelectedSubsystem(id);
    if (id !== 'all') {
      setShowSpecSheet(true);
    }
  }, []);

  // When an educational chapter applies a recommended view
  const handleApplyChapterState = useCallback(
    (bookmark: SubsystemId, recommendedExplode: number, recommendedMode: ViewMode) => {
      setSelectedSubsystem(bookmark);
      setExplodeFactor(recommendedExplode);
      setViewMode(recommendedMode);
    },
    []
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0f14] text-slate-100 font-sans">
      {/* 3D WebGL Canvas (Takes up full background) */}
      <CarCanvas
        state={state}
        viewMode={viewMode}
        explodeFactor={explodeFactor}
        selectedSubsystem={selectedSubsystem}
        onSelectSubsystem={handleSelectSubsystem}
        paintColor={paintColor}
      />

      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onSetViewMode={handleSetViewMode}
        soundEnabled={state.soundEnabled}
        onToggleSound={toggleSound}
        showDiagrams={showDiagrams}
        onToggleDiagrams={() => setShowDiagrams((prev) => !prev)}
        showSpecSheet={showSpecSheet}
        onToggleSpecSheet={() => setShowSpecSheet((prev) => !prev)}
        showChapters={showChapters}
        onToggleChapters={() => setShowChapters((prev) => !prev)}
        showHud={showHud}
        onToggleHud={() => setShowHud((prev) => !prev)}
        paintColor={paintColor}
        onSelectPaintColor={setPaintColor}
      />

      {/* Top Left: Exploded Slider & Subsystem Focus */}
      {showHud && (
        <ViewControls
          explodeFactor={explodeFactor}
          onSetExplodeFactor={(factor) => {
            setExplodeFactor(factor);
            if (factor > 0.05 && viewMode === 'exterior') {
              setViewMode('exploded');
            } else if (factor <= 0.02 && viewMode === 'exploded') {
              setViewMode('exterior');
            }
          }}
          selectedSubsystem={selectedSubsystem}
          onSelectSubsystem={handleSelectSubsystem}
        />
      )}

      {/* Top Right Column: Live Telemetry HUD & Subsystem Spec Sheet */}
      <div className="absolute top-14 right-3 z-20 flex flex-col gap-2 w-72 md:w-84 max-w-[calc(100vw-24px)] max-h-[calc(100vh-68px)] pointer-events-none">
        {showHud && <TelemetryHUD state={state} />}
        {showSpecSheet && (
          <SubsystemSpecSheet
            subsystemId={selectedSubsystem}
            onClose={() => setShowSpecSheet(false)}
          />
        )}
      </div>

      {/* Bottom Left: Cockpit Controls (Engine, Throttle, Shifter, Steering, Brake, M xDrive) */}
      {showHud && (
        <CockpitControls
          state={state}
          onSetThrottle={setThrottle}
          onSetBrake={setBrake}
          onSetSteeringAngle={setSteeringAngle}
          onToggleEngine={toggleEngine}
          onSetGearMode={setGearMode}
          onShiftUp={shiftUp}
          onShiftDown={shiftDown}
          onSetMXDriveMode={setMXDriveMode}
          onSetDrivelogicMode={setDrivelogicMode}
        />
      )}

      {/* Bottom Right: Animated Mechanical Diagrams (Dyno, Boost, Gears, Diff) */}
      {showDiagrams && (
        <DiagramPanel state={state} onClose={() => setShowDiagrams(false)} />
      )}

      {/* Modal: Educational Guided Chapters */}
      {showChapters && (
        <EducationalChapters
          onClose={() => setShowChapters(false)}
          onApplyChapterState={handleApplyChapterState}
        />
      )}

      {/* Subtle Bottom Instruction / Hint Banner */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none hidden md:flex items-center gap-3">
        <span>🖱️ Drag to Orbit 360°</span>
        <span>•</span>
        <span>🔍 Scroll to Zoom</span>
        <span>•</span>
        <span>⌨️ W/S: Throttle/Brake</span>
        <span>•</span>
        <span>A/D: Steer</span>
        <span>•</span>
        <span>Q/E: Shift</span>
        <span>•</span>
        <span>X: M xDrive Mode</span>
      </div>
    </div>
  );
}

export default App;

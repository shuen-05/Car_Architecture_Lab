import { useEffect } from 'react';
import { PowertrainState } from '../types/powertrain';
import { engineAudio } from '../services/audioSynthesizer';

export function useEngineAudio(state: PowertrainState) {
  // Sync mute state with soundEnabled
  useEffect(() => {
    if (!state.soundEnabled) {
      if (!engineAudio.getMuted()) {
        engineAudio.toggleMute();
      }
    } else {
      if (engineAudio.getMuted()) {
        engineAudio.unmute();
      }
    }
  }, [state.soundEnabled]);

  // Update procedural audio synthesizer with latest state
  useEffect(() => {
    engineAudio.update(
      state.isEngineRunning,
      state.engineRpm,
      state.throttle,
      state.isStarting ?? false
    );
  }, [state.isEngineRunning, state.engineRpm, state.throttle, state.isStarting]);

  return null;
}

export { engineAudio };

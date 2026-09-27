import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';

export default function PlaybackControls({
  isPlaying,
  onTogglePlay,
  currentStep,
  totalSteps,
  onStepNext,
  onStepPrev,
  onReset,
  onJumpToEnd,
  onRunToBreakpoint,
  onSeekStep,
  speed,
  onChangeSpeed,
  actionType = '',
}) {
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5">
      {/* Top Scrubber & Step Info */}
      <div className="flex items-center gap-3">
        {/* Step Counter Badge */}
        <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs font-mono font-bold text-sky-400 whitespace-nowrap">
          Step {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
        </div>

        {/* Interactive Progress Slider */}
        <div className="flex-1 relative flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(totalSteps - 1, 0)}
            value={currentStep}
            onChange={(e) => onSeekStep(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 focus:outline-none"
          />
        </div>

        {/* Action / State Indicator Badge */}
        <div className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
          {actionType ? actionType.replace(/_/g, ' ') : 'READY'}
        </div>
      </div>

      {/* Control Buttons & Speed */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Reset / Start */}
          <button
            onClick={onReset}
            title="Reset (R)"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back */}
          <button
            onClick={onStepPrev}
            disabled={currentStep === 0}
            title="Previous Step (Left Arrow)"
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-700/50"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          {/* Step Next */}
          <button
            onClick={onStepNext}
            disabled={currentStep >= totalSteps - 1}
            title="Next Step (Right Arrow / F10)"
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-700/50"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Run to Breakpoint */}
          <button
            onClick={onRunToBreakpoint}
            title="Continue to Next Breakpoint"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>To Breakpoint</span>
          </button>

          {/* Jump to End */}
          <button
            onClick={onJumpToEnd}
            title="Jump to Finish"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono">Speed:</span>
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  speed === s
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

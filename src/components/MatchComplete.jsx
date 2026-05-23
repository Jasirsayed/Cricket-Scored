import React, { useState } from 'react';
import { Download, RotateCcw, Trophy, Star, Sparkles } from 'lucide-react';
import { exportMatchPDF } from '../utils/pdfExport.js';
import { getTopScorer, getBestBowler } from '../utils/cricketLogic.js';

export default function MatchComplete({ match, onNewMatch, onUpdate }) {
  const [pomInput, setPomInput] = useState(match.playerOfMatch || '');
  const [exporting, setExporting] = useState(false);

  const { innings, setup, result } = match;
  const inn1 = innings[0];
  const inn2 = innings[1];

  const allBatsmen = [...(inn1?.batsmen || []), ...(inn2?.batsmen || [])];
  const allBowlers = [...(inn1?.bowlers || []), ...(inn2?.bowlers || [])];

  const topScorer = allBatsmen.reduce((t, b) => (!t || b.runs > t.runs) ? b : t, null);
  const bestBowler = allBowlers.reduce((best, b) => {
    if (!best) return b;
    if (b.wickets > best.wickets) return b;
    if (b.wickets === best.wickets && b.economy < best.economy) return b;
    return best;
  }, null);

  const handleSetPOM = () => {
    if (pomInput.trim()) {
      onUpdate({ ...match, playerOfMatch: pomInput.trim(), status: 'completed' });
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      exportMatchPDF({ ...match, playerOfMatch: pomInput || match.playerOfMatch });
    } catch (e) {
      alert('PDF export failed: ' + e.message);
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pitch-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Trophy header */}
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-stumps-400 to-stumps-600 rounded-full mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-stumps-500/40 mb-3">
            🏆
          </div>
          <h1 className="font-display text-4xl text-white tracking-wider">MATCH OVER</h1>
          {result && <p className="text-pitch-400 font-semibold mt-1">{result}</p>}
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-3">
          {[inn1, inn2].filter(Boolean).map((inn, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{i === 0 ? '1st' : '2nd'} Inn</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{inn.battingTeam}</p>
              <p className="font-display text-3xl text-gray-900 dark:text-white">{inn.score}/{inn.wickets}</p>
              <p className="text-xs text-gray-400">{inn.overs}.{inn.balls} ov</p>
            </div>
          ))}
        </div>

        {/* Key stats */}
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-3">
            {topScorer && (
              <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3">
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase mb-1">Top Scorer</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{topScorer.name}</p>
                <p className="text-sky-700 dark:text-sky-300 font-bold">{topScorer.runs} ({topScorer.balls}b)</p>
              </div>
            )}
            {bestBowler && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Best Bowler</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{bestBowler.name}</p>
                <p className="text-red-700 dark:text-red-300 font-bold">{bestBowler.wickets}/{bestBowler.runs}</p>
              </div>
            )}
          </div>
        </div>

        {/* POM selector */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-stumps-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Player of the Match</h3>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stumps-500"
              placeholder="Enter player name"
              value={pomInput}
              onChange={e => setPomInput(e.target.value)}
            />
            <button
              onClick={handleSetPOM}
              className="px-4 py-2 bg-stumps-500 hover:bg-stumps-600 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Set
            </button>
          </div>
          {/* Quick suggestions */}
          {(topScorer || bestBowler) && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {topScorer && (
                <button onClick={() => setPomInput(topScorer.name)} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all">
                  {topScorer.name}
                </button>
              )}
              {bestBowler && bestBowler.name !== topScorer?.name && (
                <button onClick={() => setPomInput(bestBowler.name)} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all">
                  {bestBowler.name}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full py-3.5 bg-pitch-500 hover:bg-pitch-600 disabled:opacity-60 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pitch-500/30"
          >
            <Download className="w-5 h-5" />
            {exporting ? 'Generating PDF...' : 'Download PDF Scorecard'}
          </button>

          <button
            onClick={onNewMatch}
            className="w-full py-3.5 border-2 border-white/20 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Match
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { getTarget } from '../utils/cricketLogic.js';
import { ArrowRight } from 'lucide-react';

export default function InningsBreak({ match, onStartSecond }) {
  const { innings, setup } = match;
  const inn1 = innings[0];
  const target = getTarget(inn1);
  const battingSecond = inn1.bowlingTeam;
  const bowlingSecond = inn1.battingTeam;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pitch-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Break header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔄</div>
          <h1 className="font-display text-4xl text-white tracking-wider">INNINGS BREAK</h1>
          <p className="text-gray-400 text-sm">{setup.venue}</p>
        </div>

        {/* 1st innings summary */}
        <div className="card p-5 mb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">1st Innings Result</p>
          <p className="font-display text-2xl text-gray-900 dark:text-white mb-1">{inn1.battingTeam}</p>
          <div className="font-display text-6xl text-gray-900 dark:text-white">
            {inn1.score}/{inn1.wickets}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {inn1.overs}.{inn1.balls} overs
          </p>
          {inn1.extras && (
            <p className="text-xs text-gray-400 mt-1">
              Extras: {inn1.extras.total}
            </p>
          )}
        </div>

        {/* Target */}
        <div className="bg-gradient-to-r from-pitch-600 to-pitch-700 rounded-2xl p-5 mb-4 text-center text-white">
          <p className="text-pitch-200 text-sm mb-1">{battingSecond} need</p>
          <div className="font-display text-6xl">{target}</div>
          <p className="text-pitch-200 text-sm mt-1">runs to win in {inn1.totalOvers} overs</p>
        </div>

        {/* Stats from 1st innings */}
        {inn1.batsmen && inn1.batsmen.length > 0 && (
          <div className="card p-4 mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Top performers — {inn1.battingTeam}</h3>
            {inn1.batsmen
              .sort((a, b) => b.runs - a.runs)
              .slice(0, 3)
              .map((b, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{b.name}</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white font-mono">
                    {b.runs} <span className="text-gray-400 font-normal">({b.balls}b)</span>
                  </span>
                </div>
              ))}
          </div>
        )}

        <button
          onClick={onStartSecond}
          className="w-full py-4 bg-pitch-500 hover:bg-pitch-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pitch-500/30"
        >
          Start 2nd Innings
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

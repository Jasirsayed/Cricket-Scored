import React from 'react';
import { Plus, ChevronRight, Trash2, Eye, Clock, Trophy } from 'lucide-react';
import { SAMPLE_MATCH } from '../data/sampleMatch.js';

export default function MatchList({ matches, onNew, onOpen, onDelete, onLoadDemo }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏏</span>
          <div>
            <h1 className="font-display text-4xl tracking-wider">AI CRICKET SCORER</h1>
            <p className="text-gray-400 text-sm">Professional match scoring for everyone</p>
          </div>
        </div>

        <button
          onClick={onNew}
          className="mt-6 w-full py-4 bg-pitch-500 hover:bg-pitch-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-pitch-500/30 active:scale-98"
        >
          <Plus className="w-5 h-5" />
          New Match
        </button>
      </div>

      {/* Matches list */}
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {/* Demo match button */}
        {matches.length === 0 && (
          <div className="card p-5 text-center">
            <div className="text-4xl mb-3">👁️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No matches yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start a new match or explore the demo</p>
            <button
              onClick={onLoadDemo}
              className="w-full py-2.5 border-2 border-pitch-200 dark:border-pitch-700 text-pitch-600 dark:text-pitch-400 rounded-xl font-semibold text-sm hover:bg-pitch-50 dark:hover:bg-pitch-900/20 transition-all"
            >
              📊 Load Demo Match
            </button>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Recent Matches</h2>
              <button
                onClick={onLoadDemo}
                className="text-xs text-pitch-600 dark:text-pitch-400 font-semibold"
              >
                + Demo
              </button>
            </div>

            {matches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                onOpen={() => onOpen(m)}
                onDelete={() => onDelete(m.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, onOpen, onDelete }) {
  const { setup, innings, status, result } = match;
  const inn1 = innings?.[0];
  const inn2 = innings?.[1];

  const statusColor = {
    'setup': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    'live': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'innings_break': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'completed': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const statusLabel = {
    'setup': 'Setup',
    'live': '🔴 Live',
    'innings_break': 'Break',
    'completed': '✅ Final',
  };

  return (
    <div className="card p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`badge text-xs ${statusColor[status] || statusColor.setup}`}>
              {statusLabel[status] || status}
            </span>
            <span className="text-xs text-gray-400">{setup.matchType}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {setup.teamA} vs {setup.teamB}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{setup.venue} · {setup.date}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-2 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Score line */}
      {inn1 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{inn1.battingTeam}</span>
            <span className="font-bold text-gray-900 dark:text-white font-mono">{inn1.score}/{inn1.wickets} <span className="text-xs text-gray-400">({inn1.overs}.{inn1.balls})</span></span>
          </div>
          {inn2 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{inn2.battingTeam}</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{inn2.score}/{inn2.wickets} <span className="text-xs text-gray-400">({inn2.overs}.{inn2.balls})</span></span>
            </div>
          )}
          {result && <p className="text-xs text-pitch-600 dark:text-pitch-400 font-semibold mt-1.5">{result}</p>}
        </div>
      )}

      <button
        onClick={onOpen}
        className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
      >
        <Eye className="w-3.5 h-3.5" />
        {status === 'live' ? 'Continue Scoring' : 'Open Match'}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

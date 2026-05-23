import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

export default function Commentary({ match, onUpdate }) {
  const { innings } = match;

  const allCommentary = innings.flatMap((inn, idx) =>
    (inn.commentary || []).map(c => ({ ...c, inningsIdx: idx, team: inn.battingTeam }))
  ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const deleteEntry = (inningsIdx, ball) => {
    const updatedInnings = match.innings.map((inn, i) => {
      if (i !== inningsIdx) return inn;
      return { ...inn, commentary: inn.commentary.filter(c => c.ball !== ball) };
    });
    onUpdate({ ...match, innings: updatedInnings });
  };

  if (allCommentary.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No commentary yet</p>
        <p className="text-sm">Start scoring to see ball-by-ball commentary</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-8">
      {allCommentary.map((c, i) => (
        <div
          key={`${c.inningsIdx}-${c.ball}-${i}`}
          className={`card px-4 py-3 flex items-start gap-3 animate-fade-in
            ${c.text?.includes('WICKET') || c.text?.includes('OUT') || c.text?.includes('walks back') ? 'border-l-4 border-leather-500' :
              c.text?.includes('SIX') || c.text?.includes('MAXIMUM') ? 'border-l-4 border-stumps-500' :
              c.text?.includes('FOUR') || c.text?.includes('BOUNDARY') ? 'border-l-4 border-sky-500' : ''}`}
        >
          {/* Over badge */}
          <div className="shrink-0">
            <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
              {c.ball}
            </span>
          </div>

          {/* Event icon */}
          <div className="text-lg shrink-0">
            {c.text?.includes('WICKET') || c.text?.includes('OUT') || c.text?.includes('walks back') ? '🏏' :
              c.text?.includes('SIX') || c.text?.includes('MAXIMUM') ? '🚀' :
              c.text?.includes('FOUR') || c.text?.includes('BOUNDARY') ? '🔵' :
              c.text?.includes('Wide') ? '↔' :
              c.text?.includes('No ball') ? '❌' :
              '⚪'}
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.team}</p>
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteEntry(c.inningsIdx, c.ball)}
            className="shrink-0 w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

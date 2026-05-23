import React from 'react';
import { getStrikeRate, getEconomy } from '../utils/cricketLogic.js';

export default function Scorecard({ match }) {
  const { innings, setup } = match;
  if (!innings || innings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 pb-8">
      {innings.map((inn, idx) => (
        <InningsCard key={idx} inn={inn} idx={idx} />
      ))}
    </div>
  );
}

function InningsCard({ inn, idx }) {
  const totalBalls = inn.overs * 6 + inn.balls;

  return (
    <div className="card overflow-hidden">
      {/* Innings header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-display text-xl text-white">{inn.battingTeam}</div>
            <div className="text-gray-400 text-sm">{idx === 0 ? '1st Innings' : '2nd Innings'}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl text-white">{inn.score}/{inn.wickets}</div>
            <div className="text-gray-400 text-sm">
              {inn.overs}.{inn.balls} ov •{' '}
              RR: {totalBalls > 0 ? ((inn.score / totalBalls) * 6).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        {/* Extras */}
        {inn.extras && (
          <div className="mt-2 text-xs text-gray-400">
            Extras: {inn.extras.total}{' '}
            (W {inn.extras.wides}, NB {inn.extras.noBalls}, B {inn.extras.byes}, LB {inn.extras.legByes})
          </div>
        )}
      </div>

      {/* Batting */}
      {inn.batsmen && inn.batsmen.length > 0 && (
        <div className="overflow-x-auto">
          <table className="scorecard-table">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-gray-500 dark:text-gray-400 w-1/3">BATTER</th>
                <th className="text-gray-500 dark:text-gray-400 hidden sm:table-cell">DISMISSAL</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">R</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">B</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">4s</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">6s</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
              {inn.batsmen.map((b, i) => (
                <tr key={i} className={`${!b.out ? 'bg-pitch-50/30 dark:bg-pitch-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}>
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{b.name}</div>
                    <div className="text-xs text-gray-400 sm:hidden truncate max-w-[120px]">{b.dismissal}</div>
                    {!b.out && <span className="badge bg-pitch-100 text-pitch-700 dark:bg-pitch-900/30 dark:text-pitch-400 text-xs mt-0.5">not out</span>}
                  </td>
                  <td className="text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">{b.dismissal}</td>
                  <td className="text-right font-bold text-gray-900 dark:text-white">{b.runs}</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">{b.balls}</td>
                  <td className="text-right text-sky-600 dark:text-sky-400">{b.fours}</td>
                  <td className="text-right text-stumps-600 dark:text-stumps-400">{b.sixes}</td>
                  <td className="text-right text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700/50" />

      {/* Bowling */}
      {inn.bowlers && inn.bowlers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="scorecard-table">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-gray-500 dark:text-gray-400">BOWLER</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">O</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">M</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">R</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">W</th>
                <th className="text-gray-500 dark:text-gray-400 text-right">ECON</th>
                <th className="text-gray-500 dark:text-gray-400 text-right hidden sm:table-cell">WD</th>
                <th className="text-gray-500 dark:text-gray-400 text-right hidden sm:table-cell">NB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
              {inn.bowlers.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="font-medium text-gray-900 dark:text-white text-sm">{b.name}</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">{b.overs}.{b.balls % 6 || (b.balls % 6 === 0 && b.balls > 0 ? 0 : b.balls)}</td>
                  <td className="text-right text-gray-600 dark:text-gray-400">{b.maidens}</td>
                  <td className="text-right text-gray-900 dark:text-white">{b.runs}</td>
                  <td className="text-right font-bold text-leather-600 dark:text-leather-400">{b.wickets}</td>
                  <td className="text-right font-mono text-xs text-gray-600 dark:text-gray-400">{b.economy || 0}</td>
                  <td className="text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">{b.wides || 0}</td>
                  <td className="text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">{b.noBalls || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fall of wickets */}
      {inn.fallOfWickets && inn.fallOfWickets.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700/50">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Fall of Wickets</div>
          <div className="flex flex-wrap gap-2">
            {inn.fallOfWickets.map((f, i) => (
              <span key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="font-bold text-leather-600 dark:text-leather-400">{f.wicket}-{f.score}</span>
                {' '}({f.batsman}, {f.overs} ov)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📋</div>
      <p className="font-semibold">No scorecard yet</p>
      <p className="text-sm">Start scoring to see the card here</p>
    </div>
  );
}

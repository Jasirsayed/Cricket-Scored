import React from 'react';
import { Trophy, TrendingUp, Target, Zap, Star } from 'lucide-react';
import { getTopScorer, getBestBowler, getHighestPartnership } from '../utils/cricketLogic.js';

export default function MatchSummary({ match }) {
  const { innings, setup, result, playerOfMatch } = match;

  if (!innings || innings.length === 0) {
    return <EmptyState />;
  }

  const inn1 = innings[0];
  const inn2 = innings.length > 1 ? innings[1] : null;

  const topScorer = inn1 ? getTopScorer(inn1) : null;
  const topScorer2 = inn2 ? getTopScorer(inn2) : null;
  const bestBowler = inn2 ? getBestBowler(inn2) : null;
  const bestBowler2 = inn1 ? getBestBowler(inn1) : null;

  const allBatsmen = [...(inn1?.batsmen || []), ...(inn2?.batsmen || [])];
  const overallTop = allBatsmen.reduce((t, b) => (!t || b.runs > t.runs) ? b : t, null);

  const allBowlers = [...(inn1?.bowlers || []), ...(inn2?.bowlers || [])];
  const overallBestBowler = allBowlers.reduce((best, b) => {
    if (!best) return b;
    if (b.wickets > best.wickets) return b;
    if (b.wickets === best.wickets && b.economy < best.economy) return b;
    return best;
  }, null);

  const totalBalls1 = inn1 ? inn1.overs * 6 + inn1.balls : 0;
  const totalBalls2 = inn2 ? inn2.overs * 6 + inn2.balls : 0;

  return (
    <div className="space-y-4 pb-8">
      {/* Result Banner */}
      {result && (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-pitch-600 to-pitch-700 p-5 text-center">
            <Trophy className="w-10 h-10 text-stumps-400 mx-auto mb-2" />
            <p className="font-display text-3xl text-white tracking-wide">{result}</p>
            {playerOfMatch && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                <Star className="w-4 h-4 text-stumps-400" />
                <span className="text-white text-sm font-semibold">Player of the Match: {playerOfMatch}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score summary */}
      <div className="grid grid-cols-2 gap-3">
        <InningsScoreCard inn={inn1} label="1st Innings" />
        {inn2 && <InningsScoreCard inn={inn2} label="2nd Innings" />}
      </div>

      {/* Key Stats */}
      <div className="card p-4">
        <h3 className="font-display text-xl text-gray-900 dark:text-white mb-3">Key Performers</h3>
        <div className="grid grid-cols-2 gap-3">
          {overallTop && (
            <StatCard
              icon={<TrendingUp className="w-4 h-4 text-sky-500" />}
              label="Top Scorer"
              name={overallTop.name}
              stat={`${overallTop.runs} (${overallTop.balls}b)`}
              color="sky"
            />
          )}
          {overallBestBowler && (
            <StatCard
              icon={<Zap className="w-4 h-4 text-leather-500" />}
              label="Best Bowler"
              name={overallBestBowler.name}
              stat={`${overallBestBowler.wickets}/${overallBestBowler.runs}`}
              color="red"
            />
          )}
        </div>
      </div>

      {/* Innings breakdown */}
      {innings.map((inn, idx) => (
        <InningsDetailCard key={idx} inn={inn} idx={idx} />
      ))}

      {/* Powerplay */}
      {(inn1?.powerplayScore !== undefined || inn2?.powerplayScore !== undefined) && (
        <div className="card p-4">
          <h3 className="font-display text-xl text-gray-900 dark:text-white mb-3">Powerplay Scores</h3>
          <div className="grid grid-cols-2 gap-3">
            {inn1?.powerplayScore !== undefined && (
              <PowerplayCard inn={inn1} />
            )}
            {inn2?.powerplayScore !== undefined && (
              <PowerplayCard inn={inn2} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InningsScoreCard({ inn, label }) {
  if (!inn) return null;
  const totalBalls = inn.overs * 6 + inn.balls;
  const rr = totalBalls > 0 ? ((inn.score / totalBalls) * 6).toFixed(2) : '0.00';

  return (
    <div className="card p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
      <div className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</div>
      <div className="font-semibold text-sm text-gray-600 dark:text-gray-400 truncate">{inn.battingTeam}</div>
      <div className="font-display text-3xl text-gray-900 dark:text-white">
        {inn.score}/{inn.wickets}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {inn.overs}.{inn.balls} ov | RR: {rr}
      </div>
    </div>
  );
}

function StatCard({ icon, label, name, stat, color }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</span>
      </div>
      <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{name}</div>
      <div className={`text-sm font-bold text-${color}-600 dark:text-${color}-400`}>{stat}</div>
    </div>
  );
}

function InningsDetailCard({ inn, idx }) {
  const topBat = getTopScorer(inn);
  const topBowl = getBestBowler(inn);

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg text-gray-900 dark:text-white mb-3">
        {inn.battingTeam} — {inn.score}/{inn.wickets} ({inn.overs}.{inn.balls} ov)
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {topBat && (
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold block">Top Scorer</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{topBat.name}</span>
            <span className="text-gray-500 ml-1">{topBat.runs} ({topBat.balls}b)</span>
          </div>
        )}
        {topBowl && (
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold block">Best vs them</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{topBowl.name}</span>
            <span className="text-gray-500 ml-1">{topBowl.wickets}/{topBowl.runs}</span>
          </div>
        )}
      </div>
      {inn.extras && (
        <div className="mt-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
          Extras: {inn.extras.total} (W {inn.extras.wides}, NB {inn.extras.noBalls}, B {inn.extras.byes}, LB {inn.extras.legByes})
        </div>
      )}
    </div>
  );
}

function PowerplayCard({ inn }) {
  return (
    <div className="bg-pitch-50 dark:bg-pitch-900/20 rounded-xl p-3">
      <div className="text-xs font-semibold text-pitch-600 dark:text-pitch-400 uppercase mb-1">PP ({inn.battingTeam})</div>
      <div className="font-display text-2xl text-gray-900 dark:text-white">
        {inn.powerplayScore}/{inn.powerplayWickets}
      </div>
      <div className="text-xs text-gray-400">First 6 overs</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">No summary yet</p>
      <p className="text-sm">Complete the match to see the summary</p>
    </div>
  );
}

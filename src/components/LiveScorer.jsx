import React, { useState, useCallback, useRef } from 'react';
import {
  RotateCcw, ChevronDown, AlertTriangle, RefreshCw, Flag, ArrowLeftRight
} from 'lucide-react';
import {
  processDelivery, isInningsComplete, formatOvers,
  getRunRate, getRequiredRunRate, getTotalBalls, getTarget,
} from '../utils/cricketLogic.js';

const RUN_BUTTONS = [
  { runs: 0, label: '0', color: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200', size: 'text-2xl' },
  { runs: 1, label: '1', color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300', size: 'text-2xl' },
  { runs: 2, label: '2', color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300', size: 'text-2xl' },
  { runs: 3, label: '3', color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300', size: 'text-2xl' },
  { runs: 4, label: '4', color: 'bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300', size: 'text-2xl' },
  { runs: 6, label: '6', color: 'bg-stumps-50 hover:bg-stumps-100 dark:bg-stumps-900/30 dark:hover:bg-stumps-900/50 text-stumps-700 dark:text-stumps-400', size: 'text-2xl' },
];

const EXTRAS = [
  { key: 'wide', label: 'Wide', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700' },
  { key: 'noBall', label: 'No Ball', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' },
  { key: 'bye', label: 'Bye', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700' },
  { key: 'legBye', label: 'Leg Bye', color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700' },
];

export default function LiveScorer({ match, onUpdate, onEndInnings }) {
  const { setup, innings, currentInnings } = match;
  const inn = innings[currentInnings];

  const isBattingFirst = currentInnings === 0;
  const battingTeam = inn.battingTeam;
  const bowlingTeam = inn.bowlingTeam;

  const battingPlayers = battingTeam === setup.teamA ? setup.playersA : setup.playersB;
  const bowlingPlayers = bowlingTeam === setup.teamA ? setup.playersA : setup.playersB;

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [extraRuns, setExtraRuns] = useState(0);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [wicketDetail, setWicketDetail] = useState('');
  const [flashClass, setFlashClass] = useState('');
  const scoreRef = useRef(null);

  const target = currentInnings === 1 ? getTarget(innings[0]) : null;
  const currentBalls = getTotalBalls(inn.overs, inn.balls);
  const maxBalls = inn.totalOvers * 6;
  const ballsRemaining = maxBalls - currentBalls;
  const runRate = getRunRate(inn.score, currentBalls);
  const rrr = target ? getRequiredRunRate(target, inn.score, ballsRemaining) : null;
  const runsNeeded = target ? target - inn.score : null;

  const striker = inn.currentBatsmen?.striker;
  const nonStriker = inn.currentBatsmen?.nonStriker;
  const currentBowler = inn.currentBowler;

  const strikerStats = inn.batsmen?.find(b => b.name === striker && !b.out);
  const bowlerStats = inn.bowlers?.find(b => b.name === currentBowler);

  const toggleExtra = (key) => {
    setSelectedExtras(prev =>
      prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key]
    );
  };

  const handleRunPress = (runs) => {
    if (!striker || !currentBowler) {
      alert('Please select a batsman and bowler first!');
      return;
    }
    if (runs === 4) triggerFlash('four-flash');
    if (runs === 6) triggerFlash('six-flash');

    const delivery = {
      runs: selectedExtras.includes('bye') || selectedExtras.includes('legBye') ? (extraRuns || runs) : runs,
      isWide: selectedExtras.includes('wide'),
      isNoBall: selectedExtras.includes('noBall'),
      isBye: selectedExtras.includes('bye'),
      isLegBye: selectedExtras.includes('legBye'),
    };

    if (selectedExtras.includes('bye') || selectedExtras.includes('legBye')) {
      delivery.runs = runs;
    }

    processAndUpdate(delivery);
    setSelectedExtras([]);
    setExtraRuns(0);
  };

  const handleWicket = () => {
    if (!striker || !currentBowler) {
      alert('Please select a batsman and bowler first!');
      return;
    }
    setShowWicketModal(true);
  };

  const confirmWicket = () => {
    const delivery = {
      runs: 0,
      isWicket: true,
      dismissalType: wicketType || 'out',
      dismissalText: wicketDetail || wicketType || 'out',
      isWide: false,
      isNoBall: false,
    };
    processAndUpdate(delivery);
    setShowWicketModal(false);
    setWicketType('');
    setWicketDetail('');
    triggerFlash('wicket-shake');

    // Show new batsman selector if wickets < 10
    const newInn = match.innings[currentInnings];
    if ((newInn?.wickets || 0) < 9) {
      setTimeout(() => setShowBatsmanModal(true), 300);
    }
  };

  const processAndUpdate = (delivery) => {
    const newInnings = processDelivery(inn, delivery, striker, currentBowler);

    // Animate score
    if (scoreRef.current) {
      scoreRef.current.classList.remove('score-animate');
      void scoreRef.current.offsetWidth;
      scoreRef.current.classList.add('score-animate');
    }

    const updatedMatch = {
      ...match,
      innings: match.innings.map((inn, i) => i === currentInnings ? newInnings : inn),
    };

    if (isInningsComplete(newInnings)) {
      onUpdate(updatedMatch);
      setTimeout(() => onEndInnings(updatedMatch), 500);
    } else {
      onUpdate(updatedMatch);
    }
  };

  const triggerFlash = (cls) => {
    setFlashClass(cls);
    setTimeout(() => setFlashClass(''), 700);
  };

  const handleUndo = () => {
    if (!inn.ballHistory || inn.ballHistory.length === 0) return;
    // Simple undo: reload from previous state
    alert('Undo: Use match history to restore previous ball. Feature coming soon!');
  };

  const handleSwapStrike = () => {
    const newBatsmen = {
      striker: nonStriker,
      nonStriker: striker,
    };
    const updatedInn = { ...inn, currentBatsmen: newBatsmen };
    onUpdate({
      ...match,
      innings: match.innings.map((x, i) => i === currentInnings ? updatedInn : x),
    });
  };

  const handleSelectBatsman = (name) => {
    const pos = showBatsmanModal === 'nonStriker' ? 'nonStriker' : 'striker';
    const updatedInn = {
      ...inn,
      currentBatsmen: { ...inn.currentBatsmen, [pos]: name },
    };
    if (!inn.batsmen.find(b => b.name === name)) {
      updatedInn.batsmen = [...inn.batsmen, {
        name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0
      }];
    }
    onUpdate({
      ...match,
      innings: match.innings.map((x, i) => i === currentInnings ? updatedInn : x),
    });
    setShowBatsmanModal(false);
  };

  const handleSelectBowler = (name) => {
    const updatedInn = { ...inn, currentBowler: name };
    if (!inn.bowlers.find(b => b.name === name)) {
      updatedInn.bowlers = [...inn.bowlers, {
        name, overs: 0, balls: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0
      }];
    }
    onUpdate({
      ...match,
      innings: match.innings.map((x, i) => i === currentInnings ? updatedInn : x),
    });
    setShowBowlerModal(false);
  };

  const availableBatsmen = battingPlayers.filter(
    p => !inn.batsmen?.find(b => b.name === p && b.out)
  );
  const bowlerOptions = bowlingPlayers;

  return (
    <div className={`pb-8 transition-colors duration-300 ${flashClass}`}>
      {/* Live Score Header */}
      <div className="bg-gradient-to-r from-gray-900 to-green-900 text-white px-4 py-4">
        {/* Match info bar */}
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span>{setup.venue || 'Match'}</span>
          <span className={`badge ${currentInnings === 0 ? 'bg-pitch-500/20 text-pitch-400' : 'bg-orange-500/20 text-orange-400'}`}>
            {currentInnings === 0 ? '1st Innings' : '2nd Innings'}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold text-pitch-400 mb-0.5">{battingTeam}</div>
            <div ref={scoreRef} className="font-display text-6xl tracking-wider leading-none">
              {inn.score}/{inn.wickets}
            </div>
            <div className="text-lg text-gray-300 font-mono mt-1">
              {formatOvers(inn.overs * 6 + inn.balls)} ov
              <span className="text-sm ml-2 text-gray-400">RR: {runRate}</span>
            </div>
          </div>

          {target && (
            <div className="text-right bg-white/10 rounded-xl p-3">
              <div className="text-xs text-gray-400">TARGET</div>
              <div className="font-display text-3xl text-stumps-400">{target}</div>
              <div className="text-xs text-gray-300 mt-1">
                Need <span className="text-white font-bold">{Math.max(0, runsNeeded)}</span> off <span className="text-white font-bold">{ballsRemaining}</span> balls
              </div>
              <div className="text-xs text-orange-400 mt-0.5">RRR: {rrr}</div>
            </div>
          )}
        </div>

        {/* Current batsmen */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowBatsmanModal('striker')}
            className="bg-white/10 hover:bg-white/15 rounded-xl p-2 text-left transition-all"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-pitch-400 text-xs font-bold">*</span>
              <span className="text-xs text-gray-300 truncate">{striker || 'Select batsman'}</span>
            </div>
            {strikerStats && (
              <div className="text-sm font-bold text-white mt-0.5">
                {strikerStats.runs} <span className="text-xs text-gray-400">({strikerStats.balls})</span>
              </div>
            )}
          </button>

          <button
            onClick={() => setShowBatsmanModal('nonStriker')}
            className="bg-white/10 hover:bg-white/15 rounded-xl p-2 text-left transition-all"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 text-xs">○</span>
              <span className="text-xs text-gray-300 truncate">{nonStriker || 'Select batsman'}</span>
            </div>
            {nonStriker && (() => {
              const ns = inn.batsmen?.find(b => b.name === nonStriker && !b.out);
              return ns ? <div className="text-sm font-bold text-white mt-0.5">{ns.runs} <span className="text-xs text-gray-400">({ns.balls})</span></div> : null;
            })()}
          </button>
        </div>

        {/* Current bowler */}
        <button
          onClick={() => setShowBowlerModal(true)}
          className="mt-2 w-full bg-white/10 hover:bg-white/15 rounded-xl p-2 flex justify-between items-center transition-all"
        >
          <span className="text-xs text-gray-400">Bowling: <span className="text-white">{currentBowler || 'Select bowler'}</span></span>
          {bowlerStats && (
            <span className="text-xs text-gray-300 font-mono">
              {bowlerStats.overs}.{bowlerStats.balls} — {bowlerStats.wickets}/{bowlerStats.runs}
            </span>
          )}
        </button>
      </div>

      {/* Current over */}
      {inn.ballHistory && inn.ballHistory.length > 0 && (
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-1 overflow-x-auto">
          <span className="text-xs text-gray-400 mr-2 shrink-0">This over:</span>
          {inn.ballHistory.slice(-6).map((b, i) => (
            <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${b.isWicket ? 'bg-red-600 text-white' :
                b.isWide ? 'bg-orange-500 text-white' :
                b.isNoBall ? 'bg-red-500 text-white' :
                b.runs === 6 ? 'bg-stumps-500 text-white' :
                b.runs === 4 ? 'bg-sky-500 text-white' :
                b.runs === 0 ? 'bg-gray-600 text-gray-300' :
                'bg-gray-500 text-white'}`}>
              {b.isWicket ? 'W' : b.isWide ? 'Wd' : b.isNoBall ? 'NB' : b.runs}
            </div>
          ))}
        </div>
      )}

      {/* Scoring Pad */}
      <div className="p-4 space-y-3">
        {/* Extras toggle */}
        <div className="grid grid-cols-4 gap-2">
          {EXTRAS.map(e => (
            <button
              key={e.key}
              onClick={() => toggleExtra(e.key)}
              className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${selectedExtras.includes(e.key)
                ? e.color + ' border-current shadow-md'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
            >
              {e.label}
            </button>
          ))}
        </div>

        {selectedExtras.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2 text-xs text-orange-700 dark:text-orange-300 text-center">
            Extra selected: {selectedExtras.join(' + ')}. Now press runs scored off it.
          </div>
        )}

        {/* Run buttons */}
        <div className="grid grid-cols-3 gap-3">
          {RUN_BUTTONS.map(btn => (
            <button
              key={btn.runs}
              onClick={() => handleRunPress(btn.runs)}
              className={`btn-run h-20 ${btn.color} border-2 border-transparent`}
            >
              {btn.runs === 4 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold">4</div>
                  <div className="text-xs opacity-70">FOUR</div>
                </div>
              ) : btn.runs === 6 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-xs opacity-70">SIX</div>
                </div>
              ) : (
                <span className={btn.size + ' font-bold'}>{btn.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Wicket & Actions row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWicket}
            className="btn-run h-16 bg-leather-500 hover:bg-leather-600 text-white border-2 border-leather-700 gap-2"
          >
            <span className="text-2xl">🏏</span>
            <span className="text-lg font-bold">WICKET</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSwapStrike} className="btn-run h-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-col gap-0.5 text-xs">
              <ArrowLeftRight className="w-4 h-4" />
              Swap
            </button>
            <button onClick={handleUndo} className="btn-run h-16 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-col gap-0.5 text-xs">
              <RotateCcw className="w-4 h-4" />
              Undo
            </button>
          </div>
        </div>

        {/* End Innings */}
        <button
          onClick={() => onEndInnings(match)}
          className="w-full py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Flag className="w-4 h-4" />
          Declare / End Innings
        </button>
      </div>

      {/* ── Wicket Modal ─────────────────────────────────────────────────── */}
      {showWicketModal && (
        <Modal title="Wicket Details" onClose={() => setShowWicketModal(false)}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">{striker} is OUT!</p>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">DISMISSAL TYPE</label>
              <div className="grid grid-cols-2 gap-2">
                {['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Obstructing', 'Other'].map(type => (
                  <button
                    key={type}
                    onClick={() => setWicketType(type)}
                    className={`py-2 px-3 text-xs rounded-lg font-semibold transition-all ${wicketType === type
                      ? 'bg-leather-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leather-500"
              placeholder="e.g. c Dhoni b Bumrah"
              value={wicketDetail}
              onChange={e => setWicketDetail(e.target.value)}
            />
            <button
              onClick={confirmWicket}
              disabled={!wicketType}
              className="w-full py-3 bg-leather-500 hover:bg-leather-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all"
            >
              Confirm Wicket
            </button>
          </div>
        </Modal>
      )}

      {/* ── Batsman Select Modal ─────────────────────────────────────────── */}
      {showBatsmanModal && (
        <Modal title={`Select ${showBatsmanModal === 'nonStriker' ? 'Non-Striker' : 'Striker'}`} onClose={() => setShowBatsmanModal(false)}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableBatsmen.map(p => (
              <button
                key={p}
                onClick={() => handleSelectBatsman(p)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all
                  ${striker === p || nonStriker === p
                    ? 'bg-pitch-50 dark:bg-pitch-900/20 text-pitch-700 dark:text-pitch-400 font-semibold'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                {p}
                {striker === p && <span className="ml-2 text-xs text-pitch-500">● striker</span>}
                {nonStriker === p && <span className="ml-2 text-xs text-gray-400">○ non-striker</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Bowler Select Modal ──────────────────────────────────────────── */}
      {showBowlerModal && (
        <Modal title="Select Bowler" onClose={() => setShowBowlerModal(false)}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bowlerOptions.map(p => {
              const stats = inn.bowlers?.find(b => b.name === p);
              return (
                <button
                  key={p}
                  onClick={() => handleSelectBowler(p)}
                  className={`w-full flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-all
                    ${currentBowler === p
                      ? 'bg-pitch-50 dark:bg-pitch-900/20 text-pitch-700 dark:text-pitch-400 font-semibold'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                >
                  <span>{p}</span>
                  {stats && (
                    <span className="text-xs text-gray-400 font-mono">
                      {stats.overs}.{stats.balls} — {stats.wickets}/{stats.runs}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-in">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display text-xl text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

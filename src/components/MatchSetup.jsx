import React, { useState } from 'react';
import { ChevronRight, Users, MapPin, Calendar, Trophy, User } from 'lucide-react';

const MATCH_TYPES = [
  { label: 'T10', overs: 10 },
  { label: 'T20', overs: 20 },
  { label: 'ODI', overs: 50 },
  { label: 'Test', overs: 90 },
  { label: 'Custom', overs: null },
];

const DEFAULT_PLAYERS = Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`);

export default function MatchSetup({ onStart }) {
  const [step, setStep] = useState(1);
  const [setup, setSetup] = useState({
    teamA: '',
    teamB: '',
    matchType: 'T20',
    totalOvers: 20,
    customOvers: 20,
    tossWinner: '',
    tossDecision: 'bat',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    umpire: '',
    playersA: [...DEFAULT_PLAYERS],
    playersB: [...DEFAULT_PLAYERS],
  });

  const updateSetup = (key, val) => setSetup(prev => ({ ...prev, [key]: val }));

  const updatePlayer = (team, idx, val) => {
    const key = team === 'A' ? 'playersA' : 'playersB';
    const players = [...setup[key]];
    players[idx] = val;
    updateSetup(key, players);
  };

  const handleMatchType = (type) => {
    updateSetup('matchType', type.label);
    if (type.overs) updateSetup('totalOvers', type.overs);
  };

  const canProceedStep1 = setup.teamA.trim() && setup.teamB.trim();
  const canProceedStep2 = setup.playersA.filter(p => p.trim()).length >= 2 &&
    setup.playersB.filter(p => p.trim()).length >= 2;
  const canProceedStep3 = setup.tossWinner;

  const handleStart = () => {
    const finalSetup = {
      ...setup,
      totalOvers: setup.matchType === 'Custom' ? parseInt(setup.customOvers) || 20 : setup.totalOvers,
      playersA: setup.playersA.filter(p => p.trim()),
      playersB: setup.playersB.filter(p => p.trim()),
    };
    onStart(finalSetup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-pitch-500 rounded-full flex items-center justify-center shadow-lg shadow-pitch-500/30">
              <span className="text-2xl">🏏</span>
            </div>
            <h1 className="font-display text-5xl text-white tracking-wider">AI CRICKET SCORER</h1>
          </div>
          <p className="text-gray-400 text-sm">Professional match scoring for everyone</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-pitch-500' : 'bg-gray-700'}`} />
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1: Match Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-2xl text-gray-900 dark:text-white">Match Details</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">TEAM A NAME</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500"
                    placeholder="e.g. Royal Challengers"
                    value={setup.teamA}
                    onChange={e => updateSetup('teamA', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">TEAM B NAME</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500"
                    placeholder="e.g. Super Kings"
                    value={setup.teamB}
                    onChange={e => updateSetup('teamB', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">MATCH TYPE</label>
                <div className="grid grid-cols-5 gap-2">
                  {MATCH_TYPES.map(type => (
                    <button
                      key={type.label}
                      onClick={() => handleMatchType(type)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${setup.matchType === type.label
                        ? 'bg-pitch-500 text-white shadow-md shadow-pitch-500/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {setup.matchType === 'Custom' && (
                  <input
                    type="number"
                    className="mt-2 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pitch-500"
                    placeholder="Number of overs"
                    value={setup.customOvers}
                    onChange={e => updateSetup('customOvers', e.target.value)}
                    min={1} max={200}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin className="inline w-3 h-3 mr-1" />VENUE
                  </label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500"
                    placeholder="Stadium / Ground"
                    value={setup.venue}
                    onChange={e => updateSetup('venue', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="inline w-3 h-3 mr-1" />DATE
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500"
                    value={setup.date}
                    onChange={e => updateSetup('date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  <User className="inline w-3 h-3 mr-1" />UMPIRE (optional)
                </label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500"
                  placeholder="Umpire name"
                  value={setup.umpire}
                  onChange={e => updateSetup('umpire', e.target.value)}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-3 bg-pitch-500 hover:bg-pitch-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                Add Players <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Player Names */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl text-gray-900 dark:text-white mb-4">Player Names</h2>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {[
                  { label: setup.teamA || 'Team A', key: 'A' },
                  { label: setup.teamB || 'Team B', key: 'B' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-pitch-500" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <input
                          key={i}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-pitch-500"
                          placeholder={`Player ${i + 1}`}
                          value={(key === 'A' ? setup.playersA : setup.playersB)[i] || ''}
                          onChange={e => updatePlayer(key, i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 py-2.5 bg-pitch-500 hover:bg-pitch-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                >
                  Toss <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Toss */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl text-gray-900 dark:text-white mb-4">Toss</h2>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-stumps-400 to-stumps-600 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg shadow-stumps-400/30 mb-3">
                  🪙
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Who won the toss?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[setup.teamA || 'Team A', setup.teamB || 'Team B'].map(team => (
                  <button
                    key={team}
                    onClick={() => updateSetup('tossWinner', team)}
                    className={`py-4 rounded-xl font-semibold text-sm transition-all border-2 ${setup.tossWinner === team
                      ? 'border-pitch-500 bg-pitch-50 dark:bg-pitch-900/20 text-pitch-700 dark:text-pitch-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}
                  >
                    <Trophy className={`w-6 h-6 mx-auto mb-1 ${setup.tossWinner === team ? 'text-stumps-500' : 'text-gray-400'}`} />
                    {team}
                  </button>
                ))}
              </div>

              {setup.tossWinner && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{setup.tossWinner} elects to:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['bat', 'bowl'].map(d => (
                      <button
                        key={d}
                        onClick={() => updateSetup('tossDecision', d)}
                        className={`py-3 rounded-xl font-semibold capitalize transition-all border-2 ${setup.tossDecision === d
                          ? 'border-pitch-500 bg-pitch-500 text-white'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                      >
                        {d === 'bat' ? '🏏 BAT' : '⚾ BOWL'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Back</button>
                <button
                  onClick={handleStart}
                  disabled={!canProceedStep3}
                  className="flex-1 py-2.5 bg-pitch-500 hover:bg-pitch-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pitch-500/30"
                >
                  🏏 Start Match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

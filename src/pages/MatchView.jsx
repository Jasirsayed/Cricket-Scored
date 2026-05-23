import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, Download, Radio } from 'lucide-react';
import LiveScorer from '../components/LiveScorer.jsx';
import Scorecard from '../components/Scorecard.jsx';
import Commentary from '../components/Commentary.jsx';
import MatchSummary from '../components/MatchSummary.jsx';
import AIAnalysis from '../components/AIAnalysis.jsx';
import InningsBreak from '../components/InningsBreak.jsx';
import MatchComplete from '../components/MatchComplete.jsx';
import { exportMatchPDF } from '../utils/pdfExport.js';
import {
  createInnings, calculateResult, isInningsComplete,
  saveMatchToStorage,
} from '../utils/cricketLogic.js';

const TABS = [
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'scorecard', label: 'Scorecard', icon: '📋' },
  { id: 'commentary', label: 'Commentary', icon: '🎙️' },
  { id: 'summary', label: 'Summary', icon: '📊' },
  { id: 'ai', label: 'AI', icon: '✨' },
];

export default function MatchView({ match: initialMatch, onBack, darkMode, onToggleDark }) {
  const [match, setMatch] = useState(initialMatch);
  const [activeTab, setActiveTab] = useState('live');
  const [exporting, setExporting] = useState(false);

  const updateMatch = (updatedMatch) => {
    setMatch(updatedMatch);
    saveMatchToStorage(updatedMatch);
  };

  const handleEndInnings = (m) => {
    if (m.currentInnings === 0) {
      // Start innings break
      const updated = { ...m, status: 'innings_break' };
      updateMatch(updated);
    } else {
      // Match complete
      const result = calculateResult(m);
      const updated = { ...m, status: 'completed', result };
      updateMatch(updated);
    }
  };

  const handleStartSecondInnings = () => {
    const { setup, innings } = match;
    const battingTeam = innings[0].bowlingTeam;
    const bowlingTeam = innings[0].battingTeam;
    const inn2 = createInnings(battingTeam, bowlingTeam, setup.totalOvers);

    const battingPlayers = battingTeam === setup.teamA ? setup.playersA : setup.playersB;
    // Pre-set opening batsmen & bowler from first match
    inn2.currentBatsmen = { striker: battingPlayers[0] || null, nonStriker: battingPlayers[1] || null };
    inn2.batsmen = [
      { name: battingPlayers[0] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
      { name: battingPlayers[1] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
    ].filter(b => b.name);

    const updated = {
      ...match,
      innings: [...match.innings, inn2],
      currentInnings: 1,
      status: 'live',
    };
    updateMatch(updated);
    setActiveTab('live');
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      exportMatchPDF(match);
    } catch (e) {
      alert('Export error: ' + e.message);
    }
    setExporting(false);
  };

  // ── Render status screens ─────────────────────────────────────────────────
  if (match.status === 'innings_break') {
    return (
      <InningsBreak
        match={match}
        onStartSecond={handleStartSecondInnings}
      />
    );
  }

  if (match.status === 'completed') {
    return (
      <MatchComplete
        match={match}
        onNewMatch={onBack}
        onUpdate={updateMatch}
      />
    );
  }

  // ── Live match view ────────────────────────────────────────────────────────
  const inn = match.innings[match.currentInnings];

  // Initialize innings if needed
  if (!inn) {
    // Should not happen but safety net
    const { setup } = match;
    const battingTeam = setup.tossDecision === 'bat' ? setup.tossWinner :
      (setup.tossWinner === setup.teamA ? setup.teamB : setup.teamA);
    const bowlingTeam = battingTeam === setup.teamA ? setup.teamB : setup.teamA;
    const newInn = createInnings(battingTeam, bowlingTeam, setup.totalOvers);

    const battingPlayers = battingTeam === setup.teamA ? setup.playersA : setup.playersB;
    newInn.currentBatsmen = { striker: battingPlayers[0] || null, nonStriker: battingPlayers[1] || null };
    newInn.currentBowler = null;
    newInn.batsmen = [
      { name: battingPlayers[0] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
      { name: battingPlayers[1] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
    ].filter(b => b.name);

    const updated = {
      ...match,
      innings: [newInn],
      status: 'live',
    };
    updateMatch(updated);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top nav */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {match.setup.teamA} vs {match.setup.teamB}
            </div>
            <div className="text-xs text-gray-400">{match.setup.matchType} · {match.setup.venue || 'Unknown'}</div>
          </div>

          <button onClick={onToggleDark} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all shrink-0">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-none border-t border-gray-100 dark:border-gray-700">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-pitch-500 text-pitch-600 dark:text-pitch-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        {activeTab === 'live' && (
          <LiveScorer
            match={match}
            onUpdate={updateMatch}
            onEndInnings={handleEndInnings}
          />
        )}

        {activeTab === 'scorecard' && (
          <div className="p-4">
            <Scorecard match={match} />
          </div>
        )}

        {activeTab === 'commentary' && (
          <div className="p-4">
            <Commentary match={match} onUpdate={updateMatch} />
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="p-4">
            <MatchSummary match={match} />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-4">
            <AIAnalysis match={match} onUpdate={updateMatch} />
          </div>
        )}
      </div>
    </div>
  );
}

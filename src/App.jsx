import React, { useState, useEffect } from 'react';
import MatchList from './components/MatchList.jsx';
import MatchSetup from './components/MatchSetup.jsx';
import MatchView from './pages/MatchView.jsx';
import {
  createMatch, createInnings, saveMatchToStorage,
  getMatchesFromStorage, deleteMatchFromStorage,
} from './utils/cricketLogic.js';
import { SAMPLE_MATCH } from './data/sampleMatch.js';

export default function App() {
  const [view, setView] = useState('list'); // list | setup | match
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('cricket-dark') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load matches from localStorage
  useEffect(() => {
    setMatches(getMatchesFromStorage());
  }, []);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cricket-dark', darkMode);
  }, [darkMode]);

  const handleNewMatch = () => setView('setup');

  const handleSetupComplete = (setup) => {
    // Create match
    const match = createMatch(setup);

    // Determine batting order from toss
    const battingTeam = setup.tossDecision === 'bat'
      ? setup.tossWinner
      : (setup.tossWinner === setup.teamA ? setup.teamB : setup.teamA);
    const bowlingTeam = battingTeam === setup.teamA ? setup.teamB : setup.teamA;

    // Create 1st innings
    const inn = createInnings(battingTeam, bowlingTeam, setup.totalOvers);

    // Set opening batsmen
    const battingPlayers = battingTeam === setup.teamA ? setup.playersA : setup.playersB;
    inn.currentBatsmen = {
      striker: battingPlayers[0] || null,
      nonStriker: battingPlayers[1] || null,
    };
    inn.batsmen = [
      { name: battingPlayers[0] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
      { name: battingPlayers[1] || '', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: 'not out', strikeRate: 0 },
    ].filter(b => b.name);

    const liveMatch = {
      ...match,
      innings: [inn],
      currentInnings: 0,
      status: 'live',
    };

    saveMatchToStorage(liveMatch);
    setMatches(getMatchesFromStorage());
    setActiveMatch(liveMatch);
    setView('match');
  };

  const handleOpenMatch = (match) => {
    setActiveMatch(match);
    setView('match');
  };

  const handleDeleteMatch = (matchId) => {
    deleteMatchFromStorage(matchId);
    setMatches(getMatchesFromStorage());
  };

  const handleMatchUpdate = (updatedMatch) => {
    saveMatchToStorage(updatedMatch);
    setMatches(getMatchesFromStorage());
    setActiveMatch(updatedMatch);
  };

  const handleBack = () => {
    setMatches(getMatchesFromStorage());
    setActiveMatch(null);
    setView('list');
  };

  const handleLoadDemo = () => {
    const demo = {
      ...SAMPLE_MATCH,
      id: `demo-${Date.now()}`,
      status: 'completed',
    };
    saveMatchToStorage(demo);
    setMatches(getMatchesFromStorage());
    setActiveMatch(demo);
    setView('match');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="font-body bg-gray-50 dark:bg-gray-900 min-h-screen">
        {view === 'list' && (
          <MatchList
            matches={matches}
            onNew={handleNewMatch}
            onOpen={handleOpenMatch}
            onDelete={handleDeleteMatch}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {view === 'setup' && (
          <MatchSetup onStart={handleSetupComplete} />
        )}

        {view === 'match' && activeMatch && (
          <MatchView
            match={activeMatch}
            onBack={handleBack}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onMatchUpdate={handleMatchUpdate}
          />
        )}
      </div>
    </div>
  );
}

// ─── Cricket Scoring Logic ─────────────────────────────────────────────────

export function createMatch(setup) {
  return {
    id: `match-${Date.now()}`,
    setup,
    innings: [],
    currentInnings: 0,
    status: 'setup', // setup | live | innings_break | completed
    result: null,
    playerOfMatch: null,
    createdAt: new Date().toISOString(),
  };
}

export function createInnings(battingTeam, bowlingTeam, totalOvers) {
  return {
    battingTeam,
    bowlingTeam,
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
    batsmen: [],
    bowlers: [],
    currentBatsmen: { striker: null, nonStriker: null },
    currentBowler: null,
    fallOfWickets: [],
    commentary: [],
    ballHistory: [],
    partnerships: [],
    currentPartnership: { runs: 0, balls: 0, batsmen: [] },
    powerplayScore: 0,
    powerplayWickets: 0,
    totalOvers,
  };
}

export function createBatsman(name) {
  return {
    name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    out: false,
    dismissal: 'not out',
    strikeRate: 0,
    innings: [],
  };
}

export function createBowler(name) {
  return {
    name,
    overs: 0,
    balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    economy: 0,
    wides: 0,
    noBalls: 0,
    currentOverRuns: 0,
  };
}

export function formatOvers(balls) {
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return remainingBalls === 0 ? `${completedOvers}.0` : `${completedOvers}.${remainingBalls}`;
}

export function formatOversFull(overs, balls) {
  return `${overs}.${balls}`;
}

export function getRunRate(score, totalBalls) {
  if (totalBalls === 0) return '0.00';
  return ((score / totalBalls) * 6).toFixed(2);
}

export function getRequiredRunRate(target, currentScore, ballsRemaining) {
  if (ballsRemaining <= 0) return '---';
  const required = target - currentScore;
  if (required <= 0) return '---';
  return ((required / ballsRemaining) * 6).toFixed(2);
}

export function getStrikeRate(runs, balls) {
  if (balls === 0) return 0;
  return ((runs / balls) * 100).toFixed(1);
}

export function getEconomy(runs, balls) {
  if (balls === 0) return 0;
  return ((runs / balls) * 6).toFixed(2);
}

export function getTotalBalls(overs, balls) {
  return overs * 6 + balls;
}

export function processDelivery(innings, delivery, batsmanName, bowlerName) {
  const {
    runs = 0,
    isWide = false,
    isNoBall = false,
    isBye = false,
    isLegBye = false,
    isWicket = false,
    dismissalType = '',
    dismissalText = '',
  } = delivery;

  const newInnings = deepClone(innings);

  // Find or create batsman
  let strikerIdx = newInnings.batsmen.findIndex(
    b => b.name === batsmanName && !b.out
  );
  if (strikerIdx === -1) {
    newInnings.batsmen.push(createBatsman(batsmanName));
    strikerIdx = newInnings.batsmen.length - 1;
  }

  // Find or create bowler
  let bowlerIdx = newInnings.bowlers.findIndex(b => b.name === bowlerName);
  if (bowlerIdx === -1) {
    newInnings.bowlers.push(createBowler(bowlerName));
    bowlerIdx = newInnings.bowlers.length - 1;
  }

  const striker = newInnings.batsmen[strikerIdx];
  const bowler = newInnings.bowlers[bowlerIdx];

  // Legal delivery counter
  const isLegalDelivery = !isWide && !isNoBall;

  // Calculate runs scored
  let totalRunsThisBall = runs;
  if (isWide) {
    totalRunsThisBall = runs + 1; // wide penalty
    newInnings.extras.wides += 1 + runs;
    newInnings.extras.total += 1 + runs;
    bowler.runs += 1 + runs;
    bowler.wides++;
  } else if (isNoBall) {
    totalRunsThisBall = runs + 1; // no ball penalty
    newInnings.extras.noBalls += 1;
    newInnings.extras.total += 1 + runs;
    bowler.runs += 1 + runs;
    bowler.noBalls++;
    // Batsman still scores off no ball bat runs
    if (!isBye && !isLegBye) {
      striker.runs += runs;
      striker.balls++; // count for SR but ball doesn't count for over
      if (runs === 4) striker.fours++;
      if (runs === 6) striker.sixes++;
    } else if (isBye) {
      newInnings.extras.byes += runs;
    } else if (isLegBye) {
      newInnings.extras.legByes += runs;
    }
  } else if (isBye) {
    newInnings.extras.byes += runs;
    newInnings.extras.total += runs;
    bowler.runs += runs;
    totalRunsThisBall = runs;
  } else if (isLegBye) {
    newInnings.extras.legByes += runs;
    newInnings.extras.total += runs;
    bowler.runs += runs;
    totalRunsThisBall = runs;
  } else {
    // Normal runs off bat
    striker.runs += runs;
    striker.balls++;
    if (runs === 4) striker.fours++;
    if (runs === 6) striker.sixes++;
    bowler.runs += runs;
  }

  // Update score
  newInnings.score += totalRunsThisBall;

  // Wicket
  if (isWicket && !isWide) {
    striker.out = true;
    striker.dismissal = dismissalText || dismissalType || 'out';
    newInnings.wickets++;
    bowler.wickets++;
    newInnings.fallOfWickets.push({
      wicket: newInnings.wickets,
      score: newInnings.score,
      overs: parseFloat(`${newInnings.overs}.${newInnings.balls}`),
      batsman: striker.name,
    });
    // End partnership
    if (newInnings.currentPartnership) {
      newInnings.partnerships.push({ ...newInnings.currentPartnership });
      newInnings.currentPartnership = { runs: 0, balls: 0, batsmen: [] };
    }
  }

  // Partnership tracking
  if (!isWide) {
    newInnings.currentPartnership.runs += totalRunsThisBall;
    if (isLegalDelivery) newInnings.currentPartnership.balls++;
  }

  // Bowler over count
  if (isLegalDelivery) {
    bowler.balls++;
    // Check maiden
    if (bowler.balls % 6 === 0) {
      bowler.overs++;
      const overBalls = newInnings.ballHistory.filter(
        b => b.bowler === bowlerName && !b.isWide && !b.isNoBall
      ).slice(-6);
      const overRuns = overBalls.reduce((s, b) => s + (b.runs || 0), 0);
      if (overRuns === 0 && !overBalls.some(b => b.isWicket)) {
        bowler.maidens++;
      }
      bowler.currentOverRuns = 0;
    }
    bowler.economy = parseFloat(getEconomy(bowler.runs, bowler.balls));
  }

  // Innings balls / overs
  if (isLegalDelivery) {
    newInnings.balls++;
    if (newInnings.balls === 6) {
      newInnings.overs++;
      newInnings.balls = 0;
      // Rotate strike at end of over
      const tmp = newInnings.currentBatsmen.striker;
      newInnings.currentBatsmen.striker = newInnings.currentBatsmen.nonStriker;
      newInnings.currentBatsmen.nonStriker = tmp;
    } else {
      // Rotate strike on odd runs
      if (runs % 2 === 1) {
        const tmp = newInnings.currentBatsmen.striker;
        newInnings.currentBatsmen.striker = newInnings.currentBatsmen.nonStriker;
        newInnings.currentBatsmen.nonStriker = tmp;
      }
    }
  }

  // Powerplay score (first 6 overs)
  if (newInnings.overs < 6 || (newInnings.overs === 6 && newInnings.balls === 0)) {
    newInnings.powerplayScore = newInnings.score;
    newInnings.powerplayWickets = newInnings.wickets;
  }

  // Update strike rates
  newInnings.batsmen.forEach(b => {
    b.strikeRate = parseFloat(getStrikeRate(b.runs, b.balls));
  });

  // Build commentary
  const overBall = `${newInnings.overs}.${newInnings.balls}`;
  const commentaryText = generateCommentary({
    overBall,
    batsmanName,
    bowlerName,
    runs,
    isWide,
    isNoBall,
    isBye,
    isLegBye,
    isWicket,
    dismissalType,
  });

  newInnings.commentary.unshift({ ball: overBall, text: commentaryText, timestamp: Date.now() });

  // Ball history for undo
  newInnings.ballHistory.push({
    overBall,
    batsmanName,
    bowlerName,
    runs,
    isWide,
    isNoBall,
    isBye,
    isLegBye,
    isWicket,
    dismissalType,
    dismissalText,
  });

  return newInnings;
}

export function generateCommentary({ overBall, batsmanName, bowlerName, runs, isWide, isNoBall, isBye, isLegBye, isWicket, dismissalType }) {
  const firstName = batsmanName.split(' ').pop();
  const bowlerFirst = bowlerName.split(' ').pop();

  if (isWicket) {
    const wicketPhrases = [
      `${firstName} is OUT! ${dismissalType}. What a delivery from ${bowlerFirst}!`,
      `Big wicket! ${firstName} departs for ${dismissalType}. The crowd erupts!`,
      `${bowlerFirst} strikes! ${firstName} walks back to the pavilion.`,
      `That's OUT! ${firstName} can't believe it. ${dismissalType}.`,
    ];
    return `${overBall}: ${wicketPhrases[Math.floor(Math.random() * wicketPhrases.length)]}`;
  }

  if (isWide) return `${overBall}: Wide ball from ${bowlerFirst}. Extra run added.`;
  if (isNoBall) return `${overBall}: No ball called! Free hit coming up. ${runs > 0 ? `${firstName} hits ${runs} off the no ball.` : ''}`;

  if (isBye) return `${overBall}: Bye taken. ${runs} run${runs !== 1 ? 's' : ''} to the total.`;
  if (isLegBye) return `${overBall}: Leg bye. ${runs} run${runs !== 1 ? 's' : ''} added.`;

  if (runs === 6) {
    const sixPhrases = [
      `${firstName} sends it into the stands! MAXIMUM! SIX!`,
      `What a clean strike from ${firstName}! SIX over long-on!`,
      `${firstName} clears the boundary! That's a SIX!`,
      `Massive hit from ${firstName}! Six runs!`,
    ];
    return `${overBall}: ${sixPhrases[Math.floor(Math.random() * sixPhrases.length)]}`;
  }

  if (runs === 4) {
    const fourPhrases = [
      `${firstName} drives through covers. FOUR!`,
      `Beautifully timed by ${firstName}. FOUR through the gap!`,
      `${firstName} cuts it late. Racing away for FOUR!`,
      `Perfect placement from ${firstName}. BOUNDARY!`,
    ];
    return `${overBall}: ${fourPhrases[Math.floor(Math.random() * fourPhrases.length)]}`;
  }

  if (runs === 0) {
    const dotPhrases = [
      `${bowlerFirst} bowls a dot. Tight delivery.`,
      `Good ball from ${bowlerFirst}. ${firstName} defends solidly.`,
      `No run off that one. Dot ball.`,
      `${firstName} misses! Dot ball. ${bowlerFirst} is on top.`,
    ];
    return `${overBall}: ${dotPhrases[Math.floor(Math.random() * dotPhrases.length)]}`;
  }

  const runPhrases = [
    `${firstName} works it to leg for ${runs}.`,
    `Nudged away by ${firstName} for ${runs} run${runs !== 1 ? 's' : ''}.`,
    `${firstName} plays a tidy shot for ${runs}.`,
    `${runs} run${runs !== 1 ? 's' : ''} for ${firstName}.`,
  ];
  return `${overBall}: ${runPhrases[Math.floor(Math.random() * runPhrases.length)]}`;
}

export function isInningsComplete(innings) {
  const maxBalls = innings.totalOvers * 6;
  const currentBalls = innings.overs * 6 + innings.balls;
  return innings.wickets >= 10 || currentBalls >= maxBalls;
}

export function getTarget(innings1) {
  return innings1.score + 1;
}

export function calculateResult(match) {
  const innings1 = match.innings[0];
  const innings2 = match.innings[1];
  if (!innings1 || !innings2) return null;

  const teamA = innings1.battingTeam;
  const teamB = innings2.battingTeam;

  if (innings2.score > innings1.score) {
    const wicketsLeft = 10 - innings2.wickets;
    return `${teamB} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
  } else if (innings1.score > innings2.score) {
    const runMargin = innings1.score - innings2.score;
    return `${teamA} won by ${runMargin} run${runMargin !== 1 ? 's' : ''}`;
  } else {
    return 'Match tied';
  }
}

export function getTopScorer(innings) {
  if (!innings || !innings.batsmen || innings.batsmen.length === 0) return null;
  return innings.batsmen.reduce((top, b) => (!top || b.runs > top.runs) ? b : top, null);
}

export function getBestBowler(innings) {
  if (!innings || !innings.bowlers || innings.bowlers.length === 0) return null;
  return innings.bowlers.reduce((best, b) => {
    if (!best) return b;
    if (b.wickets > best.wickets) return b;
    if (b.wickets === best.wickets && b.economy < best.economy) return b;
    return best;
  }, null);
}

export function getHighestPartnership(innings) {
  if (!innings || !innings.partnerships || innings.partnerships.length === 0) return null;
  return innings.partnerships.reduce((max, p) => (!max || p.runs > max.runs) ? p : max, null);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function saveMatchToStorage(match) {
  try {
    const matches = getMatchesFromStorage();
    const idx = matches.findIndex(m => m.id === match.id);
    if (idx >= 0) {
      matches[idx] = match;
    } else {
      matches.unshift(match);
    }
    localStorage.setItem('ai-cricket-matches', JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save match:', e);
  }
}

export function getMatchesFromStorage() {
  try {
    const data = localStorage.getItem('ai-cricket-matches');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteMatchFromStorage(matchId) {
  const matches = getMatchesFromStorage().filter(m => m.id !== matchId);
  localStorage.setItem('ai-cricket-matches', JSON.stringify(matches));
}

export function getMatchFromStorage(matchId) {
  return getMatchesFromStorage().find(m => m.id === matchId) || null;
}

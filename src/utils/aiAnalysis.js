// ─── AI Match Analysis Engine ─────────────────────────────────────────────
// Rule-based locally. Drop in OpenAI/Gemini/Claude API key for enhanced analysis.

import { getTopScorer, getBestBowler, getHighestPartnership, getStrikeRate } from './cricketLogic.js';

// ── Local Rule-Based Analysis ──────────────────────────────────────────────

export function generateLocalAnalysis(match) {
  const { setup, innings } = match;
  if (!innings || innings.length === 0) return null;

  const innings1 = innings[0];
  const innings2 = innings.length > 1 ? innings[1] : null;

  const topScorer1 = getTopScorer(innings1);
  const bestBowler1 = getBestBowler(innings2);
  const topScorer2 = innings2 ? getTopScorer(innings2) : null;
  const bestBowler2 = getBestBowler(innings1);

  // Overall top scorer
  const allScorers = [
    ...(innings1?.batsmen || []),
    ...(innings2?.batsmen || []),
  ];
  const topScorer = allScorers.reduce((top, b) => (!top || b.runs > top.runs) ? b : top, null);

  // Best bowler overall
  const allBowlers = [
    ...(innings1?.bowlers || []),
    ...(innings2?.bowlers || []),
  ];
  const bestBowler = allBowlers.reduce((best, b) => {
    if (!best) return b;
    if (b.wickets > best.wickets) return b;
    if (b.wickets === best.wickets && b.economy < best.economy) return b;
    return best;
  }, null);

  const team1 = setup.teamA || innings1.battingTeam;
  const team2 = setup.teamB || innings1.bowlingTeam;
  const result = match.result || 'Match in progress';

  // Match summary paragraph
  const summary = buildSummary(setup, innings1, innings2, result, topScorer, bestBowler);

  // Turning point
  const turningPoint = findTurningPoint(innings1, innings2);

  // Pressure moment
  const pressureMoment = findPressureMoment(innings1, innings2);

  // Performance ratings
  const team1Rating = rateTeamPerformance(innings1, innings2);
  const team2Rating = rateTeamPerformance(innings2, innings1);

  // Player of the match suggestion
  const suggestedPOM = suggestPlayerOfMatch(innings1, innings2, topScorer, bestBowler);

  // Social media caption
  const caption = buildCaption(setup, innings1, innings2, result, suggestedPOM);

  return {
    summary,
    turningPoint,
    pressureMoment,
    bestPerformer: topScorer ? `${topScorer.name} (${topScorer.runs} runs off ${topScorer.balls} balls, SR: ${getStrikeRate(topScorer.runs, topScorer.balls)})` : 'N/A',
    suggestedPOM: suggestedPOM?.name || 'N/A',
    suggestedPOMStats: suggestedPOM ? buildPOMStats(suggestedPOM) : '',
    team1Rating: { team: team1, rating: team1Rating },
    team2Rating: { team: team2, rating: team2Rating },
    socialCaption: caption,
  };
}

function buildSummary(setup, innings1, innings2, result, topScorer, bestBowler) {
  const matchType = setup.matchType || 'T20';
  const venue = setup.venue || 'the venue';
  const date = setup.date ? new Date(setup.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'today';

  let s = `In a thrilling ${matchType} match played at ${venue} on ${date}, `;
  s += `${innings1.battingTeam} batted first and posted a score of `;
  s += `${innings1.score}/${innings1.wickets} in ${innings1.overs}.${innings1.balls} overs. `;

  if (topScorer) {
    s += `${topScorer.name} was the star with a brilliant ${topScorer.runs}-run knock. `;
  }

  if (innings2) {
    s += `In reply, ${innings2.battingTeam} `;
    if (innings2.score > innings1.score) {
      s += `chased down the target of ${innings1.score + 1} `;
      s += `with ${10 - innings2.wickets} wickets in hand. `;
    } else {
      s += `could only manage ${innings2.score}/${innings2.wickets}. `;
    }
    if (bestBowler && bestBowler.wickets > 0) {
      s += `${bestBowler.name} was the pick of the bowlers with ${bestBowler.wickets}/${bestBowler.runs}. `;
    }
    s += result + '.';
  }

  return s;
}

function findTurningPoint(innings1, innings2) {
  // Look for a cluster of wickets or a big over
  if (innings2 && innings2.fallOfWickets && innings2.fallOfWickets.length >= 2) {
    const fow = innings2.fallOfWickets;
    for (let i = 1; i < fow.length; i++) {
      const runsBetween = fow[i].score - fow[i - 1].score;
      if (runsBetween <= 5) {
        return `The match swung dramatically when ${innings2.battingTeam} lost 2 wickets in quick succession around the ${Math.floor(fow[i].overs)}-over mark. The collapse from ${fow[i-1].score}/${fow[i-1].wicket} to ${fow[i].score}/${fow[i].wicket} effectively ended the chase.`;
      }
    }
  }

  if (innings1 && innings1.batsmen) {
    const highScorer = getTopScorer(innings1);
    if (highScorer && highScorer.runs > 40) {
      return `The pivotal moment came when ${highScorer.name} was dismissed for ${highScorer.runs}. The batting side lost control after that key wicket, changing the game's momentum significantly.`;
    }
  }

  return `The momentum shifted in the middle overs when tight bowling restricted the flow of runs, creating sustained pressure on the batting side.`;
}

function findPressureMoment(innings1, innings2) {
  if (!innings2) return 'Match still in progress.';

  const target = innings1.score + 1;
  const lastFew = innings2.fallOfWickets?.slice(-2) || [];

  if (lastFew.length >= 1) {
    const last = lastFew[lastFew.length - 1];
    const runsNeeded = target - last.score;
    const ballsLeft = innings2.totalOvers * 6 - Math.floor(last.overs * 6);
    if (runsNeeded > 0 && ballsLeft > 0) {
      return `With ${runsNeeded} runs needed off ${ballsLeft} balls and key wickets falling, every delivery became a pressure cooker. The asking rate soared above ${((runsNeeded / ballsLeft) * 6).toFixed(1)} — a supreme test of nerve.`;
    }
  }

  return `The death overs proved decisive. Defending ${innings1.score - 10} in the last 3 overs required nerves of steel from both sides.`;
}

function rateTeamPerformance(battingInnings, bowlingInnings) {
  if (!battingInnings) return { score: 0, label: 'N/A', color: 'gray' };

  let score = 5; // base

  // Batting rating
  const totalOvers = battingInnings.totalOvers || 20;
  const runRate = (battingInnings.score / totalOvers);

  if (runRate >= 10) score = 9;
  else if (runRate >= 8) score = 8;
  else if (runRate >= 7) score = 7;
  else if (runRate >= 6) score = 6;
  else if (runRate >= 5) score = 5;
  else score = 4;

  // Penalise for wickets lost
  if (battingInnings.wickets >= 9) score -= 1;
  if (battingInnings.wickets <= 3) score += 0.5;

  // Bowling rating (if opponent innings given)
  if (bowlingInnings) {
    const defended = battingInnings.score > bowlingInnings.score;
    if (defended) score += 0.5;
  }

  score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

  const label =
    score >= 9 ? 'Outstanding' :
    score >= 8 ? 'Excellent' :
    score >= 7 ? 'Very Good' :
    score >= 6 ? 'Good' :
    score >= 5 ? 'Average' :
    'Below Par';

  const color =
    score >= 8 ? 'green' :
    score >= 6 ? 'blue' :
    score >= 5 ? 'yellow' : 'red';

  return { score, label, color };
}

function suggestPlayerOfMatch(innings1, innings2, topScorer, bestBowler) {
  const candidates = [];

  if (topScorer) candidates.push({ ...topScorer, type: 'bat', value: topScorer.runs + (topScorer.fours * 0.5) + (topScorer.sixes * 2) });
  if (bestBowler) candidates.push({ ...bestBowler, type: 'bowl', value: bestBowler.wickets * 25 - bestBowler.economy * 2 });

  // All-rounders
  const allPlayers = [...(innings1?.batsmen || []), ...(innings2?.batsmen || [])];
  allPlayers.forEach(b => {
    const bowlerMatch = [...(innings1?.bowlers || []), ...(innings2?.bowlers || [])].find(bw => bw.name === b.name);
    if (bowlerMatch && b.runs >= 20 && bowlerMatch.wickets >= 1) {
      candidates.push({
        ...b,
        type: 'all-round',
        value: b.runs + bowlerMatch.wickets * 25,
      });
    }
  });

  if (candidates.length === 0) return topScorer || bestBowler;
  return candidates.reduce((best, c) => (!best || c.value > best.value) ? c : best, null);
}

function buildPOMStats(pom) {
  if (!pom) return '';
  if (pom.type === 'bat' || pom.runs !== undefined) {
    return `${pom.runs} runs (${pom.balls} balls, ${pom.fours}×4, ${pom.sixes}×6, SR: ${getStrikeRate(pom.runs, pom.balls)})`;
  }
  if (pom.type === 'bowl' || pom.wickets !== undefined) {
    return `${pom.wickets}/${pom.runs} in ${pom.overs} overs (Econ: ${pom.economy})`;
  }
  return '';
}

function buildCaption(setup, innings1, innings2, result, pom) {
  const t1 = innings1.battingTeam;
  const t2 = innings1.bowlingTeam;
  const score1 = `${innings1.score}/${innings1.wickets}`;
  const score2 = innings2 ? `${innings2.score}/${innings2.wickets}` : '';

  let caption = `🏏 MATCH RESULT\n`;
  caption += `${t1} ${score1} vs ${t2}`;
  if (score2) caption += ` ${score2}`;
  caption += `\n\n${result}\n`;
  if (pom) caption += `\n🌟 Player of the Match: ${pom.name}`;
  caption += `\n\n#Cricket #${t1.replace(/\s/g, '')} #${t2.replace(/\s/g, '')} #AICricketScorer`;
  return caption;
}

// ── Optional: API-powered analysis ────────────────────────────────────────
// Replace LOCAL_ONLY with your preferred AI provider

export async function generateAIAnalysis(match, apiConfig = {}) {
  const { provider = 'local', apiKey = '', model = '' } = apiConfig;

  if (provider === 'local' || !apiKey) {
    return { source: 'local', data: generateLocalAnalysis(match) };
  }

  const prompt = buildAnalysisPrompt(match);

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        }),
      });
      const data = await res.json();
      return { source: 'openai', data: parseAIResponse(data.choices[0].message.content) };
    }

    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      return { source: 'gemini', data: parseAIResponse(data.candidates[0].content.parts[0].text) };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: model || 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      return { source: 'claude', data: parseAIResponse(data.content[0].text) };
    }
  } catch (e) {
    console.error('AI API error, falling back to local:', e);
    return { source: 'local', data: generateLocalAnalysis(match) };
  }

  return { source: 'local', data: generateLocalAnalysis(match) };
}

function buildAnalysisPrompt(match) {
  const { setup, innings, result } = match;
  const i1 = innings[0];
  const i2 = innings[1];

  return `You are a cricket analyst. Analyze this match and respond ONLY with a JSON object with these exact keys:
{
  "summary": "2-3 sentence match summary paragraph",
  "turningPoint": "1-2 sentences on the turning point",
  "bestPerformer": "name and stats",
  "pressureMoment": "1-2 sentences describing the key pressure moment",
  "suggestedPOM": "player name",
  "suggestedPOMStats": "stats string",
  "team1Rating": { "team": "name", "rating": { "score": 7.5, "label": "Good", "color": "blue" } },
  "team2Rating": { "team": "name", "rating": { "score": 6.0, "label": "Average", "color": "yellow" } },
  "socialCaption": "short social media post"
}

Match Data:
- Match type: ${setup.matchType}
- Venue: ${setup.venue}
- ${i1?.battingTeam}: ${i1?.score}/${i1?.wickets} in ${i1?.overs}.${i1?.balls} overs
- ${i2?.battingTeam}: ${i2?.score}/${i2?.wickets} in ${i2?.overs}.${i2?.balls} overs
- Result: ${result}
- Top scorer: ${getTopScorer(i1)?.name || 'N/A'} (${getTopScorer(i1)?.runs || 0} runs)
- Best bowler: ${getBestBowler(i2)?.name || 'N/A'} (${getBestBowler(i2)?.wickets || 0} wickets)`;
}

function parseAIResponse(text) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

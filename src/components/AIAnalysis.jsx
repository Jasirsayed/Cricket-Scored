import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Loader2, Settings } from 'lucide-react';
import { generateLocalAnalysis, generateAIAnalysis } from '../utils/aiAnalysis.js';

export default function AIAnalysis({ match, onUpdate }) {
  const [analysis, setAnalysis] = useState(match.aiAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    provider: 'local',
    apiKey: '',
    model: '',
  });

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await generateAIAnalysis(match, apiConfig);
      setAnalysis(result.data);
      onUpdate({ ...match, aiAnalysis: result.data });
    } catch (e) {
      const local = generateLocalAnalysis(match);
      setAnalysis(local);
      onUpdate({ ...match, aiAnalysis: local });
    }
    setLoading(false);
  };

  const copyCaption = () => {
    if (analysis?.socialCaption) {
      navigator.clipboard.writeText(analysis.socialCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ratingColor = (color) => {
    const map = {
      green: 'text-pitch-600 dark:text-pitch-400 bg-pitch-50 dark:bg-pitch-900/20',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      yellow: 'text-stumps-600 dark:text-stumps-400 bg-stumps-50 dark:bg-stumps-900/20',
      red: 'text-leather-600 dark:text-leather-400 bg-leather-50 dark:bg-leather-900/20',
      gray: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
    };
    return map[color] || map.gray;
  };

  if (!match.innings || match.innings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">AI Analysis not available</p>
        <p className="text-sm">Start the match to get AI insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-xl text-gray-900 dark:text-white">AI Match Analysis</h3>
              <p className="text-xs text-gray-400">{apiConfig.provider === 'local' ? 'Rule-based engine' : `Powered by ${apiConfig.provider}`}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowApiSettings(!showApiSettings)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-pitch-500 hover:bg-pitch-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-pitch-500/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Analysing...' : analysis ? 'Re-analyse' : 'Analyse Match'}
            </button>
          </div>
        </div>

        {/* API settings */}
        {showApiSettings && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 space-y-2 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs font-semibold text-gray-500">AI Provider (optional)</p>
            <div className="grid grid-cols-3 gap-2">
              {['local', 'openai', 'gemini', 'claude'].map(p => (
                <button
                  key={p}
                  onClick={() => setApiConfig(prev => ({ ...prev, provider: p }))}
                  className={`py-1.5 px-2 text-xs rounded-lg font-semibold capitalize transition-all ${apiConfig.provider === p
                    ? 'bg-pitch-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            {apiConfig.provider !== 'local' && (
              <input
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pitch-500"
                placeholder={`${apiConfig.provider.toUpperCase()} API Key`}
                type="password"
                value={apiConfig.apiKey}
                onChange={e => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            )}
          </div>
        )}
      </div>

      {/* Analysis output */}
      {analysis && (
        <>
          {/* Match Summary */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📝</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">Match Summary</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key insights row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InsightCard
              icon="🔄"
              title="Turning Point"
              content={analysis.turningPoint}
            />
            <InsightCard
              icon="⚡"
              title="Pressure Moment"
              content={analysis.pressureMoment}
            />
          </div>

          {/* Best performer + POM */}
          <div className="card p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏆</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Best Performer</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.bestPerformer}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⭐</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Suggested POM</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{analysis.suggestedPOM}</p>
                <p className="text-xs text-gray-500">{analysis.suggestedPOMStats}</p>
              </div>
            </div>
          </div>

          {/* Team ratings */}
          {(analysis.team1Rating || analysis.team2Rating) && (
            <div className="card p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Team Performance Ratings</h4>
              <div className="space-y-3">
                {[analysis.team1Rating, analysis.team2Rating].filter(Boolean).map((tr, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tr.team}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor(tr.rating?.color)}`}>
                        {tr.rating?.label} ({tr.rating?.score}/10)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${tr.rating?.color === 'green' ? 'bg-pitch-500' :
                          tr.rating?.color === 'blue' ? 'bg-blue-500' :
                          tr.rating?.color === 'yellow' ? 'bg-stumps-500' : 'bg-leather-500'}`}
                        style={{ width: `${(tr.rating?.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social caption */}
          {analysis.socialCaption && (
            <div className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Social Media Caption</h4>
                </div>
                <button
                  onClick={copyCaption}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all"
                >
                  {copied ? <><Check className="w-3 h-3 text-pitch-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-body bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                {analysis.socialCaption}
              </pre>
            </div>
          )}
        </>
      )}

      {!analysis && !loading && (
        <div className="text-center py-8 text-gray-400">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Analyse Match" to get AI-powered insights</p>
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon, title, content }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{content}</p>
    </div>
  );
}

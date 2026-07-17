export const API_BASE_URL = 'http://localhost:8080/api';

const withSessionFilter = (url: string, sessionCode?: string | null) =>
  sessionCode ? `${url}?sessionCode=${encodeURIComponent(sessionCode)}` : url;

export const API_ENDPOINTS = {
  players: `${API_BASE_URL}/players`,
  playSessions: `${API_BASE_URL}/play-sessions`,
  playSession: (sessionCode: string) => `${API_BASE_URL}/play-sessions/${sessionCode}`,
  playSessionStats: (sessionCode: string) => `${API_BASE_URL}/play-sessions/${sessionCode}/stats`,
  completePlaySession: (sessionCode: string) => `${API_BASE_URL}/play-sessions/${sessionCode}/complete`,
  nextRound: `${API_BASE_URL}/schedules/rounds/next`,
  completeRound: `${API_BASE_URL}/schedules/rounds/complete`,
  history: (sessionCode?: string | null) => withSessionFilter(`${API_BASE_URL}/schedules/history`, sessionCode),
  ranking: (sessionCode?: string | null) => withSessionFilter(`${API_BASE_URL}/schedules/ranking`, sessionCode)
} as const;
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  players: `${API_BASE_URL}/players`,
  playSessions: `${API_BASE_URL}/play-sessions`,
  nextRound: `${API_BASE_URL}/schedules/rounds/next`,
  completeRound: `${API_BASE_URL}/schedules/rounds/complete`
} as const;
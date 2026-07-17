import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { ETeamCode } from '../../../core/enums/team-code.enum';
import { EMPTY_PLAYER_FORM } from './badminton-club.constants';
import {
  ApiResponse,
  HistoryResponse,
  Match,
  MatchHistory,
  Player,
  PlaySessionStateResponse,
  PlaySessionSummary,
  RankingResponse,
  RankingRow,
  RoundInfo,
  RoundResponse,
  SessionPlayerStat,
  SessionResponse,
  SessionStatsResponse
} from './badminton-club.models';

@Injectable({ providedIn: 'root' })
export class BadmintonClubService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private messageTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly players = signal<Player[]>([]);
  readonly selectedCodes = signal<Set<string>>(new Set());
  readonly history = signal<MatchHistory[]>([]);
  readonly ranking = signal<RankingRow[]>([]);
  readonly sessions = signal<PlaySessionSummary[]>([]);
  readonly selectedHistorySession = signal<string>('');
  readonly currentSession = signal<string | null>(null);
  readonly currentSessionStats = signal<SessionPlayerStat[]>([]);
  readonly currentRound = signal<RoundResponse | null>(null);
  readonly completedCourts = signal<Record<number, ETeamCode>>({});
  readonly selectedPlayer = signal<Player | null>(null);
  readonly editingPlayerCode = signal<string | null>(null);
  readonly showCreateForm = signal(false);
  readonly loading = signal(false);
  readonly message = signal('');

  courtCount = 1;
  playerForm: Player = { ...EMPTY_PLAYER_FORM };
  editPlayerForm: Player = { ...EMPTY_PLAYER_FORM };

  readonly groupedHistory = computed(() => {
    const groups = new Map<string, MatchHistory[]>();

    for (const item of this.history()) {
      groups.set(item.sessionCode, [...(groups.get(item.sessionCode) ?? []), item]);
    }

    return Array.from(groups.entries()).map(([sessionCode, items]) => ({ sessionCode, items }));
  });

  init(): void {
    if (!this.isBrowser) {
      return;
    }

    this.restoreCurrentSession();
    this.loadSessions();
    this.loadHistory();
    this.loadRanking();
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Player[]>>(API_ENDPOINTS.players).subscribe({
      next: (response) => {
        const players = this.sortPlayersByLastName(response.data ?? []);
        this.players.set(players);
        if (this.selectedCodes().size === 0) {
          this.selectedCodes.set(new Set(players.map((player) => player.playerCode)));
        }
        this.loading.set(false);
      },
      error: () => {
        this.showMessage('Không tải được danh sách người chơi. Hãy kiểm tra backend B7N_BE.');
        this.loading.set(false);
      }
    });
  }

  loadSessions(): void {
    this.http.get<ApiResponse<PlaySessionSummary[]>>(API_ENDPOINTS.playSessions).subscribe({
      next: (response) => this.sessions.set(response.data ?? []),
      error: () => this.showMessage('Không tải được danh sách ca chơi.')
    });
  }

  changeHistorySession(sessionCode: string): void {
    this.selectedHistorySession.set(sessionCode);
    this.loadHistory();
    this.loadRanking();
  }

  loadHistory(): void {
    this.http.get<ApiResponse<HistoryResponse>>(API_ENDPOINTS.history(this.selectedHistorySession())).subscribe({
      next: (response) => this.history.set(response.data?.history ?? []),
      error: () => this.showMessage('Không tải được lịch sử trận đấu.')
    });
  }

  loadRanking(): void {
    this.http.get<ApiResponse<RankingResponse>>(API_ENDPOINTS.ranking(this.selectedHistorySession())).subscribe({
      next: (response) => this.ranking.set(response.data?.ranking ?? []),
      error: () => this.showMessage('Không tải được bảng xếp hạng.')
    });
  }

  addPlayer(): void {
    if (!this.playerForm.playerCode || !this.playerForm.name) {
      this.showMessage('Vui lòng nhập mã và tên người chơi.');
      return;
    }

    this.loading.set(true);
    this.http.post<ApiResponse<Player>>(API_ENDPOINTS.players, this.playerForm).subscribe({
      next: () => {
        this.showMessage('Đã thêm người chơi.');
        this.resetPlayerForm();
        this.showCreateForm.set(false);
        this.loadPlayers();
      },
      error: () => {
        this.showMessage('Không thêm được người chơi.');
        this.loading.set(false);
      }
    });
  }

  startEditPlayer(player: Player): void {
    this.editPlayerForm = { ...player };
    this.editingPlayerCode.set(player.playerCode);
  }

  cancelEditPlayer(): void {
    this.editingPlayerCode.set(null);
    this.editPlayerForm = { ...EMPTY_PLAYER_FORM };
  }

  updateEditingPlayer(): void {
    const playerCode = this.editingPlayerCode();
    if (!playerCode || !this.editPlayerForm.name) {
      this.showMessage('Vui lòng nhập tên người chơi.');
      return;
    }

    const payload = {
      name: this.editPlayerForm.name,
      gender: this.editPlayerForm.gender,
      level: this.editPlayerForm.level
    };

    this.loading.set(true);
    this.http.patch<ApiResponse<Player>>(`${API_ENDPOINTS.players}/${playerCode}`, payload).subscribe({
      next: () => {
        this.showMessage('Đã cập nhật người chơi.');
        this.cancelEditPlayer();
        this.loadPlayers();
      },
      error: () => {
        this.showMessage('Không cập nhật được người chơi.');
        this.loading.set(false);
      }
    });
  }

  updateSelectedPlayer(): void {
    const player = this.selectedPlayer();
    if (!player) {
      return;
    }

    const payload = { name: player.name, gender: player.gender, level: player.level };
    this.http.patch<ApiResponse<Player>>(`${API_ENDPOINTS.players}/${player.playerCode}`, payload).subscribe({
      next: (response) => {
        this.selectedPlayer.set(response.data);
        this.showMessage('Đã cập nhật người chơi.');
        this.loadPlayers();
      },
      error: () => this.showMessage('Không cập nhật được người chơi.')
    });
  }

  deletePlayer(player: Player): void {
    if (!confirm(`Xóa ${player.name}?`)) {
      return;
    }

    this.http.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.players}/${player.playerCode}`).subscribe({
      next: () => {
        this.selectedCodes.update((codes) => {
          const next = new Set(codes);
          next.delete(player.playerCode);
          return next;
        });
        if (this.editingPlayerCode() === player.playerCode) {
          this.cancelEditPlayer();
        }
        this.loadPlayers();
      },
      error: () => this.showMessage('Không xóa được người chơi.')
    });
  }

  openPlayerDetail(player: Player): void {
    this.selectedPlayer.set({ ...player });
  }

  closePlayerDetail(): void {
    this.selectedPlayer.set(null);
  }

  togglePlayer(code: string): void {
    this.selectedCodes.update((codes) => {
      const next = new Set(codes);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  selectAll(): void {
    this.selectedCodes.set(new Set(this.players().map((player) => player.playerCode)));
  }

  clearSelection(): void {
    this.selectedCodes.set(new Set());
  }

  prepareCreateForm(): void {
    this.playerForm = {
      ...EMPTY_PLAYER_FORM,
      playerCode: this.newPlayerCode()
    };
    this.showCreateForm.update((value) => !value);
  }

  scheduleRound(): void {
    const playerCodes = Array.from(this.selectedCodes());
    if (playerCodes.length < 4) {
      this.showMessage('Cần ít nhất 4 người chơi để xếp trận đôi.');
      return;
    }

    this.loading.set(true);
    const request = this.currentSession()
      ? null
      : this.http.post<ApiResponse<SessionResponse>>(API_ENDPOINTS.playSessions, {
          courtCount: this.courtCount,
          playerCodes
        });

    if (request) {
      request.subscribe({
        next: (response) => {
          this.setCurrentSession(response.data.session.sessionCode);
          this.loadSessionStats(response.data.session.sessionCode);
          this.generateNextRound(response.data.session.sessionCode);
        },
        error: () => {
          this.showMessage('Không tạo được ca chơi.');
          this.loading.set(false);
        }
      });
      return;
    }

    this.generateNextRound(this.currentSession()!);
  }

  completeSession(): void {
    const sessionCode = this.currentSession();
    if (!sessionCode) {
      return;
    }

    if (!confirm(`Kết thúc ca chơi ${sessionCode} và giữ lại lịch sử trong DB?`)) {
      return;
    }

    this.loading.set(true);
    this.http.post<ApiResponse<unknown>>(API_ENDPOINTS.completePlaySession(sessionCode), {}).subscribe({
      next: () => {
        this.clearCurrentSession();
        this.showMessage('Đã kết thúc ca chơi. Bạn có thể tạo ca mới.');
        this.loadSessions();
        this.loadHistory();
        this.loadRanking();
        this.loading.set(false);
      },
      error: () => {
        this.showMessage('Không kết thúc được ca chơi. Hãy hoàn thành vòng đang xếp trước.');
        this.loading.set(false);
      }
    });
  }
  cancelSchedule(): void {
    const sessionCode = this.currentSession();
    if (!sessionCode) {
      this.currentRound.set(null);
      this.completedCourts.set({});
      return;
    }

    if (!confirm(`Hủy ca chơi ${sessionCode} và xóa dữ liệu đã xếp trong DB?`)) {
      return;
    }

    this.loading.set(true);
    this.http.delete<ApiResponse<unknown>>(API_ENDPOINTS.playSession(sessionCode)).subscribe({
      next: () => {
        this.clearCurrentSession();
        this.showMessage('Đã hủy ca chơi và xóa dữ liệu trong DB.');
        this.loadSessions();
        this.loadHistory();
        this.loadRanking();
        this.loading.set(false);
      },
      error: () => {
        this.showMessage('Không hủy được ca chơi.');
        this.loading.set(false);
      }
    });
  }

  recordWinner(match: Match, winner: ETeamCode): void {
    if (this.completedCourts()[match.courtNumber]) {
      return;
    }

    this.completedCourts.update((courts) => ({ ...courts, [match.courtNumber]: winner }));

    const round = this.currentRound();
    const completedCount = Object.keys(this.completedCourts()).length;
    if (round && completedCount >= round.matches.length) {
      this.completeRound(round.round);
    }
  }

  clearHistory(): void {
    this.showMessage('Lịch sử trận đấu đang được quản lý trong DB.');
  }

  matchCountFor(playerCode: string): number {
    return this.currentSessionStats().find((stat) => stat.player.playerCode === playerCode)?.matchCount ?? 0;
  }

  private generateNextRound(sessionCode: string): void {
    this.http.post<ApiResponse<RoundResponse>>(API_ENDPOINTS.nextRound, { sessionCode }).subscribe({
      next: (response) => {
        this.currentRound.set(response.data);
        this.completedCourts.set({});
        this.loadSessionStats(sessionCode);
        this.showMessage(`Đã xếp vòng ${response.data.round.roundNumber} cho ca ${sessionCode}.`);
        this.loading.set(false);
      },
      error: () => {
        this.showMessage('Không xếp được trận. Có thể vòng trước chưa hoàn thành hoặc thiếu người.');
        this.loading.set(false);
      }
    });
  }

  private completeRound(round: RoundInfo): void {
    const results = Object.entries(this.completedCourts()).map(([courtNumber, winner]) => ({
      courtNumber: Number(courtNumber),
      winner
    }));

    this.http
      .post<ApiResponse<RoundResponse>>(API_ENDPOINTS.completeRound, {
        sessionCode: round.sessionCode,
        roundNumber: round.roundNumber,
        results
      })
      .subscribe({
        next: () => {
          this.currentRound.set(null);
          this.completedCourts.set({});
          this.loadSessionStats(round.sessionCode);
          this.loadHistory();
          this.loadRanking();
          this.showMessage('Đã lưu kết quả vòng. Có thể xếp vòng tiếp theo.');
        },
        error: () => this.showMessage('Không lưu được kết quả vòng vào DB.')
      });
  }

  private loadSessionState(sessionCode: string): void {
    this.http.get<ApiResponse<PlaySessionStateResponse>>(API_ENDPOINTS.playSession(sessionCode)).subscribe({
      next: (response) => {
        this.setCurrentSession(response.data.session.sessionCode);
        this.courtCount = response.data.session.courtCount;
        this.currentSessionStats.set(this.sortSessionStatsByPlayerName(response.data.players ?? []));
        this.currentRound.set(response.data.currentRound);
        this.completedCourts.set({});
      },
      error: () => {
        this.clearCurrentSession();
        this.showMessage('Ca chơi đã lưu không còn tồn tại.');
      }
    });
  }

  private loadSessionStats(sessionCode: string): void {
    this.http.get<ApiResponse<SessionStatsResponse>>(API_ENDPOINTS.playSessionStats(sessionCode)).subscribe({
      next: (response) => this.currentSessionStats.set(this.sortSessionStatsByPlayerName(response.data?.players ?? [])),
      error: () => this.showMessage('Không tải được thống kê ca chơi.')
    });
  }

  private restoreCurrentSession(): void {
    const sessionCode = localStorage.getItem(STORAGE_KEYS.currentSession);
    if (!sessionCode) {
      return;
    }

    this.loadSessionState(sessionCode);
  }

  private setCurrentSession(sessionCode: string): void {
    this.currentSession.set(sessionCode);
    localStorage.setItem(STORAGE_KEYS.currentSession, sessionCode);
  }

  private clearCurrentSession(): void {
    this.currentSession.set(null);
    this.currentSessionStats.set([]);
    this.currentRound.set(null);
    this.completedCourts.set({});
    localStorage.removeItem(STORAGE_KEYS.currentSession);
  }

  private showMessage(message: string): void {
    this.message.set(message);

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    this.messageTimeout = setTimeout(() => {
      this.message.set('');
      this.messageTimeout = null;
    }, 3500);
  }

  private sortPlayersByLastName(players: Player[]): Player[] {
    return [...players].sort((a, b) => {
      const lastNameCompare = this.getLastName(a.name).localeCompare(this.getLastName(b.name), 'vi', {
        sensitivity: 'base'
      });

      return lastNameCompare || a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
  }

  private sortSessionStatsByPlayerName(stats: SessionPlayerStat[]): SessionPlayerStat[] {
    return [...stats].sort((a, b) => {
      const matchCountCompare = a.matchCount - b.matchCount;
      const lastNameCompare = this.getLastName(a.player.name).localeCompare(
        this.getLastName(b.player.name),
        'vi',
        { sensitivity: 'base' }
      );

      return (
        matchCountCompare ||
        lastNameCompare ||
        a.player.name.localeCompare(b.player.name, 'vi', { sensitivity: 'base' })
      );
    });
  }

  private getLastName(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.at(-1) ?? '';
  }

  private newPlayerCode(): string {
    const max = this.players()
      .map((player) => Number(player.playerCode.replace(/\D/g, '')))
      .filter((value) => Number.isFinite(value))
      .reduce((highest, value) => Math.max(highest, value), 0);
    return `BMT${String(max + 1).padStart(3, '0')}`;
  }

  private resetPlayerForm(): void {
    this.playerForm = {
      ...EMPTY_PLAYER_FORM,
      playerCode: this.newPlayerCode()
    };
  }
}
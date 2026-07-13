import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { ETeamCode } from '../../../core/enums/team-code.enum';
import { EMPTY_PLAYER_FORM } from './badminton-club.constants';
import {
  ApiResponse,
  Match,
  MatchHistory,
  Player,
  RankingRow,
  RoundInfo,
  RoundResponse,
  SessionResponse
} from './badminton-club.models';
import { playersByTeam } from './badminton-club.utils';

@Injectable({ providedIn: 'root' })
export class BadmintonClubService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly players = signal<Player[]>([]);
  readonly selectedCodes = signal<Set<string>>(new Set());
  readonly history = signal<MatchHistory[]>([]);
  readonly currentSession = signal<string | null>(null);
  readonly currentRound = signal<RoundResponse | null>(null);
  readonly completedCourts = signal<Record<number, ETeamCode>>({});
  readonly selectedPlayer = signal<Player | null>(null);
  readonly editingPlayerCode = signal<string | null>(null);
  readonly showCreateForm = signal(false);
  readonly loading = signal(false);
  readonly message = signal('');

  courtCount = 2;
  playerForm: Player = { ...EMPTY_PLAYER_FORM };
  editPlayerForm: Player = { ...EMPTY_PLAYER_FORM };

  readonly ranking = computed<RankingRow[]>(() => {
    const rows = new Map<string, Omit<RankingRow, 'winRate'>>();

    for (const item of this.history()) {
      const allPlayers = [...item.teamA, ...item.teamB];
      const winners = item.winner === ETeamCode.A ? item.teamA : item.teamB;

      for (const player of allPlayers) {
        const row = rows.get(player.playerCode) ?? { player, matches: 0, wins: 0 };
        row.matches += 1;
        if (winners.some((winner) => winner.playerCode === player.playerCode)) {
          row.wins += 1;
        }
        rows.set(player.playerCode, row);
      }
    }

    return Array.from(rows.values())
      .map((row) => ({
        ...row,
        winRate: row.matches ? Math.round((row.wins / row.matches) * 100) : 0
      }))
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || a.player.name.localeCompare(b.player.name));
  });

  readonly groupedHistory = computed(() => {
    const groups = new Map<string, MatchHistory[]>();

    for (const item of this.history()) {
      const key = new Intl.DateTimeFormat('vi-VN').format(new Date(item.playedAt));
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }

    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  });

  init(): void {
    if (!this.isBrowser) {
      return;
    }

    this.loadHistory();
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Player[]>>(API_ENDPOINTS.players).subscribe({
      next: (response) => {
        const players = response.data ?? [];
        this.players.set(players);
        if (this.selectedCodes().size === 0) {
          this.selectedCodes.set(new Set(players.map((player) => player.playerCode)));
        }
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Không tải được danh sách người chơi. Hãy kiểm tra backend B7N_BE.');
        this.loading.set(false);
      }
    });
  }

  addPlayer(): void {
    if (!this.playerForm.playerCode || !this.playerForm.name) {
      this.message.set('Vui lòng nhập mã và tên người chơi.');
      return;
    }

    this.loading.set(true);
    this.http.post<ApiResponse<Player>>(API_ENDPOINTS.players, this.playerForm).subscribe({
      next: () => {
        this.message.set('Đã thêm người chơi.');
        this.resetPlayerForm();
        this.showCreateForm.set(false);
        this.loadPlayers();
      },
      error: () => {
        this.message.set('Không thêm được người chơi.');
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
      this.message.set('Vui lòng nhập tên người chơi.');
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
        this.message.set('Đã cập nhật người chơi.');
        this.cancelEditPlayer();
        this.loadPlayers();
      },
      error: () => {
        this.message.set('Không cập nhật được người chơi.');
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
        this.message.set('Đã cập nhật người chơi.');
        this.loadPlayers();
      },
      error: () => this.message.set('Không cập nhật được người chơi.')
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
      error: () => this.message.set('Không xóa được người chơi.')
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
      this.message.set('Cần ít nhất 4 người chơi để xếp trận đôi.');
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
          this.currentSession.set(response.data.session.sessionCode);
          this.generateNextRound(response.data.session.sessionCode);
        },
        error: () => {
          this.message.set('Không tạo được ca chơi.');
          this.loading.set(false);
        }
      });
      return;
    }

    this.generateNextRound(this.currentSession()!);
  }

  cancelSchedule(): void {
    this.currentRound.set(null);
    this.completedCourts.set({});
    this.message.set('Đã hủy kết quả xếp trận hiện tại.');
  }

  recordWinner(match: Match, winner: ETeamCode): void {
    if (this.completedCourts()[match.courtNumber]) {
      return;
    }

    const record: MatchHistory = {
      id: `${match.sessionCode}-${match.roundNumber}-${match.courtNumber}-${Date.now()}`,
      playedAt: new Date().toISOString(),
      roundNumber: match.roundNumber,
      courtNumber: match.courtNumber,
      winner,
      teamA: playersByTeam(match, ETeamCode.A),
      teamB: playersByTeam(match, ETeamCode.B)
    };

    this.completedCourts.update((courts) => ({ ...courts, [match.courtNumber]: winner }));
    this.history.update((items) => [record, ...items]);
    this.saveHistory();

    const round = this.currentRound();
    const completedCount = Object.keys(this.completedCourts()).length;
    if (round && completedCount >= round.matches.length) {
      this.completeRound(round.round);
    }
  }

  clearHistory(): void {
    if (!confirm('Xóa toàn bộ lịch sử trận đấu?')) {
      return;
    }
    this.history.set([]);
    this.saveHistory();
  }

  private generateNextRound(sessionCode: string): void {
    this.http.post<ApiResponse<RoundResponse>>(API_ENDPOINTS.nextRound, { sessionCode }).subscribe({
      next: (response) => {
        this.currentRound.set(response.data);
        this.completedCourts.set({});
        this.message.set(`Đã xếp vòng ${response.data.round.roundNumber}.`);
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Không xếp được trận. Có thể vòng trước chưa hoàn thành hoặc thiếu người.');
        this.loading.set(false);
      }
    });
  }

  private completeRound(round: RoundInfo): void {
    this.http
      .post<ApiResponse<RoundResponse>>(API_ENDPOINTS.completeRound, {
        sessionCode: round.sessionCode,
        roundNumber: round.roundNumber
      })
      .subscribe({
        next: () => {
          this.currentRound.set(null);
          this.completedCourts.set({});
          this.message.set('Đã lưu kết quả vòng. Có thể xếp vòng tiếp theo.');
        },
        error: () => this.message.set('Đã lưu lịch sử trên máy, nhưng backend chưa complete được vòng.')
      });
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

  private loadHistory(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.matchHistory);
    this.history.set(raw ? JSON.parse(raw) : []);
  }

  private saveHistory(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(this.history()));
  }
}
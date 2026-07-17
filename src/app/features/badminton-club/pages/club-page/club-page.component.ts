import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarChart3, LucideAngularModule, Swords, User, X } from 'lucide-angular';
import { EBadmintonClubTab } from '../../../../core/enums/badminton-club-tab.enum';
import { EGender, GENDER_LABELS } from '../../../../core/enums/gender.enum';
import { PLAYER_LEVEL_LABELS } from '../../../../core/enums/player-level.enum';
import { HistoryTabComponent } from '../../components/history-tab/history-tab.component';
import { PlayersTabComponent } from '../../components/players-tab/players-tab.component';
import { ScheduleTabComponent } from '../../components/schedule-tab/schedule-tab.component';
import { CLUB_TABS, PLAYER_LEVELS } from '../../data-access/badminton-club.constants';
import { BadmintonClubService } from '../../data-access/badminton-club.service';

@Component({
  selector: 'app-club-page',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PlayersTabComponent,
    ScheduleTabComponent,
    HistoryTabComponent
  ],
  templateUrl: './club-page.component.html'
})
export class ClubPageComponent implements OnInit {
  readonly club = inject(BadmintonClubService);
  readonly tabs = CLUB_TABS;
  readonly tabId = EBadmintonClubTab;
  readonly gender = EGender;
  readonly genderLabels = GENDER_LABELS;
  readonly levels = PLAYER_LEVELS;
  readonly levelLabels = PLAYER_LEVEL_LABELS;
  readonly activeTab = signal(EBadmintonClubTab.PLAYERS);
  readonly icons = {
    chart: BarChart3,
    shuttle: Swords,
    user: User,
    x: X
  };

  ngOnInit(): void {
    this.club.init();
  }
}

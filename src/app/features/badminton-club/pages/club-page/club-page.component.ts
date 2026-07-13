import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, PlayersTabComponent, ScheduleTabComponent, HistoryTabComponent],
  templateUrl: './club-page.component.html',
  styleUrl: './club-page.component.css',
  encapsulation: ViewEncapsulation.None
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

  ngOnInit(): void {
    this.club.init();
  }
}
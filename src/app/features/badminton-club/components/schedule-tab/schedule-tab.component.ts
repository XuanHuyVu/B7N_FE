import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ETeamCode } from '../../../../core/enums/team-code.enum';
import { COURT_OPTIONS } from '../../data-access/badminton-club.constants';
import { Match } from '../../data-access/badminton-club.models';
import { BadmintonClubService } from '../../data-access/badminton-club.service';
import { playersByTeam } from '../../data-access/badminton-club.utils';

@Component({
  selector: 'app-schedule-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-tab.component.html'
})
export class ScheduleTabComponent {
  readonly club = inject(BadmintonClubService);
  readonly courtOptions = COURT_OPTIONS;
  readonly teamCode = ETeamCode;

  team(match: Match, teamCode: ETeamCode) {
    return playersByTeam(match, teamCode);
  }
}
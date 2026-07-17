import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckCircle2, LucideAngularModule, RotateCcw, Shuffle, Trophy } from 'lucide-angular';
import { ETeamCode } from '../../../../core/enums/team-code.enum';
import { COURT_OPTIONS } from '../../data-access/badminton-club.constants';
import { Match } from '../../data-access/badminton-club.models';
import { BadmintonClubService } from '../../data-access/badminton-club.service';
import { playersByTeam } from '../../data-access/badminton-club.utils';

@Component({
  selector: 'app-schedule-tab',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './schedule-tab.component.html'
})
export class ScheduleTabComponent {
  readonly club = inject(BadmintonClubService);
  readonly courtOptions = COURT_OPTIONS;
  readonly teamCode = ETeamCode;
  readonly icons = {
    checkCircle: CheckCircle2,
    rotateCcw: RotateCcw,
    shuffle: Shuffle,
    trophy: Trophy
  };

  team(match: Match, teamCode: ETeamCode) {
    return playersByTeam(match, teamCode);
  }
}
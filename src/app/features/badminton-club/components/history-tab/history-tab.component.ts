import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ETeamCode } from '../../../../core/enums/team-code.enum';
import { BadmintonClubService } from '../../data-access/badminton-club.service';
import { playerNames } from '../../data-access/badminton-club.utils';

@Component({
  selector: 'app-history-tab',
  imports: [CommonModule],
  templateUrl: './history-tab.component.html'
})
export class HistoryTabComponent {
  readonly club = inject(BadmintonClubService);
  readonly teamCode = ETeamCode;
  readonly playerNames = playerNames;
}
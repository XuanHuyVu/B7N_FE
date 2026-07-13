import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EGender, GENDER_LABELS } from '../../../../core/enums/gender.enum';
import { PLAYER_LEVEL_LABELS } from '../../../../core/enums/player-level.enum';
import { PLAYER_LEVELS } from '../../data-access/badminton-club.constants';
import { BadmintonClubService } from '../../data-access/badminton-club.service';

@Component({
  selector: 'app-players-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './players-tab.component.html'
})
export class PlayersTabComponent {
  readonly club = inject(BadmintonClubService);
  readonly gender = EGender;
  readonly genderLabels = GENDER_LABELS;
  readonly levels = PLAYER_LEVELS;
  readonly levelLabels = PLAYER_LEVEL_LABELS;
}
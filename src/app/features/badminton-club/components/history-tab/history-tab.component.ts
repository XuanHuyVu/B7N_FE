import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Star, Trash2, Trophy } from 'lucide-angular';
import { ETeamCode } from '../../../../core/enums/team-code.enum';
import { BadmintonClubService } from '../../data-access/badminton-club.service';

@Component({
  selector: 'app-history-tab',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './history-tab.component.html'
})
export class HistoryTabComponent {
  readonly club = inject(BadmintonClubService);
  readonly teamCode = ETeamCode;
  readonly icons = {
    star: Star,
    trash2: Trash2,
    trophy: Trophy
  };
}
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent {
  @Input() level: number = 0; // 1..max
  @Input() max: number = 5;

  get range(): number[] {
    return Array.from({ length: this.max }, (_, i) => i);
  }
}

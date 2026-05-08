import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-indicators-panel',
  templateUrl: './indicators-panel.component.html',
  styleUrls: ['./indicators-panel.component.scss'],
})
export class IndicatorsPanelComponent {
  @Input() indicatorQuery!: {
    page: number;
    pageSize: number;
    sourceId: number | null;
    indicator: string;
    keyword: string;
  };

  @Input() indicatorResp!: {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  };

  @Input() includeDataSource = true;
  @Input() loadingIndicators = false;
  @Input() selectedIndicatorId = '';

  @Output() includeDataSourceChange = new EventEmitter<boolean>();
  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() clearSourceFilter = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() indicatorSelected = new EventEmitter<any>();

  onIncludeModeChange(value: boolean): void {
    this.includeDataSourceChange.emit(value);
  }

  onIndicatorSelectionChange(item: any): void {
    this.indicatorSelected.emit(item);
  }
}

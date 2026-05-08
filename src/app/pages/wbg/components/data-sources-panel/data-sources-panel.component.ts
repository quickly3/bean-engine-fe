import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-data-sources-panel',
  templateUrl: './data-sources-panel.component.html',
  styleUrls: ['./data-sources-panel.component.scss'],
})
export class DataSourcesPanelComponent {
  @Input() sourceQuery!: {
    page: number;
    pageSize: number;
    code: string;
    keyword: string;
  };

  @Input() sourceResp!: {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  };

  @Input() loadingSources = false;

  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() applySourceFilter = new EventEmitter<number>();

  onApplySourceFilter(sourceId: number): void {
    this.applySourceFilter.emit(sourceId);
  }
}

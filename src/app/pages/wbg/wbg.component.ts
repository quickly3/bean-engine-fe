import { Component } from '@angular/core';
import { WbgService } from '../../api/wbg.service';

@Component({
  selector: 'app-wbg',
  templateUrl: './wbg.component.html',
  styleUrls: ['./wbg.component.scss'],
})
export class WbgComponent {
  sourceQuery = {
    page: 1,
    pageSize: 20,
    code: '',
    keyword: '',
  };

  indicatorQuery = {
    page: 1,
    pageSize: 20,
    sourceId: null as number | null,
    indicator: '',
    keyword: '',
  };

  includeDataSource = true;

  sourceResp: any = {
    list: [],
    total: 0,
    page: 1,
    pageSize: 20,
  };

  indicatorResp: any = {
    list: [],
    total: 0,
    page: 1,
    pageSize: 20,
  };

  loadingSources = false;
  loadingIndicators = false;

  constructor(private wbgService: WbgService) {}

  ngOnInit(): void {
    this.fetchDataSources();
    this.fetchIndicators();
  }

  private compactParams(params: any): any {
    const compacted: any = {};
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== '' && value !== null && value !== undefined) {
        compacted[key] = value;
      }
    });
    return compacted;
  }

  fetchDataSources(): void {
    this.loadingSources = true;
    const params = this.compactParams(this.sourceQuery);
    this.wbgService.getDataSources(params).subscribe({
      next: (resp: any) => {
        this.sourceResp = {
          ...this.sourceResp,
          ...resp,
          list: resp?.list || [],
          total: resp?.total || 0,
          page: resp?.page || this.sourceQuery.page,
          pageSize: resp?.pageSize || this.sourceQuery.pageSize,
        };
        this.sourceQuery.page = this.sourceResp.page;
      },
      error: () => {
        this.sourceResp = {
          ...this.sourceResp,
          list: [],
          total: 0,
        };
      },
      complete: () => {
        this.loadingSources = false;
      },
    });
  }

  fetchIndicators(): void {
    this.loadingIndicators = true;
    const params = this.compactParams(this.indicatorQuery);
    const request$ = this.includeDataSource
      ? this.wbgService.getIndicatorsWithDataSource(params)
      : this.wbgService.getIndicators(params);

    request$.subscribe({
      next: (resp: any) => {
        this.indicatorResp = {
          ...this.indicatorResp,
          ...resp,
          list: resp?.list || [],
          total: resp?.total || 0,
          page: resp?.page || this.indicatorQuery.page,
          pageSize: resp?.pageSize || this.indicatorQuery.pageSize,
        };
        this.indicatorQuery.page = this.indicatorResp.page;
      },
      error: () => {
        this.indicatorResp = {
          ...this.indicatorResp,
          list: [],
          total: 0,
        };
      },
      complete: () => {
        this.loadingIndicators = false;
      },
    });
  }

  searchDataSources(): void {
    this.sourceQuery.page = 1;
    this.fetchDataSources();
  }

  searchIndicators(): void {
    this.indicatorQuery.page = 1;
    this.fetchIndicators();
  }

  resetDataSources(): void {
    this.sourceQuery = {
      page: 1,
      pageSize: 20,
      code: '',
      keyword: '',
    };
    this.fetchDataSources();
  }

  resetIndicators(): void {
    this.indicatorQuery = {
      page: 1,
      pageSize: 20,
      sourceId: null,
      indicator: '',
      keyword: '',
    };
    this.includeDataSource = true;
    this.fetchIndicators();
  }

  onDataSourcesPageChange(page: number): void {
    this.sourceQuery.page = page;
    this.fetchDataSources();
  }

  onIndicatorsPageChange(page: number): void {
    this.indicatorQuery.page = page;
    this.fetchIndicators();
  }

  applySourceFilter(sourceId: number): void {
    this.indicatorQuery.sourceId = sourceId;
    this.indicatorQuery.page = 1;
    this.fetchIndicators();
  }

  clearSourceFilter(): void {
    this.indicatorQuery.sourceId = null;
    this.indicatorQuery.page = 1;
    this.fetchIndicators();
  }
}

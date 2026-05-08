import { Component, Injectable, forwardRef } from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { WbgService } from '../../api/wbg.service';
import {
  WorldBankListResponse,
  WorldBankService,
} from '../../api/world-bank.service';

@Component({
  selector: 'app-wbg',
  templateUrl: './wbg.component.html',
  styleUrls: ['./wbg.component.scss'],
  providers: [
    {
      provide: NgbDateParserFormatter,
      useClass: forwardRef(() => YearOnlyDateParserFormatter),
    },
  ],
})
export class WbgComponent {
  readonly minYear = 1960;
  readonly maxYear = new Date().getFullYear() - 1;
  readonly minDate: NgbDateStruct = { year: this.minYear, month: 1, day: 1 };
  readonly maxDate: NgbDateStruct = { year: this.maxYear, month: 12, day: 31 };

  sourceQuery = {
    page: 1,
    pageSize: 20,
    code: '',
    keyword: '',
  };

  indicatorQuery = {
    page: 1,
    pageSize: 20,
    sourceId: 2 as number | null,
    indicator: '',
    keyword: '',
  };

  includeDataSource = true;
  selectedIndicatorId = 'NY.GDP.MKTP.CD';

  indicatorDataQuery = {
    countryCodes: [] as string[],
    page: 1,
    per_page: 1000,
    startDate: { year: this.minYear, month: 1, day: 1 } as NgbDateStruct,
    endDate: { year: this.maxYear, month: 12, day: 31 } as NgbDateStruct,
  };

  countryGroups: Array<{
    regionValue: string;
    items: Array<{ iso2Code: string; name: string }>;
  }> = [];
  allCountryCodes: string[] = [];
  loadingCountries = false;

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

  indicatorDataResp = {
    meta: {
      page: 1,
      pages: 0,
      per_page: '1000',
      total: 0,
    },
    list: [] as any[],
  };

  loadingSources = false;
  loadingIndicators = false;
  loadingIndicatorData = false;
  indicatorDataError = '';

  constructor(
    private wbgService: WbgService,
    private worldBankService: WorldBankService,
  ) {}

  ngOnInit(): void {
    this.fetchDataSources();
    this.fetchIndicators();
    this.fetchCountries();
    if (this.selectedIndicatorId) {
      this.fetchIndicatorData();
    }
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

  private normalizeIndicatorDataResponse(
    resp: WorldBankListResponse<any> | any,
  ) {
    const meta = Array.isArray(resp) ? resp[0] : null;
    const list = Array.isArray(resp) ? resp[1] || [] : [];

    return {
      meta: {
        page: Number(meta?.page || this.indicatorDataQuery.page),
        pages: Number(meta?.pages || 0),
        per_page: String(meta?.per_page || this.indicatorDataQuery.per_page),
        total: Number(meta?.total || 0),
      },
      list,
    };
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

  fetchIndicatorData(): void {
    if (!this.selectedIndicatorId) {
      this.indicatorDataError = '请先选择一个指标';
      this.indicatorDataResp = {
        ...this.indicatorDataResp,
        list: [],
      };
      return;
    }

    this.loadingIndicatorData = true;
    this.indicatorDataError = '';

    const { countryCodes, startDate, endDate, ...queryParams } =
      this.indicatorDataQuery;
    const params = this.compactParams({
      ...queryParams,
      pageSize: this.indicatorDataQuery.per_page,
      date: this.buildDateRange(startDate, endDate),
    });

    this.worldBankService
      .getIndicatorData(
        this.selectedIndicatorId,
        this.buildCountryCodeParam(countryCodes),
        params,
      )
      .subscribe({
        next: (resp) => {
          this.indicatorDataResp = this.normalizeIndicatorDataResponse(resp);
          this.indicatorDataQuery.page = this.indicatorDataResp.meta.page;
        },
        error: () => {
          this.indicatorDataError = '指标数据查询失败';
          this.indicatorDataResp = {
            ...this.indicatorDataResp,
            meta: {
              ...this.indicatorDataResp.meta,
              page: this.indicatorDataQuery.page,
              total: 0,
            },
            list: [],
          };
        },
        complete: () => {
          this.loadingIndicatorData = false;
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

  confirmSelectedIndicator(): void {
    this.indicatorDataQuery.page = 1;
    this.fetchIndicatorData();
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
      sourceId: 2,
      indicator: '',
      keyword: '',
    };
    this.includeDataSource = true;
    this.fetchIndicators();
  }

  resetIndicatorData(): void {
    this.indicatorDataQuery = {
      countryCodes: [],
      page: 1,
      per_page: 20,
      startDate: { year: this.minYear, month: 1, day: 1 },
      endDate: { year: this.maxYear, month: 12, day: 31 },
    };
    this.indicatorDataError = '';
    this.indicatorDataResp = {
      meta: {
        page: 1,
        pages: 0,
        per_page: '20',
        total: 0,
      },
      list: [],
    };
  }

  onDataSourcesPageChange(page: number): void {
    this.sourceQuery.page = page;
    this.fetchDataSources();
  }

  onIndicatorsPageChange(page: number): void {
    this.indicatorQuery.page = page;
    this.fetchIndicators();
  }

  onIndicatorDataPageChange(page: number): void {
    this.indicatorDataQuery.page = page;
    this.fetchIndicatorData();
  }

  onIndicatorSelectionChange(item: any): void {
    this.selectedIndicatorId = item?.indicator || '';
    this.indicatorDataError = '';
  }

  setIncludeDataSource(value: boolean): void {
    this.includeDataSource = value;
  }

  setSelectedCountryCodes(codes: string[]): void {
    this.indicatorDataQuery.countryCodes = codes;
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

  fetchCountries(): void {
    this.loadingCountries = true;
    this.countryGroups = [];
    this.allCountryCodes = [];

    const pageSize = 1000;
    const allItems: any[] = [];

    const fetchPage = (page: number) => {
      this.wbgService.getCountries({ page, pageSize }).subscribe({
        next: (resp: any) => {
          const list = Array.isArray(resp?.list) ? resp.list : [];
          allItems.push(...list);

          const total = Number(resp?.total || allItems.length);
          const totalPages = Math.max(1, Math.ceil(total / pageSize));

          if (page < totalPages) {
            fetchPage(page + 1);
            return;
          }

          this.buildCountryGroups(allItems);
          this.loadingCountries = false;
        },
        error: () => {
          this.countryGroups = [];
          this.allCountryCodes = [];
          this.loadingCountries = false;
        },
      });
    };

    fetchPage(1);
  }

  private buildCountryCodeParam(codes: string[]): string {
    if (!codes || codes.length === 0) {
      return 'all';
    }

    return codes.join(';');
  }

  private buildCountryGroups(countries: any[]): void {
    const grouped = new Map<
      string,
      Array<{ id: string; iso2Code: string; name: string }>
    >();

    countries.forEach((item) => {
      const iso2Code = String(item?.iso2Code || '').toUpperCase();
      const name = String(item?.name || '').trim();
      const id = String(item?.id || '').trim();

      if (!iso2Code) {
        return;
      }

      const regionValue =
        String(item?.regionValue || 'Other').trim() || 'Other';
      const group = grouped.get(regionValue) || [];
      group.push({ id, iso2Code, name: name || iso2Code });
      grouped.set(regionValue, group);
    });

    this.countryGroups = Array.from(grouped.entries())
      .map(([regionValue, items]) => ({
        regionValue,
        items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.regionValue.localeCompare(b.regionValue));

    this.allCountryCodes = this.countryGroups
      .flatMap((group) => group.items)
      .map((item) => item.iso2Code.toLowerCase());
  }

  private buildDateRange(
    startDate: NgbDateStruct,
    endDate: NgbDateStruct,
  ): string {
    const normalizedStart = Math.max(
      this.minYear,
      Math.min(Number(startDate?.year) || this.minYear, this.maxYear),
    );
    const normalizedEnd = Math.max(
      this.minYear,
      Math.min(Number(endDate?.year) || this.maxYear, this.maxYear),
    );

    const fromYear = Math.min(normalizedStart, normalizedEnd);
    const toYear = Math.max(normalizedStart, normalizedEnd);

    return `${fromYear}:${toYear}`;
  }
}

@Injectable()
export class YearOnlyDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    const text = (value || '').trim();
    if (!text) {
      return null;
    }

    const year = Number(text);
    if (!Number.isFinite(year)) {
      return null;
    }

    return {
      year,
      month: 1,
      day: 1,
    };
  }

  format(date: NgbDateStruct | null): string {
    if (!date || !date.year) {
      return '';
    }

    return String(date.year);
  }
}

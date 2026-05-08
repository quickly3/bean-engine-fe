import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

type CountryItem = { id?: string; iso2Code: string; name: string };
type CountryGroup = { regionValue: string; items: CountryItem[] };

@Component({
  selector: 'app-indicator-data-panel',
  templateUrl: './indicator-data-panel.component.html',
  styleUrls: ['./indicator-data-panel.component.scss'],
})
export class IndicatorDataPanelComponent implements OnChanges {
  readonly quickCountryGroups: { label: string; countryIds: string[] }[] = [
    { label: '油管五常', countryIds: ['IND', 'KOR', 'VNM', 'TUR', 'POL'] },
    { label: '真·五常', countryIds: ["CHN", "FRA", "RUS", "GBR", "USA"] },
  ];

  @Input() selectedIndicatorId = '';
  @Input() maxYear = new Date().getFullYear() - 1;
  @Input() minDate!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;

  @Input() indicatorDataQuery!: {
    countryCodes: string[];
    page: number;
    per_page: number;
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
  };

  @Input() countryGroups: CountryGroup[] = [];
  @Input() allCountryCodes: string[] = [];
  @Input() loadingCountries = false;

  @Input() indicatorDataResp!: {
    meta: {
      page: number;
      pages: number;
      per_page: string;
      total: number;
    };
    list: any[];
  };
  @Input() loadingIndicatorData = false;
  @Input() indicatorDataError = '';

  countryKeyword = '';
  filteredCountryGroups: CountryGroup[] = [];
  showFullscreenChart = false;

  @Output() countryCodesChange = new EventEmitter<string[]>();
  @Output() confirm = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  openFullscreenChart(): void {
    this.showFullscreenChart = true;
  }

  closeFullscreenChart(): void {
    this.showFullscreenChart = false;
  }

  toggleCountrySelection(iso2Code: string, checked: boolean): void {
    if (!iso2Code) {
      return;
    }

    const normalized = iso2Code.toLowerCase();
    const current = this.indicatorDataQuery.countryCodes;

    if (checked) {
      if (!current.includes(normalized)) {
        this.countryCodesChange.emit([...current, normalized]);
      }
      return;
    }

    this.countryCodesChange.emit(current.filter((code) => code !== normalized));
  }

  toggleAllCountries(checked: boolean): void {
    this.countryCodesChange.emit(checked ? [...this.allCountryCodes] : []);
  }

  isCountrySelected(iso2Code: string): boolean {
    return this.indicatorDataQuery.countryCodes.includes(iso2Code.toLowerCase());
  }

  isAllCountriesSelected(): boolean {
    return (
      this.allCountryCodes.length > 0 &&
      this.indicatorDataQuery.countryCodes.length === this.allCountryCodes.length
    );
  }

  getCountrySelectionLabel(): string {
    if (this.loadingCountries) {
      return '国家列表加载中...';
    }

    const selectedCount = this.indicatorDataQuery.countryCodes.length;
    if (selectedCount === 0) {
      return '全部国家（默认 all）';
    }

    if (selectedCount === this.allCountryCodes.length) {
      return `全部国家（${selectedCount}）`;
    }

    return `已选择 ${selectedCount} 个国家`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countryGroups']) {
      this.refreshFilteredCountryGroups();
    }
  }

  onCountryKeywordChange(keyword: string): void {
    this.countryKeyword = keyword;
    this.refreshFilteredCountryGroups();
  }

  trackByRegion(_: number, group: CountryGroup): string {
    return group.regionValue;
  }

  trackByCountry(_: number, country: CountryItem): string {
    return country.iso2Code;
  }

  private refreshFilteredCountryGroups(): void {
    const keyword = this.countryKeyword.trim().toLowerCase();
    if (!keyword) {
      this.filteredCountryGroups = this.countryGroups;
      return;
    }

    this.filteredCountryGroups = this.countryGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((country) => this.isCountryMatch(country, keyword)),
      }))
      .filter((group) => group.items.length > 0);
  }

  onCountryKeywordEnter(event: Event): void {
    event.preventDefault();
    this.addMatchedCountries();
  }

  addMatchedCountries(): void {
    const keyword = this.countryKeyword.trim().toLowerCase();
    if (!keyword) {
      return;
    }

    const matchedCodes = this.countryGroups
      .flatMap((group) => group.items)
      .filter((country) => this.isCountryMatch(country, keyword))
      .map((country) => country.iso2Code.toLowerCase());

    if (matchedCodes.length === 0) {
      return;
    }

    const merged = new Set([...this.indicatorDataQuery.countryCodes, ...matchedCodes]);
    this.countryCodesChange.emit(Array.from(merged));
  }

  removeSelectedCountry(iso2Code: string): void {
    if (!iso2Code) {
      return;
    }

    const normalized = iso2Code.toLowerCase();
    this.countryCodesChange.emit(
      this.indicatorDataQuery.countryCodes.filter((code) => code !== normalized)
    );
  }

  addCountryGroupByIds(countryIds: string[]): void {
    if (!countryIds.length) {
      return;
    }

    const targetIds = new Set(countryIds.map((id) => id.trim().toLowerCase()));
    const matchedCodes = this.countryGroups
      .flatMap((group) => group.items)
      .filter((country) => targetIds.has((country.id || '').toLowerCase()))
      .map((country) => country.iso2Code.toLowerCase());

    if (matchedCodes.length === 0) {
      return;
    }

    const merged = new Set([...this.indicatorDataQuery.countryCodes, ...matchedCodes]);
    this.countryCodesChange.emit(Array.from(merged));
  }

  getSelectedCountries(): CountryItem[] {
    if (!this.indicatorDataQuery?.countryCodes?.length) {
      return [];
    }

    const selectedCodes = new Set(this.indicatorDataQuery.countryCodes.map((code) => code.toLowerCase()));

    return this.countryGroups
      .flatMap((group) => group.items)
      .filter((country) => selectedCodes.has(country.iso2Code.toLowerCase()));
  }

  private isCountryMatch(
    country: CountryItem,
    keyword: string
  ): boolean {
    return (
      (country.id || '').toLowerCase().includes(keyword) ||
      country.iso2Code.toLowerCase().includes(keyword) ||
      country.name.toLowerCase().includes(keyword)
    );
  }
}

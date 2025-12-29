import {
  Component,
  ViewEncapsulation,
  ViewChild,
  HostListener,
} from '@angular/core';

import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {
  faSearch,
  faRssSquare,
  faBuilding,
  faUser,
  faChartBar,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faCloud,
  faCalendarAlt,
  faLink,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { of } from 'rxjs';
import { BiliService } from 'src/app/api/bili.service';
import * as moment from 'moment';

@Component({
  selector: 'bili-up',
  templateUrl: './bili-up.component.html',
  styleUrls: ['./bili-up.component.scss', '../search/search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BiliUpComponent {
  queryParams: any = {};
  upList: any[] = [];
  allUps: any[] = [];
  allCategories: string[] = [];
  sourceList: any[] = [];
  sortItems: any[] = [];
  faSearch = faSearch;
  faRssSquare = faRssSquare;
  faBuilding = faBuilding;
  faUser = faUser;
  faGithub = faGithub;
  faChartBar = faChartBar;
  faAngleDoubleDown = faAngleDoubleDown;
  faAngleDoubleUp = faAngleDoubleUp;
  faCloud = faCloud;
  faCalendarAlt = faCalendarAlt;
  faLink = faLink;
  faFileAlt = faFileAlt;

  total: number = 0;
  took: number = 0;
  totalPage: number = 0;

  biliService: BiliService;

  defaultTouch = { x: 0, y: 0, time: 0 };
  @ViewChild('instance', { static: true }) instance: NgbTypeahead | undefined;
  @ViewChild('authorTypehead', { static: true }) authorTypehead:
    | NgbTypeahead
    | undefined;

  constructor(biliService: BiliService) {
    this.biliService = biliService;
    this.queryParams = this.getInitQueryParams();
    this.sortItems = [
      { key: 'follower', label: '粉丝' },
      { key: 'following', label: '关注' },
      { key: 'likes', label: '获赞' },
      { key: 'view', label: '播放' },
    ];
    // 默认排序项
    // store the whole item so template can use `.label`
    this.queryParams.sortBy = this.sortItems[0];
  }

  changeSort = (item: any) => {
    if (!item) return;
    // keep the selected item object so template shows `label`
    this.queryParams.sortBy = item;
    // 重置到第一页并重新获取数据
    this.queryParams.page = 1;
    this.getBiliUps();
  };

  ngOnInit() {
    this.getBiliUps();
  }

  searchOnClick() {
    this.getBiliUps();
  }

  searchOnKeydown(e: { key: string }) {
    console.log(e);
    if (e.key === 'Enter') {
      this.getBiliUps();
    }
  }

  lastPage = () => {
    if (this.queryParams.page !== 1) {
      this.queryParams.page--;
      this.pageChange();
    }
  };

  nextPage = () => {
    if (this.queryParams.page < this.totalPage) {
      this.queryParams.page++;
      this.pageChange();
    }
  };

  getInitQueryParams() {
    return {
      page: 1,
      pageSize: 20,
      sortBy: 'follower',
      category: 'all',
    };
  }

  autoComplete = (text$: any) => of([]);

  getBiliUps = () => {
    // ensure we send the key value to backend (if sortBy is an object, use its key)
    const params = {
      ...this.queryParams,
      sortBy: this.queryParams.sortBy?.key ?? this.queryParams.sortBy,
    };
    this.biliService.getUps(params).subscribe((result: any) => {
      this.allUps = result.data || [];
      this.total = result.total;

      // normalize fields and compute createdAt ISO
      this.allUps.map((u) => {
        u.lastPublishStr = u.lastPublish
          ? moment(Number(u.lastPublish) * 1000).format('YYYY-MM-DD HH:mm')
          : '';
        // createdAt may be timestamp (seconds/ms) or ISO string
        try {
          const c = u.createdAt;
          let dt: Date | null = null;
          if (c === undefined || c === null) {
            dt = null;
          } else if (typeof c === 'number') {
            // if looks like seconds (10 digits) convert to ms
            dt = new Date(c > 1e12 ? c : c * 1000);
          } else if (!isNaN(Number(c))) {
            const n = Number(c);
            dt = new Date(n > 1e12 ? n : n * 1000);
          } else {
            dt = new Date(c);
          }
          u.createdAtIso = dt ? dt.toISOString() : '';
        } catch (err) {
          u.createdAtIso = '';
        }

        // try common field names for total videos (fallbacks)
        u.totalVideos = u.totalVideos ?? u.videoCount ?? u.archiveCount ?? u.videos ?? 0;
      });

      // build category list
      const cats = new Set<string>();
      this.allUps.forEach((u) => {
        if (u.category) cats.add(String(u.category));
      });
      this.allCategories = Array.from(cats).sort();

      // apply client-side filter
      this.applyLocalFilter();
    });
  };

  applyLocalFilter() {
    const cat = this.queryParams.category;
    if (!cat || cat === 'all') {
      this.upList = [...this.allUps];
    } else {
      this.upList = this.allUps.filter((u) => String(u.category) === String(cat));
    }
    // update total to reflect filtered size for pagination UI
    this.total = this.upList.length;
  }

  onCategoryChange() {
    this.queryParams.page = 1;
    this.applyLocalFilter();
  }

  pageChange = () => {
    this.getBiliUps();
  };
}

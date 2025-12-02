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
  }

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
    };
  }

  autoComplete = (text$: any) => of([]);

  getBiliUps = () => {
    const params = { ...this.queryParams };
    this.biliService.getUps(params).subscribe((result: any) => {
      this.upList = result.data;
      this.total = result.total;

      this.upList.map((u) => {
        u.lastPublishStr = u.lastPublish
          ? moment(Number(u.lastPublish) * 1000).format('YYYY-MM-DD HH:mm')
          : '';
        // try common field names for total videos (fallbacks)
        u.totalVideos =
          u.totalVideos ?? u.videoCount ?? u.archiveCount ?? u.videos ?? 0;
      });
    });
  };

  pageChange = () => {
    this.getBiliUps();
  };
}

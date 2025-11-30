import { Component, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { BiliService } from 'src/app/api/bili.service';

@Component({
  selector: 'up-videos',
  templateUrl: './up-videos.component.html',
  styleUrls: ['./up-videos.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UpVideosComponent {
  articles: any[] = [];
  loading = false;

  // pagination / query
  page = 1;
  pageSize = 12;
  total = 0;
  took = 0;

  // filters
  keywords = '';

  constructor(private biliService: BiliService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    const params = {
      page: this.page,
      pageSize: this.pageSize,
      keywords: this.keywords,
    };
    this.biliService.getUpVideos(params).subscribe(
      (res: any) => {
        const data = res?.data || res;
        if (data) {
          data.map((d: any) => {
            d.createdStr = moment(Number(d.created*1000)).format('YYYY-MM-DD HH:mm');
            d.author_url = `https://space.bilibili.com/${d.mid}`;
          });
          this.articles = data;
          this.total = res.total;
          this.took = res?.took || 0;
        }
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  onSearchKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.page = 1;
      this.loadArticles();
    }
  }

  pageChange(newPage: number) {
    this.page = newPage;
    this.loadArticles();
  }

  formatDate(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  }
}

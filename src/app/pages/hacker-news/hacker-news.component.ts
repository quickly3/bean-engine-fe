import { Component } from '@angular/core';
import { HackerNewsService } from '../../api/hacker-news.service';

@Component({
  selector: 'app-hacker-news',
  templateUrl: './hacker-news.component.html',
  styleUrls: ['./hacker-news.component.scss'],
})
export class HackerNewsComponent {
  resp: any = {
    data: [],
    page: 1,
    size: 20,
    total: 0,
  };
  // 用于模板上的分类筛选（'所有' 表示不过滤）
  selectedCategory = '所有';
  categories: string[] = [
    '所有',
    '安全 / 隐私 / 情报',
    '其他',
    '科技 / 互联网',
    '军事 / 战争 / 国际冲突',
    '法律 / 反垄断 / 合规',
    '人工智能 / AI 应用',
    '科学研究',
    '政治 / 政策 / 监管',
    '地理 / 地图 / 科学研究',
    '工具 / 产品 / 软件推荐',
  ];

  constructor(private hackerNewsService: HackerNewsService) {}

  ngOnInit() {
    this.getHackerNews();
  }

  getHackerNews() {
    this.hackerNewsService
      .getHackerNews({
        page: this.resp.page,
        size: this.resp.size,
        category: this.selectedCategory,
      })
      .subscribe((resp: any) => {
        console.log(resp);
        this.resp = resp;
      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.resp.page = 1; // 切换分类时重置页码
    this.getHackerNews();
  }

  onPageChange(): void {
    this.getHackerNews();
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} 秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;
    return `${Math.floor(diff / 2592000)} 月前`;
  }
}

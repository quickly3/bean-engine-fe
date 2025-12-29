import { Component, HostListener } from '@angular/core';
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
  // 用于模板上的分类筛选（空字符串表示不过滤）
  selectedCategory = '';
  categories: string[] = [
    '所有',
    '人工智能 / AI 应用',
    '开发者工具 / 库 / 语言生态',
    '后端 / 数据库 / 数据工程',
    '安全 / 漏洞 / 隐私',
    '产品 / 公司 / 商业新闻',
    '硬件 / 芯片 / 基础设施',
    '科学研究 / 太空',
    '生物医药 / 健康',
    '政策 / 法律 / 监管',
    '社交平台 / 内容 / 媒体生态',
    '隐私 / 伦理议题',
    '开源 / 社区项目',
    '教程 / 实践 / 技术深度文章',
    '产品评测 / 硬件拆解',
    '游戏 / 娱乐',
    '文化 / 社会 / 人文议题',
    '物流 / 出行 / 自动驾驶',
    '调查报道 / 泄露档案',
    '经济 / 金融市场',
    '小工具 / 实用脚本 / 命令行',
    '其他',
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

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toUpperCase();
    if (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      (target?.isContentEditable ?? false)
    ) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      if (this.resp.page > 1) {
        this.resp.page = Math.max(1, this.resp.page - 1);
        this.onPageChange();
      }
    } else if (event.key === 'ArrowRight') {
      if (this.resp.page < this.totalPages) {
        this.resp.page = Math.min(this.totalPages, this.resp.page + 1);
        this.onPageChange();
      }
    }
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

  get totalPages(): number {
    const total = this.resp?.total ?? 0;
    const size = this.resp?.size ?? 1;
    return Math.max(1, Math.ceil(total / size));
  }
}

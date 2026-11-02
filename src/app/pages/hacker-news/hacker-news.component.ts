import { Component, HostListener, OnDestroy } from '@angular/core';
import {
  HackNewsSummaryJobStatus,
  HackerNewsService,
} from '../../api/hacker-news.service';
import { AuthService } from '../../api/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-hacker-news',
  templateUrl: './hacker-news.component.html',
  styleUrls: ['./hacker-news.component.scss'],
})
export class HackerNewsComponent implements OnDestroy {
  private static readonly POLL_INTERVAL = 3000;
  private static readonly MAX_POLL_ATTEMPTS = 36;

  resp: any = {
    data: [],
    page: 1,
    size: 20,
    total: 0,
  };
  // 用于模板上的分类筛选（空字符串表示不过滤）
  searchKeyword = '';
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
  selectedCategory = this.categories[0];
  levelOptions = ['all', '5', '4', '3', '2', '1'];
  selectedLevel = 'all';

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollAttempts = 0;
  private pollingIds = new Set<number>();


  constructor(
    private hackerNewsService: HackerNewsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getHackerNews();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private buildQuery(page: number = this.resp.page) {
    return {
      page,
      size: this.resp.size,
      category: this.selectedCategory,
      searchKeyword: this.searchKeyword,
      level: this.selectedLevel === 'all' ? null : parseInt(this.selectedLevel),
    };
  }

  getHackerNews() {
    this.hackerNewsService
      .getHackerNews(this.buildQuery())
      .subscribe((resp: any) => {
        this.resp = resp;
      });
  }

  // 用于移动端“加载更多” —— 在当前数据后追加下一页
  loadMore(): void {
    const nextPage = (this.resp.page || 1) + 1;
    if (nextPage > this.totalPages) return;

    this.hackerNewsService
      .getHackerNews({
        page: nextPage,
        size: this.resp.size,
        category: this.selectedCategory,        level: this.selectedLevel === 'all' ? null : parseInt(this.selectedLevel),      })
      .subscribe((resp: any) => {
        // 将新页追加到现有数据中
        this.resp.data = [...(this.resp.data || []), ...(resp.data || [])];
        this.resp.page = resp.page;
        this.resp.total = resp.total;
        this.resp.size = resp.size;
      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.resp.page = 1; // 切换分类时重置页码
    this.getHackerNews();
  }

  onLevelChange(level: string): void {
    this.selectedLevel = level;
    this.resp.page = 1; // 切换筛选时重置页码
    this.getHackerNews();
  }

  onPageChange(): void {
    this.getHackerNews();
  }

  onSearch(): void {
    this.resp.page = 1;
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

  // 展开/收起某条记录的 Markdown 内容
  toggleMarkdown(item: any, field: 'summary_cn' | 'content'): void {
    const key = field === 'summary_cn' ? '_showSummary' : '_showContent';
    item[key] = !item[key];
  }

  // 爬取任务进行中（待处理 / 处理中）
  private isJobRunning(item: any): boolean {
    return (
      item.fetchStatus === HackNewsSummaryJobStatus.PENDING ||
      item.fetchStatus === HackNewsSummaryJobStatus.PROCESSING
    );
  }

  showSummaryBtn(item: any): boolean {
    return !!item.summary_cn && !this.isJobRunning(item);
  }

  showContentBtn(item: any): boolean {
    return !!item.content && !this.isJobRunning(item);
  }

  showFetchBtn(item: any): boolean {
    if (!this.authService.isLoggedIn()) return false;
    if (this.isJobRunning(item)) return false;
    if (item.fetchStatus === HackNewsSummaryJobStatus.SUCCESS) return false;
    if (item.fetchStatus === HackNewsSummaryJobStatus.FAILED) return true;
    // 没有任务状态时：内容为空才显示抓取按钮
    return !item.content;
  }

  showJobBadge(item: any): boolean {
    return (
      item.fetchStatus === HackNewsSummaryJobStatus.PENDING ||
      item.fetchStatus === HackNewsSummaryJobStatus.PROCESSING ||
      item.fetchStatus === HackNewsSummaryJobStatus.FAILED
    );
  }

  jobBadgeText(item: any): string {
    switch (item.fetchStatus) {
      case HackNewsSummaryJobStatus.PENDING:
        return '待爬取';
      case HackNewsSummaryJobStatus.PROCESSING:
        return '爬取中';
      case HackNewsSummaryJobStatus.FAILED:
        return '爬取失败';
      default:
        return '';
    }
  }

  jobBadgeClass(item: any): string {
    return 'hn-job-' + (item.fetchStatus || 'none');
  }

  // 内容为空时，请求后端抓取该条 hacker news 的内容
  fetchContent(item: any): void {
    if (item._fetching || item.id == null) return;
    item._fetching = true;
    this.hackerNewsService.summarizeJob(item.id).subscribe({
      next: () => {
        item._fetching = false;
        item.fetchStatus = HackNewsSummaryJobStatus.PENDING;
        // 任务入队后开始定时刷新，更新抓取状态
        this.pollingIds.add(item.id);
        this.startPolling();
      },
      error: () => {
        item._fetching = false;
        item.fetchStatus = HackNewsSummaryJobStatus.FAILED;
      },
    });
  }

  fetchBtnText(item: any): string {
    if (item._fetching) return '抓取中...';
    if (item.fetchStatus === HackNewsSummaryJobStatus.FAILED) return '重新抓取';
    return '抓取内容';
  }

  // 抓取任务入队后，定时重新请求列表接口，刷新任务状态与抓取结果
  private startPolling(): void {
    this.pollAttempts = 0;
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      this.refreshPollingData();
    }, HackerNewsComponent.POLL_INTERVAL);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.pollingIds.clear();
  }

  private refreshPollingData(): void {
    this.pollAttempts++;
    this.hackerNewsService.getHackerNews(this.buildQuery()).subscribe({
      next: (resp: any) => {
        const items = this.mergeViewState(resp.data || [], this.resp.data || []);
        this.resp = { ...resp, data: items };
        this.syncPollingIds(items);
      },
      error: () => {
        // 请求失败时继续重试，直到达到最大轮询次数
        if (this.pollAttempts >= HackerNewsComponent.MAX_POLL_ATTEMPTS) {
          this.stopPolling();
        }
      },
    });
    if (this.pollAttempts >= HackerNewsComponent.MAX_POLL_ATTEMPTS) {
      this.stopPolling();
    }
  }

  // 刷新列表时保留已展开的摘要/正文面板，以及本地进行中的抓取状态
  private mergeViewState(items: any[], previous: any[]): any[] {
    const prevMap = new Map(previous.map((it: any) => [it.id, it]));
    return items.map((it: any) => {
      const prev: any = prevMap.get(it.id);
      if (!prev) return it;
      return {
        ...it,
        _showSummary: prev._showSummary,
        _showContent: prev._showContent,
        // 列表接口未返回任务状态时，保留本地已知的进行中状态
        fetchStatus:
          it.fetchStatus ??
          (this.pollingIds.has(it.id) && !it.content && !it.summary_cn
            ? prev.fetchStatus
            : undefined),
      };
    });
  }

  // 当抓取任务真正结束（成功/失败）时，停止对该条目的轮询
  // 注意：正文可能先于任务结束返回，不能以 content/summary_cn 是否为空作为结束条件
  private syncPollingIds(items: any[]): void {
    this.pollingIds.forEach((id) => {
      const item: any = items.find((it: any) => it.id === id);
      if (!item) return;
      const finished =
        item.fetchStatus === HackNewsSummaryJobStatus.SUCCESS ||
        item.fetchStatus === HackNewsSummaryJobStatus.FAILED ||
        (!item.fetchStatus && !!item.content && !!item.summary_cn);
      if (finished) {
        this.pollingIds.delete(id);
      }
    });
    if (this.pollingIds.size === 0) {
      this.stopPolling();
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

  toIsoDate(dateStr: string): string {
    if (!dateStr) return '';
    return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
  }

  get totalPages(): number {
    const total = this.resp?.total ?? 0;
    const size = this.resp?.size ?? 1;
    return Math.max(1, Math.ceil(total / size));
  }
}

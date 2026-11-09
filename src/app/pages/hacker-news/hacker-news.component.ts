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

  // 复制时需内联到剪贴板的排版样式
  private static readonly COPY_TYPOGRAPHY_PROPS = [
    'color',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'text-align',
  ];

  // 复制时需内联到剪贴板的块级样式
  private static readonly COPY_BLOCK_PROPS = [
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'background-color',
    'white-space',
    'word-break',
    'overflow-wrap',
    'text-decoration-line',
    'list-style-type',
    'list-style-position',
    'vertical-align',
    'border-collapse',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-right-width',
    'border-right-style',
    'border-right-color',
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
    'border-left-width',
    'border-left-style',
    'border-left-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
    'max-width',
  ];

  // 观察者网等站点使用 UMeditor，其 XSS 白名单只保留这些标签，
  // 且只有 div/p/section 允许携带 style，其余标签上的样式会被清掉
  private static readonly UMEDITOR_INLINE_TAGS: Record<string, string> = {
    STRONG: 'strong',
    B: 'strong',
    I: 'i',
    EM: 'i',
    U: 'u',
    SUP: 'sup',
  };

  private static readonly UMEDITOR_UNWRAP_TAGS = new Set([
    'SPAN',
    'CODE',
    'MARK',
    'DEL',
    'S',
    'STRIKE',
    'SUB',
    'SMALL',
    'FONT',
    'LABEL',
    'TT',
    'KBD',
    'SAMP',
    'VAR',
    'CITE',
    'Q',
    'ABBR',
    'TIME',
  ]);

  private static readonly UMEDITOR_BLOCK_TAGS = new Set([
    'P',
    'DIV',
    'SECTION',
    'ARTICLE',
    'BLOCKQUOTE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'UL',
    'OL',
    'LI',
    'PRE',
    'TABLE',
    'THEAD',
    'TBODY',
    'TR',
    'TD',
    'TH',
    'HR',
    'FIGURE',
    'FIGCAPTION',
    'DL',
    'DT',
    'DD',
    'MARKDOWN',
    'MAIN',
    'HEADER',
    'FOOTER',
    'ASIDE',
    'NAV',
    'DETAILS',
    'SUMMARY',
    'ADDRESS',
  ]);

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

  /**
   * Markdown 面板的样式来自组件 SCSS（会被 Angular 编译成带 _ngcontent 的作用域选择器），
   * 浏览器复制时只带走 DOM 结构和内联样式，不会带走这些 CSS，粘贴到富文本编辑器后样式就丢了。
   * 这里在复制发生时把计算后的样式内联到克隆节点上，再写入剪贴板的 text/html。
   * 非可编辑区域选中文字时 copy 事件只在 document 上触发，因此监听 document。
   */
  @HostListener('document:copy', ['$event'])
  onDocumentCopy(event: ClipboardEvent): void {
    const selection = window.getSelection();
    if (
      !event.clipboardData ||
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as Element)
        : node.parentElement;
    const panel = element?.closest('.hn-md-panel') as HTMLElement | null;
    if (!panel) return;

    const { html, text } = this.buildCopyPayload(panel, range);
    event.clipboardData.setData('text/html', html);
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
  }

  // 复制摘要全文（Markdown 源文本）
  async copySummaryMarkdown(item: any): Promise<void> {
    const text = item.summary_cn || '';
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(text);
    } catch {
      this.copyPlainText(text);
    }
    item._copiedMd = true;
    setTimeout(() => {
      item._copiedMd = false;
    }, 1500);
  }

  // 复制摘要全文（保留原有标签和内联样式的 HTML）
  async copySummaryHtml(item: any, panel: HTMLElement): Promise<void> {
    const { html, text } = this.buildCopyPayload(panel);
    try {
      await this.writeRichClipboard(html, text);
    } catch {
      // Clipboard API 不可用时退回选区复制，走 document 的 copy 处理
      this.copyPanelBySelection(panel);
    }
    item._copiedHtml = true;
    setTimeout(() => {
      item._copiedHtml = false;
    }, 1500);
  }

  // 复制摘要全文（UMeditor 白名单兼容格式，用于观察者网等站点）
  async copySummaryUmeditor(item: any, panel: HTMLElement): Promise<void> {
    const { html, text } = this.buildCopyPayload(panel, undefined, 'umeditor');
    try {
      await this.writeRichClipboard(html, text);
    } catch {
      this.copyPanelBySelection(panel);
    }
    item._copiedUm = true;
    setTimeout(() => {
      item._copiedUm = false;
    }, 1500);
  }

  private copyPlainText(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  private async writeRichClipboard(html: string, text: string): Promise<void> {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
  }

  private copyPanelBySelection(panel: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(panel);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }

  // 把面板内容连同计算后的样式一起序列化成剪贴板数据
  private buildCopyPayload(
    panel: HTMLElement,
    range?: Range,
    target: 'html' | 'umeditor' = 'html'
  ): { html: string; text: string } {
    // 记录原有 style 属性，复制完成后还原，避免污染页面
    const restores: Array<{ el: HTMLElement; style: string | null }> = [];
    try {
      const elements: HTMLElement[] = [
        panel,
        ...Array.from(panel.querySelectorAll<HTMLElement>('*')),
      ];
      // 先统一计算，再统一写入，避免写入后的样式影响后续元素的计算结果
      const styles = elements.map((el) =>
        this.buildCopyStyle(window.getComputedStyle(el))
      );
      elements.forEach((el, i) => {
        restores.push({ el, style: el.getAttribute('style') });
        el.setAttribute('style', styles[i]);
      });

      // 用面板的基础排版包一层，确保只选中部分内容时也能继承正文字号/行高/颜色
      const wrapper = document.createElement('div');
      wrapper.setAttribute(
        'style',
        this.buildCopyStyle(window.getComputedStyle(panel), true)
      );
      if (range) {
        wrapper.appendChild(range.cloneContents());
      } else {
        Array.from(panel.childNodes).forEach((node) => {
          wrapper.appendChild(node.cloneNode(true));
        });
      }
      this.cleanCopyNode(wrapper);

      return {
        html:
          target === 'umeditor'
            ? this.toUmeditorHtml(wrapper)
            : wrapper.innerHTML,
        text: range ? range.toString() : panel.innerText,
      };
    } finally {
      restores.forEach(({ el, style }) => {
        if (style === null) {
          el.removeAttribute('style');
        } else {
          el.setAttribute('style', style);
        }
      });
    }
  }

  /**
   * UMeditor（观察者网使用的富文本编辑器）粘贴时会过 XSS 白名单：
   * 白名单外的标签（h1-h6、ul/ol/li、pre/code、table、br 等）会被整段删除，
   * 只有 div/p/section 上的 style 会保留。这里把内容重写成只含白名单标签、
   * 样式全部落在 p/div 上的结构，保证粘贴后外观不丢失。
   */
  private toUmeditorHtml(root: HTMLElement): string {
    const container = document.createElement('div');
    const baseStyle = root.getAttribute('style');
    if (baseStyle) {
      container.setAttribute('style', baseStyle);
    }
    Array.from(root.childNodes).forEach((node) => {
      this.convertUmeditorNode(node, container, 0);
    });
    return container.outerHTML;
  }

  private convertUmeditorNode(
    node: Node,
    out: HTMLElement,
    depth: number,
    inheritedStyle = ''
  ): void {
    if (node.nodeType === Node.TEXT_NODE) {
      out.appendChild(document.createTextNode(node.textContent || ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();
    const style = el.getAttribute('style') || '';

    if (tag === 'BR') {
      out.appendChild(document.createTextNode('\n'));
      return;
    }
    if (tag === 'HR') {
      out.appendChild(document.createElement('hr'));
      return;
    }

    // 行内标签：只保留白名单里的 strong/i/u/sup
    const inlineTag = HackerNewsComponent.UMEDITOR_INLINE_TAGS[tag];
    if (inlineTag) {
      const inline = document.createElement(inlineTag);
      Array.from(el.childNodes).forEach((child) => {
        this.convertUmeditorNode(child, inline, depth, inheritedStyle);
      });
      out.appendChild(inline);
      return;
    }

    // 链接/图片：只保留白名单允许的属性，样式无法保留
    if (tag === 'A' || tag === 'IMG') {
      const kept = document.createElement(tag.toLowerCase());
      ['href', 'target', 'title', 'src', 'alt'].forEach((attr) => {
        const value = el.getAttribute(attr);
        if (value != null) {
          kept.setAttribute(attr, value);
        }
      });
      if (tag === 'A') {
        Array.from(el.childNodes).forEach((child) => {
          this.convertUmeditorNode(child, kept, depth, inheritedStyle);
        });
      }
      out.appendChild(kept);
      return;
    }

    // 行内但白名单不支持的标签（span/code/mark 等）：拆掉标签保留内容
    if (HackerNewsComponent.UMEDITOR_UNWRAP_TAGS.has(tag)) {
      Array.from(el.childNodes).forEach((child) => {
        this.convertUmeditorNode(child, out, depth, inheritedStyle);
      });
      return;
    }

    // 代码块：转成保留换行和等宽样式的 p
    if (tag === 'PRE') {
      const p = document.createElement('p');
      p.setAttribute(
        'style',
        this.mergeCopyStyle(style, 'white-space:pre-wrap', inheritedStyle)
      );
      p.textContent = el.textContent || '';
      out.appendChild(p);
      return;
    }

    // 列表：白名单没有 ul/ol/li，转成带项目符号/序号的 p
    if (tag === 'UL' || tag === 'OL') {
      const items = Array.from(el.children).filter(
        (child) => child.tagName.toUpperCase() === 'LI'
      );
      items.forEach((li, index) => {
        const p = document.createElement('p');
        p.setAttribute(
          'style',
          this.mergeCopyStyle(
            li.getAttribute('style') || '',
            `padding-left:${depth * 22}px`,
            inheritedStyle,
            li.querySelector('br') ? 'white-space:pre-wrap' : ''
          )
        );
        p.appendChild(
          document.createTextNode(tag === 'OL' ? `${index + 1}. ` : '• ')
        );
        // 先挂到输出上，保证嵌套列表出现在当前条目之后
        out.appendChild(p);
        Array.from(li.childNodes).forEach((child) => {
          const childTag =
            child.nodeType === Node.ELEMENT_NODE
              ? (child as HTMLElement).tagName.toUpperCase()
              : '';
          if (childTag === 'UL' || childTag === 'OL') {
            this.convertUmeditorNode(child, out, depth + 1, inheritedStyle);
          } else {
            this.convertUmeditorNode(child, p, depth, inheritedStyle);
          }
        });
      });
      return;
    }

    // 表格：白名单没有 table，按行转成 p，单元格用 | 分隔
    if (tag === 'TABLE') {
      Array.from(el.querySelectorAll('tr')).forEach((row) => {
        const p = document.createElement('p');
        p.setAttribute(
          'style',
          this.mergeCopyStyle(style, inheritedStyle)
        );
        Array.from(row.children)
          .filter((cell) => ['TD', 'TH'].includes(cell.tagName.toUpperCase()))
          .forEach((cell, index) => {
            if (index > 0) {
              p.appendChild(document.createTextNode('  |  '));
            }
            const text = (cell.textContent || '').trim();
            if (cell.tagName.toUpperCase() === 'TH') {
              const strong = document.createElement('strong');
              strong.textContent = text;
              p.appendChild(strong);
            } else {
              p.appendChild(document.createTextNode(text));
            }
          });
        out.appendChild(p);
      });
      return;
    }

    // 容器里还有块级元素时保持透明，把样式下发给子块
    const hasBlockChild = Array.from(el.children).some((child) =>
      HackerNewsComponent.UMEDITOR_BLOCK_TAGS.has(child.tagName.toUpperCase())
    );
    if (hasBlockChild) {
      const nextInherited = this.mergeCopyStyle(style, inheritedStyle);
      Array.from(el.childNodes).forEach((child) => {
        this.convertUmeditorNode(child, out, depth, nextInherited);
      });
      return;
    }

    // 其余块级元素（h1-h6/p/div/blockquote 等）统一转成 p
    const p = document.createElement('p');
    const pStyle = this.mergeCopyStyle(
      style,
      inheritedStyle,
      el.querySelector('br') ? 'white-space:pre-wrap' : ''
    );
    if (pStyle) {
      p.setAttribute('style', pStyle);
    }
    Array.from(el.childNodes).forEach((child) => {
      this.convertUmeditorNode(child, p, depth, inheritedStyle);
    });
    out.appendChild(p);
  }

  private mergeCopyStyle(...parts: Array<string | null | undefined>): string {
    return parts.filter((part): part is string => !!part).join(';');
  }

  // 生成内联样式字符串；typographyOnly 只保留文字相关样式
  private buildCopyStyle(cs: CSSStyleDeclaration, typographyOnly = false): string {
    const props = typographyOnly
      ? HackerNewsComponent.COPY_TYPOGRAPHY_PROPS
      : [
          ...HackerNewsComponent.COPY_TYPOGRAPHY_PROPS,
          ...HackerNewsComponent.COPY_BLOCK_PROPS,
        ];
    return props
      .map((prop) => {
        const value = cs.getPropertyValue(prop);
        return value ? `${prop}:${value}` : '';
      })
      .filter(Boolean)
      .join(';');
  }

  // 清理 Angular 作用域属性和 class/id，避免复制出去的 HTML 带上无关信息
  private cleanCopyNode(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      el.removeAttribute('class');
      el.removeAttribute('id');
      Array.from(el.attributes)
        .filter((attr) => /^(_ng|ng-|data-)/i.test(attr.name))
        .forEach((attr) => el.removeAttribute(attr.name));
    });
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

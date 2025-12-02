import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BiliService } from 'src/app/api/bili.service';

@Component({
  selector: 'up-analysis',
  templateUrl: './up-analysis.component.html',
  styleUrls: ['./up-analysis.component.scss'],
})
export class UpAnalysisComponent {
  title = 'Up Analyse';
  analysisId: any = null;
  markdownStr = '';
  // tabs and selection
  tabs = [
    { id: 'ai', label: 'AI分析' },
    { id: 'stats', label: '可视化分析' },
    { id: 'trend', label: '趋势分析' },
  ];
  selectedTab = 'ai';

  // analysis results
  wordCount = 0;
  topWords: Array<{ word: string; count: number }> = [];
  plainPreview = '';

  constructor(
    private biliService: BiliService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // get params mid from url in angular way
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      const analysisId = params['analysisId'];
      if (analysisId && !isNaN(Number(analysisId))) {
        this.analysisId = Number(analysisId);
        this.loadAnalysis();
      }
    });
  }
  loadAnalysis() {
    this.biliService
      .getUpAnalysis({ analysisId: this.analysisId })
      .subscribe((res: any) => {
        const data = res?.data || res;
        console.log(data);
        if (data) {
          this.markdownStr = data.content || '';
          // compute lightweight analysis for tabs
          this.computeStats();
          this.plainPreview = this.getPlainTextFromMarkdown(
            this.markdownStr
          ).slice(0, 1000);
        }
      });
  }

  selectTab(id: string) {
    this.selectedTab = id;
    if (id === 'stats') {
      this.computeStats();
    }
  }

  getPlainTextFromMarkdown(md: string) {
    if (!md) return '';
    // naive strip of markdown syntax
    let txt = md.replace(/```[\s\S]*?```/g, '');
    txt = txt.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
    txt = txt.replace(/[#>*`~\-\[\]]/g, '');
    txt = txt.replace(/\s+/g, ' ');
    return txt.trim();
  }

  computeStats() {
    const txt = this.getPlainTextFromMarkdown(this.markdownStr);
    if (!txt) {
      this.wordCount = 0;
      this.topWords = [];
      return;
    }
    const words = txt
      .toLowerCase()
      .replace(/[\W_]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0 && w.length > 1);

    this.wordCount = words.length;
    const map: Record<string, number> = {};
    words.forEach((w) => (map[w] = (map[w] || 0) + 1));
    const arr = Object.keys(map).map((k) => ({ word: k, count: map[k] }));
    arr.sort((a, b) => b.count - a.count);
    this.topWords = arr.slice(0, 20);
  }
}

import { Component } from '@angular/core';
import { ArticleService } from 'src/app/api/article.service';
import { Datum } from 'src/app/interface/Datum';
import constList from 'src/app/pages/search/constList';

@Component({
  templateUrl: './data-calendar.component.html',
  styleUrls: ['./data-calendar.component.scss'],
})
export class DataCalendar {
  histogramData: Datum[] = [];
  sourceList = constList.sourceList;

  queryParams = {
    source: this.sourceList[0],
  };

  constructor(private articleService: ArticleService) {}

  radiusFix = (i: any) => Math.sqrt(i);
  ngOnInit() {
    this.getHistogram();
  }

  selectSource(source: any) {
    this.queryParams.source = source;
    this.getHistogram();
  }

  getHistogram() {
    let sourceStr = 'source:*';
    if (this.queryParams.source.title !== 'all') {
      sourceStr = `source:${this.queryParams.source.title}`;
    }
    this.articleService
      .getHistogram({
        query: `${sourceStr} && created_at:[2008-01-01 TO 2022-01-01]`,
        calendar_interval: 'day',
      })
      .subscribe((data: any) => {
        this.histogramData = data;
      });
  }
}

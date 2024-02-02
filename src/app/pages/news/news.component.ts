import { Component, OnInit } from '@angular/core';
import * as json2md from 'json2md';
import { GraphService } from 'src/app/api/graph.service';
import { CopyToClipboard } from 'src/app/util/util';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  private graphService: GraphService;
  MdData: any;
  MdText: any;
  dHtml: any = {};
  titles: any[] = [];
  showRawMd = 'text';
  mdOptions = {
    cdn: 'https://unpkg.com/vditor@${VDITOR_VERSION}',
  };
  resp: any;

  constructor(graphService: GraphService) {
    this.graphService = graphService;
  }

  ngOnInit() {
    this.getDailyMd();
  }

  getDailyMd() {
    this.graphService.dailyMd().subscribe((resp: any) => {
      const dd: any[] = [{ h2: resp.title }];
      this.resp = resp;
      const dtext: any[] = [{ h2: resp.title }];
      this.dHtml.title = resp.title;
      this.dHtml.sources = [];
      let dtext2 = `## ${resp.title}\n`;

      for (const item of resp.data) {
        if (item.data.length > 0) {
          const sourceData: any = {};
          dd.push({ h3: item.title });
          dtext.push({ h3: item.title });
          dtext2 += `### ${item.title}\n`;

          sourceData.title = item.title;
          sourceData.items = [];

          this.titles.push(item.title);

          const dd_ol: any[] = [];
          item.data.forEach((item2: any, i: any) => {
            const itemLink = {
              title: `${item2.title.trim()}`,
              source: item2.url.trim(),
            };
            sourceData.items.push(itemLink);
            dd_ol.push({
              link: itemLink,
            });
            dtext.push([`${i + 1}.${item2.title}`, ``, `${item2.url}`], ``);
            dtext2 += `${i + 1}.${item2.title}\r\n${item2.url}\r\n`;
          });
          dd.push({
            ol: dd_ol,
          });

          this.dHtml.sources.push(sourceData);
        }
      }
      this.MdData = json2md(dd);
      this.MdText = dtext2;
    });
  }

  switchRaw(mode: any) {
    this.showRawMd = mode;
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  copyText(id: any) {
    CopyToClipboard(id);
  }
}

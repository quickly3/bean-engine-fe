import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  navShow = false;
  items = [
    { label: '搜索引擎', value: 'search' },
    { label: '博主查询', value: 'author' },
    { label: '数据可视化', value: 'graph' },
    { label: '每日新闻', value: 'news' },
    { label: '36氪新闻', value: 'kr-news' },
    { label: 'Github最热项目', value: 'github' },
];
  constructor(public router: Router) {
    this.router = router;
  }

  ngOnInit() {
  }

  toggleNav() {
    this.navShow = !this.navShow;
  }
}

import { Component } from '@angular/core';
import { SearchService } from 'src/app/api/search.service';

@Component({
  templateUrl: './juejin-wordcloud.component.html',
})
export class JuejinWordCloud {
  words: string[] = [];

  constructor(private searchService: SearchService) {}
  ngOnInit() {
    this.loadCloud();
  }

  loadCloud() {
    this.searchService
      .getWordsCloud({ tag: '*', source: 'juejin', size: 1000 })
      .subscribe((resp: any) => {
        this.words = resp;
      });
  }
}

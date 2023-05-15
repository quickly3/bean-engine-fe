import { Component } from '@angular/core';
import { GraphService } from 'src/app/api/graph.service';
import { Datum } from 'src/app/interface/Datum';

@Component({
  templateUrl: './cate-statistics.component.html',
})
export class CateStatistics {
  tagsData: Datum[] = [];

  constructor(private graphService: GraphService) {}

  radiusFix = (i:any) => Math.sqrt(i);

  ngOnInit() {
    this.getTagsAgg();
  }

  getTagsAgg() {
    this.graphService.getTagsAgg({size: 100}).subscribe((data: any) => {
        this.tagsData = data;
    });
}

}

import { Component } from '@angular/core';
import { GraphService } from 'src/app/api/graph.service';
import { Datum } from 'src/app/interface/Datum';

@Component({
  templateUrl: './source-statistics.component.html',
})
export class SourceStatistics {
  totalData: Datum[] = [];
  histogramData: Datum[] = [];

  constructor(private graphService: GraphService) {}

  radiusFix = (i: any) => Math.sqrt(i);
  ngOnInit() {
    this.getTotalData();
  }

  getTotalData() {
    this.graphService.getTotalGraph().subscribe((data: any) => {
      const totalData = [];
      for (const i of Object.keys(data)) {
        totalData.push({
          name: i,
          value: data[i],
        });
      }
      this.totalData = totalData;
    });
  }
}

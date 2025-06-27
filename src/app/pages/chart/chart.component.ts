import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { reciprocalTariffs, worldMapJson } from './world';
import * as _ from 'lodash';

@Component({
  selector: 'app-news',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  chartInstance: any;
  constructor() {}

  ngOnInit() {
    this.initWorldMap();
  }

  initWorldMap() {
    echarts.registerMap('world', JSON.stringify(worldMapJson));
    this.chartInstance = echarts.init(document.getElementById('word-map'));

    const data = reciprocalTariffs.map((i: any) => {
      i.name = i.country;
      return i;
    });

    const max = _.max(data.map(i=>i.value))
    const min = _.min(data.map(i=>i.value))

    console.log(data);

    const option = {
      title: {
        text: 'World Map',
        left: 'right',
      },
      toolbox: {
        show: true,
        //orient: 'vertical',
        left: 'left',
        top: 'top',
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      tooltip: {
        trigger: 'item',
        showDelay: 0,
        transitionDuration: 0.2,
      },
      visualMap: {
        left: 'right',
        min,
        max,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026',
          ],
        },
        text: ['High', 'Low'],
        calculable: true,
      },
      series: [
        {
          name: 'World',
          type: 'map',
          map: 'world',
          roam: true,
          emphasis: {
            label: {
              show: true,
            },
          },

          data,
        },
      ],
    };
    this.chartInstance.setOption(option);
  }
}

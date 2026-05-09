import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-indicator-trend-chart',
  templateUrl: './indicator-trend-chart.component.html',
  styleUrls: ['./indicator-trend-chart.component.scss'],
})
export class IndicatorTrendChartComponent implements OnChanges {
  @Input() dataList: any[] = [];
  chartOption: EChartsOption = this.buildOption([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.chartOption = this.buildOption(this.dataList || []);
    }
  }

  private buildOption(dataList: any[]): EChartsOption {
    const rows = (dataList || [])
      .map((item) => ({
        country: item?.country?.value as string,
        date: String(item?.date || ''),
        value: Number(item?.value),
      }))
      .filter(
        (item) =>
          !!item.value &&
          !!item.country &&
          !!item.date &&
          Number.isFinite(item.value)
      );

    if (rows.length === 0) {
      return {
        title: {
          text: '暂无可视化数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#6b7280',
            fontSize: 14,
            fontWeight: 'normal',
          },
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
      };
    }

    const years = Array.from(new Set(rows.map((item) => item.date))).sort(
      (a, b) => Number(a) - Number(b)
    );

    // years 数据有可能是 2025Q3 这种格式 ，检查一下，如果是这种格式，按照年份排序
    if (years.some((year) => /\d{4}Q\d/.test(year))) {
      years.sort((a, b) => {
        const [aYear, aQuarter] = a.split('Q').map(Number);
        const [bYear, bQuarter] = b.split('Q').map(Number);
        return aYear === bYear ? aQuarter - bQuarter : aYear - bYear;
      });
    }

    const countryCountMap = rows.reduce<Record<string, number>>((acc, item) => {
      acc[item.country] = (acc[item.country] || 0) + 1;
      return acc;
    }, {});

    const topCountries = Object.entries(countryCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country]) => country);

    const series = topCountries.map((country) => ({
      name: country,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data: years.map((year) => {
        const matched = rows.find(
          (item) => item.country === country && item.date === year
        );
        return matched ? matched.value : null;
      }),
    }));

    return {
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
      },
      legend: {
        top: 0,
        type: 'scroll',
      },
      grid: {
        left: 44,
        right: 20,
        top: 36,
        bottom: 28,
      },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series,
    };
  }
}

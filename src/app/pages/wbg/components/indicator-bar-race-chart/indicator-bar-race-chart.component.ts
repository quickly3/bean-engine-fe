import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

type RaceRow = {
  country: string;
  date: string;
  value: number;
};

type RaceFrame = {
  date: string;
  rows: Array<{ country: string; value: number }>;
};

@Component({
  selector: 'app-indicator-bar-race-chart',
  templateUrl: './indicator-bar-race-chart.component.html',
  styleUrls: ['./indicator-bar-race-chart.component.scss'],
})
export class IndicatorBarRaceChartComponent implements OnChanges, OnDestroy {
  @Input() dataList: any[] = [];

  chartOption: EChartsOption = this.buildEmptyOption();

  private readonly maxBars = 10;
  private readonly frameIntervalMs = 1500;
  private frames: RaceFrame[] = [];
  private frameIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.prepareFrames(this.dataList || []);
      this.restartAnimation();
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  private prepareFrames(dataList: any[]): void {
    const rows = (dataList || [])
      .map((item) => ({
        country: String(item?.country?.value || '').trim(),
        date: String(item?.date || '').trim(),
        value: Number(item?.value),
      }))
      .filter(
        (item): item is RaceRow =>
          !!item.country &&
          !!item.date &&
          Number.isFinite(item.value) &&
          item.value >= 0
      );

    if (rows.length === 0) {
      this.frames = [];
      return;
    }

    const groupedByDate = new Map<string, Map<string, number>>();

    for (const row of rows) {
      const dateMap = groupedByDate.get(row.date) || new Map<string, number>();
      dateMap.set(row.country, (dateMap.get(row.country) || 0) + row.value);
      groupedByDate.set(row.date, dateMap);
    }

    const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) =>
      this.compareDateKey(a, b)
    );

    this.frames = sortedDates.map((date) => {
      const dateMap = groupedByDate.get(date) || new Map<string, number>();
      const topRows = Array.from(dateMap.entries())
        .map(([country, value]) => ({ country, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, this.maxBars);

      return { date, rows: topRows };
    });
  }

  private restartAnimation(): void {
    this.stopAnimation();

    if (this.frames.length === 0) {
      this.chartOption = this.buildEmptyOption();
      return;
    }

    this.frameIndex = 0;
    this.applyFrame(this.frames[this.frameIndex]);

    if (this.frames.length === 1) {
      return;
    }

    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.applyFrame(this.frames[this.frameIndex]);
    }, this.frameIntervalMs);
  }

  private stopAnimation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private applyFrame(frame: RaceFrame): void {
    const categories = frame.rows.map((item) => item.country);
    const values = frame.rows.map((item) => item.value);
    const maxValue = Math.max(...values, 0);

    this.chartOption = {
      animationDuration: 400,
      animationDurationUpdate: 1200,
      animationEasing: 'cubicOut',
      animationEasingUpdate: 'linear',
      title: {
        text: 'Indicator Data 条形图赛跑',
        left: 8,
        top: 8,
        textStyle: {
          color: '#1f3f5b',
          fontSize: 14,
          fontWeight: 700,
        },
        subtext: `时间: ${frame.date}`,
        subtextStyle: {
          color: '#5a738c',
          fontSize: 12,
        },
      },
      grid: {
        left: 140,
        right: 28,
        top: 70,
        bottom: 20,
      },
      xAxis: {
        type: 'value',
        max: maxValue > 0 ? maxValue * 1.1 : 1,
        splitLine: {
          lineStyle: {
            color: 'rgba(141, 167, 193, 0.24)',
          },
        },
        axisLabel: {
          color: '#567089',
          formatter: (value: number) => this.formatValue(value),
        },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: categories,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: '#1f3f5b',
          fontSize: 12,
          width: 120,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          realtimeSort: true,
          data: values,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(36, 105, 179, 0.08)',
          },
          label: {
            show: true,
            position: 'right',
            color: '#19324a',
            formatter: (params: any) => this.formatValue(params?.value),
          },
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: (params: any) => {
              const palette = [
                '#0f7cdd',
                '#07a18a',
                '#f19c38',
                '#d04f7d',
                '#7a66d9',
                '#1f9ac8',
                '#93b14f',
                '#e76f51',
                '#5f88c9',
                '#00a6a6',
              ];
              return palette[(params?.dataIndex || 0) % palette.length];
            },
          },
        },
      ],
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: (params: any) => {
          const country = params?.name || '-';
          const value = this.formatValue(params?.value);
          return `${country}<br/>${value}`;
        },
      },
      graphic: [
        {
          type: 'text',
          right: 16,
          bottom: 10,
          style: {
            text: frame.date,
            fontSize: 36,
            fontWeight: 700,
            fill: 'rgba(52, 86, 120, 0.15)',
          },
        },
      ],
    };
  }

  private compareDateKey(a: string, b: string): number {
    const aQuarter = this.parseQuarterKey(a);
    const bQuarter = this.parseQuarterKey(b);

    if (aQuarter && bQuarter) {
      if (aQuarter.year !== bQuarter.year) {
        return aQuarter.year - bQuarter.year;
      }
      return aQuarter.quarter - bQuarter.quarter;
    }

    const aYear = Number(a);
    const bYear = Number(b);
    if (Number.isFinite(aYear) && Number.isFinite(bYear)) {
      return aYear - bYear;
    }

    return a.localeCompare(b);
  }

  private parseQuarterKey(value: string): { year: number; quarter: number } | null {
    const matched = value.match(/^(\d{4})Q([1-4])$/i);
    if (!matched) {
      return null;
    }

    return {
      year: Number(matched[1]),
      quarter: Number(matched[2]),
    };
  }

  private formatValue(value: unknown): string {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return '-';
    }

    const abs = Math.abs(numeric);

    if (abs >= 1_000_000_000) {
      return `${(numeric / 1_000_000_000).toFixed(2)}B`;
    }

    if (abs >= 1_000_000) {
      return `${(numeric / 1_000_000).toFixed(2)}M`;
    }

    if (abs >= 1_000) {
      return `${(numeric / 1_000).toFixed(1)}K`;
    }

    return numeric.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }

  private buildEmptyOption(): EChartsOption {
    return {
      title: {
        text: '暂无可视化数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#64748b',
          fontSize: 14,
          fontWeight: 'normal',
        },
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: [],
    };
  }
}

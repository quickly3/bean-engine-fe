import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberUnit',
  pure: true,
})
export class NumberUnitPipe implements PipeTransform {
  transform(value: number | string | undefined | null): string {
    if (value === null || value === undefined || value === '') return '-';

    const num = typeof value === 'string' ? Number(value) : value;
    if (isNaN(num)) return String(value);

    const abs = Math.abs(num);
    // 亿
    if (abs >= 100000000) {
      const v = num / 100000000;
      return this.trim(v) + '亿';
    }
    // 万
    if (abs >= 10000) {
      const v = num / 10000;
      return this.trim(v) + '万';
    }
    return String(num);
  }

  private trim(n: number): string {
    // 保留一位小数，但如果是整数则不保留小数
    const rounded = Math.round(n * 10) / 10;
    if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
      return String(Math.round(rounded));
    }
    return String(rounded);
  }
}

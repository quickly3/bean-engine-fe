import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type WorldBankParamValue = string | number | boolean;

export interface WorldBankListMeta {
  page: number;
  pages: number;
  per_page: string;
  total: number;
}

export type WorldBankListResponse<T> = [WorldBankListMeta, T[]];

@Injectable({
  providedIn: 'root',
})
export class WorldBankService {
  private readonly apiUrl = 'https://api.worldbank.org/v2';

  constructor(private http: HttpClient) {}

  private buildParams(params?: Record<string, WorldBankParamValue>): HttpParams {
    let httpParams = new HttpParams().set('format', 'json');

    if (!params) {
      return httpParams;
    }

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  getSources(
    params?: Record<string, WorldBankParamValue>
  ): Observable<WorldBankListResponse<any>> {
    return this.http.get<WorldBankListResponse<any>>(`${this.apiUrl}/sources`, {
      params: this.buildParams(params),
    });
  }

  getIndicators(
    params?: Record<string, WorldBankParamValue>
  ): Observable<WorldBankListResponse<any>> {
    return this.http.get<WorldBankListResponse<any>>(`${this.apiUrl}/indicator`, {
      params: this.buildParams(params),
    });
  }

  getIndicatorsBySource(
    sourceId: number | string,
    params?: Record<string, WorldBankParamValue>
  ): Observable<WorldBankListResponse<any>> {
    return this.http.get<WorldBankListResponse<any>>(
      `${this.apiUrl}/sources/${sourceId}/indicators`,
      {
        params: this.buildParams(params),
      }
    );
  }

  getIndicatorData(
    indicatorId: string,
    countryCode: string = 'all',
    params?: Record<string, WorldBankParamValue>
  ): Observable<WorldBankListResponse<any>> {
    return this.http.get<WorldBankListResponse<any>>(
      `${this.apiUrl}/country/${countryCode}/indicator/${indicatorId}`,
      {
        params: this.buildParams(params),
      }
    );
  }
  
}
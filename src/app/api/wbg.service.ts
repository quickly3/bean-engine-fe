import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WbgService {
  apiURL: string;

  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  getDataSources = (params: any) => {
    return this.http.get(this.apiURL + '/wbg/data-sources', { params });
  };

  getIndicators = (params: any) => {
    return this.http.get(this.apiURL + '/wbg/indicators', { params });
  };

  getIndicatorsWithDataSource = (params: any) => {
    return this.http.get(this.apiURL + '/wbg/indicators-with-data-source', {
      params,
    });
  };

  getCountries = (params: any) => {
    return this.http.get(this.apiURL + '/wbg/countries', { params });
  };
}

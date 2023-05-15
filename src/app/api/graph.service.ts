import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  apiURL: string;
  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  getTotalGraph = () => {
    return this.http.get(this.apiURL + '/graph/getTotalGraph');
  };

  getLastDayData = () => {
    return this.http.get(this.apiURL + '/graph/getLastDayData');
  };

  dailyMd = () => {
    return this.http.get(this.apiURL + '/graph/dailyMd');
  };
  dailyKr = () => {
    return this.http.get(this.apiURL + '/graph/dailyKr');
  };
  dailyGitHub = (params: any) => {
    return this.http.get(this.apiURL + '/graph/dailyGitHub', { params });
  };

  getTagsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/graph/getTagsAgg', params);
  };
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BiliService {
  apiURL: string;
  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  getUps = (params: any) => {
    return this.http.post(this.apiURL + '/bili/getUps', params);
  };

  getUpVideos = (params: any) => {
    return this.http.post(this.apiURL + '/bili/getUpVideos', params);
  };

  getUpAnalysis = (params: any) => {
    return this.http.post(this.apiURL + '/bili/getUpAnalysis', params);
  };
}

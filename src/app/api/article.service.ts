import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  apiURL: string;
  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  getHistogram = (params: any) => {
    return this.http.post(this.apiURL + '/article/getHistogram', params);
  };

  getAuthorTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/article/getAuthorTermsAgg', params);
  };
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  apiURL: string;
  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  getWordsCloud = (params: any) => {
    return this.http.get(this.apiURL + '/infoq/getWordsCloud', { params });
  };

  searchDatasSimple = (params: {
    page: string;
    keywords: any;
    search_type: string;
  }) => {
    return this.http.post(this.apiURL + '/infoq/getDailyList', params);
  };

  getTags = (params: { source: string }) => {
    return this.http.get(this.apiURL + '/infoq/getTags', { params });
  };

  getCategories = (params: { source: string }) => {
    return this.http.get(this.apiURL + '/infoq/getCategories', { params });
  };

  // tslint:disable-next-line: max-line-length
  getDailyList = (params: {
    page: string;
    keywords: string;
    tag: string;
    source: string;
    startDate: NgbDateStruct | undefined;
    endDate: NgbDateStruct | undefined;
    sortBy: { value: string; label: string };
  }) => {
    return this.http.post(this.apiURL + '/infoq/getDailyList', params);
  };

  getArticleHistogram = (params: {
    page: string;
    keywords: string;
    tag: string;
    source: string;
    startDate: NgbDateStruct | undefined;
    endDate: NgbDateStruct | undefined;
    sortBy: { value: string; label: string };
  }) => {
    return this.http.post(this.apiURL + '/infoq/getArticleHistogram', params);
  };

  getWordsCloudByQueryBuilder = (params: any) => {
    return this.http.post(
      this.apiURL + '/infoq/getWordsCloudByQueryBuilder',
      params
    );
  };

  getAuthorTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/infoq/getAuthorTermsAgg', params);
  };

  getTagsTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/infoq/getTagsTermsAgg', params);
  };

  getCatesTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/infoq/getCatesTermsAgg', params);
  };

  starsChange = (params: any) => {
    return this.http.post(this.apiURL + '/infoq/starsChange', { params });
  };

  autoComplete = (params: { keywords: string }) => {
    return this.http.get(this.apiURL + '/infoq/autoComplete', { params });
  };
}

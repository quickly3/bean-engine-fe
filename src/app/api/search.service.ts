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
    return this.http.get(this.apiURL + '/search/getWordsCloud', { params });
  };

  searchDatasSimple = (params: {
    page: string;
    keywords: any;
    search_type: string;
  }) => {
    return this.http.post(this.apiURL + '/search/getAll', params);
  };

  getTags = (params: { source: string }) => {
    return this.http.get(this.apiURL + '/search/getTags', { params });
  };

  getCategories = (params: { source: string }) => {
    return this.http.get(this.apiURL + '/search/getCategories', { params });
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
    return this.http.post(this.apiURL + '/search/getAll', params);
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
    return this.http.post(this.apiURL + '/search/getArticleHistogram', params);
  };

  getWordsCloudByQueryBuilder = (params: any) => {
    return this.http.post(
      this.apiURL + '/search/getWordsCloudByQueryBuilder',
      params
    );
  };

  getAuthorTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/search/getAuthorTermsAgg', params);
  };

  getTagsTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/search/getTagsTermsAgg', params);
  };

  getCatesTermsAgg = (params: any) => {
    return this.http.post(this.apiURL + '/search/getCatesTermsAgg', params);
  };

  starsChange = (params: any) => {
    return this.http.post(this.apiURL + '/search/starsChange', { params });
  };

  autoComplete = (params: { keywords: string }) => {
    return this.http.get(this.apiURL + '/search/autoComplete', { params });
  };
}

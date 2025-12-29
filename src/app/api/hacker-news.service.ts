import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface HackerNewsItem {
  id: number;
  state: string | null;
  by: string | null;
  descendants: number | null;
  score: number | null;
  time: number | null;
  title: string | null;
  subTitle?: string | null;
  title_cn?: string | null;
  category?: string | null;
  text?: string | null;
  text_cn?: string | null;
  type?: string | null;
  url?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface HackerNewsResponse {
  total: number;
  data: HackerNewsItem[];
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class HackerNewsService {
  apiURL: string;
  constructor(private http: HttpClient) {
    this.apiURL = environment.apiURL;
  }

  /**
   * Fetch hacker news list from backend
   * @param page page number (default 1)
   * @param size page size (default 20)
   */
  getHackerNews(params:any): any{
    return this.http.post<HackerNewsResponse>(
      this.apiURL + '/search/getHackerNews',
      params
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, LoginResponse, UserInfo } from '../../api/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  navShow = false;
  items = [
    { label: '搜索引擎', value: 'search' },
    { label: 'B站Up', value: 'bili-up' },
    { label: '数据可视化', value: 'graph' },
    { label: '每日新闻', value: 'news' },
    { label: '36氪新闻', value: 'kr-news' },
    { label: 'Github最热项目', value: 'github' },
    { label: '图表', value: 'chart' },
    { label: 'HackerNews', value: 'hackerNews' },
    { label: 'WBG指标', value: 'wbg' },


];
  showLoginModal = false;
  showProfileModal = false;
  loginForm = { username: '', password: '' };
  loginError = '';
  loginLoading = false;
  profileLoading = false;
  profileError = '';
  user: UserInfo | null = null;

  constructor(public router: Router, private authService: AuthService) {
    this.router = router;
  }

  ngOnInit() {
    if (this.authService.getToken()) {
      this.loadProfile(false);
    }
  }

  get isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  get displayName(): string {
    const name =
      this.user?.['name'] ?? this.user?.['username'] ?? this.user?.['email'];
    return typeof name === 'string' ? name : '';
  }

  get userEntries(): { key: string; value: string }[] {
    if (!this.user) {
      return [];
    }
    return Object.entries(this.user)
      .filter(
        ([key, value]) =>
          !['accessToken', 'token', 'password'].includes(key) &&
          (typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean')
      )
      .map(([key, value]) => ({ key, value: String(value) }));
  }

  toggleNav() {
    this.navShow = !this.navShow;
  }

  openLogin() {
    this.loginError = '';
    this.showProfileModal = false;
    this.showLoginModal = true;
  }

  closeLogin() {
    this.showLoginModal = false;
  }

  submitLogin() {
    const username = this.loginForm.username.trim();
    if (!username || !this.loginForm.password) {
      this.loginError = '请输入用户名和密码';
      return;
    }
    this.loginError = '';
    this.loginLoading = true;
    this.authService
      .login({ username, password: this.loginForm.password })
      .subscribe({
        next: (res: LoginResponse) => {
          const token = res.accessToken || res.token || '';
          if (!token) {
            this.loginLoading = false;
            this.loginError = '登录响应缺少 accessToken';
            return;
          }
          this.authService.setToken(token);
          this.user = res.user || this.pickUser(res);
          this.loginLoading = false;
          this.showLoginModal = false;
          this.loginForm = { username: '', password: '' };
        },
        error: (err: HttpErrorResponse) => {
          this.loginLoading = false;
          this.loginError =
            err.status === 401
              ? '用户名或密码错误'
              : err.error?.message || '登录失败，请稍后重试';
        },
      });
  }

  openProfile() {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }
    this.profileError = '';
    this.showProfileModal = true;
    this.loadProfile(true);
  }

  closeProfile() {
    this.showProfileModal = false;
  }

  logout() {
    this.authService.clearToken();
    this.user = null;
    this.showProfileModal = false;
  }

  private loadProfile(showError: boolean) {
    this.profileLoading = true;
    this.profileError = '';
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = this.pickUser(res);
        this.profileLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.profileLoading = false;
        if (err.status === 401) {
          this.authService.clearToken();
          this.user = null;
          this.showProfileModal = false;
          if (showError) {
            this.openLogin();
            this.loginError = '登录状态已失效，请重新登录';
          }
          return;
        }
        if (showError) {
          this.profileError =
            err.error?.message || '获取用户信息失败，请稍后重试';
        }
      },
    });
  }

  private pickUser(res: UserInfo | LoginResponse): UserInfo {
    const user = (res as Record<string, unknown>)['user'];
    if (user && typeof user === 'object') {
      return user as UserInfo;
    }
    const rest = { ...(res as LoginResponse) };
    delete rest.accessToken;
    delete rest.token;
    return rest;
  }
}

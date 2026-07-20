/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// 拦截 target="_blank" 的链接，使用 Tauri opener 在系统默认浏览器中打开
// 在非 Tauri 环境（普通浏览器）下保持原生行为
function setupTauriExternalLinks() {
  if (!(window as any).__TAURI_INTERNALS__) {
    return;
  }
  document.addEventListener('click', async (event: MouseEvent) => {
    const link = (event.target as HTMLElement)?.closest?.('a[target="_blank"]') as HTMLAnchorElement | null;
    if (!link) {
      return;
    }
    const href = link.href;
    if (!href || href.startsWith('javascript:') || href.startsWith('#')) {
      return;
    }
    event.preventDefault();
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(href);
    } catch (err) {
      console.error('Failed to open URL via Tauri opener:', err);
      window.open(href, '_blank');
    }
  }, true);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => setupTauriExternalLinks())
  .catch(err => console.error(err));

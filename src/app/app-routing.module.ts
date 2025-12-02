import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { GithubComponent } from './pages/github/github.component';
import { GraphComponent } from './pages/graph/graph.component';
import { KrNewsComponent } from './pages/kr-news/kr-news.component';
import { NewsComponent } from './pages/news/news.component';
import { ChartComponent } from './pages/chart/chart.component';
import { BiliUpComponent } from './pages/bili-up/bili-up.component';
import { UpVideosComponent } from './pages/up-videos/up-videos.component';
import { UpAnalysisComponent } from './pages/up-analysis/up-analysis.component';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'bili-up', component: BiliUpComponent },
  { path: 'graph', component: GraphComponent },
  { path: 'news', component: NewsComponent },
  { path: 'kr-news', component: KrNewsComponent },
  { path: 'github', component: GithubComponent },
  { path: 'chart', component: ChartComponent },
  { path: 'up-videos', component: UpVideosComponent },
  { path: 'up-analysis', component: UpAnalysisComponent },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      enableTracing: false,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

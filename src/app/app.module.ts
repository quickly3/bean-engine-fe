import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './pages/search/search.component';
import { ComponentsModule } from './components/components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NewsComponent } from './pages/news/news.component';
import { KrNewsComponent } from './pages/kr-news/kr-news.component';
import { GraphComponent } from './pages/graph/graph.component';
import { NuMarkdownModule } from '@ng-util/markdown';
import { GithubComponent } from './pages/github/github.component';
import SubGraphComponents from './pages/graph/sub-graph';
import { MarkdownModule } from 'ngx-markdown';
import { ChartComponent } from './pages/chart/chart.component';
import { BiliUpComponent } from './pages/bili-up/bili-up.component';
import { UpVideosComponent } from './pages/up-videos/up-videos.component';
import { UpAnalysisComponent } from './pages/up-analysis/up-analysis.component';
import { NumberUnitPipe } from './pipes/number-unit.pipe';
import { HackerNewsComponent } from './pages/hacker-news/hacker-news.component';
import { WbgComponent } from './pages/wbg/wbg.component';
import { DataSourcesPanelComponent } from './pages/wbg/components/data-sources-panel/data-sources-panel.component';
import { IndicatorsPanelComponent } from './pages/wbg/components/indicators-panel/indicators-panel.component';
import { IndicatorDataPanelComponent } from './pages/wbg/components/indicator-data-panel/indicator-data-panel.component';
import { IndicatorTrendChartComponent } from './pages/wbg/components/indicator-trend-chart/indicator-trend-chart.component';
import { IndicatorBarRaceChartComponent } from './pages/wbg/components/indicator-bar-race-chart/indicator-bar-race-chart.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    NumberUnitPipe,
    BiliUpComponent,
    UpVideosComponent,
    UpAnalysisComponent,
    NewsComponent,
    KrNewsComponent,
    GithubComponent,
    ChartComponent,
    GraphComponent,
    ...SubGraphComponents.allComponents,
    SubGraphComponents.subComponents,
    HackerNewsComponent,
    WbgComponent,
    DataSourcesPanelComponent,
    IndicatorsPanelComponent,
    IndicatorDataPanelComponent,
    IndicatorTrendChartComponent,
    IndicatorBarRaceChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ComponentsModule,
    NgbModule,
    FontAwesomeModule,
    NuMarkdownModule.forRoot(),
    MarkdownModule.forRoot(),
    NgxEchartsModule.forRoot({ echarts }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

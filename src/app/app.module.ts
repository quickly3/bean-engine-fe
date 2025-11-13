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

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    BiliUpComponent,
    NewsComponent,
    KrNewsComponent,
    GithubComponent,
    ChartComponent,
    GraphComponent,
    ...SubGraphComponents.allComponents,
    SubGraphComponents.subComponents,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

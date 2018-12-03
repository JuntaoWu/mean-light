import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionManageComponent } from './question-manage/question-manage.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "",
    component: QuestionManageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

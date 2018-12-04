import { Injectable } from '@angular/core';
import { Questions } from './struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  constructor(private http: HttpClient) { }
  
  getQuestionList(params?: { limit?: number, skip?: number }) {
    return this.http.post<Questions[]>('/api/levelpackage', {});
  }
  
  saveQuestion(params: Questions) {
    return this.http.post('/api/levelpackage/save', params);
  }
}

import { Injectable } from '@angular/core';
import { Questions } from './struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  constructor(private http: HttpClient) { }
  
  deleteQuestionById(id: string) {
    return this.http.post('/api/levelpackage/remove', {_id: id});
  }
  
  getQuestionList(params?: { limit?: number, skip?: number }) {
    return this.http.post<Questions[]>('/api/levelpackage', {});
  }
  
  getQuestionByPackageId(id: string) {
    return this.http.get<Questions>(`/api/levelpackage/getByPackageId/${id}`);
  }

  saveQuestion(params: Questions) {
    return this.http.post('/api/levelpackage/save', params);
  }

  fileUpload(formData: FormData) {
    return this.http.post('/api/upload', formData).toPromise();
  }
}

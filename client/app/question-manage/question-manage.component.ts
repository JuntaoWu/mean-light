import { Component, OnInit } from '@angular/core';
import { Questions } from '../struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-question-manage',
  templateUrl: './question-manage.component.html',
  styleUrls: ['./question-manage.component.scss']
})
export class QuestionManageComponent implements OnInit {

  editQuestions: Questions;
  question: Questions; 
  isEdit: boolean; //编辑题库或新增题库
  tips: string;
  questionList: Array<Questions> = [];
  uploading = false;
  cannotSubmit = true;
  fileList: any[] = [];
  activeTab: number = 0;
  ismodalVisible: boolean = false;
  pageSize: number;
  pageIndex: number;
  questionNo: string = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.isEdit = false;
    this.pageIndex = 1; 
    this.pageSize = 10;
    this.question = {
      levelPackageId: null,
      questionTitle: null,
      questionDes: null,
      qVersion: 1,
      qUrl: null,
    }
  }

  resetQuestion() {
    this.isEdit = false;
    this.questionNo = null;
    this.question.levelPackageId = null;
    this.question.questionTitle = null;
    this.question.questionDes = null;
    this.question.qVersion = 1,
    this.question.qUrl = null;
  }

  selectChange() {
    if (this.activeTab && !this.questionList.length) {
      this.getQuestionList();
    }
  }

  isQuestionExisted() {
    if (this.questionNo == this.question.levelPackageId) return;
    this.questionNo = this.questionNo || this.question.levelPackageId;
    let req = new HttpRequest('GET', `/api/levelpackage/getByPackageId/${this.question.levelPackageId}`);
    this.http
      .request(req)
      .subscribe(
        (val: any) => {
          if (val.body && val.body.result) {
            this.editQuestions = {
              ...val.body.result
            }
            this.showModal("当前题库ID已存在，你要修改该题库吗？");
          }
          else {
            if (this.isEdit) {
              this.cannotSubmit = false;
            }
          }
        },
        err => {
        }
      );
  }

  modelChange() {
    if (!this.question.levelPackageId) {
      console.log("id is null");
      this.cannotSubmit = true;
      return;
    }
    else if (!this.isEdit && !this.fileList.length) {
      this.cannotSubmit = true;
      return;
    }
    this.cannotSubmit = false;
  }

  beforeUpload = (file: any): boolean => {
    this.fileList[0] = file;
    this.cannotSubmit = false;
    return false;
  }

  async fileUpload() {
    const formData = new FormData();
    formData.append('files', this.fileList[0]);
    formData.append('questionNo', this.question.levelPackageId);
    this.uploading = true;
    const req = new HttpRequest('POST', '/api/upload', formData);
    return this.http
      .request(req)
      .toPromise();
  }

  async handleSubmit() {
    this.cannotSubmit = true;
    if (this.fileList[0]) {
      let val: any = await this.fileUpload().catch(val => {

      });
      this.uploading = false;
      this.question.qUrl = val.body.path;
    }
    if (this.isEdit) {
      this.question.qVersion = +this.question.qVersion + 1;
    }
    const req = new HttpRequest('POST', '/api/levelpackage/save', this.question);
    this.http
      .request(req)
      .subscribe(
        (val: {}) => {
          this.fileList = [];
          this.resetQuestion();
          this.getQuestionList();
        },
        err => {
          this.cannotSubmit = false;
        }
      );
  }

  getQuestionList() {
    let param = { limit: this.pageSize, skip: this.pageSize * (this.pageIndex - 1) }
    // console.log(param); 
    const req = new HttpRequest('POST', '/api/levelpackage', {});
    this.http
      .request(req)
      .subscribe(
        (val: any) => {
          console.log(val)
          if (val.body && val.body.result) {
            this.questionList = val.body.result.map(i => {
              let date = new Date(i.updatedAt);
              let h: string|number = date.getHours(), 
                  m: string|number = date.getMinutes(), 
                  s: string|number = date.getSeconds();
              h = h < 10 ? "0" + h : h;
              m = m < 10 ? "0" + m : m;
              s = s < 10 ? "0" + s : s;
              return {
                ...i,
                updatedAt: `${i.updatedAt.substr(0, 10)} ${h}:${m}:${s}`
              }
            });
          }
        },
        err => {
        }
      );
  }

  editQuestion(id?: string) {
    let editQuestion = this.questionList.find(i => i._id == id)
    this.questionNo = editQuestion.levelPackageId;
    this.question = { ...editQuestion };
    this.fileList = [];
    this.isEdit = true;
    this.cannotSubmit = true;
    this.activeTab = 0;
  }
  
  showModal(msg): void {
    this.tips = msg;
    this.ismodalVisible = true;
  }

  handleOk(): void {
    this.ismodalVisible = false;
    if (this.tips == "确定放弃编辑该题库？") {
      this.resetQuestion();
    }
    else {
      this.question = {
        ...this.editQuestions
      }
      this.questionNo = this.question.levelPackageId;
    }
  }

  handleCancel(): void {
    this.ismodalVisible = false;
    this.question.levelPackageId = this.questionNo;
  }

}

import { Component, OnInit } from '@angular/core';
import { Questions } from '../struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-question-manage',
  templateUrl: './question-manage.component.html',
  styleUrls: ['./question-manage.component.scss']
})
export class QuestionManageComponent implements OnInit {

  editQuestions: Questions;
  question: Questions; 
  isExisted: boolean; //编辑题号是否已存在
  tips: string;
  questionList: Array<Questions> = [];
  uploading = false;
  cannotSubmit = true;
  fileList: any[] = [];
  activeTab: number = 0;
  ismodalVisible: boolean = false;
  pageSize: number;
  pageIndex: number;
  questionId: string = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.isExisted = false;
    this.pageIndex = 1; 
    this.pageSize = 10;
    this.question = {
      questionsId: null,
      questionsNo: null,
      questionTitle: null,
      questionDes: null,
      qVersion: 1,
      qUrl: null,
    }
  }

  resetQuestion() {
    this.question.questionsId = null;
    this.question.questionsNo = null;
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
    if (this.questionId == this.question.questionsId) return;
    this.questionId = this.questionId || this.question.questionsId;
    let req = new HttpRequest('GET', `/api/questions/${this.question.questionsId}`);
    this.http
      .request(req)
      .subscribe(
        (val: any) => {
          if (val.body && val.body.result) {
            this.editQuestions = {
              ...val.body.result
            }
            this.showModal("当前题库编号已存在，你要修改该题库吗？");
          }
          else {
            this.isExisted = false;
            if (!this.fileList.length) {
              this.question.qUrl = "";
              this.question.questionTitle = "";
              this.question.questionDes = "";
              this.cannotSubmit = true;
            }
          }
        },
        err => {
        }
      );
  }

  modelChange() {
    if (!this.question.questionsId || !this.question.questionsNo) {
      console.log("id is null");
      this.cannotSubmit = true;
      return;
    }
    else if (!this.isExisted && !this.fileList.length) {
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
    this.uploading = true;
    const req = new HttpRequest('POST', '/api/upload', formData);
    await this.http
      .request(req)
      .subscribe(
        (val: any) => {
          this.uploading = false;
        },
        err => {
          this.uploading = false;
          console.log("upload failed.");
        }
      );
  }

  async handleSubmit() {
    this.cannotSubmit = true;
    if (this.fileList[0]) {
      await this.fileUpload();
      this.question.qUrl = "uploads/" + this.fileList[0].name;
    }
    if (this.isExisted) {
      this.question.qVersion = +this.question.qVersion + 1;
    }
    const req = new HttpRequest('POST', '/api/questions/save', this.question);
    this.http
      .request(req)
      .subscribe(
        (val: {}) => {
          this.fileList = [];
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
    const req = new HttpRequest('POST', '/api/questions', {});
    this.http
      .request(req)
      .subscribe(
        (val: any) => {
          console.log(val)
          if (val.body && val.body.result) {
            this.questionList = val.body.result.map(i => {
              let date = new Date(i.updatedAt);
              let h = date.getHours(), 
                  m = date.getMinutes(), 
                  s = date.getSeconds();
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
    this.question = { ...this.questionList.find(i => i.questionsId == id) };
    this.questionId = id;
    this.fileList = [];
    this.isExisted = true;
    this.cannotSubmit = true;
    this.activeTab = 0;
  }
  
  showModal(msg): void {
    this.tips = msg;
    this.ismodalVisible = true;
  }

  handleOk(): void {
    this.ismodalVisible = false;
    this.isExisted = true;
    this.question = {
      ...this.editQuestions
    }
    this.questionId = this.question.questionsId;
  }

  handleCancel(): void {
    this.ismodalVisible = false;
    this.question.questionsId = this.questionId;
  }

}

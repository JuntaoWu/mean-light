import { Component, OnInit } from '@angular/core';
import { Questions } from '../struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-question-manage',
  templateUrl: './question-manage.component.html',
  styleUrls: ['./question-manage.component.scss']
})
export class QuestionManageComponent implements OnInit {

  editOldQuestion: Questions = {
    questionsId: 1,
    questionsNo: "",
    questionTitle: "",
    questionDes: "",
    qVersion: "",
    qUrl: "",
  }
  question: Questions = {
    questionsId: 1,
    questionsNo: "",
    questionTitle: "",
    questionDes: "",
    qVersion: "",
    qUrl: "",
  }; 
  questionList: Array<Questions> = [];
  uploading = false;
  cannotSubmit = true;
  fileList: any[] = [];
  activeTab: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.judgeCanSunmit();
  }

  selectChange() {
    // console.log(this.activeTab);
    if (this.activeTab && !this.questionList.length) {
      this.getQuestionList();
    }
  }

  judgeCanSunmit() {
    console.log(111);
    if (this.fileList[0]) {
      this.cannotSubmit = false;
    }
    else {
      this.cannotSubmit = true;
      Object.keys(this.question).forEach((key) => {
        if (this.question[key] != this.editOldQuestion[key]) {
          this.cannotSubmit = false;
        }
      });
    }
  }

  beforeUpload = (file: any): boolean => {
    this.fileList[0] = file;
    this.judgeCanSunmit();
    return false;
  }

  async fileUpload() {
    const formData = new FormData();
    formData.append('files', this.fileList[0]);
    this.uploading = true;
    const req = new HttpRequest('POST', '/api/upload', formData, {
      
    });
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
    if (!this.question.questionsId || !this.question.questionsNo) {
      console.log("id is null");
      return;
    }
    if (this.fileList[0]) {
      await this.fileUpload();
      this.question.qUrl = "/api/uploads/" + this.fileList[0].name;
    }
    console.log(this.question.qUrl)
    const req = new HttpRequest('POST', '/api/questions/save', this.question, {
      
    });
    this.http
      .request(req)
      .subscribe(
        (val: {}) => {
          console.log(val);
          this.fileList = [];
          this.editOldQuestion = { ...this.question };
          this.judgeCanSunmit();
          this.getQuestionList();
        },
        err => {
        }
      );
  }

  getQuestionList() {
    const req = new HttpRequest('GET', '/api/questions/', {tiemStamp: "2018-11-25"}, {
      
    });
    this.http
      .request(req)
      .subscribe(
        (val: any) => {
          if (val.body && val.body.result && val.body.result.length) {
            this.questionList = val.body.result;
          }
        },
        err => {
        }
      );
  }

  editQuestion(id?: number) {
    this.editOldQuestion = { ...this.questionList.find(i => i.questionsId == id) };
    this.question = { ...this.questionList.find(i => i.questionsId == id) };
    this.judgeCanSunmit();
    this.activeTab = 0;
  }
}

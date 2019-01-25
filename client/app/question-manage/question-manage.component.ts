import { Component, OnInit } from '@angular/core';
import { Questions } from '../struct/Questions';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { ManageService } from "../manage.service"

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
  modalType: string;
  fromApp: string = null;

  constructor(private http: HttpClient, private manageService: ManageService) { }

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
      qForApp: null,
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
    this.question.qForApp = null;
  }

  selectChange() {
    if (this.activeTab && !this.questionList.length) {
      this.getQuestionList();
    }
  }

  subSelectChange(tabIndex: number) {
    const tabs = [null, 'wulong'];
    this.fromApp = tabs[tabIndex];
    this.getQuestionList();
  }

  isQuestionExisted() {
    if (this.questionNo == this.question.levelPackageId) return;
    this.questionNo = this.questionNo || this.question.levelPackageId;
    this.manageService.getQuestionByPackageId(this.question.levelPackageId).subscribe(
        (val: any) => {
          if (val.result) {
            this.editQuestions = {
              ...val.result
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

  async handleSubmit() {
    this.cannotSubmit = true;
    if (this.fileList[0]) {
      const formData = new FormData();
      formData.append('files', this.fileList[0]);
      formData.append('questionNo', this.question.levelPackageId);
      this.uploading = true;
      let val: any = await this.manageService.fileUpload(formData).catch(err => {
        console.log(err);
      });
      this.uploading = false;
      this.question.qUrl = val.path;
    }
    if (this.isEdit) {
      this.question.qVersion = +this.question.qVersion + 1;
    }
    this.manageService.saveQuestion(this.question).subscribe(
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
    let param = { limit: this.pageSize, skip: this.pageSize * (this.pageIndex - 1), fromApp: this.fromApp }
    this.manageService.getQuestionList(param).subscribe(
      (val: any) => {
        console.log(val)
        if (val.result) {
          this.questionList = val.result.map(i => {
            return { ...i }
          });
        }
      },
      err => {
        console.log(err);
      }
    );

  }

  deleteQuestion(id?: string) {
    this.showModal("确定删除该题库？", id);
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
  
  showModal(msg: string, type: string = 'edit-modal'): void {
    this.tips = msg;
    this.modalType = type;
    this.ismodalVisible = true;
  }

  handleOk(): void {
    this.ismodalVisible = false;
    if (this.modalType == "cancel-edit") {
      this.resetQuestion();
    }
    else if (this.modalType == "edit-modal") {
      this.isEdit = true;
      this.question = {
        ...this.editQuestions
      }
      this.questionNo = this.question.levelPackageId;
    }
    else {
      this.manageService.deleteQuestionById(this.modalType).subscribe(
        (val: any) => {
          console.log(val)
          this.getQuestionList();
        },
        err => {
          console.log(err);
        }
      )
    }
  }

  handleCancel(): void {
    this.ismodalVisible = false;
    this.question.levelPackageId = this.questionNo = "";
  }

}

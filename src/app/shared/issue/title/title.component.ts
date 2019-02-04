import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IssueService} from '../../../core/services/issue.service';
import {Issue} from '../../../core/models/issue.model';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-issue-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css'],
})
export class TitleComponent implements OnInit {
  isEditing = false;
  isSavePending = false;
  issueTitleForm: FormGroup;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    this.issueTitleForm = this.formBuilder.group({
      title: ['', Validators.required],
    });
  }

  changeToEditMode() {
    this.isEditing = true;
    this.issueTitleForm.setValue({
      title: this.issue.title || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateTitle(form: NgForm) {
    if (this.issueTitleForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueService.updateIssue({
      ...this.issue,
      title: this.issueTitleForm.get('title').value,
    }).pipe(finalize(() => {
      this.isEditing = false;
      this.isSavePending = false;
    })).subscribe((editedIssue: Issue) => {
      this.issueService.updateLocalStore(editedIssue);
      this.issueUpdated.emit(editedIssue);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @angular-eslint/component-class-suffix */
import { AppComponentBase } from '../shared/app-component-base';
import { Component, Injector, OnInit } from '@angular/core';

export class PagedResultDto {
  items: any[];
  totalCount: number;
}

export class EntityDto {
  id: number;
}

export class PagedRequestDto {
  skipCount: number;
  maxResultCount: number;
}

@Component({
  template: '',
})
export abstract class PagedListingComponentBase<TEntityDto>
  extends AppComponentBase
  implements OnInit {
  pageSize = 10;
  pageNumber = 1;
  totalPages = 1;
  totalItems: number;
  isTableLoading = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.getDataPage(this.pageNumber);
  }

  showPaging(result: PagedResultDto, pageNumber: number): void {
    this.totalPages =
      (result.totalCount - (result.totalCount % this.pageSize)) /
        this.pageSize +
      1;

    this.totalItems = result.totalCount;
    this.pageNumber = pageNumber;
  }

  getDataPage(page: number): void {
    const req = new PagedRequestDto();
    req.maxResultCount = this.pageSize;
    req.skipCount = (page - 1) * this.pageSize;

    this.isTableLoading = true;
    this.list(req, page, () => {
      this.isTableLoading = false;
    });
  }

  protected abstract list(
    request: PagedRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void;
  protected abstract delete(entity: TEntityDto): void;
}

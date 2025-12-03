import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ListQuery, ListResponse, BaseApiService } from 'ng-admin-core';

/**
 * Extended query interface for user filtering
 */
export interface UserListQuery extends ListQuery {
  role?: string;
  isActive?: boolean;
}

/**
 * User API service extending BaseApiService for CRUD operations
 */
@Injectable({
  providedIn: 'root'
})
export class UserApi extends BaseApiService<User, string> {
  protected override resourcePath = 'users';

  /**
   * Override getAll to support user-specific filtering
   */
  override getAll(query?: UserListQuery): Observable<ListResponse<User>> {
    let params = new HttpParams();

    if (query?.skip !== undefined) {
      params = params.set('skip', query.skip.toString());
    }
    if (query?.take !== undefined) {
      params = params.set('take', query.take.toString());
    }
    if (query?.role) {
      params = params.set('role', query.role);
    }
    if (query?.isActive !== undefined) {
      params = params.set('isActive', query.isActive.toString());
    }

    return this.http.get<ListResponse<User>>(
      this.getResourceUrl(),
      { params, withCredentials: true }
    );
  }
}
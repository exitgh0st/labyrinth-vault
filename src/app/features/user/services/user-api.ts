import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ListQuery, ListResponse, BaseApiService } from '@labyrinth/ng-admin-core';

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

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getAll instead
   */
  getUsers(query?: UserListQuery): Observable<ListResponse<User>> {
    return this.getAll(query);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getById instead
   */
  getUserById(id: string): Observable<User> {
    return this.getById(id);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use create instead
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.create(user);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use update instead
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.update(id, user);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use delete instead
   */
  deleteUser(id: string): Observable<void> {
    return this.delete(id);
  }
}
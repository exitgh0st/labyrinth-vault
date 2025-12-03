import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../models/user.model';
import { UserApi } from '../../services/user-api';
import { BaseListComponent, SkeletonLoader, EmptyState } from 'ng-admin-core';

/**
 * User list page component with Material table and pagination
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    SkeletonLoader,
    EmptyState
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList extends BaseListComponent<User, string> {
  protected override apiService = inject(UserApi);
  protected override baseRoute = 'admin/users';
  protected override itemName = 'user';

  /**
   * Columns to display in the table
   */
  displayedColumns = ['displayName', 'email', 'roles', 'status', 'actions'];

  /**
   * Page size options for the paginator
   */
  pageSizeOptions = [5, 10, 25, 50];

  /**
   * Handles page change events from MatPaginator
   */
  onPageChange(event: PageEvent): void {
    this.query.take = event.pageSize;
    this.query.skip = event.pageIndex * event.pageSize;
    this.loadItems();
  }

  /**
   * Gets the formatted role names for display
   */
  getRoleNames(user: User): string[] {
    return user.roles?.map(role => role.name) || [];
  }

  /**
   * Gets status display text
   */
  getStatusText(user: User): string {
    return user.isActive ? 'Active' : 'Inactive';
  }

  /**
   * Gets status color
   */
  getStatusColor(user: User): string {
    return user.isActive ? 'primary' : 'warn';
  }
}
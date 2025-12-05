import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Role } from '../../models/role.model';
import { RoleApi } from '../../services/role-api';
import { BaseListComponent, SkeletonLoader, EmptyState } from 'ng-admin-core';

/**
 * Role list page component with Material table and pagination
 */
@Component({
  selector: 'app-role-list',
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
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss'
})
export class RoleList extends BaseListComponent<Role, number> {
  protected override apiService = inject(RoleApi);
  protected override baseRoute = 'admin/roles';
  protected override itemName = 'role';

  /**
   * Columns to display in the table
   */
  displayedColumns = ['name', 'description', 'status', 'createdAt', 'actions'];

  /**
   * Page size options for the paginator
   */
  pageSizeOptions = [5, 10, 25, 50];

  /**
   * Handles page change events from MatPaginator
   */
  onPageChange(event: PageEvent): void {
    this.take.set(event.pageSize);
    this.skip.set(event.pageIndex * event.pageSize);
    this.loadItems();
  }

  /**
   * Gets status display text
   */
  getStatusText(role: Role): string {
    return role.isActive ? 'Active' : 'Inactive';
  }

  /**
   * Gets status color
   */
  getStatusColor(role: Role): string {
    return role.isActive ? 'primary' : 'warn';
  }

  /**
   * Formats date for display
   */
  formatDate(dateString: Date | string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }
}
import { Directive, signal, computed, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListQuery } from '../interfaces/list-query';
import { BaseApiService } from '../services/base-api.service';
import { DialogService } from '../services/dialog.service';
import { NotificationService } from '../services/notification.service';

/**
 * Abstract base component for list pages with common table functionality.
 * Provides pagination, loading states, error handling, and CRUD operations.
 *
 * @typeParam T - The entity type this list manages
 * @typeParam ID - The type of the entity's identifier (defaults to number)
 *
 * @example
 * ```typescript
 * export class UserList extends BaseListComponent<User, string> {
 *   protected apiService = inject(UserApi);
 *   protected baseRoute = '/users';
 *   protected itemName = 'user';
 *   displayedColumns = ['displayName', 'email', 'roles', 'status', 'actions'];
 * }
 * ```
 */
@Directive()
export abstract class BaseListComponent<T, ID = number> implements OnInit {
  protected router = inject(Router);
  protected platformId = inject(PLATFORM_ID);
  protected dialogService = inject(DialogService);
  protected notificationService = inject(NotificationService);

  /**
   * The API service to use for CRUD operations.
   * Must be provided by subclasses.
   */
  protected abstract apiService: BaseApiService<T, ID>;

  /**
   * The base route for navigation (e.g., '/users', '/roles')
   * Must be provided by subclasses.
   */
  protected abstract baseRoute: string;

  /**
   * The singular name of the item for display in messages (e.g., 'user', 'role')
   * Must be provided by subclasses.
   */
  protected abstract itemName: string;

  // State signals
  items = signal<T[]>([]);
  total = signal(0);
  loading = signal(false);
  error = signal('');

  // Pagination signals
  protected skip = signal(0);
  protected take = signal(10);

  // Pagination query (computed from signals)
  query = computed<ListQuery>(() => ({
    skip: this.skip(),
    take: this.take()
  }));

  // Computed properties for pagination
  hasNextPage = computed(() =>
    this.skip() + this.take() < this.total()
  );

  hasPreviousPage = computed(() =>
    this.skip() > 0
  );

  currentPage = computed(() =>
    Math.floor(this.skip() / this.take()) + 1
  );

  totalPages = computed(() =>
    Math.ceil(this.total() / this.take())
  );

  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Loads items from the API using the current query parameters.
   */
  loadItems(): void {
    this.loading.set(true);
    this.error.set('');

    this.apiService.getAll(this.query()).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to load ${this.itemName}s`);
        this.loading.set(false);
        this.notificationService.error(`Failed to load ${this.itemName}s`);
        console.error(err);
      }
    });
  }

  /**
   * Navigates to the create page.
   */
  create(): void {
    this.router.navigate([`${this.baseRoute}/create`]);
  }

  /**
   * Navigates to the edit page for the specified item.
   * @param id - The item identifier
   */
  edit(id: ID): void {
    this.router.navigate([`${this.baseRoute}`, id, 'edit']);
  }

  /**
   * Navigates to the view/details page for the specified item.
   * @param id - The item identifier
   */
  view(id: ID): void {
    this.router.navigate([`${this.baseRoute}`, id]);
  }

  /**
   * Deletes an item after confirmation.
   * @param id - The item identifier
   */
  async delete(id: ID): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Are you sure?',
      text: `Do you really want to delete this ${this.itemName}? This action cannot be undone.`,
      icon: 'warning',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (confirmed) {
      this.apiService.delete(id).subscribe({
        next: () => {
          this.notificationService.success(`${this.capitalize(this.itemName)} deleted successfully`);
          this.loadItems();
        },
        error: (err) => {
          this.notificationService.error(`Failed to delete ${this.itemName}`);
          console.error(err);
        }
      });
    }
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    if (this.hasNextPage()) {
      this.skip.set(this.skip() + this.take());
      this.loadItems();
    }
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.skip.set(Math.max(0, this.skip() - this.take()));
      this.loadItems();
    }
  }

  /**
   * Goes to a specific page number.
   * @param page - The page number (1-indexed)
   */
  goToPage(page: number): void {
    const newSkip = (page - 1) * this.take();
    if (newSkip >= 0 && newSkip < this.total()) {
      this.skip.set(newSkip);
      this.loadItems();
    }
  }

  /**
   * Changes the page size.
   * @param pageSize - The new page size
   */
  changePageSize(pageSize: number): void {
    this.take.set(pageSize);
    this.skip.set(0); // Reset to first page
    this.loadItems();
  }

  /**
   * Refreshes the current page.
   */
  refresh(): void {
    this.loadItems();
  }

  /**
   * Capitalizes the first letter of a string.
   * @param str - The string to capitalize
   * @returns The capitalized string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

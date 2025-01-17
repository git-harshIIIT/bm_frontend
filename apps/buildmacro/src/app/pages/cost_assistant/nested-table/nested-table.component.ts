import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  viewChild,
  inject,
  Injector,
} from '@angular/core'

import { injectVirtualizer } from '@tanstack/angular-virtual'

import {
  Column,
  ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnFiltersState,
  // getColumnFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  
  getFilteredRowModel,
  createAngularTable,
  FlexRenderDirective,
  GroupingState,
  Updater,
  getExpandedRowModel,
  getGroupedRowModel,
  getCoreRowModel,
  type VisibilityState,
  getPaginationRowModel
} from '@tanstack/angular-table'
import { FilterComponent } from './table-filter.component'
import { makeData,type Person, newPerson } from './makeData'
import { faker } from '@faker-js/faker'
import { CommonModule, NgStyle,  } from '@angular/common'



const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'firstName',
    id: 'firstName',
    header: 'First Name',
    cell: info => info.getValue(),
    getGroupingValue: row => `${row.firstName} ${row.lastName}`,
    footer: props => props.column.id,
    size: 180,
    
  },
  {
    accessorFn: row => row.lastName,
    id: 'lastName',
    cell: info => info.getValue(),
    header: () => 'Last Name',
    footer: props => props.column.id,
    size: 180,
  },
  {
    accessorKey: 'age',
    id: 'age',
    header: 'Age',
    footer: props => props.column.id,
    size: 180,
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'visits',
    id: 'visits',
    header: 'Visits',
    footer: props => props.column.id,
    size: 180,
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Status',
    footer: props => props.column.id,
    size: 180,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    accessorKey: 'progress',
    id: 'progress',
    header: 'Profile Progress',
    footer: props => props.column.id,
    size: 180,
    meta: {
      filterVariant: 'range',
    },
  },
  
]

@Component({
  selector: 'app-nested-table',
  imports: [FlexRenderDirective,FilterComponent,CommonModule, NgStyle],
  templateUrl: './nested-table.component.html',
  styleUrl: './nested-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class NestedTableComponent {
  readonly columnFilters = signal<ColumnFiltersState>([])
  readonly columns = signal([...defaultColumns])
  readonly data = signal<Person[]> (makeData(100000))
  readonly columnVisibility = signal<VisibilityState>({})
  readonly columnOrder = signal<ColumnOrderState>([])
  readonly columnPinning = signal<ColumnPinningState>({})
  readonly split = signal(false)

  

  // @ViewChild('scrollElement') scrollElement!:ElementRef<HTMLDivElement>;

  grouping = signal<GroupingState>([])
  stringifiedGrouping = computed(() => JSON.stringify(this.grouping(), null, 2))

  readonly pagination = signal({
    pageIndex: 0,
    pageSize: 10,
  });

  table = createAngularTable<Person>(() => ({
    data: this.data(),
    columns: this.columns(),
    state: {
      columnFilters: this.columnFilters(),
      grouping: this.grouping(),
      pagination: this.pagination(),
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater(this.pagination())
          : updater;
      this.pagination.set(newPagination); // Update the reactive pagination signal
    },
    onGroupingChange: (updaterOrValue: Updater<GroupingState>) => {
      const groupingState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue([...this.grouping()])
          : updaterOrValue
      this.grouping.set(groupingState)
    },
    onColumnFiltersChange: updater => {
      updater instanceof Function
        ? this.columnFilters.update(updater)
        : this.columnFilters.set(updater)
    },
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting

    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
    
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    columnResizeMode: 'onChange',
  }))

  

  // virtualizer: any; // Define virtualizer
  constructor(private cdr: ChangeDetectorRef) {}

  scrollElement = viewChild<ElementRef<HTMLDivElement>>('scrollElement')

  virtualizer = computed(() => {
    const scrollElement = this.scrollElement();
    if (!scrollElement) {
      console.error('Scroll element not found!');
      return null;
    }
  
    const count = this.table.getRowModel().rows.length;
    console.log('Virtualizer Count:', count); // Debug log
  
    return injectVirtualizer(() => ({
      scrollElement: scrollElement.nativeElement,
      count,
      estimateSize: () => 30,
      overscan: 500,
      onMeasure: () => {
        console.log('Virtualizer updated with rows:', count);
      },
    }));
  });

  rows = computed(() => {
    const rows = this.table.getRowModel().rows;
    console.log('Rows:', rows); // Debug log
    return rows;
  });
  

  onPageInputChange(event: any): void {
    const page = event.target.value ? Number(event.target.value) - 1 : 0;
    this.table.setPageIndex(page);
    const virtualizerInstance = this.virtualizer();
    if (virtualizerInstance) {
      virtualizerInstance.scrollToIndex(0); // Reset the virtualizer to the top
    }
    console.log('Current Page Index:', this.table.getState().pagination.pageIndex);
    console.log('Current Page Size:', this.table.getState().pagination.pageSize);
  }


  onPageSizeChange(event: any) {
    const pageSize = Number(event.target.value);
    this.pagination.update((prev) => ({ ...prev, pageSize }));
    this.table.reset();
    
    const virtualizerInstance = this.virtualizer();
    if (virtualizerInstance) {
      virtualizerInstance.scrollToIndex(0); // Reset the virtualizer to the top
    }

    // Manually trigger change detection
  this.cdr.detectChanges();

  //debug logs
    console.log('Table State:', this.table.getState());
  console.log('Current Page Index:', this.table.getState().pagination.pageIndex);
  console.log('Current Page Size:', this.table.getState().pagination.pageSize);
  console.log('Rows:', this.table.getRowModel().rows);
  }

  stringifiedColumnPinning = computed(() => {
    return JSON.stringify(this.table.getState().columnPinning)
  })

  readonly getCommonPinningStyles = (
    column: Column<Person>
  ): Record<string, any> => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right')

    return {
      boxShadow: isLastLeftPinnedColumn
        ? '-4px 0 4px -4px gray inset'
        : isFirstRightPinnedColumn
          ? '4px 0 4px -4px gray inset'
          : undefined,
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      opacity: isPinned ? 0.95 : 1,
      position: isPinned ? 'sticky' : 'relative',
      width: `${column.getSize()}px`,
      zIndex: isPinned ? 1 : 0,
    }
  }

  // constructor(private cdr: ChangeDetectorRef) {}

  addSubCategory(row: Person): void {
    const newSubCategory: Person = {
      ...newPerson(), // Use the imported newPerson function
      children: [], // Initialize as empty for sub-categories
    };
  
    // Create a new children array with the new sub-category
    const updatedChildren = row.children ? [...row.children, newSubCategory] : [newSubCategory];
  
    // Update the row immutably
    const updatedRow = { ...row, children: updatedChildren };
  
    // Update the data array immutably
    const updatedData = this.data().map((item) => (item === row ? updatedRow : item));
  
    // Set the new data
    this.data.set(updatedData);
  
    // Log the newly added children to the console
    console.log('Newly added sub-category:', newSubCategory);
    console.log('Updated children array:', updatedChildren);
    // this.cdr.detectChanges();
    this.table.reset();
  }

  addLineItem(row: Person): void {
    const newLineItem: Person = {
      ...newPerson(),
    };
    if (!row.children) {
      row.children = [];
    }
    row.children.push(newLineItem);
    this.data.set([...this.data()]); // Trigger change detection
  }

  updateData(row: Person, columnId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value
    const newData = this.data().map(item => {
      if (item === row) {
        return {
          ...item,
          [columnId]: value,
        }
      }
      return item
    })
    this.data.set(newData)
  }

  randomizeColumns() {
    this.table.setColumnOrder(
      faker.helpers.shuffle(this.table.getAllLeafColumns().map(d => d.id))
    )
  }

  rerender() {
    this.data.set(makeData(100))
  }
}

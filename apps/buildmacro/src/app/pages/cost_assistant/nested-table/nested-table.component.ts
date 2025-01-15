import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core'

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
import { makeData,type Person } from './makeData'
import { faker } from '@faker-js/faker'
import { CommonModule, NgStyle, NgTemplateOutlet, SlicePipe } from '@angular/common'

// type Person = {
//   firstName: string
//   lastName: string
//   age: number
//   visits: number
//   progress: number
//   status: 'relationship' | 'complicated' | 'single'
//   subRows?: Person[] 
  

// }

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
  grouping = signal<GroupingState>([])
  stringifiedGrouping = computed(() => JSON.stringify(this.grouping(), null, 2))

  table = createAngularTable<Person>(() => ({
    data: this.data(),
    columns: this.columns(),
    state: {
      columnFilters: this.columnFilters(),
      grouping: this.grouping(),
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

  onPageInputChange(event: any): void {
    const page = event.target.value ? Number(event.target.value) - 1 : 0
    this.table.setPageIndex(page)
  }

  onPageSizeChange(event: any) {
    this.table.setPageSize(Number(event.target.value))
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

  randomizeColumns() {
    this.table.setColumnOrder(
      faker.helpers.shuffle(this.table.getAllLeafColumns().map(d => d.id))
    )
  }

  rerender() {
    this.data.set(makeData(100))
  }
}

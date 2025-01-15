import { CommonModule } from "@angular/common";
import { Component, computed, input, OnInit } from "@angular/core";
import type { Column, RowData, Table } from "@tanstack/angular-table";


declare module '@tanstack/angular-table' {
    //allows us to define custom properties for our columns
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select'
    }
}

@Component({
    selector:'app-table-filter',
    imports:[CommonModule],
    templateUrl: 'table-filter.component.html'

})

export class FilterComponent<T>{

  column = input.required<Column<any, any>>()

  table = input.required<Table<T>>()

  readonly filterVariant = computed(() => {
    return (this.column().columnDef.meta ?? {}).filterVariant
  })

  readonly columnFilterValue = computed<any>(() =>
    this.column().getFilterValue()
  )

  readonly minRangePlaceholder = computed(() => {
    return `Min ${
      this.column().getFacetedMinMaxValues()?.[0] !== undefined
        ? `(${this.column().getFacetedMinMaxValues()?.[0]})`
        : ''
    }`
  })

  readonly maxRangePlaceholder = computed(() => {
    return `Max ${
      this.column().getFacetedMinMaxValues()?.[1]
        ? `(${this.column().getFacetedMinMaxValues()?.[1]})`
        : ''
    }`
  })

  readonly sortedUniqueValues = computed(() => {
    const filterVariant = this.filterVariant()
    const column = this.column()
    if (filterVariant === 'range') {
      return []
    }
    return Array.from(column.getFacetedUniqueValues().keys())
      .sort()
      .slice(0, 5000)
  })

  readonly changeMinRangeValue = (event: Event) => {
    console.log("change min range value fn trigerred")
    const value = (event.target as HTMLInputElement).value
    this.column().setFilterValue((old: [number, number]) => {
      return [value, old?.[1]]
    })
  }

  readonly changeMaxRangeValue = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    this.column().setFilterValue((old: [number, number]) => {
      return [old?.[0], value]
    })
  }

}
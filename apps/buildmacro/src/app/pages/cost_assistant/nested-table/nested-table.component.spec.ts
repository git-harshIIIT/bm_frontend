import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NestedTableComponent } from './nested-table.component';

describe('NestedTableComponent', () => {
  let component: NestedTableComponent;
  let fixture: ComponentFixture<NestedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NestedTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NestedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

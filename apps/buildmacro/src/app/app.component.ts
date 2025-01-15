import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { NestedTableComponent } from './pages/cost_assistant/nested-table/nested-table.component';

@Component({
  imports: [NestedTableComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'buildmacro';
}

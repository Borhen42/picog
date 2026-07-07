import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Brain3dComponent } from './brain3d/brain3d.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Brain3dComponent, NavigationComponent],
  template: `
    <div class="app-layout">
      <div class="brain-background-container">
        <app-brain3d></app-brain3d>
      </div>
      <app-navigation></app-navigation>
      <div class="content-overlay">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
    }

    .brain-background-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      z-index: -1;
    }

    .content-overlay {
      position: relative;
      z-index: 1;
      margin-top: 70px;
      padding: 0;
    }
  `]
})
export class AppComponent {}

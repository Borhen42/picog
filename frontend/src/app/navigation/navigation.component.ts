import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">COGNIVITA</span>
        </a>

        <button class="menu-toggle" (click)="toggleMenu()" [class.active]="menuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul class="nav-menu" [class.active]="menuOpen">
          <!-- Cognitive Tests Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('cognitive')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'cognitive')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'cognitive'"
            >
              <span class="nav-icon">🧠</span>
              <span class="nav-text">Cognitive Tests</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'cognitive'">
              <li>
                <a routerLink="/mmse" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">📋</span>
                  <div>
                    <div class="dropdown-title">MMSE Test</div>
                    <div class="dropdown-desc">Mini-Mental State Examination</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/cnn" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🤖</span>
                  <div>
                    <div class="dropdown-title">AI Scanner</div>
                    <div class="dropdown-desc">Brain Scan Analysis</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/medical-records" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🏥</span>
                  <div>
                    <div class="dropdown-title">Medical Records</div>
                    <div class="dropdown-desc">Patient Clinical Files</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>

          <!-- User Management Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('user')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'user')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'user'"
            >
              <span class="nav-icon">👤</span>
              <span class="nav-text">User Management</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'user'">
              <li>
                <a routerLink="/register" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">📝</span>
                  <div>
                    <div class="dropdown-title">Registration</div>
                    <div class="dropdown-desc">Create new account</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/login" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🔐</span>
                  <div>
                    <div class="dropdown-title">Login</div>
                    <div class="dropdown-desc">Authentication portal</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/profile" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">👤</span>
                  <div>
                    <div class="dropdown-title">Profile</div>
                    <div class="dropdown-desc">Manage your account</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/admin" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">⚙️</span>
                  <div>
                    <div class="dropdown-title">Admin Dashboard</div>
                    <div class="dropdown-desc">System administration</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>

          <!-- Medical Data Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('medical')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'medical')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'medical'"
            >
              <span class="nav-icon">🏥</span>
              <span class="nav-text">Medical Data</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'medical'">
              <li>
                <a routerLink="/medical-history" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">📊</span>
                  <div>
                    <div class="dropdown-title">Medical History</div>
                    <div class="dropdown-desc">View health records</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/risk-factors" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">⚠️</span>
                  <div>
                    <div class="dropdown-title">Risk Factors</div>
                    <div class="dropdown-desc">Track risk indicators</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>

          <!-- Feedback & Support Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('support')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'support')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'support'"
            >
              <span class="nav-icon">💬</span>
              <span class="nav-text">Support</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'support'">
              <li>
                <a routerLink="/feedback" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">📨</span>
                  <div>
                    <div class="dropdown-title">Feedback</div>
                    <div class="dropdown-desc">Share your experience</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/support" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🎧</span>
                  <div>
                    <div class="dropdown-title">Help Center</div>
                    <div class="dropdown-desc">Get assistance</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>

          <!-- Forum & Community Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('community')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'community')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'community'"
            >
              <span class="nav-icon">👥</span>
              <span class="nav-text">Community</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'community'">
              <li>
                <a routerLink="/forum" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">💭</span>
                  <div>
                    <div class="dropdown-title">Forum</div>
                    <div class="dropdown-desc">Discussions & questions</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/community" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🤝</span>
                  <div>
                    <div class="dropdown-title">Community Groups</div>
                    <div class="dropdown-desc">Connect with others</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>

          <!-- Exercises & Journal Dropdown -->
          <li class="nav-item dropdown" (mouseleave)="closeDropdown('wellness')">
            <a 
              href="#"
              (click)="toggleDropdown($event, 'wellness')"
              class="nav-link dropdown-toggle"
              [class.active]="activeDropdown === 'wellness'"
            >
              <span class="nav-icon">🧘</span>
              <span class="nav-text">Wellness</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </a>
            <ul class="dropdown-menu" [class.show]="activeDropdown === 'wellness'">
              <li>
                <a routerLink="/exercises" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">🎯</span>
                  <div>
                    <div class="dropdown-title">Cognitive Exercises</div>
                    <div class="dropdown-desc">Brain training games</div>
                  </div>
                </a>
              </li>
              <li>
                <a routerLink="/mood-journal" routerLinkActive="active" (click)="closeAll()" class="dropdown-item">
                  <span class="dropdown-icon">📔</span>
                  <div>
                    <div class="dropdown-title">Mood Journal</div>
                    <div class="dropdown-desc">Track your emotions</div>
                  </div>
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Authentication area -->
        <div class="nav-auth">
          @if (auth.isLoggedIn()) {
            <span class="nav-user" [class.is-admin]="isAdmin()">
              <span class="user-icon">{{ isAdmin() ? '🛡️' : '👤' }}</span>
              <span class="user-name">{{ username() }}</span>
            </span>
            <button class="auth-btn logout" (click)="logout()">Logout</button>
          } @else {
            <button class="auth-btn login" (click)="login()">Login</button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      width: 100%;
      background: rgba(10, 10, 26, 0.85);
      backdrop-filter: blur(20px);
      box-shadow: 
        0 0 30px rgba(0, 255, 255, 0.1),
        0 2px 15px rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      z-index: 1000;
      padding: 0;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 1.4rem;
      font-family: 'Orbitron', 'Inter', sans-serif;
      background: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ccff 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      cursor: pointer;
      transition: transform 0.3s ease;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
      animation: textShimmer 3s ease-in-out infinite;
      text-decoration: none;
      flex-shrink: 0;
    }

    @keyframes textShimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .navbar-logo:hover {
      transform: scale(1.05);
    }

    .logo-icon {
      font-size: 1.6rem;
    }

    .logo-text {
      letter-spacing: -0.5px;
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 2px;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      position: relative;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      color: #b0e0ff;
      text-decoration: none;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      border-radius: 10px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      font-size: 0.85rem;
      position: relative;
      white-space: nowrap;
    }

    .nav-text {
      white-space: nowrap;
    }

    .nav-icon {
      font-size: 1.1rem;
      filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.5));
    }

    .dropdown-arrow {
      margin-left: 4px;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
    }

    .dropdown-toggle.active .dropdown-arrow {
      transform: rotate(180deg);
    }

    .nav-link:hover {
      background: rgba(0, 255, 255, 0.1);
      color: #00ffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 255, 255, 0.2);
    }

    .nav-link.active {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
      color: #ffffff;
      box-shadow: 
        0 0 20px rgba(0, 255, 255, 0.3),
        0 5px 15px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 255, 255, 0.3);
    }

    /* Dropdown Menu */
    .dropdown {
      position: relative;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      min-width: 280px;
      background: rgba(10, 10, 26, 0.95);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 16px;
      box-shadow: 
        0 0 40px rgba(0, 255, 255, 0.2),
        0 10px 40px rgba(0, 0, 0, 0.4);
      list-style: none;
      padding: 8px;
      margin: 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 1001;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      color: #b0e0ff;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
    }

    .dropdown-item:hover {
      background: rgba(0, 255, 255, 0.15);
      color: #ffffff;
      transform: translateX(4px);
    }

    .dropdown-item.active {
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
      color: #ffffff;
      border: 1px solid rgba(0, 255, 255, 0.4);
    }

    .dropdown-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.6));
      flex-shrink: 0;
    }

    .dropdown-title {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .dropdown-desc {
      font-size: 0.75rem;
      opacity: 0.7;
      color: #93c5fd;
    }

    /* Auth area */
    .nav-auth {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #b0e0ff;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .nav-user.is-admin .user-name {
      color: #ffd166;
      text-shadow: 0 0 12px rgba(255, 209, 102, 0.4);
    }

    .user-icon {
      font-size: 1.1rem;
    }

    .auth-btn {
      padding: 8px 16px;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      white-space: nowrap;
    }

    .auth-btn.login {
      color: #0a0a1a;
      background: linear-gradient(135deg, #00ffff 0%, #00ccff 100%);
      border: none;
      box-shadow: 0 0 18px rgba(0, 255, 255, 0.35);
    }

    .auth-btn.login:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 22px rgba(0, 255, 255, 0.55);
    }

    .auth-btn.logout {
      color: #ff6b9d;
      background: transparent;
      border: 1px solid rgba(255, 107, 157, 0.5);
    }

    .auth-btn.logout:hover {
      background: rgba(255, 107, 157, 0.15);
      transform: translateY(-2px);
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      gap: 6px;
    }

    .menu-toggle span {
      width: 25px;
      height: 3px;
      background: #00ffff;
      border-radius: 2px;
      transition: all 0.3s ease;
      box-shadow: 0 0 4px rgba(0, 255, 255, 0.5);
    }

    .menu-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(8px, 8px);
    }

    .menu-toggle.active span:nth-child(2) {
      opacity: 0;
    }

    .menu-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -7px);
    }

    @media (max-width: 1200px) {
      .nav-link {
        padding: 8px 10px;
        font-size: 0.8rem;
        gap: 4px;
      }

      .nav-icon {
        font-size: 1rem;
      }

      .navbar-logo {
        font-size: 1.2rem;
      }

      .logo-icon {
        font-size: 1.4rem;
      }
    }

    @media (max-width: 1024px) {
      .menu-toggle {
        display: flex;
      }

      .nav-menu {
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        flex-direction: column;
        background: rgba(10, 10, 26, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        box-shadow: 
          0 0 30px rgba(0, 255, 255, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .nav-menu.active {
        max-height: 90vh;
        overflow-y: auto;
      }

      .nav-item {
        width: 100%;
      }

      .nav-link {
        width: 100%;
        padding: 15px 20px;
        border-radius: 0;
        color: #b0e0ff;
        font-size: 0.9rem;
      }

      .nav-link.active {
        border-left: 4px solid #00ffff;
        padding-left: 16px;
        background: rgba(0, 255, 255, 0.1);
      }

      .dropdown-menu {
        position: static;
        min-width: 100%;
        margin-top: 0;
        border: none;
        border-top: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 0;
        box-shadow: none;
      }

      .dropdown-item {
        padding: 12px 20px;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0 15px;
      }

      .menu-toggle {
        display: flex;
      }

      .nav-menu {
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        flex-direction: column;
        background: rgba(10, 10, 26, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        box-shadow: 
          0 0 30px rgba(0, 255, 255, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .nav-menu.active {
        max-height: 90vh;
        overflow-y: auto;
      }

      .nav-item {
        width: 100%;
      }

      .nav-link {
        width: 100%;
        padding: 15px 20px;
        border-radius: 0;
        color: #b0e0ff;
      }

      .nav-link.active {
        border-left: 4px solid #00ffff;
        padding-left: 16px;
        background: rgba(0, 255, 255, 0.1);
      }

      .dropdown-menu {
        position: static;
        min-width: 100%;
        margin-top: 0;
        border: none;
        border-top: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 0;
        box-shadow: none;
      }

      .dropdown-item {
        padding: 12px 20px;
      }
    }
  `]
})
export class NavigationComponent {
  readonly auth = inject(AuthService);

  menuOpen = false;
  activeDropdown: string | null = null;

  username(): string {
    return this.auth.getUsername();
  }

  isAdmin(): boolean {
    return this.auth.hasRole('admin');
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.activeDropdown = null;
  }

  closeAll(): void {
    this.menuOpen = false;
    this.activeDropdown = null;
  }

  toggleDropdown(event: Event, dropdown: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  closeDropdown(dropdown: string): void {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.activeDropdown = null;
    }
  }
}

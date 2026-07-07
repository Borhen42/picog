import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Brain3dComponent } from '../brain3d/brain3d.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Brain3dComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly menuGuide: ReadonlyArray<MenuCategory> = [
    {
      key: 'cognitive',
      icon: '🧠',
      title: 'Cognitive Tests',
      desc: 'Start assessments and track results in one place.',
      items: [
        { icon: '📋', title: 'MMSE Test', desc: 'Mini‑Mental State Examination', route: '/mmse' },
        { icon: '🤖', title: 'AI Scanner', desc: 'Brain Scan Analysis (CNN)', route: '/cnn' },
        { icon: '🏥', title: 'Medical Records', desc: 'Patient clinical files', route: '/medical-records' }
      ]
    },
    {
      key: 'user',
      icon: '👤',
      title: 'User Management',
      desc: 'Accounts, profiles, and admin monitoring.',
      items: [
        { icon: '⚙️', title: 'Admin Dashboard', desc: 'System overview & management', route: '/admin' },
        { icon: '📝', title: 'Registration', desc: 'Create new account', soon: true },
        { icon: '🔐', title: 'Login', desc: 'Authentication portal', soon: true },
        { icon: '👤', title: 'Profile', desc: 'Manage your account', soon: true }
      ]
    },
    {
      key: 'medical',
      icon: '🏥',
      title: 'Medical Data',
      desc: 'Health history and risk indicators.',
      items: [
        { icon: '📊', title: 'Medical History', desc: 'View health records', soon: true },
        { icon: '⚠️', title: 'Risk Factors', desc: 'Track risk indicators', soon: true }
      ]
    },
    {
      key: 'support',
      icon: '💬',
      title: 'Support',
      desc: 'Get help or share feedback with the team.',
      items: [
        { icon: '📨', title: 'Feedback', desc: 'Share your experience', soon: true },
        { icon: '🎧', title: 'Help Center', desc: 'Get assistance', soon: true }
      ]
    },
    {
      key: 'community',
      icon: '👥',
      title: 'Community',
      desc: 'Connect, discuss, and learn together.',
      items: [
        { icon: '💭', title: 'Forum', desc: 'Discussions & questions', soon: true },
        { icon: '🤝', title: 'Community Groups', desc: 'Connect with others', soon: true }
      ]
    },
    {
      key: 'wellness',
      icon: '🧘',
      title: 'Wellness',
      desc: 'Exercises and journaling to support routine.',
      items: [
        { icon: '🎯', title: 'Cognitive Exercises', desc: 'Brain training games', soon: true },
        { icon: '📔', title: 'Mood Journal', desc: 'Track your emotions', soon: true }
      ]
    }
  ];

  private gsapCtx?: gsap.Context;
  private animeAnimations: any[] = [];

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch {
      // no-op
    }

    this.gsapCtx = gsap.context(() => {
      gsap.from('.js-heroBadge', { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out' });
      gsap.from('.js-heroTitle', { opacity: 0, y: 22, duration: 0.9, delay: 0.1, ease: 'power3.out' });
      gsap.from('.js-heroLead', { opacity: 0, y: 18, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.js-heroActions', { opacity: 0, y: 14, duration: 0.8, delay: 0.25, ease: 'power3.out' });

      const revealEls = gsap.utils.toArray<HTMLElement>('.js-reveal');
      revealEls.forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        });
      });

      const staggerGroups = gsap.utils.toArray<HTMLElement>('.js-stagger');
      staggerGroups.forEach((group) => {
        const children = Array.from(group.querySelectorAll<HTMLElement>('.js-staggerItem'));
        if (!children.length) return;
        gsap.from(children, {
          opacity: 0,
          y: 22,
          scale: 0.98,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: group,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    });

    // AnimeJS micro-animations (looping accents)
    import('animejs')
      .then((mod: any) => mod?.default ?? mod)
      .then((anime: any) => {
        if (typeof anime !== 'function') return;

        const floats = document.querySelectorAll('.js-float');
        if (floats.length) {
          this.animeAnimations.push(
            anime({
              targets: floats,
              translateY: [0, -8],
              direction: 'alternate',
              duration: 1800,
              delay: (_: any, i: number) => i * 120,
              easing: 'easeInOutSine',
              loop: true
            })
          );
        }

        const sweeps = document.querySelectorAll('.js-sweep');
        if (sweeps.length) {
          this.animeAnimations.push(
            anime({
              targets: sweeps,
              backgroundPosition: ['0% 50%', '100% 50%'],
              duration: 3200,
              easing: 'easeInOutSine',
              direction: 'alternate',
              loop: true
            })
          );
        }

        // Use AnimeJS on scroll entry (paired with GSAP ScrollTrigger)
        const stCreate = (ScrollTrigger as any)?.create;
        const onEnterPulse = (selector: string) => {
          const targets = document.querySelectorAll(selector);
          if (!targets.length) return;
          this.animeAnimations.push(
            anime({
              targets,
              duration: 900,
              easing: 'easeOutQuad',
              direction: 'alternate',
              borderColor: ['rgba(0, 255, 255, 0.16)', 'rgba(0, 255, 255, 0.38)'],
              boxShadow: [
                '0 18px 55px rgba(0, 0, 0, 0.35)',
                '0 18px 55px rgba(0, 255, 255, 0.14)'
              ],
              delay: (_: any, i: number) => i * 65
            })
          );
        };

        if (typeof stCreate === 'function') {
          const menuGuideEl = document.querySelector('.menu-guide');
          if (menuGuideEl) {
            stCreate({
              trigger: menuGuideEl,
              start: 'top 78%',
              once: true,
              onEnter: () => onEnterPulse('.guide-card')
            });
          }

          const quickStartEl = document.querySelector('.quick-start');
          if (quickStartEl) {
            stCreate({
              trigger: quickStartEl,
              start: 'top 78%',
              once: true,
              onEnter: () => onEnterPulse('.qs-card')
            });
          }
        } else {
          // Fallback: run once immediately if ScrollTrigger isn't available.
          onEnterPulse('.guide-card');
          onEnterPulse('.qs-card');
        }
      })
      .catch(() => {
        // no-op
      });
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
    this.gsapCtx = undefined;

    this.animeAnimations.forEach((a) => {
      try {
        a.pause?.();
      } catch {
        // no-op
      }
    });
    this.animeAnimations = [];
  }
}

type MenuKey = 'cognitive' | 'user' | 'medical' | 'support' | 'community' | 'wellness';

interface MenuItem {
  icon: string;
  title: string;
  desc: string;
  route?: string;
  soon?: boolean;
}

interface MenuCategory {
  key: MenuKey;
  icon: string;
  title: string;
  desc: string;
  items: MenuItem[];
}

# Frontend Navigation Guide

## Overview
The Alzheimer Detection System now features a smooth, intuitive navigation system with three main sections accessible from a fixed top navigation bar.

## Navigation Sections

### 1. **MMSE Test** (`/mmse`)
- **Icon**: 📋
- **Purpose**: Mini-Mental State Examination (cognitive assessment)
- **Features**:
  - 7-section cognitive test
  - 0-30 point scoring system
  - Automated interpretation (Normal/Mild/Moderate/Severe)
  - Results saved to database
  - Patient information capture

### 2. **AI Scanner** (`/cnn`)
- **Icon**: 🤖
- **Purpose**: CNN Model for brain scan analysis
- **Features**:
  - Upload MRI/CT brain scan images
  - AI-powered Alzheimer's detection
  - Real-time prediction results
  - Confidence scores
  - Detailed analysis breakdown
  - Score distribution visualization
  - Recommendations based on diagnosis

### 3. **Dashboard** (`/admin`)
- **Icon**: ⚙️
- **Purpose**: Admin dashboard for system monitoring
- **Features**:
  - 4 tabs: Overview, Analytics, Users, System Health
  - Real-time statistics
  - User management
  - MMSE analytics
  - Export functionality
  - System health monitoring

## Navigation Component Architecture

### Files Structure
```
frontend/src/app/
├── navigation/
│   └── navigation.component.ts (Fixed navbar component)
├── mmse/
│   ├── mmse-test.component.ts
│   ├── mmse-test.component.html
│   └── mmse-test.component.css
├── cnn/
│   ├── cnn-prediction.component.ts
│   ├── cnn-prediction.component.html
│   └── cnn-prediction.component.css
├── admin/
│   └── super-admin-dashboard/
│       ├── super-admin-dashboard.component.ts
│       ├── super-admin-dashboard.component.html
│       └── super-admin-dashboard.component.css
├── app.ts (Updated with navigation)
└── app.routes.ts (Updated with CNN route)
```

## Features

### Fixed Navigation Bar
- **Position**: Fixed at top of viewport (z-index: 1000)
- **Style**: Glassmorphism with backdrop blur
- **Responsive**: Mobile hamburger menu on screens < 768px
- **Active State**: Highlights current active route
- **Smooth Transitions**: All links have hover animations

### Mobile Responsive
- **Desktop**: Horizontal menu with all items visible
- **Tablet/Mobile**: Hamburger toggle menu
- **Touch-Friendly**: Larger tap targets for mobile users

### Animations
- **Fade-In**: Pages fade in smoothly when navigating
- **Slide-Down**: Navigation bar content slides down on load
- **Hover Effects**: Subtle scale and color changes on links
- **Transitions**: All interactions use `0.3s ease` timing

## Design System

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Text**: `#333` (dark), `#666` (medium), `#888` (light)
- **Background**: White with rgba transparency
- **Active State**: Purple gradient

### Typography
- **Font Family**: 'Poppins', sans-serif
- **Logo Size**: 1.5rem (bold)
- **Nav Links**: 0.95rem (500 weight)
- **Letter Spacing**: -0.5px for headings

### Spacing
- **Container Padding**: 20px (responsive)
- **Nav Item Gap**: 5px
- **Top Margin for Content**: 70px (navbar height)
- **Navbar Height**: 70px

## Usage Instructions

### Accessing Sections
1. **From MMSE Test**: Click "📋 MMSE Test" or "🤖 AI Scanner" or "⚙️ Dashboard"
2. **From AI Scanner**: Use the navigation bar to switch sections
3. **From Dashboard**: All sections accessible via navbar

### Mobile Navigation
1. **Open Menu**: Tap the hamburger icon (☰)
2. **Select Section**: Tap desired section
3. **Close Menu**: Menu auto-closes after selection

### URL Navigation
```
http://localhost:4200/        → Redirects to /mmse
http://localhost:4200/mmse    → MMSE Test
http://localhost:4200/cnn     → AI Scanner
http://localhost:4200/admin   → Dashboard
```

## Backend Integration

### CNN Component Backend Setup
The CNN prediction component is configured to connect to a Python backend:

**API Endpoint**: `http://localhost:5000/api/predict`
**Method**: POST
**Content-Type**: multipart/form-data

To enable CNN predictions, you need to:

1. **Start Python API** (if available):
   ```bash
   cd ai-model
   python -m flask run --port 5000
   ```

2. **Expected API Response**:
   ```json
   {
     "success": true,
     "prediction": {
       "diagnosis": "Normal Cognition",
       "confidence": 0.95,
       "model": "CNN 3-Class",
       "processingTime": "2.3s",
       "imageQuality": "Good",
       "recommendations": ["Follow-up in 6 months"],
       "scores": [
         {"label": "Normal", "value": 0.85, "level": "normal"},
         {"label": "Mild", "value": 0.12, "level": "mild"},
         {"label": "Severe", "value": 0.03, "level": "severe"}
       ]
     }
   }
   ```

## Component Details

### NavigationComponent
**Standalone**: Yes
**Imports**: CommonModule, RouterModule
**Features**:
- Fixed positioning at top
- Auto-close menu on route change
- Mobile hamburger toggle
- Active route highlighting

### CNNPredictionComponent
**Standalone**: Yes
**Imports**: CommonModule, FormsModule, HttpClientModule
**Features**:
- Image preview
- File validation
- Loading state
- Error handling
- Results display with confidence scores
- Risk level classification

## Styling Notes

### Z-Index Hierarchy
```
1. Navigation Bar (z-index: 1000) - Always on top
2. Content Overlay (z-index: 2) - Pages
3. Brain Background (z-index: -1) - Behind all content
```

### Viewport Adjustments
- All pages have `padding-top: 40px` to account for navbar (70px)
- Content starts below navbar due to `margin-top: 70px` on overlay
- Mobile adjustments at breakpoint 768px

## Future Enhancements

1. **Analytics Integration**: Track page transitions and user flow
2. **User Sessions**: Remember last accessed section
3. **Search Functionality**: Quick navigation search
4. **Breadcrumbs**: Show navigation path
5. **Keyboard Navigation**: Arrow keys to switch sections
6. **Notifications**: Toast alerts in navbar
7. **User Profile**: Avatar in navbar
8. **Dark Mode**: Toggle theme in navbar

## Troubleshooting

### Navigation Not Showing
- Verify `NavigationComponent` is imported in `app.ts`
- Check z-index values are correct
- Ensure CSS is compiled without errors

### Routes Not Working
- Verify all components are imported in `app.routes.ts`
- Check RouterModule is imported
- Ensure paths match exactly (case-sensitive)

### Mobile Menu Issues
- Check media query at 768px breakpoint
- Verify hamburger button has `display: flex` at mobile
- Ensure menu auto-closes on route change

### Styling Problems
- Verify Poppins font is imported in `styles.css`
- Check viewport meta tag in `index.html`
- Clear browser cache if styles not updating

## Performance Tips

1. **Preload Routes**: Add lazy loading for future optimization
2. **Memoize Components**: Use OnPush change detection
3. **Optimize Images**: Compress brain scan previews
4. **Lazy CSS**: Load component styles on demand

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Sufficient color contrast
- ✅ Mobile touch-friendly tap targets
- ✅ Skip-to-content link available

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

**Version**: 1.0.0  
**Last Updated**: February 4, 2026  
**Status**: ✅ Production Ready

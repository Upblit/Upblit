# Frontend Design System

> Visual language, component patterns, and design tokens for the Upblit frontend.

---

## Design Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#000000` | Page background |
| `--color-bg-surface` | `#1c1b1b` | Card / panel background |
| `--color-bg-surface-hover` | `#201f1f` | Card hover state |
| `--color-border` | `#353534` | Default border |
| `--color-border-hover` | `#434656` | Hover border |
| `--color-text-primary` | `#e5e2e1` | Primary text |
| `--color-text-secondary` | `#c3c5d9` | Secondary / muted text |
| `--color-text-tertiary` | `#8487a3` | Tertiary / placeholder text |
| `--color-brand` | `#0052ff` | Brand blue — CTAs, active states, highlights |
| `--color-brand-hover` | `#0038b6` | Brand blue hover |
| `--color-brand-glow` | `rgba(0, 82, 255, 0.35)` | Brand glow shadow |

### Environment Badge Colors

| Environment | Color |
|---|---|
| `production` | Red |
| `staging` | Yellow / Amber |
| `development` | Green |
| Unknown | Grey |

### Log Level Badge Colors

| Level | Color |
|---|---|
| `fatal` | Dark red |
| `error` | Red |
| `warn` | Amber |
| `info` | Blue |
| `debug` | Grey |

---

## Typography

| Font Variable | Font Family | Usage |
|---|---|---|
| `--font-space-grotesk` | Space Grotesk | Taglines, labels, UI text |
| `--font-cubano` | Cubano / Arial Black | Section headings, hero titles |
| `--font-montserrat` | Montserrat / Helvetica | Body text, descriptions, testimonials |
| `--font-jetbrains` | JetBrains Mono / Monaco | Code blocks, CLI demos, API keys |

---

## Component Patterns

### Card
```
bg-[#1c1b1b]/50 rounded-xl border border-[#353534]
hover:border-[#434656] hover:bg-[#201f1f]
transition-all duration-300 backdrop-blur-md
```

### Active Card (selected/highlighted)
```
bg-[#0052ff] text-white border-[#0052ff]
shadow-2xl shadow-[#0052ff]/20
```

### Primary Button
```
bg-[#0052ff] text-white px-8 py-4 rounded-2xl
font-bold hover:bg-[#0038b6] hover:scale-105
transition-all duration-200
```

### Secondary Button
```
bg-[#1c1b1b] text-[#e5e2e1] border border-[#434656]
px-8 py-4 rounded-2xl font-bold
hover:bg-[#201f1f] hover:border-[#6b6e82]
transition-all duration-200
```

### Code Block
```
bg-[#0f0f0f] rounded-lg p-6 text-sm border border-[#353534]
font-family: var(--font-jetbrains)
```

---

## Animation Patterns (framer-motion)

### Page Section Entrance
```typescript
initial={{ opacity: 0, y: 40 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-80px' }}
transition={{ duration: 0.6, ease: 'easeOut' }}
```

### Hero Text Entrance
```typescript
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
```

### Button Hover
```typescript
whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(0, 82, 255, 0.35)' }}
whileTap={{ scale: 0.96 }}
transition={{ type: 'spring', stiffness: 300, damping: 20 }}
```

### Modal Enter/Exit
```typescript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 0.2, ease: 'easeOut' }}
```

### Sidebar Collapse (icon-only mode)
```typescript
// Slide animation on width change
initial={{ width: 240 }}
animate={{ width: collapsed ? 64 : 240 }}
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

---

## Icon System

All icons use **lucide-react**. No other icon libraries.

### Dashboard Navigation Icons
| Section | Icon |
|---|---|
| Overview | `LayoutDashboard` |
| Organizations | `Building2` |
| Observability | `Activity` |
| AI Gateway | `Bot` |
| Profile | `User` |
| Settings | `Settings` |
| Logout | `LogOut` |

### Action Icons
| Action | Icon |
|---|---|
| Create / Add | `Plus` |
| Search | `Search` |
| Copy | `Copy` → `Check` (on success) |
| Notifications | `Bell` |
| API Key | `Key` |
| Navigate back | `ChevronLeft` |
| Navigate forward | `ChevronRight` |

---

## Layout System

### Dashboard Shell
```
┌─────────────────────────────────────────────┐
│  Sidebar (240px)  │  Header (full width)     │
│                   ├──────────────────────────│
│  Nav items        │  Page content            │
│  (icon + label)   │  (children slot)         │
│                   │                          │
│  [collapsed: 64px]│                          │
└─────────────────────────────────────────────┘
```

### Grid Layouts
- Org cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Feature cards: `grid-cols-1 lg:grid-cols-5`
- DevOps suite: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Spacing Scale
- Section padding: `py-20 px-6`
- Card padding: `p-6` (standard), `p-8` (large), `p-12` (hero CTA)
- Gap: `gap-6` (standard), `gap-8` (large)
- Max width: `max-w-7xl mx-auto` (content), `max-w-4xl mx-auto` (CTA)

---

## Stitch Screen Definitions

The `frontend/src/stitch/` directory contains JSON screen definitions. These are design artifacts, not runtime code.

### projects-screen.json Pattern
```json
{
  "screenId": "dashboard_projects_screen",
  "layout": { "type": "grid", "columns": { "sm": 1, "md": 2, "lg": 3 } },
  "components": [
    {
      "type": "Card",
      "iterator": "projectData",
      "props": { "title": "{item.name}", "footerAction": { "type": "navigate" } }
    },
    {
      "type": "EmptyState",
      "condition": "projectData.length === 0"
    }
  ]
}
```

Use Stitch definitions as the source of truth for component structure and navigation targets when implementing new screens.

---

## Accessibility Requirements

- All interactive elements must have `aria-label` or visible text
- Images must have `alt` text (use `next/image`)
- Color contrast: text on dark backgrounds must meet WCAG AA (4.5:1 for normal text)
- Keyboard navigation: all interactive elements must be reachable via Tab
- Focus indicators must be visible (do not remove `outline` without replacement)
- Loading states must be announced to screen readers (`aria-live` or `aria-busy`)

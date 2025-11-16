# Shopping Portal Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DashboardTopBar                                                             │
│  ┌─────┐  ┌────────────────────────┐  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │Logo │  │  Search Products...    │  │Cart│ │Msg │ │Bell│ │User│         │
│  └─────┘  └────────────────────────┘  └────┘ └────┘ └────┘ └────┘         │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────┬──────────────────────────────────────┬─────────────────────┐
│  FilterPanel   │  ProductFeed                         │  ShopList           │
│  (Left)        │  (Center/Main)                       │  (Right)            │
│                │                                      │                     │
│  Categories    │  ┌──────────┐ ┌──────────┐ ┌──────┐│  Featured Shops     │
│  ☐ Electronics │  │ Product  │ │ Product  │ │ Prod ││  ┌───────────────┐  │
│  ☐ Fashion     │  │  Card    │ │  Card    │ │ Card ││  │ Tech Haven    │  │
│  ☑ Home        │  │  $99     │ │  $149    │ │ $79  ││  │ @alice_tech   │  │
│                │  └──────────┘ └──────────┘ └──────┘│  │ ⭐ 4.7 👥 3.4K│  │
│  Price Range   │                                      │  └───────────────┘  │
│  Min: $0       │  ┌──────────┐ ┌──────────┐ ┌──────┐│  ┌───────────────┐  │
│  Max: $1000    │  │ Product  │ │ Product  │ │ Prod ││  │ Leather & Co  │  │
│                │  │  Card    │ │  Card    │ │ Card ││  │ @bob_leather  │  │
│  Rating        │  │  $199    │ │  $34     │ │ $49  ││  │ ⭐ 4.8 👥 1.9K│  │
│  ⭐5+ ⭐4+ ⭐3+ │  └──────────┘ └──────────┘ └──────┘│  └───────────────┘  │
│                │                                      │                     │
│  Active:       │  [Loading more...]                  │  View All →         │
│  ✕ Home        │                                      │                     │
│                │                                      │                     │
└────────────────┴──────────────────────────────────────┴─────────────────────┘
```

## Component Hierarchy

```
DashboardPage
│
├── DashboardTopBar
│   ├── Logo & Brand
│   ├── Search Input (with onChange handler)
│   ├── ShoppingCart Button (with badge)
│   ├── Messages Button
│   ├── Notifications Button
│   └── User Avatar & Profile Menu
│
├── FilterPanel (Left Sidebar - Desktop only)
│   ├── Category Checkboxes
│   ├── Price Range Inputs
│   ├── Rating Filter Buttons
│   └── Active Filters Summary
│
├── ProductFeed (Main Content)
│   ├── Header with Refresh Button
│   ├── Product Grid (Responsive)
│   │   └── ProductCard (x24)
│   │       ├── Product Image
│   │       ├── Like Button
│   │       ├── Rating Badge
│   │       ├── Shop Info
│   │       ├── Product Details
│   │       ├── Price
│   │       ├── Add to Cart Button
│   │       └── Category Tag
│   ├── Loading Skeletons
│   ├── Infinite Scroll Trigger
│   └── Empty State / End Message
│
└── ShopList (Right Sidebar - Desktop only)
    ├── Header
    ├── Shop Cards (x5)
    │   ├── Shop Avatar
    │   ├── Shop Name & Owner
    │   ├── Stats (Rating, Followers, Products)
    │   └── Click Handler
    └── View All Link
```

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────────────┐
│  Top Bar                │
├─────────────────────────┤
│  ProductFeed            │
│  ┌──────────────────┐   │
│  │ Product Card     │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ Product Card     │   │
│  └──────────────────┘   │
└─────────────────────────┘
```
- 1 column grid
- No sidebars
- Full-width products

### Tablet (768px - 1279px)
```
┌────────────────────────────────────┐
│  Top Bar with Search               │
├──────────┬─────────────────────────┤
│ Filters  │  ProductFeed            │
│          │  ┌────────┐ ┌────────┐  │
│          │  │Product │ │Product │  │
│          │  └────────┘ └────────┘  │
└──────────┴─────────────────────────┘
```
- 2 column grid
- Left sidebar (filters)
- No right sidebar

### Desktop (≥ 1280px)
```
┌──────────────────────────────────────────────┐
│  Top Bar with Search & Cart                  │
├──────────┬────────────────────┬──────────────┤
│ Filters  │  ProductFeed       │  ShopList    │
│          │  ┌──┐ ┌──┐ ┌──┐   │              │
│          │  │  │ │  │ │  │   │              │
│          │  └──┘ └──┘ └──┘   │              │
└──────────┴────────────────────┴──────────────┘
```
- 3 column grid
- Both sidebars visible
- Optimal shopping experience

## State Management

```typescript
DashboardPage State
├── filters: FilterOptions
│   ├── categories: string[]
│   ├── shops: string[]
│   ├── priceRange: { min, max }
│   ├── minRating?: number
│   └── searchQuery?: string
│
├── selectedShopId: string | null
├── cartItems: string[]
└── searchQuery: string

User Context (from useUser)
├── user: TanaUser
├── balances: Balance[]
├── isLoading: boolean
└── error: string | null
```

## Data Flow

```
User Actions → State Updates → Filter Changes → Product Reload

Example Flows:

1. Search Flow:
   User types → handleSearch() → setFilters({ searchQuery }) → ProductFeed reloads

2. Filter Flow:
   User checks category → FilterPanel.onFilterChange() → setFilters() → ProductFeed reloads

3. Shop Select Flow:
   User clicks shop → handleShopSelect() → setFilters({ shops: [id] }) → ProductFeed reloads

4. Add to Cart Flow:
   User clicks Add → handleAddToCart() → setCartItems([...prev, id]) → CartButton updates badge
```

## Performance Optimizations

1. **Infinite Scroll**
   - IntersectionObserver with proper cleanup
   - Loading guards prevent multiple simultaneous requests
   - Offset-based pagination

2. **Image Optimization**
   - Next.js Image component
   - Lazy loading
   - Proper aspect ratios

3. **State Updates**
   - Functional setState for concurrent updates
   - Proper dependency arrays
   - No infinite loops!

4. **Component Memoization**
   - Products keyed by ID
   - Stable callbacks with useCallback
   - Efficient re-renders

## File Organization

```
websites/landing/
├── app/
│   └── dashboard/
│       └── page.tsx          # Main dashboard entry point
├── components/
│   ├── dashboard/
│   │   ├── DashboardTopBar.tsx
│   │   ├── ActivityFeed.tsx  # Legacy/backup component
│   │   └── DashboardSidebar.tsx
│   ├── shop/                 # NEW: Shopping components
│   │   ├── ProductCard.tsx
│   │   ├── ProductFeed.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ShopList.tsx
│   └── ui/                   # shadcn components
├── data/                     # NEW: Dummy data
│   ├── products.json
│   ├── shops.json
│   └── categories.json
├── types/
│   ├── shopping.ts           # NEW: Shopping types
│   └── tana-api.ts
└── tsconfig.json             # Updated with new paths
```

## Integration Points

### Future Backend Integration

Replace these dummy data loaders with real API calls:

```typescript
// Current (Dummy):
import productsData from '@/data/products.json'

// Future (API):
const products = await fetch('/api/products').then(r => r.json())

// Or with tana API:
const products = await productsApi.getProducts(filters)
```

### State Persistence

Add these for production:

1. **Cart Persistence**: localStorage or cookies
2. **Filter State**: URL params for shareability
3. **Infinite Scroll Position**: Save scroll position
4. **Shop Favorites**: User preferences

### Analytics

Track these events:

- Product views
- Cart additions
- Filter usage
- Search queries
- Shop visits

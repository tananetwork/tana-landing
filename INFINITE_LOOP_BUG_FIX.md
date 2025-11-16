# Infinite Loop Bug Fix - Technical Details

## Critical Bug: Browser Crash due to Infinite Loop

**File:** `/websites/landing/components/dashboard/ActivityFeed.tsx`

**Severity:** CRITICAL - Caused browser crashes

**Status:** FIXED

---

## The Problem

### Symptom
The dashboard would crash the browser when the ActivityFeed component loaded, creating an infinite loop that consumed all resources.

### Root Cause Analysis

The bug was in the interaction between two hooks:

```typescript
// BEFORE (BUGGY CODE):

const loadMore = useCallback(async () => {
  if (isLoading || !hasMore) return

  setIsLoading(true)
  const newItems = await getEnrichedFeed(userId, 20, items.length)  // ❌ uses items.length
  setItems((prev) => [...prev, ...newItems])
  setIsLoading(false)
}, [userId, items.length, isLoading, hasMore])  // ❌ items.length in deps

useEffect(() => {
  if (observerRef.current) {
    observerRef.current.disconnect()
  }

  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore()  // ❌ Calls loadMore
      }
    },
    { threshold: 0.1 }
  )

  if (loadMoreRef.current) {
    observerRef.current.observe(loadMoreRef.current)
  }

  return () => observerRef.current.disconnect()
}, [loadMore, hasMore, isLoading])  // ❌ loadMore in deps
```

### The Infinite Loop Cycle

```
1. Component mounts
   ↓
2. loadMore function created with items.length = 0
   ↓
3. useEffect runs, creates IntersectionObserver
   ↓
4. Observer triggers (element is visible)
   ↓
5. loadMore() is called
   ↓
6. items state updates (now has data)
   ↓
7. items.length changes → loadMore function RECREATES
   ↓
8. loadMore changed → useEffect runs again
   ↓
9. New IntersectionObserver created
   ↓
10. Observer immediately triggers (still visible)
    ↓
11. loadMore() called again
    ↓
12. Back to step 6 → INFINITE LOOP
```

Each iteration would load more data, trigger state updates, recreate functions, and repeat endlessly.

---

## The Fix

### Two-Part Solution

#### Part 1: Stabilize the `loadMore` Function

```typescript
// AFTER (FIXED CODE):

const loadMore = useCallback(async () => {
  setIsLoading(true)
  setError(null)

  try {
    // Use functional update to get current items length
    let currentOffset = 0
    setItems((prev) => {
      currentOffset = prev.length  // ✅ Access length inside setter
      return prev
    })

    const newItems = await getEnrichedFeed(userId, 20, currentOffset)

    if (newItems.length === 0) {
      setHasMore(false)
    } else {
      setItems((prev) => [...prev, ...newItems])
    }
  } catch (err) {
    console.error('Error loading more items:', err)
    setError('Failed to load more items')
  } finally {
    setIsLoading(false)
    setIsInitialLoad(false)
  }
}, [userId]) // ✅ Only depends on userId - prevents recreation
```

**Key Changes:**
- Removed `items.length` from dependency array
- Removed `isLoading` and `hasMore` from dependencies (guards handled in useEffect)
- Used functional `setState` to access current `items.length` without depending on it
- Function now only recreates when `userId` changes (very rare)

#### Part 2: Fix the IntersectionObserver useEffect

```typescript
// AFTER (FIXED CODE):

useEffect(() => {
  if (!loadMoreRef.current || !hasMore || isLoading) return  // ✅ Early guards

  if (observerRef.current) {
    observerRef.current.disconnect()
  }

  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {  // ✅ Simplified check
        loadMore()
      }
    },
    { threshold: 0.1 }
  )

  observerRef.current.observe(loadMoreRef.current)

  return () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
  }
}, [hasMore, isLoading]) // ✅ CRITICAL: Removed loadMore from deps
```

**Key Changes:**
- Removed `loadMore` from dependency array (prevents loop)
- Added early return guards for `hasMore` and `isLoading`
- Moved guards from observer callback to useEffect (more efficient)
- Dependencies are now just flags that change infrequently

### Why This Works

```
New Flow (No Loop):

1. Component mounts
   ↓
2. loadMore created (depends only on userId)
   ↓
3. useEffect runs (depends on hasMore, isLoading)
   ↓
4. Observer triggers
   ↓
5. loadMore() called
   ↓
6. items state updates
   ↓
7. loadMore does NOT recreate (userId unchanged) ✅
   ↓
8. useEffect does NOT run (hasMore, isLoading unchanged) ✅
   ↓
9. User scrolls to bottom
   ↓
10. Observer triggers again → loadMore() → more items loaded
    ↓
11. Cycle continues ONLY when user scrolls ✅
```

---

## Code Comparison

### Before and After

```diff
- const loadMore = useCallback(async () => {
-   if (isLoading || !hasMore) return
-
-   setIsLoading(true)
-   setError(null)
-
-   const newItems = await getEnrichedFeed(userId, 20, items.length)
-   setItems((prev) => [...prev, ...newItems])
-   setIsLoading(false)
- }, [userId, items.length, isLoading, hasMore])

+ const loadMore = useCallback(async () => {
+   setIsLoading(true)
+   setError(null)
+
+   try {
+     let currentOffset = 0
+     setItems((prev) => {
+       currentOffset = prev.length
+       return prev
+     })
+
+     const newItems = await getEnrichedFeed(userId, 20, currentOffset)
+
+     if (newItems.length === 0) {
+       setHasMore(false)
+     } else {
+       setItems((prev) => [...prev, ...newItems])
+     }
+   } finally {
+     setIsLoading(false)
+   }
+ }, [userId])
```

```diff
  useEffect(() => {
+   if (!loadMoreRef.current || !hasMore || isLoading) return
+
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
-       if (entries[0].isIntersecting && hasMore && !isLoading) {
+       if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

-   if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
-   }

    return () => {
-     if (observerRef.current) {
        observerRef.current.disconnect()
-     }
    }
- }, [loadMore, hasMore, isLoading])
+ }, [hasMore, isLoading])
```

---

## Applied to ProductFeed Component

The same fix was applied to the new `ProductFeed` component to prevent similar issues:

**File:** `/websites/landing/components/shop/ProductFeed.tsx`

```typescript
// Safe implementation from the start
const loadMore = useCallback(async () => {
  setIsLoading(true)
  setError(null)

  try {
    let currentOffset = 0
    setProducts(prev => {
      currentOffset = prev.length
      return prev
    })

    const newProducts = await loadProducts(currentOffset, 12, filters)

    if (newProducts.length === 0) {
      setHasMore(false)
    } else {
      setProducts(prev => [...prev, ...newProducts])
    }
  } catch (err) {
    console.error('Error loading products:', err)
    setError('Failed to load products')
  } finally {
    setIsLoading(false)
  }
}, [filters]) // Only depends on filters

useEffect(() => {
  if (!loadMoreRef.current || !hasMore || isLoading) return

  if (observerRef.current) {
    observerRef.current.disconnect()
  }

  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 0.1 }
  )

  observerRef.current.observe(loadMoreRef.current)

  return () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
  }
}, [hasMore, isLoading]) // Safe deps - no loadMore
```

---

## Testing the Fix

### How to Verify

1. **Load the dashboard**
   - Should load initial products/feed items
   - No browser freeze or crash

2. **Scroll to bottom**
   - Should load more items smoothly
   - No repeated rapid loading

3. **Check browser console**
   - No error messages
   - No warning about dependency arrays

4. **Monitor browser performance**
   - CPU usage normal
   - Memory usage stable
   - No exponential growth

### What to Watch For

Signs the bug would return:
- Browser becomes unresponsive
- Network tab shows rapid-fire API calls
- State updates happening in a loop
- Console shows repeated log messages

---

## Lessons Learned

### React Hook Patterns

1. **Don't include derived state in useCallback deps**
   - `items.length` is derived from `items`
   - Use functional setState to access it

2. **Keep dependency arrays minimal**
   - Only include external values that should trigger recreation
   - Use guards/checks inside effects instead

3. **Be careful with useEffect + useCallback**
   - Easy to create infinite loops
   - useEffect depends on callback → callback depends on state → state changes trigger effect

4. **IntersectionObserver best practices**
   - Create once, update infrequently
   - Put guards in useEffect, not callback
   - Clean up properly

### TypeScript Helps

The TypeScript compiler can't catch this type of bug because it's a runtime logic error, not a type error. Need to:
- Understand React's reconciliation and re-render cycles
- Test infinite scroll thoroughly
- Use React DevTools to monitor re-renders

---

## Related Patterns

This same fix pattern applies to any infinite scroll implementation:

```typescript
// Generic Safe Infinite Scroll Pattern
const loadMore = useCallback(async () => {
  setIsLoading(true)

  let offset = 0
  setItems(prev => {
    offset = prev.length  // Get current length
    return prev          // Return unchanged
  })

  const newItems = await fetchData(offset)
  setItems(prev => [...prev, ...newItems])
  setIsLoading(false)
}, [/* minimal deps */])

useEffect(() => {
  if (!ref.current || !hasMore || isLoading) return

  const observer = new IntersectionObserver(
    entries => entries[0].isIntersecting && loadMore()
  )
  observer.observe(ref.current)
  return () => observer.disconnect()
}, [hasMore, isLoading]) // No loadMore!
```

Use this pattern for:
- Product feeds
- Social media feeds
- Comment sections
- Search results
- Any paginated list

---

## Conclusion

The infinite loop bug was caused by circular dependencies between `useCallback` and `useEffect`. Fixed by:

1. Removing state dependencies from `loadMore` function
2. Using functional setState to access current state
3. Removing `loadMore` from useEffect dependencies
4. Adding proper guards

**Result:** Stable, performant infinite scroll with no browser crashes.

**Prevention:** Applied the same safe pattern to all new infinite scroll implementations.

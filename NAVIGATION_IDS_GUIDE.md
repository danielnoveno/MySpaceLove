# Navigation Menu IDs - Product Tour Integration

## 🎯 Objective
Menambahkan IDs ke navigation menu items agar Product Tour dapat menargetkan mereka dengan benar.

## 📍 File Location
`resources/js/Layouts/AuthenticatedLayout.jsx`

## 🔧 Implementation Guide

### Step 1: Locate Navigation Links

Cari bagian navigation links di file `AuthenticatedLayout.jsx`. Biasanya ada dua bagian:
1. Desktop Navigation (Sidebar)
2. Mobile Navigation (Responsive Menu)

### Step 2: Add IDs to Desktop Navigation

Tambahkan ID ke setiap Link/NavLink di desktop navigation:

```jsx
{/* Location Menu */}
<Link
    id="location-menu"  // ← ADD THIS
    href={route('location.map', { space: currentSpace.slug })}
    className={navClass(coupleFeaturesLocked)}
>
    {/* Icon & Text */}
</Link>

{/* Spotify Menu */}
<Link
    id="spotify-menu"  // ← ADD THIS
    href={route('spotify.companion', { space: currentSpace.slug })}
    className={navClass(coupleFeaturesLocked)}
>
    {/* Icon & Text */}
</Link>

{/* Games Menu */}
<Link
    id="games-menu"  // ← ADD THIS
    href={route('games.index')}
    className={navClass(false)}
>
    {/* Icon & Text */}
</Link>

{/* Memory Lane Menu */}
<Link
    id="memory-lane-menu"  // ← ADD THIS
    href={route('memory-lane.edit', { space: currentSpace.slug })}
    className={navClass(!isSpaceOwner)}
>
    {/* Icon & Text */}
</Link>

{/* Video Call Menu */}
<Link
    id="video-call-menu"  // ← ADD THIS
    href={route('space.roomjitsi', { space: currentSpace.slug })}
    className={navClass(coupleFeaturesLocked)}
>
    {/* Icon & Text */}
</Link>

{/* Wishlist Menu */}
<Link
    id="wishlist-menu"  // ← ADD THIS
    href={route('wishlist.index')}
    className={navClass(false)}
>
    {/* Icon & Text */}
</Link>

{/* Documents Menu */}
<Link
    id="docs-menu"  // ← ADD THIS
    href={route('docs.index')}
    className={navClass(false)}
>
    {/* Icon & Text */}
</Link>

{/* Surprise Notes Menu */}
<Link
    id="surprise-notes-menu"  // ← ADD THIS
    href={route('notes.index')}
    className={navClass(false)}
>
    {/* Icon & Text */}
</Link>

{/* Goals Menu */}
<Link
    id="goals-menu"  // ← ADD THIS
    href={route('space.goals.index')}
    className={navClass(false)}
>
    {/* Icon & Text */}
</Link>

{/* Notifications Button */}
<button
    id="notifications-button"  // ← ADD THIS
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative"
>
    {/* Icon & Badge */}
</button>

{/* Profile Menu */}
<Dropdown>
    <Dropdown.Trigger>
        <button
            id="profile-menu"  // ← ADD THIS
            className="flex items-center"
        >
            {/* User Info */}
        </button>
    </Dropdown.Trigger>
</Dropdown>
```

### Step 3: Add IDs to Mobile Navigation (Optional)

Untuk konsistensi, tambahkan ID yang sama ke mobile navigation:

```jsx
{/* Mobile Navigation */}
<ResponsiveNavLink
    id="location-menu-mobile"  // ← ADD THIS (with -mobile suffix)
    href={route('location.map', { space: currentSpace.slug })}
>
    {/* Icon & Text */}
</ResponsiveNavLink>

// ... repeat for all menu items
```

## 📋 Complete List of Required IDs

| Menu Item | ID | Route Name |
|-----------|----|-----------| 
| Location Sharing | `location-menu` | `location.map` |
| Spotify Companion | `spotify-menu` | `spotify.companion` |
| Games | `games-menu` | `games.index` |
| Memory Lane | `memory-lane-menu` | `memory-lane.edit` |
| Video Call | `video-call-menu` | `space.roomjitsi` |
| Wishlist | `wishlist-menu` | `wishlist.index` |
| Documents | `docs-menu` | `docs.index` |
| Surprise Notes | `surprise-notes-menu` | `notes.index` |
| Goals | `goals-menu` | `space.goals.index` |
| Notifications | `notifications-button` | N/A (button) |
| Profile | `profile-menu` | N/A (dropdown) |

## 🎨 Dashboard Elements (Already Added)

These IDs are already added to Dashboard.tsx:

| Element | ID | Description |
|---------|----|-----------| 
| Space Title | `space-title` | Header with space name |
| Statistics | `stats-section` | Timeline & Gallery counts |
| Timeline Section | `timeline-section` | Quick action for timeline |
| Gallery Section | `gallery-section` | Quick action for gallery |
| Countdown Section | `countdown-section` | Upcoming events |
| Daily Messages | `daily-messages-section` | Recent messages |
| Journal Section | `journal-section` | Quick action for journal |

## ✅ Verification

After adding IDs, verify with browser DevTools:

1. Open Dashboard
2. Press F12 (DevTools)
3. Run in console:
```javascript
// Check if all IDs exist
const requiredIds = [
  'space-title',
  'stats-section', 
  'location-menu',
  'spotify-menu',
  'games-menu',
  'memory-lane-menu',
  'video-call-menu',
  'wishlist-menu',
  'docs-menu',
  'surprise-notes-menu',
  'goals-menu',
  'notifications-button',
  'profile-menu'
];

requiredIds.forEach(id => {
  const element = document.getElementById(id);
  console.log(`${id}: ${element ? '✅ Found' : '❌ Missing'}`);
});
```

## 🐛 Troubleshooting

### ID not found?
- Check spelling (case-sensitive)
- Ensure element is rendered (not hidden by conditional)
- Check if using correct component (Link vs NavLink vs button)

### Tour skips element?
- Element might be hidden
- Check z-index conflicts
- Verify element is visible when tour starts

### Multiple elements with same ID?
- IDs must be unique
- Use different IDs for desktop/mobile (e.g., `-mobile` suffix)

## 📝 Example Implementation

Here's a complete example for one menu item:

```jsx
// Before (without ID)
<Link
    href={route('location.map', { space: currentSpace.slug })}
    className={navClass(coupleFeaturesLocked)}
    title={coupleFeaturesLocked ? lockedTooltip : undefined}
>
    <MapPin className="h-5 w-5" />
    <span>{navigation.location ?? "Location"}</span>
    {coupleFeaturesLocked && <Lock className="h-4 w-4 ml-auto" />}
</Link>

// After (with ID)
<Link
    id="location-menu"  // ← ADDED
    href={route('location.map', { space: currentSpace.slug })}
    className={navClass(coupleFeaturesLocked)}
    title={coupleFeaturesLocked ? lockedTooltip : undefined}
>
    <MapPin className="h-5 w-5" />
    <span>{navigation.location ?? "Location"}</span>
    {coupleFeaturesLocked && <Lock className="h-4 w-4 ml-auto" />}
</Link>
```

## 🎯 Best Practices

1. **Use kebab-case**: `location-menu` not `locationMenu`
2. **Be descriptive**: `spotify-menu` not `menu1`
3. **Consistent naming**: All menu items end with `-menu`
4. **Unique IDs**: Never duplicate IDs on same page
5. **Document changes**: Update this file if adding new menu items

## 🔄 Testing Checklist

- [ ] All IDs added to desktop navigation
- [ ] All IDs added to mobile navigation (optional)
- [ ] No duplicate IDs
- [ ] All IDs verified in DevTools
- [ ] Product Tour can target all elements
- [ ] Tour works on desktop
- [ ] Tour works on mobile (if implemented)
- [ ] No console errors

---

**Last Updated**: December 2025
**Status**: Implementation Pending
**Priority**: High (Required for Product Tour)

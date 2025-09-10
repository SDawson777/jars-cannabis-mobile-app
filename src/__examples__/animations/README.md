# Animation Examples

This directory contains example components demonstrating various animation patterns used in the JARS app.

## Components

### `wave_animation.tsx`
A simple wave animation component that demonstrates:
- Fade-in effect using `opacity`
- Scale-up effect using `transform: scale`
- Basic `react-native-reanimated` usage with `useSharedValue` and `useAnimatedStyle`

**Use Case**: Loading states, subtle hover effects, or drawing attention to elements.

```tsx
import WaveAnimation from './wave_animation';

// Usage
<WaveAnimation />
```

### `bottom_sheet.tsx`
A content component for bottom sheets showing terpene information:
- Simple content layout for informational displays
- Demonstrates text hierarchy with different styles
- Shows how to structure data for bottom sheet content

**Use Case**: Information panels, product details, or any modal content display.

```tsx
import { BottomSheetContent } from './bottom_sheet';

// Usage
const terpeneInfo = {
  name: "Myrcene",
  aromas: ["Earthy", "Musky", "Herbal"],
  effects: ["Relaxing", "Sedating", "Pain Relief"],
  strains: ["Granddaddy Purple", "Blue Dream", "OG Kush"]
};

<BottomSheetContent info={terpeneInfo} />
```

## Integration Notes

These examples were moved from `src/terpene_wheel/snippets/` to maintain them as reference implementations while cleaning up the active codebase. They demonstrate good patterns that can be adapted for:

1. **Product animations** - Use wave animation patterns for product cards
2. **Information displays** - Use bottom sheet patterns for detailed views
3. **Loading states** - Adapt wave animations for skeleton screens
4. **Accessibility** - Both examples can be enhanced with accessibility labels

## Best Practices

When using these patterns:
- Always test animations on lower-end devices
- Ensure animations respect user's motion preferences
- Add accessibility labels for screen readers
- Consider performance impact of complex animations
- Use feature flags to control animation availability

## Related

- See `src/hooks/usePulse.ts` for production-ready animation hook
- See `src/utils/featureFlags.ts` for animation toggle capabilities
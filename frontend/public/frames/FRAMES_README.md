# Frame Sequence for Landing Page Scroll Scrubber

## Expected Naming Convention

Place your PNG frame sequence in this directory. Files must be named sequentially with zero-padded 3-digit numbering:

```
frame_001.png
frame_002.png
frame_003.png
...
frame_180.png
```

## Configuration

The frame count and path template are configured in:
`/src/components/landing/FrameScrubber.jsx`

Look for these exported constants at the very top of the file:

```js
export const TOTAL_FRAMES = 153;          // Change to match your frame count
export const FRAME_PATH_TEMPLATE = '/frames/ezgif-frame-';  // Change if your naming differs
export const FRAME_EXTENSION = '.jpg';    // Change if using .jpg or .webp
export const FRAME_PAD_LENGTH = 3;        // Zero-padding length (3 = 001, 4 = 0001)
```

## Frame Content

- **Frame 1**: Heat-scorched Pune city (orange-red tones, hot)
- **Final frame**: Cool, green, intervened Pune city (greens, blues, vegetation)
- The sequence should show a smooth transformation from hot → cool

## Resolution

- Recommended: 1920×1080 (matches target display)
- Minimum: 1280×720
- Format: PNG (lossless) or WebP (smaller files, faster load)

## Fallback

If no frames are present in this directory, the app will display a gradient-based
fallback that transitions from red/orange (hot) to green/blue (cool) as you scroll.
This ensures the landing page still works during development.

## Performance Note

All frames are preloaded into memory on page load. A loading progress bar is shown
while frames load. For best performance:
- Keep file sizes reasonable (< 500KB per frame for PNG)
- Consider converting to WebP for 50-70% smaller files
- 120-180 frames provides smooth scrubbing at 60fps

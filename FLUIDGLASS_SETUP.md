# FluidGlass 3D Effect Setup

## Overview

The FluidGlass component adds a beautiful 3D glass effect to the login page using Three.js and React Three Fiber.

## Installation

### 1. Install Required Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

### 2. Add 3D Models

Place your GLB model files in `public/assets/3d/` directory:

- `lens.glb` - For lens mode
- `bar.glb` - For bar mode
- `cube.glb` - For cube mode

**Note**: If models are not available, the component will use a fallback glass cube.

### 3. Directory Structure

```
public/
  assets/
    3d/
      lens.glb
      bar.glb
      cube.glb
```

## Usage

The FluidGlass component is already integrated into the login page. It appears as a background effect with:

- **Mode**: `lens` (can be changed to `bar` or `cube`)
- **Position**: Background layer behind login form
- **Opacity**: 30% for subtle effect
- **Auto-rotation**: Enabled for dynamic effect

## Configuration

To modify the effect, edit `src/components/Login.js`:

```javascript
<FluidGlass 
  mode="lens" // or "bar", "cube"
  lensProps={{
    scale: 0.25,              // Size of the model
    ior: 1.15,                // Index of refraction
    thickness: 5,             // Glass thickness
    chromaticAberration: 0.1, // Color dispersion
    anisotropy: 0.01         // Material anisotropy
  }}
/>
```

## Properties

### Mode Options
- `lens` - Lens-shaped glass model
- `bar` - Bar-shaped glass model
- `cube` - Cube-shaped glass model

### Lens Props
- `scale` - Model scale (default: 0.25)
- `ior` - Index of refraction (default: 1.15)
- `thickness` - Glass thickness (default: 5)
- `chromaticAberration` - Color dispersion (default: 0.1)
- `anisotropy` - Material anisotropy (default: 0.01)

### Bar Props
- `scale` - Model scale (default: 0.5)

### Cube Props
- `scale` - Model scale (default: 0.3)

## Troubleshooting

### Models Not Loading
- ✅ Check that GLB files are in `public/assets/3d/`
- ✅ Verify file names match exactly: `lens.glb`, `bar.glb`, `cube.glb`
- ✅ Check browser console for loading errors
- ✅ Component will use fallback if models are missing

### Performance Issues
- ✅ Reduce opacity if effect is too heavy
- ✅ Lower model scale
- ✅ Disable auto-rotation if needed
- ✅ Use simpler models for better performance

### Dependencies Not Found
```bash
npm install three @react-three/fiber @react-three/drei
```

## Customization

### Change Opacity
Edit `src/components/Login.js`:
```javascript
<div style={{ ..., opacity: 0.3 }}> // Change 0.3 to desired opacity
```

### Disable Auto-Rotation
Edit `src/components/FluidGlass.js`:
```javascript
<OrbitControls
  autoRotate={false} // Set to false
/>
```

### Change Model
Edit `src/components/Login.js`:
```javascript
<FluidGlass mode="cube" /> // Change to "bar" or "cube"
```

## Notes

- The effect is only visible on the login page
- Models are loaded asynchronously with Suspense
- The component uses transparent background
- Glass material uses physical-based rendering (PBR)

---

**The FluidGlass effect is now integrated and ready to use!** 🎨


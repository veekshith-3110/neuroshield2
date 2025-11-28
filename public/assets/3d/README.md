# 3D Models Directory

This directory should contain the following GLB model files:

- `lens.glb` - Lens model for FluidGlass component
- `bar.glb` - Bar model for FluidGlass component  
- `cube.glb` - Cube model for FluidGlass component

## How to Add Models

1. Place your GLB model files in this directory
2. The FluidGlass component will automatically load them based on the `mode` prop:
   - `mode="lens"` → loads `lens.glb`
   - `mode="bar"` → loads `bar.glb`
   - `mode="cube"` → loads `cube.glb`

## Fallback

If the models are not found, the component will render a simple glass cube as a fallback.

## Model Sources

You can find 3D models from:
- [Sketchfab](https://sketchfab.com/)
- [Poly Haven](https://polyhaven.com/)
- [TurboSquid](https://www.turbosquid.com/)
- Create your own using Blender or other 3D software

Make sure models are exported as GLB format for best compatibility.


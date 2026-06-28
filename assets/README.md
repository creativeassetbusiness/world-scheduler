# World Scheduler — Earth Preview Assets

## Required Textures (place in assets/textures/)

| File | Resolution | Source | Purpose |
|------|-----------|--------|---------|
| `earth_color.jpg` | 8192×4096 | NASA Blue Marble | Base color map |
| `earth_bump.jpg` | 8192×4096 | NASA SRTM | Terrain relief / displacement |
| `earth_specular.jpg` | 8192×4096 | Derived | Ocean specular / water mask |
| `earth_night.jpg` | 8192×4096 | NASA Black Marble | Night city lights |
| `earth_clouds.png` | 8192×4096 | NASA Visible Earth | Cloud layer (transparent) |
| `stars.png` | 2048×1024 | Generated | Star field background |

## Required 3D Models (place in assets/models/)

| File | Format | Polycount | Purpose |
|------|--------|-----------|---------|
| `building_low.glb` | glTF | <500 | Generic building placeholder |
| `building_med.glb` | glTF | <2K | Regional planning campus |
| `wind_turbine.glb` | glTF | <1K | Energy infrastructure marker |
| `water_tower.glb` | glTF | <500 | Water infrastructure marker |
| `farm_plot.glb` | glTF | <300 | Agriculture marker |
| `factory.glb` | glTF | <1K | Manufacturing marker |
| `house.glb` | glTF | <500 | Residential unit |

## Fallback (procedural)

Until real textures are available, the engine generates a procedural Earth texture via Canvas 2D:
- Blue ocean base with Perlin-like noise
- Brown/green landmass blobs
- White cloud wisps
- Dark background with star particles

## License Notes

NASA Blue Marble / Black Marble imagery is public domain.
SRTM elevation data is public domain.
All 3D models should be CC0 or custom-built.

# 🛰️[CollisionScope](https://collisionscope.vercel.app/)

[**CollisionScope**](https://collisionscope.vercel.app/) is a 3D satellite visualisation tool that detects and displays potential satellite collisions using real world orbital data. 


![image](https://github.com/user-attachments/assets/3c4f8227-b48b-4e84-8bea-eee78565400f)


---

## Features

- Real time rendering of Earth with day/night, cloud and star textures

- Displays satellites (red) and debris (grey) using parsed TLE data and Three.js

- Collision detection engine based on a proximity threshold of **1 Kilometer**
  
- Searchable overlay showcasing collision details

---

## Data

The app uses local TLE files stored in ```/OrbitalData```
- ```satellite_data.txt``` (Satellites)
- ```fengyun_space_debris.txt``` (Space Debris)
- ```iridium_space_debris.txt``` (Space Debris)
  
**This TLE data was sourced from [Celestrak](https://celestrak.org/)**
**Earth texture maps obtained from [Solar System Scope](https://www.solarsystemscope.com/textures/).**


## Constraints
Due to the limited computational resources provided on the [live demo](https://collisionscope.vercel.app/) the input has been cut down to a small subset of satellites and space debris. As a result, the potential collisions shown dont represent the full list of collisions. 

If you’d like to explore a more comprehensive set of data and adjust the number of collisions or thresholds yourself, you can clone the repository and run the app locally. This way, you’ll have full control over the input size and filter settings without the limitations of the live demo.


## Author

Built by Ansh Rawat

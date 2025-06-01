"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { parseTLE, getSatellitePosition } from "../utils/satellites"
import { detectCollision } from "../utils/collisionDetection"
import CollisionOverlay from "./CollisionOverlay"

const Globe = ({
  sphereRadius = 6.731,
  rotateSpeed = 0.0002,
}) => {
  const globeRef = useRef()
  const [debrisMeshes, setDebrisMeshes] = useState({
    satellites: [],
    fengyun: [],
    iridium: [],
  })

  const [collisions, setCollisions] = useState([])

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15 // initial camera position

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    globeRef.current.appendChild(renderer.domElement)

    // Camera Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 1.2
    controls.minDistance = 6
    controls.maxDistance = 20
    controls.enableZoom = true
    controls.enablePan = false

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)
    scene.add(new THREE.AmbientLight(0x222222))

    const textureLoader = new THREE.TextureLoader()
    const earthGroup = new THREE.Group()
    scene.add(earthGroup)

    // Load Earth textures
    Promise.all([
      textureLoader.loadAsync("/8k_earth_daymap.jpg"),
      textureLoader.loadAsync("/8k_earth_nightmap.jpg"),
      textureLoader.loadAsync("/8k_earth_normal_map.jpg"),
      textureLoader.loadAsync("/8k_earth_specular_map.jpg"),
      textureLoader.loadAsync("/8k_stars.jpg"),
      textureLoader.loadAsync("/8k_earth_clouds.jpg"),
    ]).then(([dayMap, nightMap, normalMap, specularMap, starMap, cloudMap]) => {
      const earthGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64)
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: dayMap,
        normalMap,
        specularMap,
        specular: new THREE.Color("grey"),
        shininess: 5,
        emissiveMap: nightMap,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1,
      })
      const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
      earthGroup.add(earthMesh)

      // Load clouds
      const cloudHeight = 0.03
      const cloudGeometry = new THREE.SphereGeometry(sphereRadius + cloudHeight, 64, 64)
      const cloudMaterial = new THREE.MeshLambertMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
      cloudMesh.name = "clouds"
      earthGroup.add(cloudMesh)

      const starGeometry = new THREE.SphereGeometry(90, 64, 64)
      const starMaterial = new THREE.MeshBasicMaterial({ map: starMap, side: THREE.BackSide })
      const starMesh = new THREE.Mesh(starGeometry, starMaterial)
      scene.add(starMesh)
    })

    const loadAndRenderDebris = async (filePath, color, label, size) => {
      try {
        const res = await fetch(filePath)
        const tleText = await res.text()
        const parsed = parseTLE(tleText)
        const positions = getSatellitePosition(parsed)

        const meshes = positions.map(({ x, y, z }) => {
          const geometry = new THREE.SphereGeometry(size, 8, 8)
          const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 1 })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.position.set(x, y, z)
          scene.add(mesh)
          return mesh
        })

        setDebrisMeshes(prev => ({ ...prev, [label]: meshes }))
      } catch (e) {
        console.error(`Error loading ${label} data:`, e)
      }
    }

    // Load debris and satellite data
    loadAndRenderDebris("/OrbitalData/satellite_data.txt", 0xff0000, "satellites", 0.04)
    loadAndRenderDebris("/OrbitalData/fengyun_space_debris.txt", "grey", "fengyun", 0.03)
    loadAndRenderDebris("/OrbitalData/iridium_space_debris.txt", "grey", "iridium", 0.03)

    // Detect collisions on mount
    const checkForCollisions = async () => {
      try {
        const res = await fetch("/OrbitalData/satellite_data.txt")
        const tleText = await res.text()
        const parsed = parseTLE(tleText)

        // The time complexity for calculating all satellite collisions is too great, so i've reduced the input sample size.
        const sample = parsed.slice(0, 800) 
        const collisions = detectCollision(sample, 1, 365, 500, 3000)
        setCollisions(collisions)
        console.log("Upcoming potential collisions:", collisions)
      } catch (e) {
        console.error("Error detecting collisions:", e)
      }
    }

    checkForCollisions()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", onResize)

    const animate = () => {
      requestAnimationFrame(animate)
      earthGroup.rotation.y += rotateSpeed

      const clouds = earthGroup.getObjectByName("clouds")
      if (clouds) clouds.rotation.y += 0.0001

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", onResize)
      globeRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return (
  <div className="globe-container" style={{ position: "relative", width: "100%", height: "100vh" }}>
    <div className="globe" ref={globeRef} style={{ width: "100%", height: "100%" }} />
    <CollisionOverlay collisions={collisions} />
  </div>
)
}

export default Globe

"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const Globe = ({
  totalSatellites = 20,
  sphereRadius = 6.731,
  rotateSpeed = 0.0002,
}) => {
  const globeRef = useRef()

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 15

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    globeRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 1.2
    controls.minDistance = 6
    controls.maxDistance = 20
    controls.enableZoom = true
    controls.enablePan = false

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)
    scene.add(new THREE.AmbientLight(0x222222))

    const textureLoader = new THREE.TextureLoader()
    const earthGroup = new THREE.Group()
    scene.add(earthGroup)

    Promise.all([
      textureLoader.loadAsync("/8k_earth_daymap.jpg"),
      textureLoader.loadAsync("/8k_earth_nightmap.jpg"),
      textureLoader.loadAsync("/8k_earth_normal_map.jpg"),
      textureLoader.loadAsync("/8k_earth_specular_map.jpg"),
      textureLoader.loadAsync("/8k_stars.jpg"),
      textureLoader.loadAsync("/8k_earth_clouds.jpg"),
    ]).then(([dayMap, nightMap, normalMap, specularMap, starMap, cloudMap]) => {
      // Earth render
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


      // Clouds
      const cloudHeight = 0.03 // Height of the clouds above the Earth surface
      const cloudGeometry = new THREE.SphereGeometry(sphereRadius + cloudHeight, 64, 64)
      const cloudMaterial = new THREE.MeshLambertMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
      cloudMesh.name = "clouds"
      earthGroup.add(cloudMesh)

      // star background
      const starGeometry = new THREE.SphereGeometry(90, 64, 64)
      const starMaterial = new THREE.MeshBasicMaterial({
        map: starMap,
        side: THREE.BackSide,
      })
      const starMesh = new THREE.Mesh(starGeometry, starMaterial)
      scene.add(starMesh)
    })

    // Random Satellites
    for (let i = 0; i < totalSatellites; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()

      const radius = sphereRadius + 1 + Math.random() * 1.5
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      const satGeometry = new THREE.SphereGeometry(0.08, 12, 12)
      const satMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
      const satellite = new THREE.Mesh(satGeometry, satMaterial)
      satellite.position.set(x, y, z)
      scene.add(satellite)
    }

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
  }, [totalSatellites, sphereRadius])

  return <div className="globe" ref={globeRef} />
}

export default Globe

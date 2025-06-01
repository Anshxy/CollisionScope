import { getSatellitePosition } from "./satellites"

export function detectCollision(
  objects,
  collisionThreshold = 1,
  daysAhead = 365,
  stepMins = 60,
  maxCollisions = 100
) {
  const collisions = []
  const seenDates = new Set()

  const stepMs = stepMins * 60 * 1000
  const startTime = new Date().getTime()
  const endTime = startTime + daysAhead * 24 * 60 * 60 * 1000

  for (let t = startTime; t <= endTime; t += stepMs) {
    const date = new Date(t)
    const positions = getSatellitePosition(objects, date)

    let dateCollisions = 0 

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const posA = positions[i]
        const posB = positions[j]

        const distance = Math.sqrt((posA.x - posB.x)**2 + (posA.y - posB.y)**2 + (posA.z - posB.z)**2)

        if (distance < collisionThreshold) {
          collisions.push({satA: posA.name, satB: posB.name, distance: distance.toFixed(3), date: date.toISOString()})

          dateCollisions++
          seenDates.add(date.toISOString().split("T")[0]) // just the date

          if (collisions.length >= maxCollisions) {
            return collisions.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, maxCollisions)
          }

          
          if (dateCollisions >= 20) {
            break
          }
        }
      }
      if (dateCollisions >= 20) {
        break
      } 
    }
  }

  return collisions.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, maxCollisions)
}

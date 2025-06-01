import * as satellite from "satellite.js";

export function parseTLE(tleText) {
  const lines = tleText.split("\n").map(line => line.trim()).filter(line => line !== "")
  const sats = []

  for (let i = 0; i< lines.length; i += 3) {
    if (i + 2 >= lines.length) {
        break
    }
    sats.push({name: lines[i], tle1: lines[i+1], tle2: lines[i+2]})
  }
  // console.log(sats)
  return sats
}

export function getSatellitePosition(satellites, date = new Date()) {
    const positions = []
    const earthRadius = 6371

    satellites.forEach(sat => {
        try {
            const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2)
            const positionEci = satellite.propagate(satrec, date)

            // If no position is returned, skip this satellite
            if (!positionEci || !positionEci.position) {
                return
            }

            const gmst = satellite.gstime(date)
            const positionEcf = satellite.eciToEcf(positionEci.position, gmst)

            const scale = 6.371 / earthRadius
            const x = positionEcf.x * scale
            const y = positionEcf.y * scale
            const z = positionEcf.z * scale

            positions.push({ name: sat.name, x, y, z })
        } catch (e) {
            console.error(`Error processing satellite ${sat.name}: `, e)
        }
    })
    // console.log(positions)
    return positions
}
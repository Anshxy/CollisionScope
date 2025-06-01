"use client"
import { useState } from "react"

const CollisionOverlay = ({ collisions }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCollisions = collisions.filter(col => col.satA.toLowerCase().includes(searchTerm.toLowerCase()) || col.satB.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div
      className="collision-overlay"
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "1rem",
        borderRadius: "8px",
        height: "90vh",
        overflowY: "scroll",
        width: "400px", 
        fontFamily: "sans-serif",
        zIndex: 10,
      }}
    >
      <h2 style={{ fontSize: "1.2", marginBottom: "0.5" }}>Potential Collisions</h2>

      <input
        type="text"
        placeholder="Search satellite name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "none",
          fontSize: "0.95rem",
        }}
      />

      {filteredCollisions.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredCollisions.map((col, index) => (
            <li key={index} style={{ marginBottom: "0.75rem", borderBottom: "1px solid #555", paddingBottom: "0.5rem" }}>
              <strong>{col.satA}</strong> vs <strong>{col.satB}</strong><br />
              <small>{new Date(col.date).toLocaleString()}</small><br />
              <small>Distance: {col.distance} km</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CollisionOverlay

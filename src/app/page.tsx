import Globe from "./components/Globe";

export default function Home() {

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const formattedDate = `${month}/${day}/${year}`

  return (
    <div className="app">
      <nav>
        <h1>CollisionScope</h1>
        <h2>By Ansh Rawat</h2>
      </nav>

      <Globe />
      
      <footer>
        <p>[ Current information and visualisation as of {formattedDate} ] </p>
      </footer>

    </div>
    
  );
}

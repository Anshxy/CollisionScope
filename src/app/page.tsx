import Globe from "./components/Globe";

export default function Home() {
  return (
    <div className="app">

      <nav>
        <h1>Globe</h1>
      </nav>

      <Globe />
      
      <footer>
        <p>[ Detection of satellite collisions ]</p>
      </footer>

    </div>
    
  );
}

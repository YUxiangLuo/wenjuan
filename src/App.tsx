import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import "./index.css";

function NavBar() {
  return (
    <nav className="flex justify-center space-x-4 mb-8">
      <Link to="/" className="text-sm font-medium hover:underline">Home</Link>
      <Link to="/about" className="text-sm font-medium hover:underline">About</Link>
    </nav>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto p-8 min-h-screen">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


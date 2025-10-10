import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import DeckBuilder from "./pages/DeckBuilder"
import Layout from "./components/layout/Layout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home/>} />
          <Route path="/deckbuilder" element={<DeckBuilder/>} />
        </Route>

        {/* Fallback for unknown URLs */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
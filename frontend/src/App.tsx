import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Decks from "./pages/Decks"
import DeckBuilder from "./pages/DeckBuilder"
import DeckViewer from "./pages/DeckViewer"
import CardsPage from "./pages/CardsPage"
import CardCollection from "./pages/CardCollection"
import CollectionDetail from "./pages/CollectionDetail"
import Layout from "./components/layout/Layout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home/>} />
          <Route path="/decks" element={<Decks/>} />
          <Route path="/deckbuilder" element={<DeckBuilder/>} />
          <Route path="/cards" element={<CardsPage/>} />
          <Route path="/deckviewer" element={<DeckViewer/>} />
          <Route path="/collection" element={<CardCollection/>} />
          <Route path="/collection/:setId" element={<CollectionDetail />} />
        </Route>

        {/* Fallback for unknown URLs */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
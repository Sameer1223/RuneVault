import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Auth0Provider } from "@auth0/auth0-react";
import Home from "./pages/Home"
import Decks from "./pages/Decks"
import DeckBuilder from "./pages/DeckBuilder"
import DeckViewer from "./pages/DeckViewer"
import SetsPage from "./pages/SetsPage"
import DailyGamePage from "./pages/DailyGamePage"
import SetCollection from "./pages/SetCollection"
import Layout from "./components/layout/Layout"

const AUTH_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || "";
const AUTH_CLIENTID = import.meta.env.VITE_AUTH0_CLIENTID || "";
const AUTH_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || "";

function App() {
  return (
    <Auth0Provider
      domain={AUTH_DOMAIN}
      clientId={AUTH_CLIENTID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: AUTH_AUDIENCE,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home/>} />
            <Route path="/decks" element={<Decks/>} />
            <Route path="/deckbuilder" element={<DeckBuilder/>} />
            <Route path="/deckviewer" element={<DeckViewer/>} />
            <Route path="/collection" element={<SetsPage/>} />
            <Route path="/collection/:setId" element={<SetCollection />} />
            <Route path="/riftboundle" element={<DailyGamePage/>} />
          </Route>

          {/* Fallback for unknown URLs */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;
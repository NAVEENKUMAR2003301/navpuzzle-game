import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PlayerEntry from "./pages/PlayerEntry";
import GamePage from "./pages/GamePage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerEntry />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

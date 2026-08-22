import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import AppLayout from "./layouts/AppLayout";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import BookMarks from "./pages/BookMarks";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/bookmarks" element={<BookMarks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
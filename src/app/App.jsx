import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import LogIn from "../pages/Auth/LogIn/LogIn";
import SignUp from "../pages/Auth/SignUp/SignUp";
import Home from "../pages/Home/Home";
import AppLayout from "../layouts/AppLayout";
import Explore from "../pages/Explore/Explore";
import Create from "../pages/Create/Create";
import BookMarks from "../pages/BookMarks/BookMarks";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import PostView from "../pages/PostView/PostView";

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
          <Route path="/settings" element={<Settings />} />
          <Route path="/post/:id" element={<PostView /> } />
          <Route path="/user/:username" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import Home from "../pages/Home/Home";
import AppLayout from "../layouts/AppLayout";
import Explore from "../pages/Explore/Explore";
import Create from "../pages/Create/Create";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import PostView from "../pages/PostView/PostView";
import Bookmarks from "../pages/Bookmarks/Bookmarks";
import Signup from "../pages/Auth/Signup/Signup";
import Login from "../pages/Auth/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { getCurrentUser } from "../mocks/api";

function RequireAuth({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const user = getCurrentUser();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <Signup />
            </RedirectIfAuthed>
          }
        />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <Create />
              </RequireAuth>
            }
          />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/post/:id" element={<PostView />} />
          <Route path="/user/:username/:tab?" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

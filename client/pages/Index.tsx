import { useState } from "react";
import HotelLogin from "@/components/HotelLogin";
import HotelDashboard from "@/components/HotelDashboard";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  if (isLoggedIn) {
    return <HotelDashboard onLogout={handleLogout} username={username} />;
  }

  return <HotelLogin onLogin={handleLogin} />;
}

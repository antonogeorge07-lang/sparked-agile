import { useState, useEffect } from "react";

export const useGuestMode = () => {
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem("guest_mode") === "true";
    setIsGuestMode(guestMode);
  }, []);

  const enableGuestMode = () => {
    localStorage.setItem("guest_mode", "true");
    setIsGuestMode(true);
  };

  const disableGuestMode = () => {
    localStorage.removeItem("guest_mode");
    setIsGuestMode(false);
  };

  return { isGuestMode, enableGuestMode, disableGuestMode };
};
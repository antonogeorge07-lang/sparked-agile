import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGuestMode = () => {
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const checkGuestMode = async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is authenticated, clear guest mode
      if (session) {
        localStorage.removeItem("guest_mode");
        setIsGuestMode(false);
        return;
      }
      
      // Otherwise check localStorage
      const guestMode = localStorage.getItem("guest_mode") === "true";
      setIsGuestMode(guestMode);
    };
    
    checkGuestMode();
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
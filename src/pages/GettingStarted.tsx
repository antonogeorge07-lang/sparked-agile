import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GettingStarted() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/quick-start", { replace: true });
  }, [navigate]);

  return null;
}

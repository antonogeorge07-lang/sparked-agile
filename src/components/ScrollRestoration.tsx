import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Respect hash navigation (e.g. /landing#features). If we always scroll to top
    // on route change, we can override the browser's anchor scrolling.
    if (location.hash) {
      const id = location.hash.replace("#", "");

      // The target element may render after route transition; retry briefly.
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      };

      // Try immediately and then once more shortly after paint.
      if (!tryScroll()) {
        const t1 = window.setTimeout(() => {
          if (!tryScroll()) {
            // Final small retry in case of lazy-loaded sections.
            window.setTimeout(tryScroll, 250);
          }
        }, 0);

        return () => window.clearTimeout(t1);
      }

      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);
  
  return null;
};

export default ScrollRestoration;

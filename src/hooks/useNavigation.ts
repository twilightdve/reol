import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { setRoute } from "../redux/slices/routeSlice";

interface NavigationOptions {
  scrollToTop?: boolean;
  updateHistory?: boolean;
}

export const useNavigation = (options: NavigationOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { scrollToTop = true, updateHistory = true } = options;

  const navigateToRoute = useCallback(
    (route: string) => {
      try {
        const url = route === "HOME" ? "/" : `/#${route}`;

        if ("/" === location.pathname || location.pathname.startsWith("/#")) {
          if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          dispatch(setRoute({ currentRoute: route }));

          if (updateHistory) {
            history.pushState(null, "!Legit｜Reol Unofficial Fansite", url);
          }
        } else {
          location.href = url;
        }
      } catch (error) {
        console.error("Navigation error:", error);
        throw error; // Re-throw for error boundary
      }
    },
    [dispatch, scrollToTop, updateHistory]
  );

  return { navigateToRoute };
};

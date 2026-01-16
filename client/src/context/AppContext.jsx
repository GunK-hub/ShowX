import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const [loading, setLoading] = useState({
    shows: false,
    favorites: false,
    admin: false,
  });

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const lastFetchRequest = useRef({
    favorites: 0,
    admin: 0,
  });

  const adminToastShown = useRef(false);

  const handleError = useCallback(
    (error, defaultMessage = "Something went wrong") => {
      const message = error?.response?.data?.message || defaultMessage;
      toast.error(message);
      console.error(error);
    },
    []
  );

  // 🔐 Axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        if (user) {
          try {
            const token = await getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error("Failed to get token:", error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [user, getToken]);

  // 👑 Check admin
  const fetchIsAdmin = useCallback(async () => {
    const requestId = Date.now();
    lastFetchRequest.current.admin = requestId;

    setLoading((prev) => ({ ...prev, admin: true }));

    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (lastFetchRequest.current.admin === requestId) {
        setIsAdmin(data.isAdmin);

        if (!data.isAdmin && location.pathname.startsWith("/admin")) {
          navigate("/");
          if (!adminToastShown.current) {
            toast.error("You are not authorized to access admin dashboard");
            adminToastShown.current = true;
          }
        }
      }
    } catch (error) {
      if (lastFetchRequest.current.admin === requestId) {
        handleError(error, "Failed to check admin status");
      }
    } finally {
      if (lastFetchRequest.current.admin === requestId) {
        setLoading((prev) => ({ ...prev, admin: false }));
      }
    }
  }, [getToken, location.pathname, navigate, handleError]);

  // 🎬 Fetch shows
  const fetchShows = useCallback(async () => {
    setLoading((prev) => ({ ...prev, shows: true }));

    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error, "Failed to fetch shows");
    } finally {
      setLoading((prev) => ({ ...prev, shows: false }));
    }
  }, [handleError]);

  // ❤️ Fetch favorites (backend)
  const fetchFavoriteMovies = useCallback(async () => {
    const requestId = Date.now();
    lastFetchRequest.current.favorites = requestId;

    setLoading((prev) => ({ ...prev, favorites: true }));

    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (lastFetchRequest.current.favorites === requestId) {
        if (data.success) {
          setFavoriteMovies(data.movies);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      if (lastFetchRequest.current.favorites === requestId) {
        handleError(error, "Failed to fetch favorites");
      }
    } finally {
      if (lastFetchRequest.current.favorites === requestId) {
        setLoading((prev) => ({ ...prev, favorites: false }));
      }
    }
  }, [getToken, handleError]);

  // ❤️ LOCAL FAVORITE TOGGLE (WORKS WITHOUT BACKEND)
  const toggleFavoriteLocal = (movie) => {
    setFavoriteMovies((prev) => {
      const exists = prev.some((m) => m._id === movie._id);

      if (exists) {
        return prev.filter((m) => m._id !== movie._id);
      } else {
        return [...prev, movie];
      }
    });
  };

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  useEffect(() => {
    if (user?.id) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    } else {
      setIsAdmin(false);
      setFavoriteMovies([]);
      adminToastShown.current = false;
    }
  }, [user?.id, fetchIsAdmin, fetchFavoriteMovies]);

  const value = {
    axios,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoriteMovies,
    loading,
    fetchFavoriteMovies,
    fetchShows,
    fetchIsAdmin,
    toggleFavoriteLocal, // ❤️ IMPORTANT
    image_base_url,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};

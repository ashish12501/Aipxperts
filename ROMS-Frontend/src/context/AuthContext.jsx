import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { setUnauthorizedHandler } from "../api/axios.js";

const AuthContext = createContext(null);

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function normalizeUser(userData) {
  return {
    id: userData?.id || "",
    email: userData?.email || "",
    name: userData?.name || "Admin User",
    role: userData?.role || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get("api/auth/getMe");
      const userData = response?.data?.user;

      if (!userData) {
        setUser(null);
        return null;
      }

      const normalizedUser = normalizeUser(userData);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      if (error?.response?.status === 401) {
        setUser(null);
        return null;
      }

      throw error;
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    if (!user) {
      setMenuItems([]);
      return [];
    }

    setIsMenuLoading(true);

    try {
      const response = await api.get("api/menu/");
      const items = Array.isArray(response?.data?.menuItems)
        ? response.data.menuItems
        : [];

      setMenuItems(items);
      return items;
    } catch (error) {
      if (error?.response?.status === 401) {
        setMenuItems([]);
        return [];
      }

      throw error;
    } finally {
      setIsMenuLoading(false);
    }
  }, [user]);

  const prependMenuItem = useCallback((item) => {
    if (!item?._id) return;

    setMenuItems((previous) => {
      const exists = previous.some((menuItem) => menuItem._id === item._id);
      if (exists) {
        return previous.map((menuItem) => (menuItem._id === item._id ? item : menuItem));
      }

      return [item, ...previous];
    });
  }, []);

  const upsertMenuItem = useCallback((item) => {
    if (!item?._id) return;

    setMenuItems((previous) =>
      previous.some((menuItem) => menuItem._id === item._id)
        ? previous.map((menuItem) => (menuItem._id === item._id ? item : menuItem))
        : [item, ...previous]
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await fetchMe();
      } catch (error) {
        console.error("Error checking auth status:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchMe]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setMenuItems([]);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setMenuItems([]);
      setIsMenuLoading(false);
      return;
    }

    fetchMenuItems().catch((error) => {
      console.error("Error fetching menu items:", error);
    });
  }, [user, fetchMenuItems]);

  const login = useCallback(async ({ email, password }) => {
    try {
      await api.post("api/auth/login", { email, password });
      const me = await fetchMe();

      if (!me) {
        throw new Error("Unable to fetch authenticated user.");
      }

      return me;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [fetchMe]);

  const register = useCallback(async ({ name, email, password }) => {
    try {
      await api.post("api/auth/register", {
        name,
        email,
        password,
      });

      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("api/auth/logout");
    } catch {
      // Ignore logout API errors and clear frontend state anyway.
    } finally {
      setUser(null);
      setMenuItems([]);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      menuItems,
      isMenuLoading,
      login,
      register,
      fetchMe,
      fetchMenuItems,
      prependMenuItem,
      upsertMenuItem,
      logout,
    }),
    [
      user,
      isAuthLoading,
      menuItems,
      isMenuLoading,
      login,
      register,
      fetchMe,
      fetchMenuItems,
      prependMenuItem,
      upsertMenuItem,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}

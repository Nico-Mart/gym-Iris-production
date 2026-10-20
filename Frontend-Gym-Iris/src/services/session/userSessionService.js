const TOKEN_STORAGE_KEY = "gym_iris_token";
const USER_STORAGE_KEY = "user";

export const saveAuthSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  if (user) {
    const { token: _token, ...userData } = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }
};

export const saveUserSession = (user) => {
  const { token, ...userData } = user ?? {};
  saveAuthSession({ token, user: userData });
};

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const getUserSession = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const isAuthenticated = () =>
  Boolean(getAuthToken() || getUserSession());

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const clearUserSession = () => {
  clearAuthSession();
};

const USER_STORAGE_KEY = "user";

export const saveUserSession = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

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

export const clearUserSession = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

const STORAGE_KEY = "brainstorm_project_data";

export const persistence = {
  saveProject: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Failed to save project", e);
      return false;
    }
  },
  
  loadProject: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load project", e);
      return null;
    }
  },

  clearProject: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

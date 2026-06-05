import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Project } from "@/lib/types";

const noopStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => undefined,
  removeItem: (_key: string) => undefined,
};

interface ProjectsState {
  projects: Record<number, Project[]>;
  setProjects: (orgId: number, projects: Project[]) => void;
}

export const useProjects = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: {},
      setProjects: (orgId, projectsList) =>
        set((state) => ({
          projects: {
            ...state.projects,
            [orgId]: projectsList,
          },
        })),
    }),
    {
      name: "upblit-project-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);

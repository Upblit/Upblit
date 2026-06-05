import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Organization } from "@/lib/types";

const ACTIVE_ORG_KEY = "upblit_active_org_id";

const noopStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => undefined,
  removeItem: (_key: string) => undefined,
};

function readStoredActiveOrgId(): number | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ACTIVE_ORG_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface OrgState {
  orgs: Organization[];
  activeOrgId: number | null;
  hasHydratedActiveOrgId: boolean;
  setOrgs: (orgs: Organization[]) => void;
  setActiveOrgId: (id: number | null) => void;
  hydrateActiveOrgId: () => void;
}

export const useOrg = create<OrgState>()(
  persist(
    (set) => ({
      orgs: [],
      activeOrgId: null,
      hasHydratedActiveOrgId: false,
      setOrgs: (orgs) => set({ orgs }),
      setActiveOrgId: (id) => {
        if (typeof window !== "undefined") {
          if (id === null) {
            window.localStorage.removeItem(ACTIVE_ORG_KEY);
          } else {
            window.localStorage.setItem(ACTIVE_ORG_KEY, String(id));
          }
        }
        set({ activeOrgId: id });
      },
      hydrateActiveOrgId: () => {
        set((state) => {
          if (state.hasHydratedActiveOrgId) return state;
          return {
            activeOrgId: readStoredActiveOrgId(),
            hasHydratedActiveOrgId: true,
          };
        });
      },
    }),
    {
      name: "upblit-org-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      partialize: (state) => ({
        orgs: state.orgs,
        activeOrgId: state.activeOrgId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.hasHydratedActiveOrgId = true;
      },
    }
  )
);

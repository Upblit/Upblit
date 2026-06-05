import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

type User = {
    id?: number;
    sub?: string;
    username?: string;
    email?: string;
    avatar?: string;
    plan?: "PIRATES" | "SUPERNOVA" | "WARLORD";
    exp?: number;
};

type UserState = {
    user: User | null;
    accessToken: string | null;
    setToken: (token: string) => void;
    updateUser: (patch: Partial<Pick<User, "username" | "email" | "avatar" | "plan">> & { avatarUrl?: string }) => void;
    logout: () => void;
};

export const useUserData = create<UserState>((set) => ({
    user: null,
    accessToken: null,

    setToken: (token: string) => {
        try {
            const decodedRaw: any = jwtDecode(token);
            const plan = decodedRaw.plan ?? "PIRATES";
            const id = decodedRaw.id ?? (decodedRaw.sub ? Number(decodedRaw.sub) : undefined);
            const username = decodedRaw.username ?? decodedRaw.name;

            const decoded: User = {
                ...decodedRaw,
                id,
                username,
                plan,
            };

            set({
                accessToken: token,
                user: decoded,
            });
        } catch (e) {
            console.error("Invalid token");
            set({ user: null, accessToken: null });
        }
    },

    updateUser: (patch) => {
        set((state) => {
            if (!state.user) return state;

            return {
                user: {
                    ...state.user,
                    username: patch.username ?? state.user.username,
                    email: patch.email ?? state.user.email,
                    avatar: patch.avatar ?? patch.avatarUrl ?? state.user.avatar,
                    plan: patch.plan ?? state.user.plan,
                },
            };
        });
    },

    logout: () => set({ user: null, accessToken: null }),
}));

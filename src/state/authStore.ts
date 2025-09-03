import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "../types/construction";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, company?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: "1",
    email: "john.engineer@example.com",
    name: "John Smith",
    role: "engineer",
    company: "ABC Engineering",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2", 
    email: "sarah.contractor@example.com",
    name: "Sarah Johnson",
    role: "contractor",
    company: "Johnson Construction",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    email: "mike.pm@example.com", 
    name: "Mike Davis",
    role: "project_manager",
    company: "Davis Project Management",
    createdAt: new Date("2024-01-20"),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string, role: UserRole) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by email and role
        const user = mockUsers.find(u => u.email === email && u.role === role);
        
        if (user) {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email: string, _password: string, name: string, role: UserRole, company?: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          set({ isLoading: false });
          return false;
        }
        
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role,
          company,
          createdAt: new Date(),
        };
        
        mockUsers.push(newUser);
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          
          // Update in mock database
          const index = mockUsers.findIndex(u => u.id === user.id);
          if (index !== -1) {
            mockUsers[index] = updatedUser;
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
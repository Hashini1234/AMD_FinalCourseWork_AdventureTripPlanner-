import React, { createContext, useContext, useEffect, useMemo, useReducer, ReactNode } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  logout as logoutService,
  resetPassword as resetPasswordService,
  restoreSession,
  fetchUserProfile,
  mapAuthError,
} from '../services/authService';
import { updateUserProfile, UpdateProfileInput } from '../services/profileService';
import type { PublicUser, UserProfile } from '../types';

export type ActionResult = { success: true } | { success: false; error: string };

interface AuthState {
  user: PublicUser | null;
  profile: UserProfile | null;
  initializing: boolean; // true until the persisted session has been restored
  loading: boolean; // true during an in-flight login/register/logout action
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS'; payload: { user: PublicUser; profile: UserProfile | null } }
  | { type: 'RESTORE_SESSION'; payload: { user: PublicUser | null; profile: UserProfile | null } }
  | { type: 'LOGOUT' }
  | { type: 'PROFILE_UPDATED'; payload: UserProfile };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<ActionResult>;
  register: (name: string, email: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<ActionResult>;
  updateProfile: (input?: UpdateProfileInput) => Promise<ActionResult>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  profile: null,
  initializing: true,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, error: null, user: action.payload.user, profile: action.payload.profile };
    case 'RESTORE_SESSION':
      return {
        ...state,
        initializing: false,
        user: action.payload.user,
        profile: action.payload.profile,
      };
    case 'LOGOUT':
      return { ...state, user: null, profile: null, loading: false, error: null };
    case 'PROFILE_UPDATED':
      return {
        ...state,
        loading: false,
        error: null,
        profile: action.payload,
        user: state.user ? { ...state.user, displayName: action.payload.name } : state.user,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    restoreSession()
      .then((session) => {
        dispatch({ type: 'RESTORE_SESSION', payload: session || { user: null, profile: null } });
      })
      .catch(() => {
        dispatch({ type: 'RESTORE_SESSION', payload: { user: null, profile: null } });
      });
  }, []);

  const login = async (email: string, password: string): Promise<ActionResult> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await loginWithEmail(email, password);
      const profile = await fetchUserProfile(user.uid).catch(() => null);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, profile } });
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<ActionResult> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await registerWithEmail(name, email, password);
      const profile = await fetchUserProfile(user.uid).catch(() => null);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, profile } });
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    await logoutService();
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = async (email: string): Promise<ActionResult> => {
    dispatch({ type: 'AUTH_START' });
    try {
      await resetPasswordService(email);
      dispatch({ type: 'CLEAR_ERROR' });
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const updateProfile = async (input: UpdateProfileInput = {}): Promise<ActionResult> => {
    dispatch({ type: 'AUTH_START' });
    try {
      if (!state.user) throw new Error('Not signed in.');
      const updatedProfile = await updateUserProfile(state.user.uid, input);
      dispatch({ type: 'PROFILE_UPDATED', payload: updatedProfile });
      return { success: true };
    } catch (error) {
      const message = mapAuthError(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, resetPassword, updateProfile, clearError }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

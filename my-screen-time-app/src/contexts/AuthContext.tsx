import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from '../firebase'; // Corrected path

// Define AuthState interface
interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// Define AuthContextType interface
interface AuthContextType {
  authState: AuthState;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user, loading: false, error: null });
    }, (error) => {
      setAuthState({ user: null, loading: false, error });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignInAnonymously(auth);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  const signInWithGoogle = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  const signInWithApple = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  const signOutUser = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      // Auth state will be updated by onAuthStateChanged listener
      setAuthState({ user: null, loading: false, error: null }); // Explicitly clear user on sign out
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signInAnonymously, signInWithGoogle, signInWithApple, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create useAuth custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default admin account and check logged in user
  useEffect(() => {
    // Create default admin account if not exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    
    const adminExists = users.some((u: User) => u.email === 'admin@delhiwaterwatch.gov.in');
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin_default',
        name: 'System Administrator',
        email: 'admin@delhiwaterwatch.gov.in',
        role: 'admin',
        phone: '+91 11 2345 6789',
        createdAt: new Date().toISOString(),
      };
      
      const adminCred = {
        email: 'admin@delhiwaterwatch.gov.in',
        password: 'admin123',
        userId: 'admin_default',
      };
      
      users.push(adminUser);
      credentials.push(adminCred);
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('credentials', JSON.stringify(credentials));
      
      console.log('✅ Default admin account created');
      console.log('📧 Email: admin@delhiwaterwatch.gov.in');
      console.log('🔑 Password: admin123');
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (existingUsers.some((u: User) => u.email === data.email)) {
        toast.error('Email already registered!');
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        createdAt: new Date().toISOString(),
      };

      // Store user credentials (password hashed in real app)
      const credentials = {
        email: data.email,
        password: data.password, // In production: hash this!
        userId: newUser.id,
      };

      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      const existingCredentials = JSON.parse(localStorage.getItem('credentials') || '[]');
      existingCredentials.push(credentials);
      localStorage.setItem('credentials', JSON.stringify(existingCredentials));

      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const login = async (email: string, password: string, role: 'user' | 'admin'): Promise<boolean> => {
    try {
      // Get credentials
      const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
      const userCredential = credentials.find(
        (c: any) => c.email === email && c.password === password
      );

      if (!userCredential) {
        toast.error('Invalid email or password!');
        return false;
      }

      // Get user data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userData = users.find((u: User) => u.id === userCredential.userId);

      if (!userData) {
        toast.error('User not found!');
        return false;
      }

      // Check role
      if (userData.role !== role) {
        toast.error(`This account is not registered as ${role}!`);
        return false;
      }

      // Set current user
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully!');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Update in users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    toast.success('Profile updated successfully!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

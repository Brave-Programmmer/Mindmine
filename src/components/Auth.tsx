import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Auth: React.FC = () => {
  const { setUser, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser(
            firebaseUser.email || "",
            firebaseUser.displayName || "",
            true
          );

          // Redirect if on /login page and logged in
          if (window.location.pathname === "/login") {
            window.location.href = "/write";
          }
        } else {
          setUser("", "", false);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      if (isLogin) {
        // Login flow
        const userCredential = await toast.promise(
          signInWithEmailAndPassword(auth, email, password),
          {
            pending: "Logging in...",
            success: "Logged in successfully!",
            error: "Login failed. Check your credentials.",
          }
        );

        // Update Zustand store with fresh user data
        const currentUser = userCredential.user;
        await currentUser.reload(); // Reload to make sure latest data
        setUser(currentUser.email || "", currentUser.displayName || "", true);
      } else {
        // Signup flow
        const userCredential = await toast.promise(
          createUserWithEmailAndPassword(auth, email, password),
          {
            pending: "Creating account...",
            success: "Account created!",
            error: "Signup failed.",
          }
        );

        const currentUser = auth.currentUser; // <-- get currentUser here after signup

        if (currentUser && name.trim()) {
          await updateProfile(currentUser, { displayName: name.trim() });
          await currentUser.reload();

          // Now get the updated user from auth.currentUser
          const updatedUser = auth.currentUser;

          setUser(
            updatedUser?.email || "",
            updatedUser?.displayName || "",
            true
          );
        } else {
          setUser(
            currentUser?.email || "",
            currentUser?.displayName || "",
            true
          );
        }
      }

      // Delay redirect slightly so store and UI can update first
      setTimeout(() => {
        window.location.href = "/write";
      }, 1000);
    } catch (err: any) {
      const errorMessage = err?.message || "An error occurred";
      toast.error(
        errorMessage
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/\./g, "")
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosewood"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="text-center text-taupe p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosewood mx-auto mb-4"></div>
        <p className="text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in max-w-md mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-blush !text-taupe"
        progressClassName="!bg-gold"
      />

      <h2 className="text-3xl font-bold text-rosewood mb-8 text-center">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-taupe font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-taupe font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
            placeholder="Enter your email"
            required
            autoComplete="username"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-taupe font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
            placeholder="Enter your password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-rosewood text-white py-3 rounded-lg hover:bg-sienna transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-taupe">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-rosewood hover:text-sienna transition-colors font-medium"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export { Auth };

import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";

const Auth = () => {
  const { setUser, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser.email || "", true);
        if (window.location.pathname === "/login") {
          window.location.href = "/write";
        }
      } else {
        setUser("", false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      setUser(userCredential.user.email || "", true);
      window.location.href = "/write";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage.replace("Firebase: ", "").replace("auth/", ""));
    } finally {
      setLoading(false);
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
    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-rosewood mb-8 text-center">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
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
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-taupe font-medium mb-2">
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rosewood text-white py-3 rounded-lg hover:bg-sienna transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              {isLogin ? "Logging in..." : "Creating account..."}
            </span>
          ) : (
            isLogin ? "Login" : "Sign Up"
          )}
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

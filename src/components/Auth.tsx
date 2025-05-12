import { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-rosewood mb-6 text-center">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-taupe mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-taupe mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-rosewood text-white py-2 rounded-lg hover:bg-sienna transition-colors"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-center text-taupe">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-rosewood hover:text-sienna transition-colors"
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
} 
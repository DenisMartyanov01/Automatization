import { useState } from 'react';
import { Shield, X, Lock, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
}

export function LoginScreen({ onLogin, onClose }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 active:text-gray-800 p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-12">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <Shield className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-blue-900 mb-2 text-center">Emergency Nearby</h1>
            <p className="text-gray-600 text-center">Police Officer Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10 h-12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500">
              For authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

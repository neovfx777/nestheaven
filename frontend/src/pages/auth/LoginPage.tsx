import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../utils/validation';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm, FormInput } from '../../components/auth/AuthForm'; // <-- FIXED HERE
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear error when component mounts
  useEffect(() => {
    clearError();
    setFocus('email');
  }, [clearError, setFocus]);

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginUser(data);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the store
      console.error('Login error:', error);
    }
  };

  return (
    <AuthForm
      title="Sign in to your account"
      subtitle="Enter your credentials to access your dashboard"
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      footer={
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Register here
          </Link>
        </p>
      }
    >
      <FormInput
        label="Email address"
        type="email"
        name="email"
        value={undefined} // Controlled by react-hook-form
        onChange={() => {}} // Handled by react-hook-form
        error={errors.email?.message}
        placeholder="you@example.com"
        required
        {...register('email')}
      />

      <FormInput
        label="Password"
        type="password"
        name="password"
        value={undefined}
        onChange={() => {}}
        error={errors.password?.message}
        placeholder="••••••••"
        required
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </AuthForm>
  );
};

export default LoginPage;
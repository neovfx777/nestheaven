import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../utils/validation';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm, FormInput } from '../../components/auth/AuthForm';
import { useTranslation } from '../../hooks/useTranslation';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();
  
  const from = location.state?.from?.pathname || '/';

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
      title={t('auth.signIn')}
      subtitle={t('auth.signInSubtitle')}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      footer={
        <p className="text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.registerHere')}
          </Link>
        </p>
      }
    >
      <FormInput
        label={t('auth.emailAddress')}
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
        label={t('auth.password')}
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
            {t('auth.rememberMe')}
          </label>
        </div>

        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.forgotPassword')}
          </a>
        </div>
      </div>
    </AuthForm>
  );
};

export default LoginPage;
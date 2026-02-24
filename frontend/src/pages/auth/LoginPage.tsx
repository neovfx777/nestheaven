import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../utils/validation';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm, FormInput } from '../../components/auth/AuthForm';
import { useTranslation } from '../../hooks/useTranslation';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  
  const from = location.state?.from?.pathname || '/';
  const pendingEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

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

  useEffect(() => {
    const verifyState = searchParams.get('verifyEmail');
    const resetState = searchParams.get('reset');

    if (verifyState === 'pending') {
      setInfoMessage('Tasdiqlash xabari emailingizga yuborildi. Emailni tasdiqlang va keyin login qiling.');
      return;
    }

    if (verifyState === 'success') {
      setInfoMessage('Email muvaffaqiyatli tasdiqlandi. Endi tizimga kirishingiz mumkin.');
      return;
    }

    if (verifyState === 'failed') {
      setInfoMessage('Tasdiqlash linki yaroqsiz yoki muddati tugagan. Qayta yuboring.');
      return;
    }

    if (resetState === 'success') {
      setInfoMessage('Parol yangilandi. Endi yangi parol bilan kiring.');
      return;
    }

    setInfoMessage(null);
  }, [searchParams]);

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
      error={error || undefined}
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
      {infoMessage && (
        <div className="rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-700">{infoMessage}</p>
        </div>
      )}

      {pendingEmail && (
        <div className="rounded-md bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            Agar email kelmagan bo'lsa, shu email bilan login qilib ko'ring.
            Tasdiqlanmagan akkauntga kirishda havola avtomatik qayta yuboriladi.
          </p>
          <p className="mt-1 text-xs text-amber-700">Email: {pendingEmail}</p>
        </div>
      )}

      <FormInput
        label={t('auth.emailAddress')}
        type="email"
        error={errors.email?.message}
        placeholder="you@example.com"
        required
        {...register('email')}
      />

      <FormInput
        label={t('auth.password')}
        type="password"
        error={errors.password?.message}
        placeholder="********"
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
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </div>
    </AuthForm>
  );
};

export default LoginPage;

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '../../utils/validation';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm, FormInput } from '../../components/auth/AuthForm';
import { useTranslation } from '../../hooks/useTranslation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    },
  });

  const password = watch('password');

  // Clear error when component mounts
  useEffect(() => {
    clearError();
    setFocus('email');
  }, [clearError, setFocus]);

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await registerUser(data);
      if (result.requiresEmailVerification) {
        const email = encodeURIComponent(result.email || data.email);
        navigate(`/login?verifyEmail=pending&email=${email}`, { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the store
      console.error('Registration error:', error);
    }
  };

  return (
    <AuthForm
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error || undefined}
      footer={
        <p className="text-sm text-gray-600">
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.signInHere')}
          </Link>
        </p>
      }
    >
      <FormInput
        label={t('auth.fullName')}
        type="text"
        error={errors.fullName?.message}
        placeholder={t('form.placeholderName')}
        required
        {...register('fullName')}
      />

      <FormInput
        label={t('auth.emailAddress')}
        type="email"
        error={errors.email?.message}
        placeholder={t('form.placeholderEmail')}
        required
        {...register('email')}
      />

      <FormInput
        label={t('auth.phoneOptional')}
        type="tel"
        error={errors.phone?.message}
        placeholder={t('form.placeholderPhone')}
        {...register('phone')}
      />

      <FormInput
        label={t('auth.password')}
        type="password"
        error={errors.password?.message}
        placeholder="********"
        required
        {...register('password')}
      />

      <FormInput
        label={t('auth.confirmPassword')}
        type="password"
        error={errors.confirmPassword?.message}
        placeholder="********"
        required
        {...register('confirmPassword')}
      />

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">{t('form.passwordRequirements')}</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className={`flex items-center ${password?.length >= 8 ? 'text-green-600' : ''}`}>
            • {t('form.atLeast8Chars')}
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password || '') ? 'text-green-600' : ''}`}>
            • {t('form.oneUppercase')}
          </li>
          <li className={`flex items-center ${/[a-z]/.test(password || '') ? 'text-green-600' : ''}`}>
            • {t('form.oneLowercase')}
          </li>
          <li className={`flex items-center ${/[0-9]/.test(password || '') ? 'text-green-600' : ''}`}>
            • {t('form.oneNumber')}
          </li>
        </ul>
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
          {t('form.agreeTerms')}{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            {t('form.termsOfService')}
          </a>{' '}
          {t('form.and')}{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            {t('form.privacyPolicy')}
          </a>
        </label>
      </div>
    </AuthForm>
  );
};

export default RegisterPage;

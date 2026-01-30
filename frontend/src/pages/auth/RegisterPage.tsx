import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '../../utils/validation';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm,  FormInput } from '../../components/auth/AuthForm';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading, error, clearError } = useAuthStore();

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
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the store
      console.error('Registration error:', error);
    }
  };

  return (
    <AuthForm
      title="Create your account"
      subtitle="Join NestHeaven to find your perfect apartment"
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      footer={
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      }
    >
      <FormInput
        label="Full Name"
        type="text"
        name="fullName"
        value={undefined}
        onChange={() => {}}
        error={errors.fullName?.message}
        placeholder="John Doe"
        required
        {...register('fullName')}
      />

      <FormInput
        label="Email address"
        type="email"
        name="email"
        value={undefined}
        onChange={() => {}}
        error={errors.email?.message}
        placeholder="you@example.com"
        required
        {...register('email')}
      />

      <FormInput
        label="Phone Number (optional)"
        type="tel"
        name="phone"
        value={undefined}
        onChange={() => {}}
        error={errors.phone?.message}
        placeholder="+998 90 123 45 67"
        {...register('phone')}
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

      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={undefined}
        onChange={() => {}}
        error={errors.confirmPassword?.message}
        placeholder="••••••••"
        required
        {...register('confirmPassword')}
      />

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className={`flex items-center ${password?.length >= 8 ? 'text-green-600' : ''}`}>
            • At least 8 characters
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password || '') ? 'text-green-600' : ''}`}>
            • One uppercase letter
          </li>
          <li className={`flex items-center ${/[a-z]/.test(password || '') ? 'text-green-600' : ''}`}>
            • One lowercase letter
          </li>
          <li className={`flex items-center ${/[0-9]/.test(password || '') ? 'text-green-600' : ''}`}>
            • One number
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
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </label>
      </div>
    </AuthForm>
  );
};

export default RegisterPage;
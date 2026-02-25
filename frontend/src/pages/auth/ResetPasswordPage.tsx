import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmPasswordReset } from 'firebase/auth';
import { AuthForm, FormInput } from '../../components/auth/AuthForm';
import { firebaseAuth } from '../../lib/firebase';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetInput = z.infer<typeof resetSchema>;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams]);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetInput) => {
    if (!oobCode) {
      setError('Reset link yaroqsiz yoki muddati tugagan.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await confirmPasswordReset(firebaseAuth, oobCode, data.password);
      setMessage('Parol muvaffaqiyatli yangilandi. Login qiling.');
      setTimeout(() => {
        navigate('/login?reset=success', { replace: true });
      }, 800);
    } catch (submitError: any) {
      const msg =
        submitError?.response?.data?.message ||
        submitError?.message ||
        'Parolni yangilab bo`lmadi.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Yangi parol o'rnatish"
      subtitle="Yangi parol kiriting va tasdiqlang."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error || undefined}
      footer={
        <p className="text-sm text-gray-600">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Login sahifasiga qaytish
          </Link>
        </p>
      }
    >
      {message && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      <FormInput
        label="Yangi parol"
        type="password"
        error={errors.password?.message}
        placeholder="********"
        required
        {...register('password')}
      />

      <FormInput
        label="Parolni tasdiqlang"
        type="password"
        error={errors.confirmPassword?.message}
        placeholder="********"
        required
        {...register('confirmPassword')}
      />
    </AuthForm>
  );
};

export default ResetPasswordPage;

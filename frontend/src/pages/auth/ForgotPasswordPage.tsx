import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AuthForm, FormInput } from '../../components/auth/AuthForm';
import { firebaseAuth } from '../../lib/firebase';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotInput = z.infer<typeof forgotSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordResetEmail(firebaseAuth, data.email.trim());
      setMessage('Agar email mavjud bo`lsa, reset link yuborildi.');
    } catch (submitError: any) {
      const msg =
        submitError?.message ||
        'Reset xabarini yuborib bo`lmadi.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Parolni tiklash"
      subtitle="Email kiriting. Sizga parolni yangilash havolasi yuboramiz."
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
        label="Email manzil"
        type="email"
        error={errors.email?.message}
        placeholder="you@example.com"
        required
        {...register('email')}
      />
    </AuthForm>
  );
};

export default ForgotPasswordPage;

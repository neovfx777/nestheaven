import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { firebaseAuth } from '../../lib/firebase';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Email tasdiqlanmoqda...');
  const navigate = useNavigate();
  const loginTarget = status === 'success' ? '/login?verifyEmail=success' : '/login?verifyEmail=failed';

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      setMessage('Tasdiqlash linki yaroqsiz.');
      return;
    }

    let mounted = true;

    applyActionCode(firebaseAuth, oobCode)
      .then(() => {
        if (!mounted) return;
        setStatus('success');
        setMessage('Email tasdiqlandi.');
        setTimeout(() => {
          navigate('/login?verifyEmail=success', { replace: true });
        }, 900);
      })
      .catch((error) => {
        if (!mounted) return;
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Tasdiqlash linki yaroqsiz yoki muddati tugagan.';
        setStatus('error');
        setMessage(msg);
      });

    return () => {
      mounted = false;
    };
  }, [oobCode, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Email Verification</h1>
        <p className="mt-3 text-sm text-gray-700">{message}</p>

        {status !== 'loading' && (
          <div className="mt-4">
            <Link to={loginTarget} className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Login sahifasiga o'tish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyMagicLinkToken } from '@/lib/auth/magic-link';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';

interface VerifyPageProps {
  searchParams: {
    token?: string;
  };
}

const ErrorState = ({ message }: { message: string }) => (
  <main className='min-h-screen flex items-center justify-center bg-white px-4'>
    <div className='max-w-md w-full text-center space-y-6'>
      <h1 className='text-2xl font-semibold text-gray-900'>
        Link tidak dapat dipakai
      </h1>
      <p className='text-gray-600'>{message}</p>
      <div className='flex flex-col gap-3'>
        <Link
          href='/auth/login'
          className='inline-flex justify-center rounded-lg bg-[#01959F] px-4 py-2 text-white font-medium hover:bg-[#017f86] transition'
        >
          Minta link baru
        </Link>
        <Link
          href='/'
          className='inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition'
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  </main>
);

const tokenErrorMessage = (
  reason: 'invalid_token' | 'expired' | 'already_used'
) => {
  switch (reason) {
    case 'expired':
      return 'Link ini sudah kedaluwarsa. Silakan minta link baru.';
    case 'already_used':
      return 'Link ini sudah dipakai. Minta link baru untuk melanjutkan.';
    default:
      return 'Kami tidak bisa memproses link ini. Silakan minta link baru.';
  }
};

const VerifyMagicLinkPage = async ({ searchParams }: VerifyPageProps) => {
  const token = searchParams?.token;
  if (!token) {
    return <ErrorState message='Token tidak ditemukan.' />;
  }

  const result = await verifyMagicLinkToken(token);

  if (!result.ok) {
    return <ErrorState message={tokenErrorMessage(result.reason)} />;
  }

  const sessionToken = createSessionToken(result.user);
  setSessionCookie(sessionToken);

  redirect(result.redirectTo ?? '/user');
};

export default VerifyMagicLinkPage;

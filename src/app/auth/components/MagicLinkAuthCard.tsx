'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineCheck } from 'react-icons/ai';
import { FiAlertTriangle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Rakamin from '@/app/components/atom/Rakamin';
import Input from './Input';
import {
  findCredential,
  upsertCredential,
} from '@/lib/auth/localCredentials';

type MagicLinkMode = 'login' | 'register';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const REGISTERED_EMAILS_KEY = 'rakamin_registered_emails';

const readRegisteredEmails = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REGISTERED_EMAILS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((email) => String(email).toLowerCase())
      : [];
  } catch (error) {
    console.warn('Failed to read registered emails from localStorage', error);
    return [];
  }
};

const persistRegisteredEmail = (email: string) => {
  if (typeof window === 'undefined') return;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const current = new Set(readRegisteredEmails());
  current.add(normalized);
  window.localStorage.setItem(
    REGISTERED_EMAILS_KEY,
    JSON.stringify(Array.from(current))
  );
};

const COPY: Record<
  MagicLinkMode,
  {
    title: string;
    switchText: string;
    switchLabel: string;
    switchHref: string;
    buttonLabel: string;
    googleLabel: string;
  }
> = {
  login: {
    title: 'Masuk ke Rakamin',
    switchText: 'Belum punya akun?',
    switchLabel: 'Daftar',
    switchHref: '/auth/register',
    buttonLabel: 'Masuk dengan Email',
    googleLabel: 'Masuk dengan Google',
  },
  register: {
    title: 'Bergabung dengan Rakamin',
    switchText: 'Sudah punya akun?',
    switchLabel: 'Masuk',
    switchHref: '/auth/login',
    buttonLabel: 'Daftar dengan Email',
    googleLabel: 'Daftar dengan Google',
  },
};

const MagicLinkAuthCard = ({ mode }: { mode: MagicLinkMode }) => {
  const copy = COPY[mode];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [successMessage, setSuccessMessage] = useState<React.ReactNode>(null);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectTarget = useMemo(() => {
    const requested = searchParams?.get('redirect') ?? undefined;
    if (!requested) return '/user';
    return requested.startsWith('/') ? requested : '/user';
  }, [searchParams]);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    const alreadyRegistered = findCredential(normalizedEmail) !== null;
    if (alreadyRegistered) {
      setState('error');
      setSuccessMessage(null);
      setErrorMessage(
        <span>
          Email ini sudah terdaftar sebagai akun di Rakamin Academy.{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`}
            className='font-medium underline'
          >
            Masuk
          </Link>
        </span>
      );
      return;
    }

    setState('loading');
    setSuccessMessage(null);
    setErrorMessage(null);

    upsertCredential(normalizedEmail, password);
    persistRegisteredEmail(normalizedEmail);

    try {
      await fetch('/api/auth/register-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
    } catch (error) {
      console.warn('Failed to sync credential with server storage', error);
    }

    setState('success');
    setSuccessMessage('Registrasi berhasil. Mengalihkan ke halaman login...');
    setTimeout(() => {
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }, 1200);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = findCredential(normalizedEmail);

    if (!credential || credential.password !== password) {
      setState('error');
      setSuccessMessage(null);
      setErrorMessage('Email atau kata sandi tidak cocok.');
      return;
    }

    setState('loading');
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/email-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const reason = payload?.message ?? 'Tidak dapat membuat sesi login.';
        setState('error');
        setErrorMessage(reason);
        return;
      }

      persistRegisteredEmail(normalizedEmail);
      setState('success');
      setSuccessMessage('Login berhasil. Mengalihkan...');
      router.push(redirectTarget);
    } catch (error) {
      console.error('Failed to establish email session', error);
      setState('error');
      setErrorMessage('Terjadi kesalahan saat login. Coba lagi.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setState('error');
      setErrorMessage('Masukkan alamat email terlebih dahulu.');
      setSuccessMessage(null);
      return;
    }

    if (!password.trim()) {
      setState('error');
      setErrorMessage('Masukkan kata sandi.');
      setSuccessMessage(null);
      return;
    }

    if (mode === 'register') {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const isLoading = state === 'loading';

  return (
    <div className='flex flex-col'>
      <Rakamin className='py-5' />
      <form
        onSubmit={handleSubmit}
        className='px-8 py-10 rounded-lg shadow-md w-[500px] bg-white '
      >
        <div className='mb-6 text-start '>
          <div className='flex flex-col gap-2 '>
            <h1 className='text-xl font-semibold text-gray-800'>{copy.title}</h1>
            <p className='text-sm text-gray-500 mt-1'>
              {copy.switchText}{' '}
              <Link
                href={copy.switchHref}
                className='text-[#01959F] font-medium cursor-pointer hover:underline'
              >
                {copy.switchLabel}
              </Link>
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='text-sm '>
            <Input
              htmlFor='email'
              id='email'
              typeinput='email'
              label='Alamat Email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              autoComplete='email'
            />
          </div>
          <div className='text-sm '>
            <Input
              htmlFor='password'
              id='password'
              typeinput='password'
              label='Kata sandi'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {state === 'success' && successMessage ? (
            <div className='flex justify-start items-center gap-2 text-sm text-green-700 rounded'>
              <AiOutlineCheck className='text-lg' /> {successMessage}
            </div>
          ) : null}
          {state === 'error' && errorMessage ? (
            <div className='flex justify-start items-center gap-2 text-sm text-red-700 rounded'>
              <FiAlertTriangle className='text-lg' /> {errorMessage}
            </div>
          ) : null}

          <div className='w-full'>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#FBC037] py-3 rounded-lg text-black font-medium hover:bg-[#e5ab2f] transition-all disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Mengirim...' : copy.buttonLabel}
            </button>
          </div>
        </div>

        <div className='flex items-center gap-2 text-gray-500 pt-6 pb-2'>
          <hr className='grow border-t border-gray-300 ' />
          <span className='text-sm'>or</span>
          <hr className='grow border-t border-gray-300 ' />
        </div>

        <div className='flex flex-col gap-3 pt-2 text-sm'>
          <button
            type='button'
            className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
          >
            <FcGoogle className='text-xl' />
            {copy.googleLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MagicLinkAuthCard;

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineCheck } from 'react-icons/ai';
import { FiAlertTriangle, FiLink } from 'react-icons/fi';
import Rakamin from '@/app/components/atom/Rakamin';
import Input from './Input';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

type StoredCredential = {
  password: string;
  createdAt: string;
  updatedAt: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CREDENTIALS_STORAGE_KEY = 'rakamin_credentials';
const SESSION_STORAGE_KEY = 'rakamin_credentials_session';

const safeNow = () => new Date().toISOString();

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const readCredentialStore = (): Record<string, StoredCredential> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(
      parsed as Record<string, StoredCredential | undefined>
    ).reduce((acc, [key, entry]) => {
      if (!entry || typeof entry.password !== 'string') return acc;

      const normalizedKey = normalizeEmail(key);
      const createdAt =
        typeof entry.createdAt === 'string' && entry.createdAt
          ? entry.createdAt
          : safeNow();
      const updatedAt =
        typeof entry.updatedAt === 'string' && entry.updatedAt
          ? entry.updatedAt
          : createdAt;

      acc[normalizedKey] = {
        password: entry.password,
        createdAt,
        updatedAt,
      };
      return acc;
    }, {} as Record<string, StoredCredential>);
  } catch (error) {
    console.warn('Failed to read credentials from localStorage', error);
    return {};
  }
};

const persistCredentialStore = (payload: Record<string, StoredCredential>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(payload));
};

const persistSession = (email: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ email, loginAt: safeNow() })
  );
};

const COPY = {
  title: 'Masuk ke Rakamin',
  switchText: 'Belum punya akun?',
  switchLabel: 'Daftar',
  switchHref: '/auth/register',
  buttonLabel: 'Masuk dengan Email & Password',
  magicLinkLabel: 'Masuk dengan Magic Link',
};

const CredentialsAuthCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [successMessage, setSuccessMessage] = useState<React.ReactNode>(null);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(null);

  const redirectTarget = useMemo(() => {
    const requested = searchParams?.get('redirect') ?? undefined;
    if (!requested) return '/user';
    return requested.startsWith('/') ? requested : '/user';
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    if (!normalizedEmail) {
      setState('error');
      setSuccessMessage(null);
      setErrorMessage('Masukkan alamat email terlebih dahulu.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setState('error');
      setSuccessMessage(null);
      setErrorMessage('Alamat email tidak valid.');
      return;
    }

    if (!trimmedPassword) {
      setState('error');
      setSuccessMessage(null);
      setErrorMessage('Masukkan kata sandi terlebih dahulu.');
      return;
    }

    let credentialStore: Record<string, StoredCredential> = {};
    let existingCredential: StoredCredential | undefined;

    if (typeof window !== 'undefined') {
      credentialStore = readCredentialStore();
      existingCredential = credentialStore[normalizedEmail];

      if (
        existingCredential &&
        existingCredential.password !== trimmedPassword
      ) {
        setState('error');
        setSuccessMessage(null);
        setErrorMessage('Password tidak cocok dengan akun ini.');
        return;
      }
    }

    const isNewCredential = !existingCredential;

    setState('loading');
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (typeof window !== 'undefined') {
        const now = safeNow();
        credentialStore[normalizedEmail] = {
          password: trimmedPassword,
          createdAt: existingCredential?.createdAt ?? now,
          updatedAt: now,
        };
        persistCredentialStore(credentialStore);
        persistSession(normalizedEmail);
      }

      const response = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: trimmedPassword,
          redirectTo: redirectTarget,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        const reason =
          payload?.message ?? 'Tidak bisa masuk saat ini. Coba lagi.';
        setState('error');
        setErrorMessage(reason);
        return;
      }

      const successText = isNewCredential
        ? 'Akun baru dibuat dan kamu sudah masuk. Mengarahkan ke dashboard...'
        : 'Login berhasil. Mengarahkan ke dashboard...';
      setState('success');
      setSuccessMessage(successText);

      const target =
        typeof payload.redirectTo === 'string' &&
        payload.redirectTo.startsWith('/')
          ? payload.redirectTo
          : redirectTarget;

      router.push(target);
      router.refresh();
    } catch (error) {
      console.error('Failed to log in with credentials', error);
      setState('error');
      setErrorMessage('Terjadi kesalahan. Coba lagi dalam beberapa saat.');
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
            <h1 className='text-xl font-semibold text-gray-800'>
              {COPY.title}
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              {COPY.switchText}{' '}
              <Link
                href={COPY.switchHref}
                className='text-[#01959F] font-medium cursor-pointer hover:underline'
              >
                {COPY.switchLabel}
              </Link>
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='text-sm '>
            <Input
              htmlFor='credential-email'
              id='credential-email'
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
              htmlFor='credential-password'
              id='credential-password'
              typeinput='password'
              label='Password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete='current-password'
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
              className='w-full bg-[#FBC037] py-3 rounded-lg  font-medium hover:bg-[#017f86] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-black'
            >
              {isLoading ? 'Memproses...' : COPY.buttonLabel}
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
            onClick={() => {
              const target = `/auth/login/magic-link?redirect=${encodeURIComponent(
                redirectTarget
              )}`;
              router.push(target);
            }}
            className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
          >
            <FiLink className='text-lg' />
            {COPY.magicLinkLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CredentialsAuthCard;

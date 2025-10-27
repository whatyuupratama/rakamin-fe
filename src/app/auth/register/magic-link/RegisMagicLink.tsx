'use client';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoIosKey } from 'react-icons/io';
import Rakamin from '@/app/components/atom/Rakamin';
import { useState } from 'react';
import Input from '../../components/Input';
import { AiOutlineCheck } from 'react-icons/ai';
import { FiAlertTriangle } from 'react-icons/fi';
import LInk from 'next/link';
const allowedEmails = ['wahyufiver.id@gmail.com'];

async function checkEmailInDb(
  email: string
): Promise<{ found: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const found = allowedEmails.includes(email.toLowerCase().trim());
  return {
    found,
    message: found ? 'Alamat email teridentikasi' : 'Alamat email tidak valid',
  };
}
const RegisMagicLink = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [submitByEnter, setSubmitByEnter] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('masukan alamat email');
      return;
    }
    setLoading(true);
    try {
      const res = await checkEmailInDb(email);
      if (res.found) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch {
      setEmail('kesalahan harap ulangi lagi');
    } finally {
      setLoading(false);
      // setSubmitByEnter(false);
    }
  };

  return (
    <div className='flex flex-col'>
      <Rakamin className='py-5' />
      <form
        onSubmit={handleSubmit}
        className='px-8 py-10 rounded-lg shadow-md w-[500px] bg-white '
      >
        <div className='mb-6 text-start '>
          <div className='flex flex-col gap-2 '>
            {' '}
            <h1 className='text-xl font-semibold text-gray-800'>
              Bergabung dengan Rakamin
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Sudah punya akun?{' '}
              <span className='text-[#01959F] font-medium cursor-pointer hover:underline'>
                Masuk
              </span>
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {success && (
            <div className='flex justify-start items-center gap-2 text-sm text-green-700 rounded'>
              <AiOutlineCheck className='text-lg' /> {success}
            </div>
          )}
          {error && (
            <div className='flex justify-start items-center gap-2 text-sm text-red-700 rounded'>
              <FiAlertTriangle className='text-lg' /> {error}
            </div>
          )}

          <div className='w-full'>
            <LInk href={'/user'}>
              {' '}
              <button
                type='submit'
                className='w-full bg-[#FBC037] py-3 rounded-lg text-black font-medium hover:bg-[#e5ab2f] transition-all'
              >
                Daftar dengan Email
              </button>
            </LInk>
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
            Daftar dengan Google
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisMagicLink;

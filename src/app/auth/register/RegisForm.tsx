import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoIosKey } from 'react-icons/io';
import Rakamin from '@/app/components/atom/Rakamin';
import { MdOutlineMailOutline } from 'react-icons/md';
import Input from '../components/Input';
import Link from 'next/link';
const RegisForm = () => {
  return (
    <div className='flex flex-col'>
      <Rakamin className='py-5' />
      <div className='px-8 py-10 rounded-lg shadow-md w-[500px] bg-white '>
        <div className='mb-6 text-start '>
          <div className='flex flex-col gap-2'>
            {' '}
            <h1 className='text-xl font-semibold text-gray-800'>
              Bergabung dengan Rakamin
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Sudah punya akun?{' '}
              <Link
                href={'/user'}
                className='text-[#01959F] font-medium cursor-pointer hover:underline'
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>

        <div className='text-sm flex flex-col gap-2 mb-4'>
          <Input
            htmlFor='email'
            id='email'
            typeinput='email'
            label='Alamat Email'
          />
          <Input
            htmlFor='email'
            id='email'
            typeinput='password'
            label='Kata sandi'
          />
        </div>

        <div className='w-full'>
          <button
            type='submit'
            className='w-full bg-[#FBC037] py-2 rounded-lg text-black font-medium hover:bg-[#e5ab2f] transition-all'
          >
            Daftar dengan Email
          </button>
        </div>

        <div className='flex items-center gap-2 text-gray-500 pt-6 pb-2'>
          <hr className='grow border-t border-gray-300 ' />
          <span className='text-sm'>or</span>
          <hr className='grow border-t border-gray-300 ' />
        </div>

        <div className='flex flex-col gap-3 pt-2 text-sm'>
          <Link href={'/auth/register/magic-link'}>
            <button
              type='button'
              className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
            >
              <MdOutlineMailOutline className='text-xl' />
              Kirim link melalui email
            </button>
          </Link>
          <button
            type='button'
            className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
          >
            <FcGoogle className='text-xl' />
            Daftar dengan Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisForm;

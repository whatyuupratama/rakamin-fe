import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoIosKey } from 'react-icons/io';
import Rakamin from '@/app/components/atom/Rakamin';
const Page = () => {
  return (
    <div className='min-h-screen flex justify-center items-center bg-white-50'>
      <div className='flex flex-col'>
        <Rakamin className='py-5' />
        <div className='px-8 py-10 rounded-lg shadow-md w-[500px] bg-white '>
          {/* Header */}
          <div className='mb-6 text-start'>
            <h1 className='text-lg font-semibold text-gray-800'>
              Masuk ke Rakamin
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Belum punya akun?{' '}
              <span className='text-[#01959F] font-medium cursor-pointer hover:underline'>
                Daftar menggunakan email
              </span>
            </p>
          </div>

          <div className='text-sm mb-4'>
            <label htmlFor='email' className='block mb-2 text-gray-700'>
              Alamat Email
            </label>
            <input
              id='email'
              type='email'
              required
              className='w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500'
            />
          </div>

          {/* Tombol kirim link */}
          <div className='w-full'>
            <button
              type='submit'
              className='w-full bg-[#FBC037] py-2 rounded-lg text-black font-medium hover:bg-[#e5ab2f] transition-all'
            >
              Kirim Link
            </button>
          </div>

          {/* Divider */}
          <div className='flex items-center gap-2 text-gray-500 pt-6 pb-2'>
            <hr className='grow border-t border-gray-300 border-dashed' />
            <span className='text-sm'>or</span>
            <hr className='grow border-t border-gray-300 border-dashed' />
          </div>

          {/* Tombol tambahan */}
          <div className='flex flex-col gap-3 pt-2 text-sm'>
            {/* <button
              type='button'
              className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
            >
              <IoIosKey className='text-lg' />
              Masuk dengan Kata Sandi
            </button> */}

            <button
              type='button'
              className='w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-all'
            >
              <FcGoogle className='text-xl' />
              Masuk dengan Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

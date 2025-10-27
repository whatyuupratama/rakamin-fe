import React from 'react';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { IoIosSearch } from 'react-icons/io';

const Page = () => {
  return (
    <div className='min-h-[70vh]'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Top search bar */}
        <div className='mb-8'>
          <div className='max-w-3xl'>
            <div className='relative'>
              <Input placeholder='Search by job details' />
              <IoIosSearch />
            </div>
          </div>
        </div>

        <div className='flex items-start gap-8'>
          {/* Main empty state */}
          <div className='flex-1 flex flex-col items-center py-20'>
            <Image
              src='/iconadmin.png'
              alt='empty'
              width={300}
              height={220}
            ></Image>

            <h3 className='text-lg font-semibold mt-6'>
              No job openings available
            </h3>
            <p className='text-muted-foreground max-w-md text-center mt-2'>
              Create a job opening now and start the candidate process.
            </p>

            <Link href='/admin/create-job'>
              <Button className='mt-6 bg-[#FBC037] text-black' size='lg'>
                Create a new job
              </Button>
            </Link>
          </div>

          {/* Right-side promo card */}
          <div className='w-[320px] hidden lg:block '>
            <Card className='sticky top-8 bg-[url(/user.jpeg)]  bg-no-repeat bg-center bg-cover'>
              <CardContent>
                <div className='flex flex-col items-start gap-4 '>
                  <div className='flex-1'>
                    <div className='font-semibold'>
                      Recruit the best candidates
                    </div>
                    <div className='text-sm text-muted-foreground mt-1'>
                      Create jobs, invite, and hire with ease
                    </div>
                  </div>
                  <div className='shrink-0 '>
                    <Link href='/admin/create-job'>
                      <Button className='bg-[#01959F]' size='sm'>
                        Create a new job
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

'use client';

import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarIcon, Camera, Search, ChevronDown } from 'lucide-react';
import { INDONESIAN_DISTRICTS, COUNTRY_CODES } from '@/lib/data';
import { cn } from '@/lib/utils';
import CameraCaptureModal from './camera-modal';
import SubmitSuccess from '@/components/SubmitSuccess';
import { useRouter } from 'next/navigation';
export default function ApplicationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: undefined as Date | undefined,
    gender: '',
    domicile: '',
    countryCode: '+62',
    phoneNumber: '',
    email: '',
    linkedinUrl: '',
    photoProfile: null as string | null,
  });

  const STORAGE_KEY = 'applicationFormData';
  const APPLICATIONS_KEY = 'applications';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('Loaded applicationFormData from localStorage:', parsed);

        try {
          const appsRaw = localStorage.getItem(APPLICATIONS_KEY);
          if (appsRaw)
            console.log(
              'Existing applications in localStorage:',
              JSON.parse(appsRaw)
            );
        } catch (e) {
          console.error(
            'Failed to read existing applications from localStorage',
            e
          );
        }

        if (parsed.dateOfBirth)
          parsed.dateOfBirth = new Date(parsed.dateOfBirth);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } else {
        const example = {
          fullName: 'Budi Santoso',
          dateOfBirth: new Date(1995, 0, 15).toISOString(),
          gender: 'male',
          domicile: 'Jakarta Selatan',
          countryCode: '+62',
          phoneNumber: '81234567890',
          email: 'budi.santoso@example.com',
          linkedinUrl: 'https://linkedin.com/in/budisantoso',
          photoProfile: null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(example));
        console.log(
          'No applicationFormData found — seeded example data:',
          example
        );

        // convert date back to Date before setting state
        const parsed = {
          ...example,
          dateOfBirth: new Date(example.dateOfBirth),
        };
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error(
        'Failed to load/seed applicationFormData from localStorage',
        e
      );
    }
  }, []);

  useEffect(() => {
    try {
      const copy = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString()
          : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
      console.log('Saved applicationFormData to localStorage:', copy);
    } catch (e) {
      console.error('Failed to save applicationFormData to localStorage', e);
    }
  }, [formData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [domicileSearch, setDomicileSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showDomicileDropdown, setShowDomicileDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const filteredDistricts = useMemo(() => {
    return INDONESIAN_DISTRICTS.filter((district) =>
      district.toLowerCase().includes(domicileSearch.toLowerCase())
    );
  }, [domicileSearch]);

  const filteredCountries = useMemo(() => {
    return COUNTRY_CODES.filter(
      (country) =>
        country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.code.includes(countrySearch)
    );
  }, [countrySearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setFormData((prev) => ({ ...prev, photoProfile: imageData }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.domicile) newErrors.domicile = 'Domicile is required';
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.linkedinUrl.trim())
      newErrors.linkedinUrl = 'LinkedIn URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // append submitted form to applications array in localStorage
      try {
        const entry = {
          ...formData,
          dateOfBirth: formData.dateOfBirth
            ? formData.dateOfBirth.toISOString()
            : null,
          submittedAt: new Date().toISOString(),
        };

        const appsRaw = localStorage.getItem(APPLICATIONS_KEY);
        const apps = appsRaw ? (JSON.parse(appsRaw) as any[]) : [];
        const updated = [...apps, entry];
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
        console.log('Saved applications to localStorage:', updated);
      } catch (e) {
        console.error('Failed to save application to localStorage', e);
      }

      // show success screen instead of alert
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/user');
      }, 3000);

      // reset form to empty/default values after successful submit
      const emptyForm = {
        fullName: '',
        dateOfBirth: undefined as Date | undefined,
        gender: '',
        domicile: '',
        countryCode: '+62',
        phoneNumber: '',
        email: '',
        linkedinUrl: '',
        photoProfile: null as string | null,
      };
      setFormData(emptyForm);
      console.log('Form cleared after submit; draft updated in localStorage');
    }
  };

  const selectedCountry = COUNTRY_CODES.find(
    (c) => c.code === formData.countryCode
  );

  return (
    <div className='min-h-screen bg-background'>
      {/* center container: full viewport height to allow internal scrolling */}
      <div className='max-w-3xl mx-auto px-4 py-6 h-screen flex flex-col'>
        <Card className='p-8 flex-1 flex flex-col overflow-hidden'>
          <div className='flex items-center gap-4 mb-4'>
            <button className='text-muted-foreground hover:text-foreground'>
              ← Back
            </button>
            <h1 className='text-2xl font-bold'>Apply Front End at Rakamin</h1>
            <span className='ml-auto text-sm text-muted-foreground'>
              This field required to fill
            </span>
          </div>

          {/* Scrollable content area inside the card (cap height so content doesn't push submit out of view) */}
          <div
            className='flex-1 overflow-y-auto pr-2'
            style={{ maxHeight: 'calc(100vh - 260px)' }}
          >
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Photo Profile Section */}
              <div>
                <Label className='text-red-500'>* Required</Label>
                <div className='mt-4 space-y-4'>
                  <div className='flex justify-start'>
                    <div className='w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden'>
                      {formData.photoProfile ? (
                        <img
                          src={formData.photoProfile || '/placeholder.svg'}
                          alt='Profile'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='text-blue-400'>
                          <Camera className='w-8 h-8' />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='shadow inline-block w-fit py-2 px-4 rounded-lg border'>
                    <button
                      type='button'
                      onClick={() => setShowCameraModal(true)}
                      className='flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-600'
                    >
                      <Camera className='w-4 h-4' />
                      <span>Take a Picture</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor='fullName' className='text-sm font-medium'>
                  Full name<span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='fullName'
                  name='fullName'
                  placeholder='Enter your full name'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className='text-red-500 text-sm mt-1'>{errors.fullName}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <Label className='text-sm font-medium'>
                  Date of birth<span className='text-red-500'>*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.dateOfBirth && 'text-muted-foreground',
                        errors.dateOfBirth && 'border-red-500'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.dateOfBirth
                        ? format(formData.dateOfBirth, 'PPP', {
                            locale: idLocale,
                          })
                        : 'Select date of birth'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={formData.dateOfBirth}
                      onSelect={handleDateChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={idLocale}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <Label className='text-sm font-medium'>
                  Pronoun (gender)<span className='text-red-500'>*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <div className='flex items-center gap-6 mt-2'>
                    <div className='flex items-center gap-2 '>
                      <RadioGroupItem
                        value='female'
                        id='female'
                        style={{ accentColor: '#01959F' }}
                        className='h-4 w-4'
                      />
                      <Label
                        htmlFor='female'
                        className='font-normal cursor-pointer '
                      >
                        She/her (Female)
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='male' id='male' />
                      <Label
                        htmlFor='male'
                        className='font-normal cursor-pointer'
                      >
                        He/him (Male)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                {errors.gender && (
                  <p className='text-red-500 text-sm mt-1'>{errors.gender}</p>
                )}
              </div>

              {/* Domicile with Search */}
              <div>
                <Label htmlFor='domicile' className='text-sm font-medium'>
                  Domicile<span className='text-red-500'>*</span>
                </Label>
                <div className='relative mt-2'>
                  <button
                    type='button'
                    onClick={() =>
                      setShowDomicileDropdown(!showDomicileDropdown)
                    }
                    className={cn(
                      'w-full px-3 py-2 text-left border rounded-md flex items-center justify-between bg-white',
                      errors.domicile ? 'border-red-500' : 'border-input'
                    )}
                  >
                    <span
                      className={
                        formData.domicile
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {formData.domicile || 'Choose your domicile'}
                    </span>
                    <ChevronDown className='w-4 h-4' />
                  </button>

                  {showDomicileDropdown && (
                    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50'>
                      <div className='p-3 border-b'>
                        <div className='relative'>
                          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input
                            placeholder='Search'
                            value={domicileSearch}
                            onChange={(e) => setDomicileSearch(e.target.value)}
                            className='pl-8 h-9'
                          />
                        </div>
                      </div>

                      <div className='max-h-60 overflow-y-auto'>
                        {filteredDistricts.length > 0 ? (
                          filteredDistricts.map((district) => (
                            <button
                              key={district}
                              type='button'
                              onClick={() => {
                                handleSelectChange('domicile', district);
                                setShowDomicileDropdown(false);
                                setDomicileSearch('');
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2 hover:bg-accent',
                                formData.domicile === district && 'bg-accent'
                              )}
                            >
                              {district}
                            </button>
                          ))
                        ) : (
                          <div className='px-3 py-2 text-muted-foreground text-sm'>
                            No results found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.domicile && (
                  <p className='text-red-500 text-sm mt-1'>{errors.domicile}</p>
                )}
              </div>

              {/* Phone Number with Searchable Country Code */}
              <div>
                <Label className='text-sm font-medium'>
                  Phone number<span className='text-red-500'>*</span>
                </Label>
                <div className='flex gap-2 mt-2'>
                  <div className='relative w-36'>
                    <button
                      type='button'
                      onClick={() =>
                        setShowCountryDropdown(!showCountryDropdown)
                      }
                      className='w-full px-3 py-2 border border-input rounded-md flex items-center justify-between bg-white'
                    >
                      <span className='text-sm'>
                        {selectedCountry?.flag} {selectedCountry?.code}
                      </span>
                      <ChevronDown className='w-4 h-4' />
                    </button>

                    {showCountryDropdown && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50'>
                        <div className='p-3 border-b'>
                          <div className='relative'>
                            <Search className='absolute left-2 top-2.5 h-5 w-5 text-muted-foreground' />
                            <Input
                              placeholder='Search'
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className='pl-8 h-9'
                            />
                          </div>
                        </div>

                        <div className='max-h-60 overflow-y-auto'>
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type='button'
                                onClick={() => {
                                  handleSelectChange(
                                    'countryCode',
                                    country.code
                                  );
                                  setShowCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between',
                                  formData.countryCode === country.code &&
                                    'bg-accent'
                                )}
                              >
                                <span className='flex items-center gap-2'>
                                  <span>{country.flag}</span>
                                  <span className='text-sm'>
                                    {country.country}
                                  </span>
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                  {country.code}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className='px-3 py-2 text-muted-foreground text-sm'>
                              No results found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    name='phoneNumber'
                    placeholder='81XXXXXXXXX'
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={cn(
                      'flex-1 rounded-lg py-3 px-4 text-lg',
                      errors.phoneNumber && 'border-red-500'
                    )}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Email<span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Enter your email address'
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div>
                <Label htmlFor='linkedinUrl' className='text-sm font-medium'>
                  Link LinkedIn<span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='linkedinUrl'
                  name='linkedinUrl'
                  placeholder='https://linkedin.com/in/username'
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className={errors.linkedinUrl ? 'border-red-500' : ''}
                />
                {errors.linkedinUrl && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.linkedinUrl}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className='bg-white px-2 rounded-lg'>
            <Button
              onClick={handleSubmit}
              className='w-full bg-[#01959F]  text-white py-6 text-lg shadow-lg rounded-xl hover:bg-[#01959F]/80'
            >
              Submit
            </Button>
          </div>
        </Card>
      </div>
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />
      {showSuccess && <SubmitSuccess onClose={() => setShowSuccess(false)} />}
    </div>
  );
}

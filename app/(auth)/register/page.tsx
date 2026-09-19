'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';

import {
  ArrowLeft,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  House,
  LockKeyhole,
  MapPin,
  Phone,
  UserRound,
  X,
} from 'lucide-react';

type ToastType = {
  type: 'success' | 'error';
  message: string;
};

export default function RegisterPage() {
  const [namaNasabah, setNamaNasabah] = useState('');
  const [username, setUsername] = useState('');
  const [telp, setTelp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    console.log('REGISTER DIKLIK');

    setToast(null);

    if (
      !namaNasabah ||
      !username ||
      !telp ||
      !alamat ||
      !password
    ) {
      setToast({
        type: 'error',
        message: 'Semua data wajib diisi.',
      });

      return;
    }

    const payload = {
      username,
      password,
      role: 'nasabah',
      nama_nasabah: namaNasabah,
      alamat,
      telp,
    };

    console.log('PAYLOAD REGISTER:', payload);

    try {
      setLoading(true);

      const response = await fetch(
         `${API_URL}/auth/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(payload),
        }
      );

      console.log('STATUS:', response.status);

      const result = await response.json();

      console.log('RESPONSE BACKEND:', result);

      if (!response.ok) {
        const message = Array.isArray(result.message)
          ? result.message.join(', ')
          : result.message;

        setToast({
          type: 'error',
          message:
            message ||
            'Registrasi gagal. Silakan coba lagi.',
        });

        return;
      }

      setToast({
        type: 'success',
        message:
          result.message ||
          'Registrasi nasabah berhasil!',
      });

      setNamaNasabah('');
      setUsername('');
      setTelp('');
      setAlamat('');
      setPassword('');

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('ERROR REGISTER:', error);

      setToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Tidak dapat terhubung ke server.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        relative
        min-h-screen
        bg-[#F7F9F8]
        px-4
        py-5
        sm:px-6
        lg:px-8
        lg:py-6
      "
    >
      {/* =====================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div
          className="
            fixed
            left-1/2
            top-6
            z-[99999]
            w-[calc(100%-32px)]
            max-w-[430px]
            -translate-x-1/2
          "
        >
          <div
            className={`
              flex
              items-start
              gap-3
              rounded-[18px]
              border
              bg-white
              px-4
              py-4
              shadow-[0_16px_45px_rgba(15,23,42,0.12)]
              ${
                toast.type === 'success'
                  ? 'border-green-200'
                  : 'border-red-200'
              }
            `}
          >
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  toast.type === 'success'
                    ? 'bg-[#F0FDF4] text-[#16A34A]'
                    : 'bg-red-50 text-red-500'
                }
              `}
            >
              {toast.type === 'success' ? (
                <Check
                  size={19}
                  strokeWidth={2.2}
                />
              ) : (
                <CircleAlert
                  size={19}
                  strokeWidth={2}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-[13px]
                  font-semibold
                  ${
                    toast.type === 'success'
                      ? 'text-[#166534]'
                      : 'text-red-600'
                  }
                `}
              >
                {toast.type === 'success'
                  ? 'Registrasi Berhasil'
                  : 'Registrasi Gagal'}
              </p>

              <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-[#94A3B8]
                transition
                hover:bg-[#F8FAFC]
                hover:text-[#334155]
              "
              aria-label="Tutup notifikasi"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          REGISTER CARD
      ====================================================== */}

      <div
        className="
          register-page-card
          mx-auto
          grid
          min-h-[calc(100vh-48px)]
          max-w-[1380px]
          overflow-hidden
          rounded-[26px]
          border
          border-[#E5E7EB]
          bg-white
          shadow-[0_18px_50px_rgba(31,41,55,0.07)]
          lg:grid-cols-[0.96fr_1.04fr]
        "
      >
        {/* ===================================================
            LEFT — COVER
        ==================================================== */}

        <section
          className="
            relative
            hidden
            min-h-[760px]
            overflow-hidden
            bg-[#14532D]
            lg:block
          "
        >
          <Image
            src="/images/ecova/cover1.png"
            alt="ECOVA - Satu Setoran untuk Hari Esok yang Lebih Baik"
            fill
            priority
            sizes="(min-width:1024px) 48vw, 0px"
            className="
              register-cover-image
              object-cover
              object-top
            "
          />
        </section>

        {/* ===================================================
            RIGHT — REGISTER FORM
        ==================================================== */}

        <section
          className="
            register-form-panel
            flex
            items-center
            justify-center
            px-6
            py-8
            sm:px-9
            lg:px-12
            xl:px-14
          "
        >
          <div className="w-full max-w-[500px]">

            {/* MOBILE LOGO */}

            <Link
              href="/"
              className="
                mb-8
                block
                w-fit
                lg:hidden
              "
            >
              <Image
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                width={145}
                height={42}
                priority
              />
            </Link>

            {/* =================================================
                HEADING
            ================================================== */}

            <div className="register-animate register-delay-1">
              <p
                className="
                  text-[12px]
                  font-semibold
                  text-[#16A34A]
                "
              >
                Create Account
              </p>

              <h1
                className="
                  mt-1.5
                  text-[30px]
                  font-bold
                  tracking-[-0.03em]
                  text-[#1F2937]
                  sm:text-[34px]
                "
              >
                Buat Akun Nasabah
              </h1>

              <p
                className="
                  mt-2
                  text-[13px]
                  leading-5
                  text-[#64748B]
                "
              >
                Lengkapi data berikut untuk mulai
                menggunakan ECOVA.
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleRegister}
              className="
                register-animate
                register-delay-2
                mt-6
                space-y-3.5
              "
            >
              {/* NAMA NASABAH */}

              <div>
                <label
                  htmlFor="namaNasabah"
                  className="
                    mb-1.5
                    block
                    text-[12px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Nama Nasabah
                </label>

                <div className="relative">
                  <UserRound
                    size={16}
                    strokeWidth={1.9}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                    "
                  />

                  <input
                    id="namaNasabah"
                    type="text"
                    value={namaNasabah}
                    onChange={(e) =>
                      setNamaNasabah(e.target.value)
                    }
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    className="
                      h-[46px]
                      w-full
                      rounded-[12px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-4
                      text-[13px]
                      text-[#1F2937]
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-[#94A3B8]
                      hover:border-[#CBD5E1]
                      focus:border-[#22C55E]
                      focus:ring-4
                      focus:ring-[#22C55E]/10
                    "
                  />
                </div>
              </div>

              {/* USERNAME */}

              <div>
                <label
                  htmlFor="username"
                  className="
                    mb-1.5
                    block
                    text-[12px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={16}
                    strokeWidth={1.9}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                    "
                  />

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    placeholder="Buat username"
                    autoComplete="username"
                    className="
                      h-[46px]
                      w-full
                      rounded-[12px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-4
                      text-[13px]
                      text-[#1F2937]
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-[#94A3B8]
                      hover:border-[#CBD5E1]
                      focus:border-[#22C55E]
                      focus:ring-4
                      focus:ring-[#22C55E]/10
                    "
                  />
                </div>
              </div>

              {/* NOMOR TELEPON */}

              <div>
                <label
                  htmlFor="telp"
                  className="
                    mb-1.5
                    block
                    text-[12px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Nomor Telepon
                </label>

                <div className="relative">
                  <Phone
                    size={16}
                    strokeWidth={1.9}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                    "
                  />

                  <input
                    id="telp"
                    type="tel"
                    value={telp}
                    onChange={(e) =>
                      setTelp(e.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    className="
                      h-[46px]
                      w-full
                      rounded-[12px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-4
                      text-[13px]
                      text-[#1F2937]
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-[#94A3B8]
                      hover:border-[#CBD5E1]
                      focus:border-[#22C55E]
                      focus:ring-4
                      focus:ring-[#22C55E]/10
                    "
                  />
                </div>
              </div>

              {/* ALAMAT */}

              <div>
                <label
                  htmlFor="alamat"
                  className="
                    mb-1.5
                    block
                    text-[12px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Alamat
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    strokeWidth={1.9}
                    className="
                      absolute
                      left-4
                      top-[15px]
                      text-[#94A3B8]
                    "
                  />

                  <textarea
                    id="alamat"
                    rows={2}
                    value={alamat}
                    onChange={(e) =>
                      setAlamat(e.target.value)
                    }
                    placeholder="Masukkan alamat lengkap"
                    autoComplete="street-address"
                    className="
                      min-h-[64px]
                      w-full
                      resize-none
                      rounded-[12px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      py-3
                      pl-11
                      pr-4
                      text-[13px]
                      leading-5
                      text-[#1F2937]
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-[#94A3B8]
                      hover:border-[#CBD5E1]
                      focus:border-[#22C55E]
                      focus:ring-4
                      focus:ring-[#22C55E]/10
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="
                    mb-1.5
                    block
                    text-[12px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={16}
                    strokeWidth={1.9}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#94A3B8]
                    "
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Masukkan password"
                    autoComplete="new-password"
                    className="
                      h-[46px]
                      w-full
                      rounded-[12px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-11
                      text-[13px]
                      text-[#1F2937]
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-[#94A3B8]
                      hover:border-[#CBD5E1]
                      focus:border-[#22C55E]
                      focus:ring-4
                      focus:ring-[#22C55E]/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      flex
                      -translate-y-1/2
                      items-center
                      justify-center
                      text-[#94A3B8]
                      transition
                      hover:text-[#475569]
                    "
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={16}
                        strokeWidth={1.9}
                      />
                    ) : (
                      <Eye
                        size={16}
                        strokeWidth={1.9}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-1
                  flex
                  h-[47px]
                  w-full
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-[#16A34A]
                  px-5
                  text-[13px]
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#15803D]
                  active:translate-y-0
                  focus:outline-none
                  focus:ring-4
                  focus:ring-[#22C55E]/15
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  disabled:hover:translate-y-0
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                      "
                    />

                    Mendaftarkan...
                  </span>
                ) : (
                  'Buat Akun ECOVA'
                )}
              </button>
            </form>

            {/* =================================================
                LOGIN LINK
            ================================================== */}

            <p
              className="
                register-animate
                register-delay-3
                mt-5
                text-center
                text-[12px]
                text-[#64748B]
              "
            >
              Sudah punya akun?{' '}

              <Link
                href="/login"
                className="
                  font-semibold
                  text-[#16A34A]
                  transition
                  hover:text-[#14532D]
                "
              >
                Masuk di sini
              </Link>
            </p>

            {/* =================================================
                BACK
            ================================================== */}

            <div
              className="
                register-animate
                register-delay-4
                mt-5
                text-center
              "
            >
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-[12px]
                  font-medium
                  text-[#64748B]
                  transition
                  hover:-translate-x-[2px]
                  hover:text-[#14532D]
                "
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.9}
                />

                Kembali ke homepage
              </Link>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
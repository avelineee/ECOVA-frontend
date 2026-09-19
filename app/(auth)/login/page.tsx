'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

import {
  ArrowLeft,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  X,
} from 'lucide-react';

type ToastType = {
  type: 'success' | 'error';
  message: string;
};

type LoginResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    user: {
      id: number;
      username: string;
      role: string;
    };
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setToast(null);

    if (!username || !password) {
      setToast({
        type: 'error',
        message: 'Username dan password wajib diisi.',
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
          `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result: LoginResponse =
        await response.json();

      console.log('LOGIN RESPONSE:', result);

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        setToast({
          type: 'error',
          message:
            result.message ||
            'Username atau password salah.',
        });

        return;
      }

      const { access_token, user } = result.data;

      // Simpan token JWT
      localStorage.setItem(
        'access_token',
        access_token
      );

      // Simpan informasi user
      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

      setToast({
        type: 'success',
        message: `Selamat datang, ${user.username}!`,
      });

      // Redirect berdasarkan role
      setTimeout(() => {
        const role = user.role.toLowerCase();

        console.log('ROLE LOGIN:', role);

        if (role === 'admin_bank') {
          router.push('/admin/dashboard');
        } else if (role === 'nasabah') {
          router.push('/nasabah/dashboard');
        } else {
          console.log(
            'ROLE TIDAK DIKENALI:',
            role
          );

          setToast({
            type: 'error',
            message: `Role "${role}" tidak dikenali.`,
          });
        }
      }, 1500);
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      setToast({
        type: 'error',
        message:
          'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.',
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
        py-4
        sm:px-6
        lg:px-8
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
                  ? 'Login Berhasil'
                  : 'Login Gagal'}
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
          LOGIN CONTAINER
      ====================================================== */}

      <div
        className="
          login-page-card
          mx-auto
          grid
          min-h-[calc(100vh-32px)]
          max-w-[1440px]
          overflow-hidden
          rounded-[28px]
          border
          border-[#E5E7EB]
          bg-white
          shadow-[0_20px_60px_rgba(31,41,55,0.07)]
          lg:grid-cols-[1fr_1fr]
        "
      >
        {/* ===================================================
            LEFT — ECOVA COVER
        ==================================================== */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-[#14532D]
            lg:block
          "
        >
          <Image
            src="/images/ecova/cover.png"
            alt="ECOVA - Satu Langkah Kecil untuk Lingkungan yang Lebih Baik"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="
              login-cover-image
              object-cover
              object-top
            "
          />
        </section>

        {/* ===================================================
            RIGHT FORM
        ==================================================== */}

        <section
          className="
            login-form-panel
            flex
            items-center
            justify-center
            px-6
            py-10
            sm:px-10
            lg:px-14
            xl:px-16
          "
        >
          <div
            className="
              login-form-content
              w-full
              max-w-[450px]
            "
          >
            {/* MOBILE LOGO */}

            <Link
              href="/"
              className="
                mb-10
                block
                w-fit
                lg:hidden
              "
            >
              <Image
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                width={150}
                height={44}
                priority
              />
            </Link>

            {/* =================================================
                HEADING
            ================================================== */}

            <div className="login-animate login-delay-1">
              <p className="text-[13px] font-semibold text-[#16A34A]">
                Welcome back
              </p>

              <h2
                className="
                  mt-2.5
                  text-[34px]
                  font-bold
                  tracking-[-0.035em]
                  text-[#1F2937]
                  sm:text-[38px]
                "
              >
                Masuk ke ECOVA
              </h2>

              <p
                className="
                  mt-3
                  max-w-[420px]
                  text-[14px]
                  leading-6
                  text-[#64748B]
                "
              >
                Masukkan username dan password
                untuk melanjutkan aktivitasmu.
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleLogin}
              className="
                login-animate
                login-delay-2
                mt-8
                space-y-5
              "
            >
              {/* USERNAME */}

              <div>
                <label
                  htmlFor="username"
                  className="
                    mb-2
                    block
                    text-[13px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
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
                    placeholder="Masukkan username"
                    autoComplete="username"
                    className="
                      h-[52px]
                      w-full
                      rounded-[13px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-4
                      text-[14px]
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
                    mb-2
                    block
                    text-[13px]
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
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
                    autoComplete="current-password"
                    className="
                      h-[52px]
                      w-full
                      rounded-[13px]
                      border
                      border-[#E2E8F0]
                      bg-white
                      pl-11
                      pr-12
                      text-[14px]
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
                        size={17}
                        strokeWidth={1.9}
                      />
                    ) : (
                      <Eye
                        size={17}
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
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-[#16A34A]
                  px-5
                  text-[14px]
                  font-semibold
                  text-white
                  shadow-[0_8px_20px_rgba(22,163,74,0.12)]
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#15803D]
                  hover:shadow-[0_10px_24px_rgba(22,163,74,0.18)]
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

                    Memproses...
                  </span>
                ) : (
                  'Masuk ke ECOVA'
                )}
              </button>
            </form>

            {/* =================================================
                REGISTER
            ================================================== */}

            <p
              className="
                login-animate
                login-delay-3
                mt-6
                text-center
                text-[13px]
                text-[#64748B]
              "
            >
              Belum punya akun?{' '}

              <Link
                href="/register"
                className="
                  font-semibold
                  text-[#16A34A]
                  transition
                  hover:text-[#14532D]
                "
              >
                Daftar sekarang
              </Link>
            </p>

            {/* =================================================
                DIVIDER
            ================================================== */}

            <div
              className="
                login-animate
                login-delay-4
                my-6
                flex
                items-center
                gap-4
              "
            >
              <div className="h-px flex-1 bg-[#EEF2F0]" />

              <span className="text-[10px] text-[#CBD5E1]">
                ECOVA
              </span>

              <div className="h-px flex-1 bg-[#EEF2F0]" />
            </div>

            {/* =================================================
                BACK
            ================================================== */}

            <div
              className="
                login-animate
                login-delay-5
                text-center
              "
            >
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-[13px]
                  font-medium
                  text-[#64748B]
                  transition
                  hover:-translate-x-[2px]
                  hover:text-[#14532D]
                "
              >
                <ArrowLeft
                  size={15}
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
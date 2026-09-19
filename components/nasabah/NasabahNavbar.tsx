'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type NasabahNavbarProps = {
  namaNasabah: string;
  foto?: string | null;
};

const API_URL = 'http://localhost:3000';

const getFotoUrl = (foto?: string | null) => {
  if (!foto) return null;

  if (
    foto.startsWith('http://') ||
    foto.startsWith('https://')
  ) {
    return foto;
  }

  if (foto.startsWith('/uploads/')) {
    return `${API_URL}${foto}`;
  }

  return null;
};

const menuItems = [
  {
    name: 'Dashboard',
    href: '/nasabah/dashboard',
  },
  {
    name: 'Setor Sampah',
    href: '/nasabah/setor',
  },
  {
    name: 'Riwayat',
    href: '/nasabah/riwayat',
  },
  {
    name: 'Hadiah',
    href: '/nasabah/hadiah',
  },
  {
    name: 'Penukaran',
    href: '/nasabah/penukaran',
  },
];

export default function NasabahNavbar({
  namaNasabah,
  foto,
}: NasabahNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const fotoUrl = getFotoUrl(foto);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">

      {/* ================= DESKTOP / MAIN NAVBAR ================= */}

      <div className="mx-auto h-[76px] max-w-[1440px] px-5 sm:px-6 lg:px-8">

        <div className="relative flex h-full items-center justify-between">

          {/* ================= LOGO ================= */}

          <Link
            href="/nasabah/dashboard"
            className="z-10 shrink-0"
          >
            <Image
              src="/images/ecova/logo_ecova.png"
              alt="ECOVA"
              width={165}
              height={48}
              priority
              className="h-auto w-[145px] lg:w-[160px]"
            />
          </Link>

          {/* ================= DESKTOP MENU ================= */}

          <nav
            className="
              absolute
              left-1/2
              top-1/2
              hidden
              -translate-x-1/2
              -translate-y-1/2
              items-center
              gap-1
              lg:flex
            "
          >
            {menuItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    whitespace-nowrap
                    rounded-full
                    px-4
                    py-2.5
                    text-[14px]
                    transition
                    ${
                      active
                        ? 'bg-[#F0FDF4] font-semibold text-[#16A34A]'
                        : 'font-medium text-[#475569] hover:bg-[#F8FAF9] hover:text-[#16A34A]'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* ================= RIGHT SIDE ================= */}

          <div className="z-10 ml-auto flex items-center gap-3">

            {/* USER NAME */}

            <div className="hidden text-right sm:block">
              <p className="max-w-[150px] truncate text-sm font-semibold text-[#1F2937]">
                {namaNasabah}
              </p>

              <p className="text-xs text-[#94A3B8]">
                Nasabah ECOVA
              </p>
            </div>

            {/* PROFILE */}

            <Link
              href="/nasabah/profile"
              className={`
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                font-bold
                transition

                ${
                  pathname === '/nasabah/profile'
                    ? 'border-[#22C55E] bg-[#DCFCE7] text-[#16A34A]'
                    : 'border-transparent bg-[#DCFCE7] text-[#16A34A] hover:border-[#86EFAC]'
                }
              `}
              title="Profile"
            >
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={namaNasabah}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {namaNasabah
                    ?.charAt(0)
                    .toUpperCase() || 'N'}
                </span>
              )}
            </Link>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                hidden
                rounded-xl
                border
                border-[#E5E7EB]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-[#475569]
                transition
                hover:border-red-100
                hover:bg-red-50
                hover:text-red-600
                sm:block
              "
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* ================= MOBILE MENU ================= */}

      <div className="overflow-x-auto border-t border-[#F1F5F9] bg-white lg:hidden">

        <nav className="mx-auto flex min-w-max items-center gap-1 px-5 py-2">

          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  whitespace-nowrap
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  transition

                  ${
                    active
                      ? 'bg-[#F0FDF4] font-semibold text-[#16A34A]'
                      : 'font-medium text-[#64748B]'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}

        </nav>

      </div>

    </header>
  );
}
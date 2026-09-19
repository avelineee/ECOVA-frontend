'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const menuItems = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Our Impact', id: 'impact' },
  { name: 'How It Works', id: 'how-it-works' },
  { name: 'Categories', id: 'categories' },
  { name: 'Rewards', id: 'rewards' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 76;

      // Posisi pembacaan section.
      // Dibuat agak ke bawah dari navbar supaya perpindahan
      // active menu terasa natural.
      const checkPoint = navbarHeight + 180;

      let currentSection = 'home';

      menuItems.forEach((item) => {
        const section = document.getElementById(item.id);

        if (!section) return;

        const rect = section.getBoundingClientRect();

        if (rect.top <= checkPoint) {
          currentSection = item.id;
        }
      });

      // Jika sudah benar-benar sampai bawah halaman,
      // aktifkan section terakhir.
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

      if (isBottom) {
        const lastExistingSection = [...menuItems]
          .reverse()
          .find((item) => document.getElementById(item.id));

        if (lastExistingSection) {
          currentSection = lastExistingSection.id;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
  };

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-[#E5E7EB] bg-white">
      <div className="relative mx-auto flex h-[76px] w-full max-w-[1440px] items-center px-5 sm:px-6 lg:px-8">

        {/* ================= LOGO ================= */}
        <a
          href="#home"
          onClick={() => handleNavClick('home')}
          className="shrink-0"
        >
          <Image
            src="/images/ecova/logo_ecova.png"
            alt="ECOVA"
            width={180}
            height={52}
            priority
            className="h-auto w-[145px] lg:w-[170px]"
          />
        </a>


        {/* ================= DESKTOP NAV ================= */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`
                  rounded-full
                  px-5
                  py-2.5
                  text-[14px]
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? 'bg-[#F0FDF4] font-semibold text-[#16A34A]'
                      : 'font-medium text-[#1F2937] hover:bg-[#F8FAF9] hover:text-[#16A34A]'
                  }
                `}
              >
                {item.name}
              </a>
            );
          })}
        </nav>


        {/* ================= DESKTOP RIGHT ================= */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-[14px] font-semibold text-[#16A34A] transition-colors hover:text-[#14532D]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#16A34A] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#14532D]"
          >
            Get Started
          </Link>
        </div>


        {/* ================= MOBILE ================= */}
        <div className="relative z-[10000] ml-auto flex items-center gap-4 lg:hidden">

          <Link
            href="/login"
            className="text-[15px] font-semibold text-[#16A34A]"
          >
            Login
          </Link>

          <details className="group relative">

            {/* HAMBURGER BUTTON */}
            <summary
              className="
                flex
                h-12
                w-12
                cursor-pointer
                list-none
                items-center
                justify-center
                rounded-full
                border
                border-[#E5E7EB]
                bg-white
                text-[#1F2937]
                [&::-webkit-details-marker]:hidden
              "
            >
              {/* HAMBURGER */}
              <svg
                className="block group-open:hidden"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7H20" />
                <path d="M4 12H20" />
                <path d="M4 17H20" />
              </svg>

              {/* CLOSE */}
              <svg
                className="hidden group-open:block"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6L18 18" />
              </svg>
            </summary>


            {/* ================= MOBILE DROPDOWN ================= */}
            <div className="fixed left-0 top-[76px] z-[9999] w-full border-t border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

              <nav className="flex flex-col gap-1 px-5 py-5 sm:px-6">

                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        w-full
                        rounded-xl
                        px-4
                        py-3.5
                        text-left
                        text-[15px]
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? 'bg-[#F0FDF4] font-semibold text-[#16A34A]'
                            : 'font-medium text-[#1F2937] hover:bg-[#F8FAF9] hover:text-[#16A34A]'
                        }
                      `}
                    >
                      {item.name}
                    </a>
                  );
                })}


                {/* GET STARTED */}
                <div className="mt-3 border-t border-[#E5E7EB] pt-4">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center rounded-full bg-[#16A34A] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#14532D]"
                  >
                    Get Started
                  </Link>
                </div>

              </nav>
            </div>

          </details>
        </div>

      </div>
    </header>
  );
}
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useState,
} from 'react';
import {
  usePathname,
  useRouter,
} from 'next/navigation';
import {
  ArrowLeftRight,
  CalendarClock,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Recycle,
  Users,
} from 'lucide-react';

const API_URL = 'http://localhost:3000';

type AdminSidebarProps = {
  namaPengelola: string;
  namaUnit: string;
  foto?: string | null;
};

/*
============================================
MENU SIDEBAR
============================================
*/

const menuGroups = [
  {
    label: null,
    items: [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: 'MASTER DATA',
    items: [
      {
        name: 'Data Nasabah',
        href: '/admin/users',
        icon: Users,
      },
      {
        name: 'Kategori Sampah',
        href: '/admin/kategori',
        icon: Recycle,
      },
      {
        name: 'Daftar Hadiah',
        href: '/admin/hadiah',
        icon: Gift,
      },
    ],
  },

  {
    label: 'TRANSAKSI',
    items: [
      {
        name: 'Setoran',
        href: '/admin/setoran',
        icon: PackageCheck,
      },
      {
        name: 'Jadwal Penjemputan',
        href: '/admin/jadwal-penjemputan',
        icon: CalendarClock,
      },
      {
        name: 'Penukaran Hadiah',
        href: '/admin/penukaran',
        icon: ArrowLeftRight,
      },
    ],
  },

  {
    label: 'LAPORAN',
    items: [
      {
        name: 'Rekap',
        href: '/admin/rekap',
        icon: ClipboardList,
      },
    ],
  },
];

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

export default function AdminSidebar({
  namaPengelola,
  namaUnit,
  foto,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] =
    useState(false);

  const fotoUrl = getFotoUrl(foto);

  /*
  ============================================
  LOAD SIDEBAR STATE
  ============================================
  */

  useEffect(() => {
    const savedState =
      localStorage.getItem(
        'ecova_admin_sidebar_collapsed'
      );

    const isCollapsed =
      savedState === 'true';

    setCollapsed(isCollapsed);

    document.documentElement.style.setProperty(
      '--admin-sidebar-width',
      isCollapsed ? '80px' : '260px'
    );
  }, []);

  /*
  ============================================
  UPDATE SIDEBAR WIDTH
  ============================================
  */

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--admin-sidebar-width',
      collapsed ? '80px' : '260px'
    );

    localStorage.setItem(
      'ecova_admin_sidebar_collapsed',
      String(collapsed)
    );
  }, [collapsed]);

  /*
  ============================================
  LOGOUT
  ============================================
  */

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    router.replace('/login');
  };

  /*
  ============================================
  DESKTOP
  ============================================
  */

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-50
          hidden h-screen flex-col
          border-r border-[#E5E7EB]
          bg-white
          transition-all duration-300 ease-in-out
          lg:flex
          ${
            collapsed
              ? 'w-[80px]'
              : 'w-[260px]'
          }
        `}
      >
        {/* ================= LOGO ================= */}

        <div
          className={`
            relative flex h-[82px]
            shrink-0 items-center
            border-b border-[#F1F5F9]
            transition-all duration-300
            ${
              collapsed
                ? 'justify-center px-2'
                : 'px-6'
            }
          `}
        >
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center"
          >
            {collapsed ? (
              <div
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  bg-[#F0F7F2]
                  text-lg font-bold
                  text-[#14532D]
                "
              >
                E
              </div>
            ) : (
              <Image
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                width={150}
                height={44}
                priority
                className="
                  h-auto w-[140px]
                  transition-all duration-300
                "
              />
            )}
          </Link>

          {/* TOGGLE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setCollapsed((prev) => !prev)
            }
            title={
              collapsed
                ? 'Perbesar sidebar'
                : 'Perkecil sidebar'
            }
            aria-label={
              collapsed
                ? 'Perbesar sidebar'
                : 'Perkecil sidebar'
            }
            className={`
              absolute top-1/2
              flex h-8 w-8
              -translate-y-1/2
              items-center justify-center
              rounded-lg
              border border-[#E5E7EB]
              bg-white
              text-[#64748B]
              shadow-sm
              transition-all duration-300
              hover:border-[#BBF7D0]
              hover:bg-[#F0FDF4]
              hover:text-[#166534]
              ${
                collapsed
                  ? '-right-4'
                  : 'right-3'
              }
            `}
          >
            <span
              className={`
                inline-block
                text-base
                transition-transform
                duration-300
                ${
                  collapsed
                    ? 'rotate-180'
                    : ''
                }
              `}
            >
              ‹
            </span>
          </button>
        </div>

        {/* ================= ADMIN LABEL ================= */}

        <div
          className={`
            overflow-hidden
            transition-all duration-300
            ${
              collapsed
                ? 'h-5 px-0 pb-0 pt-5'
                : 'px-6 pb-2 pt-6'
            }
          `}
        >
          {!collapsed && (
            <p
              className="
                whitespace-nowrap
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-[#94A3B8]
              "
            >
              Admin Bank
            </p>
          )}
        </div>

        {/* ================= MENU ================= */}

        <nav
          className={`
            flex-1
            overflow-x-hidden
            overflow-y-auto
            transition-all duration-300
            ${
              collapsed
                ? 'px-2'
                : 'px-3'
            }
          `}
        >
          {menuGroups.map(
            (group, groupIndex) => (
              <div
                key={group.label ?? 'main'}
                className={
                  groupIndex === 0
                    ? ''
                    : 'mt-5'
                }
              >
                {/* GROUP LABEL */}

                {!collapsed &&
                  group.label && (
                    <p
                      className="
                        mb-2 px-3
                        whitespace-nowrap
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#94A3B8]
                      "
                    >
                      {group.label}
                    </p>
                  )}

                {/* DIVIDER COLLAPSED */}

                {collapsed &&
                  groupIndex > 0 && (
                    <div className="mx-2 mb-2 border-t border-[#F1F5F9]" />
                  )}

                <div className="space-y-1">
                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const active =
                        pathname ===
                          item.href ||
                        pathname.startsWith(
                          `${item.href}/`
                        );

                      return (
                        <Link
                          key={
                            item.href
                          }
                          href={
                            item.href
                          }
                          title={
                            collapsed
                              ? item.name
                              : undefined
                          }
                          className={`
                            group relative
                            flex h-[48px]
                            items-center
                            rounded-lg
                            text-sm
                            transition-all duration-200
                            ${
                              collapsed
                                ? 'justify-center px-0'
                                : 'gap-3 px-4'
                            }
                            ${
                              active
                                ? 'bg-[#F0F7F2] font-semibold text-[#14532D]'
                                : 'font-medium text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#1F2937]'
                            }
                          `}
                        >
                          {/* ACTIVE INDICATOR */}

                          {active &&
                            collapsed && (
                              <span
                                className="
                                  absolute right-0
                                  h-6 w-[3px]
                                  rounded-full
                                  bg-[#16A34A]
                                "
                              />
                            )}

                          {/* ICON */}

                          <span
                            className={`
                              flex h-8 w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              text-base
                              transition
                              ${
                                active
                                  ? 'bg-white text-[#166534]'
                                  : 'text-[#94A3B8] group-hover:text-[#475569]'
                              }
                            `}
                          >
                            <Icon
                              size={
                                19
                              }
                              strokeWidth={
                                2
                              }
                            />
                          </span>

                          {/* TEXT */}

                          {!collapsed && (
                            <span
                              className="
                                min-w-0
                                flex-1
                                truncate
                                whitespace-nowrap
                              "
                            >
                              {
                                item.name
                              }
                            </span>
                          )}

                          {/* TOOLTIP SAAT COLLAPSED */}

                          {collapsed && (
                            <span
                              className="
                                pointer-events-none
                                absolute left-[68px]
                                z-[100]
                                hidden
                                whitespace-nowrap
                                rounded-lg
                                bg-[#1F2937]
                                px-3 py-2
                                text-xs font-medium
                                text-white
                                shadow-lg
                                group-hover:block
                              "
                            >
                              {
                                item.name
                              }
                            </span>
                          )}
                        </Link>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}
        </nav>

        {/* ================= BOTTOM ================= */}

        <div
          className={`
            shrink-0
            border-t border-[#E5E7EB]
            transition-all duration-300
            ${
              collapsed
                ? 'p-2'
                : 'p-3'
            }
          `}
        >
          {/* PROFILE */}

          <Link
            href="/admin/profile"
            title={
              collapsed
                ? 'Profile'
                : undefined
            }
            className={`
              group relative mb-2
              flex items-center
              rounded-lg
              transition
              ${
                collapsed
                  ? 'justify-center p-2'
                  : 'gap-3 p-3'
              }
              ${
                pathname ===
                '/admin/profile'
                  ? 'bg-[#F0F7F2]'
                  : 'hover:bg-[#F8FAF9]'
              }
            `}
          >
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-[#EAF4ED]
                text-sm font-bold
                text-[#14532D]
              "
            >
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={namaPengelola}
                  className="
                    h-full w-full
                    object-cover
                  "
                />
              ) : (
                namaPengelola
                  ?.charAt(0)
                  .toUpperCase() ||
                'A'
              )}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  {namaPengelola}
                </p>

                <p
                  className="
                    truncate
                    text-[11px]
                    text-[#94A3B8]
                  "
                >
                  {namaUnit}
                </p>
              </div>
            )}

            {collapsed && (
              <span
                className="
                  pointer-events-none
                  absolute left-[68px]
                  z-[100]
                  hidden
                  whitespace-nowrap
                  rounded-lg
                  bg-[#1F2937]
                  px-3 py-2
                  text-xs font-medium
                  text-white
                  shadow-lg
                  group-hover:block
                "
              >
                Profile
              </span>
            )}
          </Link>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? 'Logout'
                : undefined
            }
            className={`
              group relative
              flex h-[48px]
              w-full items-center
              rounded-lg
              text-sm font-semibold
              text-[#64748B]
              transition
              hover:bg-[#FEF2F2]
              hover:text-[#DC2626]
              ${
                collapsed
                  ? 'justify-center px-0'
                  : 'gap-3 px-4'
              }
            `}
          >
            <span
              className="
                flex h-7 w-7
                shrink-0
                items-center
                justify-center
                text-base
              "
            >
              <LogOut
                size={19}
                strokeWidth={2}
              />
            </span>

            {!collapsed && (
              <span>Logout</span>
            )}

            {collapsed && (
              <span
                className="
                  pointer-events-none
                  absolute left-[68px]
                  z-[100]
                  hidden
                  whitespace-nowrap
                  rounded-lg
                  bg-[#1F2937]
                  px-3 py-2
                  text-xs font-medium
                  text-white
                  shadow-lg
                  group-hover:block
                "
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ============================================
          MOBILE HEADER
      ============================================ */}

      <header
        className="
          sticky top-0 z-50
          border-b border-[#E5E7EB]
          bg-white
          lg:hidden
        "
      >
        <div
          className="
            flex h-[70px]
            items-center
            justify-between
            px-4
          "
        >
          <Link href="/admin/dashboard">
            <Image
              src="/images/ecova/logo_ecova.png"
              alt="ECOVA"
              width={130}
              height={40}
              className="h-auto w-[125px]"
            />
          </Link>

          <Link
            href="/admin/profile"
            className="
              flex h-10 w-10
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-[#EAF4ED]
              font-bold
              text-[#14532D]
            "
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={namaPengelola}
                className="
                  h-full w-full
                  object-cover
                "
              />
            ) : (
              namaPengelola
                ?.charAt(0)
                .toUpperCase() ||
              'A'
            )}
          </Link>
        </div>

        <div
          className="
            overflow-x-auto
            border-t border-[#F1F5F9]
          "
        >
          <nav
            className="
              flex min-w-max
              gap-1 px-3 py-2
            "
          >
            {menuGroups
              .flatMap(
                (group) =>
                  group.items
              )
              .map((item) => {
                const active =
                  pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      whitespace-nowrap
                      rounded-full
                      px-4 py-2
                      text-xs font-medium
                      ${
                        active
                          ? 'bg-[#F0F7F2] text-[#14532D]'
                          : 'text-[#64748B]'
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
    </>
  );
}
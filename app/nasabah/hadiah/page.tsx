'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NasabahNavbar from '@/components/nasabah/NasabahNavbar';
const API_URL = 'http://localhost:3000';

type Profile = {
  id: number;
  username: string;
  role: string;
  nama_nasabah: string;
  alamat: string;
  telp: string;
  saldo_poin: number;
  foto: string | null;
};

type Hadiah = {
  id: number;
  nama_hadiah: string;
  poin_dibutuhkan: number;
  stok: number;
  foto: string | null;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
};

export default function HadiahPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('access_token');

        if (!token) {
          router.replace('/login');
          return;
        }

        const [profileResponse, hadiahResponse] =
          await Promise.all([
            fetch(`${API_URL}/auth/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_URL}/hadiah`, {
              cache: 'no-store',
            }),
          ]);

        if (profileResponse.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');

          router.replace('/login');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error(
            'Gagal mengambil data profil.'
          );
        }

        if (!hadiahResponse.ok) {
          throw new Error(
            'Gagal mengambil katalog hadiah.'
          );
        }

        const profileResult: ApiResponse<Profile> =
          await profileResponse.json();

        const hadiahResult: ApiResponse<Hadiah[]> =
          await hadiahResponse.json();

        if (profileResult.data.role !== 'nasabah') {
          router.replace('/admin/dashboard');
          return;
        }

        setProfile(profileResult.data);
        setHadiah(hadiahResult.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat memuat halaman.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const filteredHadiah = useMemo(() => {
    let result = hadiah.filter((item) =>
      item.nama_hadiah
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sort === 'poin-low') {
      result = [...result].sort(
        (a, b) =>
          a.poin_dibutuhkan - b.poin_dibutuhkan
      );
    }

    if (sort === 'poin-high') {
      result = [...result].sort(
        (a, b) =>
          b.poin_dibutuhkan - a.poin_dibutuhkan
      );
    }

    if (sort === 'stok') {
      result = [...result].sort(
        (a, b) => b.stok - a.stok
      );
    }

    return result;
  }, [hadiah, search, sort]);

  const getFotoUrl = (foto: string | null) => {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#6B7280]">
            Memuat katalog hadiah...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center">
            <p className="font-semibold text-[#1F2937]">
              Halaman gagal dimuat
            </p>

            <p className="mt-2 text-sm text-[#6B7280]">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <NasabahNavbar
        namaNasabah={profile.nama_nasabah}
        foto={profile.foto}
      />

      <div className="nasabah-page-container">
        {/* HEADER */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#166534]">
              Reward ECOVA
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              Katalog Hadiah
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">
              Gunakan poin hasil setoran sampahmu
              untuk mendapatkan hadiah yang tersedia.
            </p>
          </div>

          {/* SALDO */}
          <div className="min-w-[210px] rounded-xl border border-[#DCE7DF] bg-white px-5 py-4">
            <p className="text-xs font-medium text-[#6B7280]">
              Saldo Poin
            </p>

            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-[#14532D]">
                {profile.saldo_poin}
              </p>

              <span className="mb-1 text-xs text-[#6B7280]">
                poin
              </span>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari hadiah..."
              className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#166534]"
            />
          </div>

          {/* SORT */}
          <div
            className="w-full sm:shrink-0"
            style={{
              width: '200px',
              minWidth: '200px',
              maxWidth: '200px',
              flexBasis: '200px',
            }}
          >
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Urutkan hadiah"
              className="h-12 w-full cursor-pointer rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm font-medium text-[#475569] outline-none transition hover:border-[#86EFAC] focus:border-[#166534]"
            >
              <option value="default">Urutkan</option>
              <option value="poin-low">Poin terendah</option>
              <option value="poin-high">Poin tertinggi</option>
              <option value="stok">Stok terbanyak</option>
            </select>
          </div>
        </div>

        {/* JUMLAH */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1F2937]">
            Hadiah Tersedia
          </p>

          <p className="text-xs text-[#9CA3AF]">
            {filteredHadiah.length} hadiah
          </p>
        </div>

        {/* LIST */}
        {filteredHadiah.length === 0 ? (
          <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
            <p className="text-sm font-medium text-[#4B5563]">
              Hadiah tidak ditemukan.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            {filteredHadiah.map((item, index) => {
              const image = getFotoUrl(item.foto);

              const cukupPoin =
                profile.saldo_poin >=
                item.poin_dibutuhkan;

              const tersedia = item.stok > 0;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${index !==
                      filteredHadiah.length - 1
                      ? 'border-b border-[#E5E7EB]'
                      : ''
                    }`}
                >
                  {/* KIRI */}
                  <div className="flex min-w-0 items-center gap-4">
                    {/* FOTO */}
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F3F4F6]">
                      {image ? (
                        <img
                          src={image}
                          alt={item.nama_hadiah}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs font-medium text-[#9CA3AF]">
                          Reward
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1F2937] sm:text-base">
                        {item.nama_hadiah}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-sm font-semibold text-[#14532D]">
                          {item.poin_dibutuhkan} poin
                        </span>

                        <span className="text-xs text-[#6B7280]">
                          Stok {item.stok}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {!tersedia ? (
                      <span className="text-xs font-medium text-[#9CA3AF]">
                        Stok habis
                      </span>
                    ) : !cukupPoin ? (
                      <span className="text-xs font-medium text-[#B45309]">
                        Poin belum cukup
                      </span>
                    ) : null}

                    <button
                      type="button"
                      disabled={
                        !tersedia || !cukupPoin
                      }
                      onClick={() =>
                        router.push(
                          `/nasabah/penukaran?id_hadiah=${item.id}`
                        )
                      }
                      className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${tersedia && cukupPoin
                          ? 'bg-[#14532D] text-white hover:bg-[#166534]'
                          : 'cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                        }`}
                    >
                      Tukar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
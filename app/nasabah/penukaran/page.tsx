'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

type Penukaran = {
  id: number;
  tanggal: string;
  id_setor: number;
  hadiah: {
    id: number;
    nama_hadiah: string;
    poin_dibutuhkan: number;
    foto: string | null;
  };
  poin_terpakai: number;
  status: string;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
};

export default function PenukaranPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hadiahParam = searchParams.get('id_hadiah');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [riwayat, setRiwayat] = useState<Penukaran[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [printMode, setPrintMode] = useState<'item' | 'monthly' | null>(null);
  const [printItem, setPrintItem] = useState<Penukaran | null>(null);

  const getCurrentMonth = () => {
    const date = new Date();

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const selectedHadiah = useMemo(() => {
    if (!hadiahParam) return null;

    return (
      hadiah.find(
        (item) => item.id.toString() === hadiahParam
      ) ?? null
    );
  }, [hadiah, hadiahParam]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const [
        profileResponse,
        hadiahResponse,
        riwayatResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/hadiah`, {
          cache: 'no-store',
        }),

        fetch(`${API_URL}/penukaran-poin/my-penukaran`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      ]);

      if (
        profileResponse.status === 401 ||
        riwayatResponse.status === 401
      ) {
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
          'Gagal mengambil data hadiah.'
        );
      }

      if (!riwayatResponse.ok) {
        throw new Error(
          'Gagal mengambil riwayat penukaran.'
        );
      }

      const profileResult: ApiResponse<Profile> =
        await profileResponse.json();

      const hadiahResult: ApiResponse<Hadiah[]> =
        await hadiahResponse.json();

      const riwayatResult: ApiResponse<Penukaran[]> =
        await riwayatResponse.json();

      if (profileResult.data.role !== 'nasabah') {
        router.replace('/admin/dashboard');
        return;
      }

      setProfile(profileResult.data);
      setHadiah(hadiahResult.data ?? []);
      setRiwayat(riwayatResult.data ?? []);
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

  useEffect(() => {
    loadData();
  }, [router]);

  const handleTukar = async () => {
    if (!selectedHadiah || !profile) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/penukaran-poin/tukar`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            id_hadiah: selectedHadiah.id,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Penukaran poin gagal dilakukan.'
        );
      }

      setSuccess(
        result.message ||
          'Penukaran poin berhasil diajukan.'
      );

      await loadData();

      router.replace('/nasabah/penukaran');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Penukaran poin gagal dilakukan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(tanggal));
  };

  const formatStatus = (status: string) => {
    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'bg-[#ECFDF3] text-[#166534]';

      case 'diproses':
        return 'bg-[#FFF7ED] text-[#B45309]';

      case 'ditolak':
        return 'bg-[#FEF2F2] text-[#B91C1C]';

      default:
        return 'bg-[#F3F4F6] text-[#6B7280]';
    }
  };

  const getHadiahImageUrl = (foto?: string | null) => {
    if (!foto) return null;

    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }

    if (foto.startsWith('/uploads/')) {
      return `${API_URL}${foto}`;
    }

    return `${API_URL}/uploads/${foto}`;
  };

  const formatPoin = (value: number) =>
    Number(value || 0).toLocaleString('id-ID', {
      maximumFractionDigits: 2,
    });

  const formatTanggalNota = (tanggal: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(tanggal));

  const monthKey = (tanggal: string) => {
    const date = new Date(tanggal);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

 const riwayatBulanDipilih = riwayat.filter(
  (item) => monthKey(item.tanggal) === selectedMonth
);

const periodeBulanDipilih = (() => {
  const [year, month] = selectedMonth.split('-');

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
})();

const totalPoinBulanDipilih = riwayatBulanDipilih.reduce(
  (total, item) => total + Number(item.poin_terpakai || 0),
  0
);

  const escapeHtml = (value: unknown) => {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const bukaPrintWindow = (content: string, title: string) => {
    const printWindow = window.open('', '_blank', 'width=900,height=900');

    if (!printWindow) {
      setError('Jendela cetak tidak dapat dibuka. Izinkan pop-up lalu coba lagi.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(title)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #1f2937;
              font-family: Arial, Helvetica, sans-serif;
            }

            .ecova-print-sheet {
              width: 100%;
              margin: 0 auto;
              background: #ffffff;
              color: #1f2937;
            }

            .ecova-print-header {
              position: relative;
              min-height: 66px;
              border-bottom: 2px solid #166534;
            }

            .ecova-print-title {
              width: 100%;
              padding-top: 20px;
              text-align: center;
            }

            .ecova-print-title h1 {
              margin: 0;
              color: #111827;
              font-size: 18px;
              font-weight: 800;
              line-height: 1.15;
              letter-spacing: 0.02em;
            }

            .ecova-print-title p {
              margin: 4px 0 0;
              color: #475569;
              font-size: 10px;
              font-weight: 700;
              line-height: 1.2;
              text-transform: uppercase;
            }

            .ecova-print-logo {
              position: absolute;
              top: 4px;
              right: 0;
              width: 92px;
              height: auto;
              object-fit: contain;
            }

            .ecova-print-info {
              display: grid;
              gap: 8px;
              margin-top: 14px;
            }

            .ecova-print-info-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .ecova-print-info-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .ecova-print-info-box {
              min-width: 0;
              border: 1px solid #dcefe2;
              border-radius: 8px;
              background: #f7fcf8;
              padding: 8px 10px;
            }

            .ecova-print-info-box span {
              display: block;
              color: #64748b;
              font-size: 9px;
              line-height: 1.2;
            }

            .ecova-print-info-box strong {
              display: block;
              margin-top: 3px;
              overflow-wrap: anywhere;
              color: #1f2937;
              font-size: 10px;
              line-height: 1.3;
            }

            .ecova-print-table {
              width: 100%;
              margin-top: 14px;
              border-collapse: collapse;
              table-layout: auto;
              font-size: 10px;
            }

            .ecova-print-table thead tr {
              border-top: 1px solid #dcefe2;
              border-bottom: 1px solid #dcefe2;
              background: #f0fdf4;
            }

            .ecova-print-table th {
              padding: 7px 8px;
              color: #334155;
              font-size: 9px;
              font-weight: 700;
              text-align: left;
            }

            .ecova-print-table tbody tr {
              border-bottom: 1px solid #e5e7eb;
            }

            .ecova-print-table td {
              padding: 7px 8px;
              vertical-align: middle;
              font-size: 10px;
            }

            .ecova-print-table td small {
              display: block;
              margin-top: 2px;
              color: #64748b;
              font-size: 8px;
            }

            .ecova-align-right {
              text-align: right !important;
            }

            .ecova-green {
              color: #16a34a !important;
            }

            .ecova-print-total {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
              margin-top: 14px;
              border-top: 1px solid #dcefe2;
              padding-top: 10px;
            }

            .ecova-print-total > div {
              border: 1px solid #dcefe2;
              border-radius: 8px;
              background: #f7fcf8;
              padding: 8px 10px;
            }

            .ecova-print-total span {
              display: block;
              color: #64748b;
              font-size: 9px;
            }

            .ecova-print-total strong {
              display: block;
              margin-top: 3px;
              color: #1f2937;
              font-size: 11px;
            }

            .ecova-print-footer {
              margin-top: 28px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
              color: #64748b;
              text-align: center;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.addEventListener('load', function () {
              var images = Array.from(document.images);
              var ready = images.map(function (img) {
                if (img.complete) return Promise.resolve();
                return new Promise(function (resolve) {
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              });

              Promise.all(ready).then(function () {
                setTimeout(function () {
                  window.print();
                }, 250);
              });
            });
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const cetakNotaItem = (item: Penukaran) => {
    const html = `
      <section class="ecova-print-sheet ecova-print-nota">
        <header class="ecova-print-header">
          <div class="ecova-print-title">
            <h1>NOTA PENUKARAN POIN</h1>
            <p>Penukaran ${escapeHtml(item.id)}</p>
          </div>

          <img
            src="${window.location.origin}/images/ecova/logo_ecova.png"
            alt="ECOVA"
            class="ecova-print-logo"
          />
        </header>

        <div class="ecova-print-info ecova-print-info-4">
          <div class="ecova-print-info-box">
            <span>Nasabah</span>
            <strong>${escapeHtml(profile.nama_nasabah)}</strong>
          </div>

          <div class="ecova-print-info-box">
            <span>Tanggal</span>
            <strong>${escapeHtml(formatTanggal(item.tanggal))}</strong>
          </div>

          <div class="ecova-print-info-box">
            <span>ID Penukaran</span>
            <strong>#${escapeHtml(item.id)}</strong>
          </div>

          <div class="ecova-print-info-box">
            <span>Status</span>
            <strong>${escapeHtml(formatStatus(item.status))}</strong>
          </div>
        </div>

        <table class="ecova-print-table">
          <thead>
            <tr>
              <th>Hadiah</th>
              <th class="ecova-align-right">Poin Hadiah</th>
              <th class="ecova-align-right">Poin Digunakan</th>
              <th class="ecova-align-right">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <strong>${escapeHtml(item.hadiah.nama_hadiah)}</strong>
                <small>ID Hadiah #${escapeHtml(item.hadiah.id)}</small>
              </td>

              <td class="ecova-align-right">
                ${escapeHtml(formatPoin(item.hadiah.poin_dibutuhkan))}
              </td>

              <td class="ecova-align-right ecova-green">
                -${escapeHtml(formatPoin(item.poin_terpakai))}
              </td>

              <td class="ecova-align-right">
                ${escapeHtml(formatStatus(item.status))}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="ecova-print-total">
          <div>
            <span>Total Hadiah</span>
            <strong>1 hadiah</strong>
          </div>

          <div>
            <span>Total Poin Digunakan</span>
            <strong class="ecova-green">
              -${escapeHtml(formatPoin(item.poin_terpakai))} poin
            </strong>
          </div>
        </div>

        <footer class="ecova-print-footer">
          Terima kasih telah berkontribusi bersama ECOVA.
        </footer>
      </section>
    `;

    bukaPrintWindow(html, `Nota Penukaran #${item.id}`);
  };

  const cetakRekapBulanan = () => {
    const rows = riwayatBulanDipilih
      .map(
        (item) => `
          <tr>
            <td><strong>#${escapeHtml(item.id)}</strong></td>
            <td>${escapeHtml(formatTanggal(item.tanggal))}</td>
            <td>${escapeHtml(item.hadiah.nama_hadiah)}</td>
            <td>${escapeHtml(formatStatus(item.status))}</td>
            <td class="ecova-align-right ecova-green">
              -${escapeHtml(formatPoin(item.poin_terpakai))}
            </td>
          </tr>
        `
      )
      .join('');

    const html = `
      <section class="ecova-print-sheet">
        <header class="ecova-print-header">
          <div class="ecova-print-title">
            <h1>REKAPITULASI BULANAN</h1>
            <p>${escapeHtml(periodeBulanDipilih)}</p>
          </div>

          <img
            src="${window.location.origin}/images/ecova/logo_ecova.png"
            alt="ECOVA"
            class="ecova-print-logo"
          />
        </header>

        <div class="ecova-print-info ecova-print-info-3">
          <div class="ecova-print-info-box">
            <span>Nasabah</span>
            <strong>${escapeHtml(profile.nama_nasabah)}</strong>
          </div>

          <div class="ecova-print-info-box">
            <span>Total Penukaran</span>
            <strong>${riwayatBulanDipilih.length} transaksi</strong>
          </div>

          <div class="ecova-print-info-box">
            <span>Periode</span>
            <strong>${escapeHtml(periodeBulanDipilih)}</strong>
          </div>
        </div>

        <table class="ecova-print-table">
          <thead>
            <tr>
              <th>Penukaran</th>
              <th>Tanggal</th>
              <th>Hadiah</th>
              <th>Status</th>
              <th class="ecova-align-right">Poin</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

          <tfoot>
            <tr>
              <td colspan="4">
                <strong>TOTAL BULANAN</strong>
              </td>
              <td class="ecova-align-right ecova-green">
                <strong>
                  -${escapeHtml(formatPoin(totalPoinBulanDipilih))} poin
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>

        <footer class="ecova-print-footer">
          Terima kasih telah berkontribusi bersama ECOVA.
        </footer>
      </section>
    `;

    bukaPrintWindow(html, `Rekap Penukaran ${periodeBulanDipilih}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#6B7280]">
            Memuat data penukaran...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const sisaPoin = selectedHadiah
    ? profile.saldo_poin -
      selectedHadiah.poin_dibutuhkan
    : profile.saldo_poin;

  const cukupPoin = selectedHadiah
    ? profile.saldo_poin >=
      selectedHadiah.poin_dibutuhkan
    : false;

  const stokTersedia = selectedHadiah
    ? selectedHadiah.stok > 0
    : false;

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <NasabahNavbar
        namaNasabah={profile.nama_nasabah}
        foto={profile.foto}
      />

      <div className="nasabah-page-container">
        {/* HEADER */}
        <div>
          <p className="text-sm font-medium text-[#166534]">
            Reward ECOVA
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
            Penukaran Poin
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Tukarkan poin yang kamu kumpulkan dengan
            hadiah yang tersedia.
          </p>
        </div>

        {/* REKAP PRIBADI BULANAN */}
<section className="mt-7">
  <div className="rounded-[20px] border border-[#D6EBDD] bg-[#F7FCF8] px-5 py-5 sm:px-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      {/* KIRI */}
      <div>
         <p className="text-sm font-semibold text-[#166534]">
              Rekap Penukaran Bulanan
            </p>

        <p className="mt-1 text-sm text-[#64748B]">
          Cetak seluruh riwayat penukaran poin dalam satu bulan.
        </p>
      </div>

      {/* KANAN */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="
            h-12
            min-w-[210px]
            rounded-2xl
            border
            border-[#D6E3DA]
            bg-white
            px-5
            text-sm
            font-medium
            text-[#334155]
            outline-none
            transition
            focus:border-[#16A34A]
            focus:ring-2
            focus:ring-[#DCFCE7]
          "
        />

        <button
          type="button"
          onClick={cetakRekapBulanan}
          disabled={riwayatBulanDipilih.length === 0}
          className="
            h-12
            whitespace-nowrap
            rounded-2xl
            bg-[#166534]
            px-6
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#14532D]
            disabled:cursor-not-allowed
            disabled:bg-[#D1D5DB]
            disabled:text-[#9CA3AF]
          "
        >
          Cetak Penukaran Bulanan
        </button>
        

      </div>
    </div>
  </div>
</section>

        {/* ALERT */}
        {error && (
          <div className="mt-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            <p className="text-sm text-[#B91C1C]">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
            <p className="text-sm text-[#166534]">
              {success}
            </p>
          </div>
        )}

        {/* ================= SUMMARY PENUKARAN ================= */}
<section className="mt-7">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

    {/* TOTAL PENUKARAN */}
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-6">
      <p className="text-sm font-medium text-[#64748B]">
        Total Penukaran
      </p>

      <p className="mt-2 text-[34px] font-bold leading-none text-[#172033]">
        {riwayat.length}
      </p>

      <p className="mt-3 text-sm text-[#94A3B8]">
        Transaksi
      </p>
    </div>

    {/* PENUKARAN SELESAI */}
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-6">
      <p className="text-sm font-medium text-[#64748B]">
        Penukaran Selesai
      </p>

      <p className="mt-2 text-[34px] font-bold leading-none text-[#172033]">
        {
          riwayat.filter(
            (item) => item.status === 'selesai'
          ).length
        }
      </p>

      <p className="mt-3 text-sm text-[#94A3B8]">
        Transaksi selesai
      </p>
    </div>

    {/* SEDANG DIPROSES */}
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-6">
      <p className="text-sm font-medium text-[#64748B]">
        Sedang Diproses
      </p>

      <p className="mt-2 text-[34px] font-bold leading-none text-[#172033]">
        {
          riwayat.filter(
            (item) => item.status === 'diproses'
          ).length
        }
      </p>

      <p className="mt-3 text-sm text-[#94A3B8]">
        Menunggu penyelesaian
      </p>
    </div>

    {/* SALDO POIN */}
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-6">
      <p className="text-sm font-medium text-[#64748B]">
        Sisa Saldo Poin
      </p>

      <p className="mt-2 text-[34px] font-bold leading-none text-[#172033]">
        {Number(profile.saldo_poin || 0).toLocaleString('id-ID', {
          maximumFractionDigits: 2,
        })}
      </p>

      <p className="mt-3 text-sm text-[#94A3B8]">
        Poin tersedia
      </p>
    </div>

  </div>
</section>

        {/* KONFIRMASI */}
        {selectedHadiah ? (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#1F2937]">
                Konfirmasi Penukaran
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Periksa hadiah sebelum melakukan
                penukaran.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#DCE7DF] bg-white">
              {/* HADIAH */}
              <div className="border-b border-[#E5E7EB] px-5 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                    {getHadiahImageUrl(selectedHadiah.foto) ? (
                      <img
                        src={getHadiahImageUrl(selectedHadiah.foto)!}
                        alt={selectedHadiah.nama_hadiah}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[#16A34A]">
                        {selectedHadiah.nama_hadiah.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#6B7280]">
                      Hadiah
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                      {selectedHadiah.nama_hadiah}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#14532D]">
                      {formatPoin(selectedHadiah.poin_dibutuhkan)} poin
                    </p>
                  </div>
                </div>
              </div>

              {/* RINGKASAN */}
              <div className="grid md:grid-cols-3">
                <div className="border-b border-[#E5E7EB] px-5 py-4 md:border-b-0 md:border-r">
                  <p className="text-xs text-[#6B7280]">
                    Saldo saat ini
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                    {profile.saldo_poin}
                  </p>
                </div>

                <div className="border-b border-[#E5E7EB] px-5 py-4 md:border-b-0 md:border-r">
                  <p className="text-xs text-[#6B7280]">
                    Poin digunakan
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#B45309]">
                    -{selectedHadiah.poin_dibutuhkan}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs text-[#6B7280]">
                    Sisa poin
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${
                      sisaPoin >= 0
                        ? 'text-[#14532D]'
                        : 'text-[#B91C1C]'
                    }`}
                  >
                    {sisaPoin}
                  </p>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#FAFAFA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {!stokTersedia ? (
                    <p className="text-sm font-medium text-[#B91C1C]">
                      Stok hadiah sudah habis.
                    </p>
                  ) : !cukupPoin ? (
                    <p className="text-sm font-medium text-[#B45309]">
                      Saldo poin kamu belum cukup.
                    </p>
                  ) : (
                    <p className="text-sm text-[#6B7280]">
                      Pastikan hadiah yang dipilih sudah
                      benar.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push('/nasabah/hadiah')
                    }
                    className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F9FAFB]"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={
                      submitting ||
                      !cukupPoin ||
                      !stokTersedia
                    }
                    onClick={handleTukar}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                      submitting ||
                      !cukupPoin ||
                      !stokTersedia
                        ? 'cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF]'
                        : 'bg-[#14532D] text-white hover:bg-[#166534]'
                    }`}
                  >
                    {submitting
                      ? 'Memproses...'
                      : 'Konfirmasi Penukaran'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-xl border border-[#DCE7DF] bg-white px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#1F2937]">
                  Belum memilih hadiah
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Pilih hadiah dari katalog sebelum
                  melakukan penukaran.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push('/nasabah/hadiah')
                }
                className="rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
              >
                Lihat Katalog Hadiah
              </button>
            </div>
          </section>
        )}

       {/* RIWAYAT */}
<section className="mt-10">
  <div className="flex items-end justify-between">
    <div>
      <h2 className="text-base font-semibold text-[#1F2937]">
        Riwayat Penukaran
      </h2>

      <p className="mt-1 text-sm text-[#6B7280]">
        Daftar penukaran poin yang pernah kamu ajukan.
      </p>
    </div>

    <p className="text-xs text-[#9CA3AF]">
      {riwayat.length} transaksi
    </p>
  </div>

          {riwayat.length === 0 ? (
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white py-14 text-center">
              <p className="text-sm font-medium text-[#4B5563]">
                Belum ada riwayat penukaran.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              {riwayat.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between ${
                    index !== riwayat.length - 1
                      ? 'border-b border-[#E5E7EB]'
                      : ''
                  }`}
                >
                  {/* INFO + FOTO HADIAH */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                      {item.hadiah.foto ? (
                        <img
                          src={
                            item.hadiah.foto.startsWith('http://') ||
                            item.hadiah.foto.startsWith('https://')
                              ? item.hadiah.foto
                              : item.hadiah.foto.startsWith('/uploads/')
                                ? `${API_URL}${item.hadiah.foto}`
                                : `${API_URL}/uploads/${item.hadiah.foto}`
                          }
                          alt={item.hadiah.nama_hadiah}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#16A34A]">
                          {item.hadiah.nama_hadiah?.charAt(0).toUpperCase() || 'H'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#1F2937]">
                          {item.hadiah.nama_hadiah}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>
                  </div>

                  {/* DETAIL */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Poin digunakan
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#14532D]">
                        {formatPoin(item.poin_terpakai)} poin
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#9CA3AF]">
                        ID Penukaran
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#4B5563]">
                        {item.id}
                      </p>
                    </div>

                    {item.status === 'selesai' && (
                      <button
                        type="button"
                        onClick={() => cetakNotaItem(item)}
                        className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-xs font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
                      >
                        Cetak Nota
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

    </main>
  );
}
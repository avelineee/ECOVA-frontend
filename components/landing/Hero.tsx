'use client';

import CountUp from '@/components/landing/CountUp';
import { useEffect, useState } from 'react';
import Link from 'next/link';
type PublicStats = {
    total_nasabah: number;
    total_sampah_kg: number;
    total_transaksi_setor: number;
    total_kategori_sampah: number;
};
import { Recycle } from 'lucide-react';

export default function Hero() {
    const [stats, setStats] = useState<PublicStats | null>(null);

    const rotatingWords = [
        {
            text: 'Real Value.',
            color: '#16A34A',
        },
        {
            text: 'Real Impact.',
            color: '#0F766E',
        },
        {
            text: 'Real Rewards.',
            color: '#D97706',
        },
        {
            text: 'Real Change.',
            color: '#2563EB',
        },
    ];

    const [wordIndex, setWordIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/dashboard/public-stats',
                    {
                        cache: 'no-store',
                    }
                );

                if (!response.ok) {
                    throw new Error('Gagal mengambil statistik ECOVA');
                }

                const result = await response.json();

                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Public stats error:', error);
            }
        };

        fetchPublicStats();
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setVisible(false);
            window.setTimeout(() => {
                setWordIndex((prev) => (prev + 1) % rotatingWords.length);
                setVisible(true);
            }, 300);
        }, 2500);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <section
            id="home"
            className="relative overflow-hidden bg-[#F8FAF9]"
        >
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#22C55E]/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#0F766E]/10 blur-3xl" />

            <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

                {/* LEFT CONTENT */}
                <div className="mx-auto max-w-[650px] text-center lg:mx-0 lg:text-left">

                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-white px-4 py-2 text-sm font-medium text-[#15803D]">
                        <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                        Smart Waste Management
                    </div>

                    {/* Heading */}
                    <h1 className="text-[42px] font-bold leading-[1.12] tracking-[-0.03em] text-[#1F2937] sm:text-[52px] lg:text-[64px]">
                        Turn Your Waste
                        <br />

                        <span className="inline-flex items-baseline">
                            <span>Into&nbsp;</span>

                            <span
                                className={`inline-block transition-all duration-300 ease-out ${visible
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-2 opacity-0'
                                    }`}
                                style={{
                                    color: rotatingWords[wordIndex].color,
                                }}
                            >
                                {rotatingWords[wordIndex].text}
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mx-auto mt-6 max-w-[570px] text-[16px] leading-7 text-[#64748B] sm:text-[17px] lg:mx-0">
                        ECOVA makes recycling easier and more rewarding. Deposit your
                        recyclable waste, earn points, and turn small actions into a
                        meaningful impact for the environment.
                    </p>

                    {/* CTA */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                        <Link
                            href="/register"
                            className="flex w-full items-center justify-center rounded-full bg-[#16A34A] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(22,163,74,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#15803D] sm:w-auto"
                        >
                            Start Recycling
                            <svg
                                className="ml-2"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="m13 6 6 6-6 6" />
                            </svg>
                        </Link>

                        <Link
                            href="#how-it-works"
                            className="flex w-full items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#374151] transition-all hover:border-[#86EFAC] hover:text-[#16A34A] sm:w-auto"
                        >
                            How It Works
                        </Link>
                    </div>

                    {/* Mini information */}
                    <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] text-[#64748B] lg:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                                ✓
                            </span>
                            Easy to use
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                                ✓
                            </span>
                            Earn rewards
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                                ✓
                            </span>
                            Eco friendly
                        </div>
                    </div>
                </div>

                {/* RIGHT VISUAL */}
                <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:mx-0 lg:ml-auto">

                    <div className="relative aspect-square w-full max-w-[520px]">

                        {/* Main soft circle */}
                        <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-[#DCFCE7] to-[#CCFBF1]" />

                        {/* Main card */}
                        {/* Main card */}
                        <div className="absolute left-1/2 top-1/2 w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-[0_25px_60px_rgba(15,118,110,0.12)] backdrop-blur">

                            {/* TOP */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] font-medium text-[#94A3B8]">
                                        ECOVA Community
                                    </p>

                                    <p className="mt-1 text-[30px] font-bold text-[#1F2937]">
                                        <CountUp value={stats?.total_nasabah ?? 0} />

                                        <span className="ml-2 text-[14px] font-semibold text-[#16A34A]">
                                            Eco Members
                                        </span>
                                    </p>
                                </div>

                                {/* ICON */}
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7]">
                                    <svg
                                        width="25"
                                        height="25"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#16A34A"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                            </div>

                            {/* DIVIDER */}
                            <div className="my-6 h-px bg-[#F1F5F9]" />

                            {/* STATISTICS */}
                            <div className="grid grid-cols-2 gap-3">

                                {/* WASTE COLLECTED */}
                                <div className="rounded-2xl bg-[#F0FDF4] p-4">
                                    <p className="text-[12px] text-[#64748B]">
                                        Waste Collected
                                    </p>

                                    <p className="mt-1 text-[24px] font-bold text-[#14532D]">
                                        <CountUp
                                            value={stats?.total_sampah_kg ?? 0}
                                            decimals={1}
                                            suffix=" kg"
                                        />
                                    </p>
                                </div>

                                {/* WASTE DEPOSITS */}
                                <div className="rounded-2xl bg-[#F0FDFA] p-4">
                                    <p className="text-[12px] text-[#64748B]">
                                        Waste Deposits
                                    </p>

                                    <p className="mt-1 text-[24px] font-bold text-[#0F766E]">
                                        <CountUp value={stats?.total_transaksi_setor ?? 0} />
                                    </p>
                                </div>

                            </div>

                            {/* BOTTOM INFORMATION */}
                            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#F1F5F9] p-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-lg">
                                    ♻
                                </div>

                                <div>
                                    <p className="text-[13px] font-semibold text-[#374151]">
                                        Recycling makes an impact!
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                                        Together, every recycled item makes a difference.
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* Floating recycle decoration */}
                        <div className="absolute right-[3%] top-[17%] flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                            <Recycle
                                size={25}
                                strokeWidth={2}
                                className="text-[#16A34A]"
                            />
                        </div>


                        {/* Floating category statistics */}
                        <div className="absolute bottom-[16%] left-[1%] rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">

                            <p className="text-[11px] text-[#94A3B8]">
                                Waste Categories
                            </p>

                            <p className="mt-1 font-bold text-[#16A34A]">
                                <CountUp
                                    value={stats?.total_kategori_sampah ?? 0}
                                    suffix=" Categories"
                                />
                            </p>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

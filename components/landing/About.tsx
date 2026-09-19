import ScrollReveal from '@/components/landing/ScrollReveal';
import {
  Recycle,
  Gift,
  ChartNoAxesColumnIncreasing,
  Sprout,
} from 'lucide-react';

export default function About() {
  return (
    <section
      id="about"
      className="bg-white px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">

        {/* ================= LEFT VISUAL ================= */}
        <ScrollReveal direction="left">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#DCFCE7] via-[#F0FDF4] to-[#CCFBF1] p-8 sm:p-10">

              {/* DECORATION */}
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#22C55E]/10" />
              <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#0F766E]/10" />

              <div className="relative grid gap-4 sm:grid-cols-2">

                {/* CARD 1 — EASY RECYCLING */}
                <ScrollReveal delay={100}>
                  <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,118,110,0.08)]">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7]">
                      <Recycle
                        size={23}
                        strokeWidth={2}
                        className="text-[#16A34A]"
                      />
                    </div>

                    <p className="text-sm font-semibold text-[#1F2937]">
                      Easy Recycling
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      Setorkan sampah dengan proses yang lebih sederhana dan
                      terorganisir.
                    </p>
                  </div>
                </ScrollReveal>

                {/* CARD 2 — VALUABLE REWARDS */}
                <ScrollReveal delay={220}>
                  <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,118,110,0.08)] sm:translate-y-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CCFBF1]">
                      <Gift
                        size={23}
                        strokeWidth={2}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <p className="text-sm font-semibold text-[#1F2937]">
                      Valuable Rewards
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      Sampah yang disetor dapat menghasilkan poin dan ditukar
                      dengan hadiah.
                    </p>
                  </div>
                </ScrollReveal>

                {/* CARD 3 — TRACK YOUR ACTIVITY */}
                <ScrollReveal delay={340}>
                  <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,118,110,0.08)]">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0F2FE]">
                      <ChartNoAxesColumnIncreasing
                        size={23}
                        strokeWidth={2}
                        className="text-[#0369A1]"
                      />
                    </div>

                    <p className="text-sm font-semibold text-[#1F2937]">
                      Track Your Activity
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      Pantau riwayat setoran, poin, dan aktivitas daur ulang
                      secara digital.
                    </p>
                  </div>
                </ScrollReveal>

                {/* CARD 4 — BETTER ENVIRONMENT */}
                <ScrollReveal delay={460}>
                  <div className="rounded-3xl bg-[#14532D] p-6 text-white shadow-[0_12px_30px_rgba(20,83,45,0.18)] sm:translate-y-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Sprout
                        size={23}
                        strokeWidth={2}
                        className="text-[#BBF7D0]"
                      />
                    </div>

                    <p className="text-sm font-semibold">
                      Better Environment
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Setiap setoran kecil dapat membantu menciptakan lingkungan
                      yang lebih bersih.
                    </p>
                  </div>
                </ScrollReveal>

              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ================= RIGHT CONTENT ================= */}
        <ScrollReveal direction="right" delay={150}>
          <div>

            {/* BADGE */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-sm font-semibold text-[#16A34A]">
              About ECOVA
            </div>

            {/* TITLE */}
            <h2 className="max-w-[580px] text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1F2937] sm:text-[42px]">
              Recycling Made
              <span className="text-[#16A34A]">
                {' '}Simple, Useful,{' '}
              </span>
              and Rewarding.
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-6 max-w-[570px] text-[16px] leading-8 text-[#64748B]">
              ECOVA adalah platform bank sampah digital yang membantu masyarakat
              mengelola sampah daur ulang dengan cara yang lebih praktis,
              transparan, dan bernilai.
            </p>

            <p className="mt-4 max-w-[570px] text-[16px] leading-8 text-[#64748B]">
              Melalui ECOVA, nasabah dapat melakukan setoran sampah, mendapatkan
              poin, memantau riwayat transaksi, dan menukarkan poin dengan hadiah
              dalam satu platform.
            </p>

            {/* ================= VALUES ================= */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* VALUE 1 */}
              <ScrollReveal delay={250}>
                <div className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-xs font-bold text-[#16A34A]">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      Digital & Practical
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      Semua proses tercatat secara digital.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* VALUE 2 */}
              <ScrollReveal delay={350}>
                <div className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-xs font-bold text-[#16A34A]">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      Transparent
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      Data setoran dan poin lebih mudah dipantau.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* VALUE 3 */}
              <ScrollReveal delay={450}>
                <div className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-xs font-bold text-[#16A34A]">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      Rewarding
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      Sampah dapat berubah menjadi poin dan hadiah.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* VALUE 4 */}
              <ScrollReveal delay={550}>
                <div className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-xs font-bold text-[#16A34A]">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-[#1F2937]">
                      Sustainable
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      Mendorong kebiasaan memilah dan mendaur ulang sampah.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
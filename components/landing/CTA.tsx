import Link from 'next/link';
import ScrollReveal from '@/components/landing/ScrollReveal';

export default function CTA() {
  return (
    <section className="overflow-hidden bg-[#F8FAF9] px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">

        {/* WHOLE CTA CARD */}
        <ScrollReveal direction="up">
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[34px]
              bg-[#14532D]
              px-6
              py-12
              text-center
              text-white
              sm:px-10
              lg:px-16
              lg:py-16
            "
          >
            {/* LEFT DECORATION */}
            <div
              className="
                absolute
                -left-20
                -top-20
                h-56
                w-56
                rounded-full
                bg-[#22C55E]/20
                transition-transform
                duration-[1800ms]
                ease-out
                group-hover:translate-x-3
                group-hover:translate-y-3
              "
            />

            {/* RIGHT DECORATION */}
            <div
              className="
                absolute
                -bottom-24
                -right-20
                h-64
                w-64
                rounded-full
                bg-[#0F766E]/30
                transition-transform
                duration-[2000ms]
                ease-out
                group-hover:-translate-x-3
                group-hover:-translate-y-3
              "
            />

            <div className="relative mx-auto max-w-[760px]">

              {/* BADGE */}
              <ScrollReveal delay={100}>
                <div
                  className="
                    mb-5
                    inline-flex
                    rounded-full
                    bg-white/10
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-[#BBF7D0]
                  "
                >
                  Start Your Eco Journey
                </div>
              </ScrollReveal>

              {/* TITLE */}
              <ScrollReveal delay={200}>
                <h2 className="text-[36px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[44px]">
                  Ready to Turn Waste Into
                  <span className="text-[#86EFAC]">
                    {' '}Value?
                  </span>
                </h2>
              </ScrollReveal>

              {/* DESCRIPTION */}
              <ScrollReveal delay={300}>
                <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-8 text-white/70">
                  Mulai kebiasaan daur ulang yang lebih mudah,
                  tercatat, dan bernilai bersama ECOVA.
                </p>
              </ScrollReveal>

              {/* BUTTONS */}
              <ScrollReveal delay={400}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

                  {/* GET STARTED */}
                  <Link
                    href="/register"
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      rounded-full
                      bg-[#22C55E]
                      px-7
                      py-3.5
                      text-[15px]
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#16A34A]
                      hover:shadow-[0_12px_30px_rgba(34,197,94,0.22)]
                      sm:w-auto
                    "
                  >
                    Get Started
                  </Link>

                  {/* LOGIN */}
                  <Link
                    href="/login"
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/20
                      bg-white/5
                      px-7
                      py-3.5
                      text-[15px]
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-white/30
                      hover:bg-white/10
                      sm:w-auto
                    "
                  >
                    Login
                  </Link>

                </div>
              </ScrollReveal>

            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
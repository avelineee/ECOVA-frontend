import Image from 'next/image';
import Link from 'next/link';

import {
  Mail,
  MessageCircle,
} from 'lucide-react';

const navigation = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'About',
    href: '#about',
  },
  {
    label: 'Our Impact',
    href: '#impact',
  },
  {
    label: 'How It Works',
    href: '#how-it-works',
  },
  {
    label: 'Categories',
    href: '#categories',
  },
  {
    label: 'Rewards',
    href: '#rewards',
  },
];

const socialLinks = {
  instagram: 'https://www.instagram.com/growmaggot/',
  linkedin:
    'https://www.linkedin.com/in/aveline-voleta-wardani-6288453a6/',
  youtube:
    'https://youtube.com/@growmaggot?si=gX699X45c1EC9f7k',

  // Isi kalau nanti sudah punya
  x: '',
  whatsapp: '',

  email:
  'https://mail.google.com/mail/?view=cm&fs=1&to=growmaggott@gmail.com&su=ECOVA%20Inquiry&body=Halo%20ECOVA%2C%20saya%20ingin%20bertanya%20mengenai...',
};

export default function Footer() {
  return (
    <footer className="ecova-footer">
      <div className="ecova-footer-container">

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="ecova-footer-grid">

          {/* ===================================================
              BRAND
          ==================================================== */}

          <div className="ecova-footer-brand">
            <Link
              href="/"
              className="ecova-footer-logo-link"
            >
              <Image
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                width={170}
                height={52}
                className="ecova-footer-logo"
              />
            </Link>

            <p className="ecova-footer-description">
              Platform bank sampah digital yang membantu
              pengelolaan sampah menjadi lebih mudah,
              tercatat, dan bernilai.
            </p>

            <p className="ecova-footer-tagline">
              Turn Waste Into Value.
            </p>
          </div>

          {/* ===================================================
              EXPLORE
          ==================================================== */}

          <div>
            <h3 className="ecova-footer-title">
              Explore
            </h3>

            <div className="ecova-footer-links">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="ecova-footer-link"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ===================================================
              ACCOUNT
          ==================================================== */}

          <div>
            <h3 className="ecova-footer-title">
              Account
            </h3>

            <div className="ecova-footer-links">
              <Link
                href="/login"
                className="ecova-footer-link"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="ecova-footer-link"
              >
                Register
              </Link>
            </div>
          </div>

          {/* ===================================================
              CONNECT WITH US
          ==================================================== */}

          <div>
            <h3 className="ecova-footer-title">
              Connect With Us
            </h3>

            <p className="ecova-footer-connect-description">
              Stay connected and follow ECOVA&apos;s
              journey toward a cleaner environment.
            </p>

            <div className="ecova-footer-socials">

              {/* ================= INSTAGRAM ================= */}

              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ECOVA Instagram"
                title="Instagram"
                className="ecova-footer-social"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* ================= LINKEDIN ================= */}

              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ECOVA LinkedIn"
                title="LinkedIn"
                className="ecova-footer-social"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.2 7.6H2V21h3.2V7.6ZM3.6 2A1.9 1.9 0 1 0 3.6 5.8 1.9 1.9 0 0 0 3.6 2ZM21.8 13.3c0-4-2.1-5.9-4.9-5.9-2.3 0-3.3 1.2-3.9 2.1V7.6H9.8V21H13v-6.6c0-1.7.3-3.4 2.5-3.4 2.1 0 2.2 2 2.2 3.5V21h3.2v-7.7h.9Z" />
                </svg>
              </a>

              {/* ================= YOUTUBE ================= */}

              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ECOVA YouTube"
                title="YouTube"
                className="ecova-footer-social"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 12s0-3.3-.4-4.9a2.7 2.7 0 0 0-1.9-1.9C18.1 4.8 12 4.8 12 4.8s-6.1 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9C2 8.7 2 12 2 12s0 3.3.4 4.9a2.7 2.7 0 0 0 1.9 1.9c1.6.4 7.7.4 7.7.4s6.1 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9C22 15.3 22 12 22 12Z" />

                  <path
                    d="m10 9 5 3-5 3V9Z"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* ================= X ================= */}

              {socialLinks.x && (
                <a
                  href={socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ECOVA X"
                  title="X"
                  className="ecova-footer-social ecova-footer-x"
                >
                  𝕏
                </a>
              )}

              {/* ================= EMAIL ================= */}

              <a
                href={socialLinks.email}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email ECOVA"
                title="Email ECOVA"
                className="ecova-footer-social"
              >
                <Mail
                  size={18}
                  strokeWidth={1.8}
                />
              </a>

              {/* ================= WHATSAPP ================= */}

              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ECOVA WhatsApp"
                  title="WhatsApp"
                  className="ecova-footer-social"
                >
                  <MessageCircle
                    size={18}
                    strokeWidth={1.8}
                  />
                </a>
              )}

            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM
        ====================================================== */}

        <div className="ecova-footer-bottom">
          <p>
            © 2026 ECOVA. All rights reserved.
          </p>

          <p>
            Eco Collection, Value & Action
          </p>
        </div>

      </div>
    </footer>
  );
}
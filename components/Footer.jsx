'use client';

import { FaGithub, FaGlobe, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-gray-900 via-black to-black text-white/80">
      <div className="mx-auto max-w-6xl px-2 py-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-lg font-semibold text-cyan-400">Connect with me</h3>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <a
              href="https://mouadlotfi.xyz"
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-medium text-white shadow-lg transition hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-100 sm:w-auto"
            >
              <FaGlobe className="text-cyan-300 text-lg transition group-hover:text-cyan-100" />
              <span>Portfolio</span>
            </a>
            <a
              href="https://github.com/arfadex"
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-medium text-white shadow-lg transition hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-100 sm:w-auto"
            >
              <FaGithub className="text-cyan-300 text-lg transition group-hover:text-cyan-100" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/mouad-lotfi/"
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 font-medium text-white shadow-lg transition hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-100 sm:w-auto"
            >
              <FaLinkedin className="text-cyan-300 text-lg transition group-hover:text-cyan-100" />
              <span>LinkedIn</span>
            </a>
          </div>

          <p className="text-center text-sm font-medium text-white/60">
            Email:
            <a href="mailto:mouad.lotfi.ml@gmail.com" className="ml-2 font-semibold text-cyan-200 transition hover:text-cyan-100">
              mouad.lotfi.work@gmail.com
            </a>
          </p>

          <p className="text-center text-sm font-medium text-white/60">© {currentYear} ScreenSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

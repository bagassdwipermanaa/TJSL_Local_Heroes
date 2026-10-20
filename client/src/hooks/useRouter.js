import { useState, useEffect, useCallback } from 'react';
import { updateSEO } from '../utils/seo';

// Route SEO definition dictionary
export const ROUTE_METADATA = {
  dashboard: {
    path: '/dashboard',
    title: 'Dashboard Pusat Kendali Administrator',
    description:
      'Pusat kendali dan verifikasi inisiatif peserta TJSL Local Heroes serta manajemen dewan juri PT PLN Electricity Services.'
  },
  pendaftaran: {
    path: '/pendaftaran',
    title: 'Pendaftaran Peserta & Dashboard Panitia',
    description:
      'Formulir pendaftaran resmi peserta inisiatif TJSL Local Heroes PT PLN Electricity Services bagi insan pegawai & TAD beserta dashboard verifikasi panitia.'
  },
  identitas: {
    path: '/penilaian/identitas',
    title: 'Tahap 1: Identitas Peserta & Program',
    description:
      'Pemeriksaan identitas pegawai pengusul dan rincian latar belakang program TJSL Local Heroes PLN ES.'
  },
  admin: {
    path: '/penilaian/administrasi',
    title: 'Tahap 2: Verifikasi Administrasi',
    description:
      'Checklist kepatuhan persyaratan administratif dan validasi berkas sahih pengusul TJSL Local Heroes.'
  },
  nilai: {
    path: '/penilaian/substansi',
    title: 'Tahap 3: Penilaian Substansi & Skor',
    description:
      'Evaluasi 7 kriteria substansi bertahap (Portofolio berkas, verifikasi lapangan, dan wawancara dewan juri).'
  },
  rekom: {
    path: '/penilaian/rekomendasi',
    title: 'Tahap 4: Rekomendasi & Catatan Juri',
    description:
      'Pemberian rekomendasi penguatan program, potensi replikasi, dan catatan evaluasi resmi dewan juri.'
  },
  rekap: {
    path: '/penilaian/rekap',
    title: 'Rekapitulasi & Papan Peringkat Peserta',
    description:
      'Papan peringkat (leaderboard) dan rekapitulasi nilai akhir peserta seleksi TJSL Local Heroes PLN Electricity Services.'
  },
  login: {
    path: '/login',
    title: 'Masuk Akun Pengguna',
    description:
      'Halaman masuk akun resmi peserta inisiatif, dewan juri, dan panitia seleksi TJSL Local Heroes PT PLN Electricity Services.'
  },
  register: {
    path: '/register',
    title: 'Pendaftaran Akun Baru',
    description:
      'Registrasi akun baru untuk pengusul inisiatif, dewan juri, dan panitia seleksi TJSL Local Heroes PLN ES.'
  }
};

/**
 * Resolves current pathname into appMode & activeStep
 */
export function parseRoute(pathname = window.location.pathname) {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  if (clean === '/dashboard' || clean === '/admin') {
    return { appMode: 'dashboard', activeStep: 'overview', path: '/dashboard' };
  }
  if (clean === '/login') {
    return { appMode: 'login', activeStep: 'login', path: '/login' };
  }
  if (clean === '/register' || clean === '/daftar') {
    return { appMode: 'register', activeStep: 'register', path: '/register' };
  }

  if (clean === '/rekap' || clean === '/penilaian/rekap') {
    return { appMode: 'penilaian', activeStep: 'rekap', path: '/penilaian/rekap' };
  }

  if (clean.startsWith('/penilaian')) {
    const parts = clean.split('/').filter(Boolean);
    const sub = parts[1];

    if (sub === 'administrasi' || sub === 'admin') {
      return { appMode: 'penilaian', activeStep: 'admin', path: '/penilaian/administrasi' };
    }
    if (sub === 'substansi' || sub === 'nilai') {
      return { appMode: 'penilaian', activeStep: 'nilai', path: '/penilaian/substansi' };
    }
    if (sub === 'rekomendasi' || sub === 'rekom') {
      return { appMode: 'penilaian', activeStep: 'rekom', path: '/penilaian/rekomendasi' };
    }
    if (sub === 'rekap') {
      return { appMode: 'penilaian', activeStep: 'rekap', path: '/penilaian/rekap' };
    }
    return { appMode: 'penilaian', activeStep: 'identitas', path: '/penilaian/identitas' };
  }

  return { appMode: 'pendaftaran', activeStep: 'identitas', path: '/pendaftaran' };
}

/**
 * Custom Router hook with HTML5 History API & dynamic SEO integration.
 */
export function useRouter() {
  const [route, setRoute] = useState(() => parseRoute());

  // Synchronize URL and SEO whenever route state changes
  const applyRoute = useCallback((newAppMode, newActiveStep, replace = false) => {
    let targetPath = '/pendaftaran';
    let metaKey = 'pendaftaran';

    if (newAppMode === 'dashboard') {
      metaKey = 'dashboard';
      targetPath = '/dashboard';
    } else if (newAppMode === 'login') {
      metaKey = 'login';
      targetPath = '/login';
    } else if (newAppMode === 'register') {
      metaKey = 'register';
      targetPath = '/register';
    } else if (newAppMode === 'penilaian') {
      metaKey = newActiveStep || 'identitas';
      const meta = ROUTE_METADATA[metaKey] || ROUTE_METADATA.identitas;
      targetPath = meta.path;
    }

    const currentUrl = window.location.pathname;
    if (currentUrl !== targetPath) {
      if (replace) {
        window.history.replaceState({ appMode: newAppMode, activeStep: newActiveStep }, '', targetPath);
      } else {
        window.history.pushState({ appMode: newAppMode, activeStep: newActiveStep }, '', targetPath);
      }
    }

    const meta = ROUTE_METADATA[metaKey] || ROUTE_METADATA.pendaftaran;
    updateSEO({
      title: meta.title,
      description: meta.description,
      path: targetPath
    });

    setRoute({
      appMode: newAppMode,
      activeStep: newActiveStep || (newAppMode === 'login' ? 'login' : newAppMode === 'register' ? 'register' : 'identitas'),
      path: targetPath
    });
  }, []);

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRoute();
      setRoute(parsed);
      const metaKey = parsed.appMode === 'penilaian' ? parsed.activeStep : parsed.appMode;
      const meta = ROUTE_METADATA[metaKey] || ROUTE_METADATA.pendaftaran;
      updateSEO({
        title: meta.title,
        description: meta.description,
        path: parsed.path
      });
    };

    window.addEventListener('popstate', handlePopState);

    // Initial SEO sync on page load
    const initialParsed = parseRoute();
    const initialMetaKey = initialParsed.appMode === 'penilaian' ? initialParsed.activeStep : initialParsed.appMode;
    const initialMeta = ROUTE_METADATA[initialMetaKey] || ROUTE_METADATA.pendaftaran;
    updateSEO({
      title: initialMeta.title,
      description: initialMeta.description,
      path: initialParsed.path
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    route,
    navigate: applyRoute
  };
}

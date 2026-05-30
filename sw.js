// Studio PWA service worker.
// Bump CACHE when shipping new code; data.json is fetched network-first so
// the deck stays current the moment Mac-Claude updates it.
const CACHE = 'studio-v1';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/mark.png',
  './fonts/Geist-Regular.ttf',
  './fonts/Geist-Medium.ttf',
  './fonts/Geist-SemiBold.ttf',
  './fonts/Geist-Bold.ttf',
  './fonts/GeistMono-Regular.ttf'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Always try the network first for the data file.
  if (url.pathname.endsWith('data.json')) {
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put('./data.json', copy));
        return r;
      }).catch(() => caches.match('./data.json'))
    );
    return;
  }
  // Cache-first for the shell.
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

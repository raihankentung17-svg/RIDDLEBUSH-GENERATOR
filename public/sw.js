// File Service Worker Dasar
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
  });
  
  self.addEventListener('fetch', (e) => {
    // Biarkan browser melakukan fetch secara normal (online)
  });
// 기존 서비스워커 및 캐시 전체 삭제
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
  await self.clients.claim();
  self.registration.unregister();
});

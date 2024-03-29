self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('chat-cache').then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        '/assets/communication.png',
      ])
    })
  )
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open('chat-cache').then(async function (cache) {
      const response = await cache.match(event.request)
      return (
        response ||
        fetch(event.request).then(function (response_1) {
          if (response_1.status === 200 || response_1.status === 0) {
            cache.put(event.request, response_1.clone())
          }
          return response_1
        })
      )
    })
  )
})

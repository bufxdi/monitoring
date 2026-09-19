const CACHE_NAME = "monitoring-cache-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


// =========================================================
// INSTALL
// =========================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();

    }
);


// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !== CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                })

        );

        self.clients.claim();

    }
);


// =========================================================
// FETCH
// NETWORK FIRST
// =========================================================

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    /*
                     * Jika berhasil mengambil
                     * dari internet, simpan versi
                     * terbaru ke cache.
                     */

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const responseClone =
                            response.clone();

                        caches.open(
                            CACHE_NAME
                        ).then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    }

                    return response;

                })

                .catch(() => {

                    /*
                     * Jika internet gagal,
                     * gunakan cache.
                     */

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);

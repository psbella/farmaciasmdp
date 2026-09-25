// Pide a los Service Workers ya registrados que busquen una versión nueva de sw.js.
export function actualizarServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });
}

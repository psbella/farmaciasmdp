// "Instalar como app" y Service Worker en las páginas secundarias
// (como-funciona, farmacias, privacidad, términos). En index.html lo hace main.js.
import { setupInstallPWA } from './install.js';
import { registrarServiceWorker } from './sw-update.js';

registrarServiceWorker();
setupInstallPWA();

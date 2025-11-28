/**
 * Register service worker for PWA functionality
 * DISABLED for development to avoid CORS issues
 * Actively unregisters any existing service workers
 */
export const registerServiceWorker = () => {
  // Unregister all existing service workers for development
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('✅ Service worker unregistered');
          }
        });
      });
    });
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  }
  
  // Service worker registration is disabled for development
  // Uncomment below to enable in production
  return;
  
  /*
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  */
};

/**
 * Prompt user to install PWA
 */
export const promptInstall = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or banner
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
          installButton.style.display = 'none';
        });
      });
    }
  });
};


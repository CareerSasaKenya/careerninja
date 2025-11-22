import { useEffect } from 'react';

export const useFavicon = (faviconUrl: string | null | undefined) => {
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof document === "undefined") {
      return;
    }

    try {
      // Remove existing favicon links
      const existingIcons = document.querySelectorAll('link[rel*="icon"]');
      existingIcons.forEach(icon => {
        if (icon.parentNode) {
          try {
            icon.parentNode.removeChild(icon);
          } catch (e) {
            // Element may have already been removed
            console.debug('Could not remove favicon:', e);
          }
        }
      });
      
      // Add new favicon if provided
      if (faviconUrl) {
        // Add cache-busting parameter to force refresh
        const urlWithCacheBust = faviconUrl.includes('?') 
          ? `${faviconUrl}&v=${Date.now()}` 
          : `${faviconUrl}?v=${Date.now()}`;
        
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = urlWithCacheBust;
        document.head.appendChild(link);
        
        // Also add as shortcut icon for broader compatibility
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/x-icon';
        shortcutLink.href = urlWithCacheBust;
        document.head.appendChild(shortcutLink);
      } else {
        // Fallback to default favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = '/favicon.ico';
        document.head.appendChild(link);
      }
    } catch (error) {
      console.debug('Error updating favicon:', error);
    }
  }, [faviconUrl]);
};
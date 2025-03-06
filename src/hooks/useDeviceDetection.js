// src/hooks/useDeviceDetection.js
import { useState, useEffect } from 'react';

/**
 * A hook that detects if the user is on a mobile device or desktop
 * @returns {Object} - { isMobile, isDesktop }
 */
function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isDesktop: true
  });

  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      
      const isMobileDevice = mobileRegex.test(userAgent) || 
                            (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
      
      setDeviceType({
        isMobile: isMobileDevice,
        isDesktop: !isMobileDevice
      });
    };

    // Check device type on mount
    checkDeviceType();

    // Add listener for window resize
    window.addEventListener('resize', checkDeviceType);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return deviceType;
}

export default useDeviceDetection;
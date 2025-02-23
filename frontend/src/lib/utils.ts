import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCardinalDirection = (heading: number | undefined | null): string => {
  if (heading === undefined || heading === null) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((heading % 360) + 360) % 360 / 45) % 8;
  return directions[index];
};

export const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;

export const getShortestRotation = (startAngle: number, endAngle: number): number => {
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);
  let delta = end - start;
  
  if (Math.abs(delta) > 180) {
    delta = delta > 0 ? delta - 360 : delta + 360;
  }
  
  return delta;
};

export const setPanoramaOptions = (panorama: google.maps.StreetViewPanorama, disabled: boolean) => {
  panorama.setOptions({
    linksControl: !disabled,
    panControl: !disabled,
    zoomControl: !disabled,
    clickToGo: false,
    disableDefaultUI: disabled,
    addressControl: !disabled,
    showRoadLabels: !disabled
  });
};

export const waitForPanoTransition = (
  panorama: google.maps.StreetViewPanorama,
  targetPanoId: string,
  timeout: number = 5000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (panorama.getPano() === targetPanoId) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Panorama transition timeout'));
      }
    }, 100);
  });
};
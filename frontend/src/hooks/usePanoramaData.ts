// src/hooks/usePanoramaData.ts
import { ConnectedPanorama } from '@/types/Location';

export const usePanoramaData = () => {
  const getFreshPanoramaData = async (panoId: string): Promise<ConnectedPanorama[]> => {
    try {
      const sv = new google.maps.StreetViewService();
      const panoData = await sv.getPanorama({ pano: panoId });
      
      if (!panoData?.data?.links) {
        console.warn('No links in fresh panorama data');
        return [];
      }

      console.log('Fresh panorama data fetched:', {
        pano: panoId,
        linkCount: panoData.data.links.length
      });

      return panoData.data.links
        .filter((link): link is (google.maps.StreetViewLink & { pano: string; heading: number }) => 
          link.pano !== null && 
          link.heading !== null && 
          typeof link.pano === 'string' && 
          typeof link.heading === 'number'
        )
        .map(link => ({
          pano: link.pano,
          heading: link.heading
        }));
    } catch (error) {
      console.error('Error getting fresh panorama data:', error);
      return [];
    }
  };

  return { getFreshPanoramaData };
};
"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

type Place = {
  id: string;
  name: string;
  city: string;
  coordinates: [number, number];
};

type ItineraryMapProps = {
  places: Place[];
};

export default function ItineraryMap({ places }: ItineraryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || places.length === 0) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZG9uMDA3IiwiYSI6ImNrbGVtYzl6NjBmd3kydnByejJjcGh2aG0ifQ.UIoLVlM6ATwuWhLxHnhzew";
        
        if (!token) {
          console.error('Mapbox token is missing');
          return;
        }

        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = token;

        // Calculate center and bounds
        const coordinates = places.map((p) => p.coordinates);
        const lngs = coordinates.map((c) => c[0]);
        const lats = coordinates.map((c) => c[1]);
        const center: [number, number] = [
          (Math.min(...lngs) + Math.max(...lngs)) / 2,
          (Math.min(...lats) + Math.max(...lats)) / 2
        ];

        // Calculate appropriate zoom level
        const lngDiff = Math.max(...lngs) - Math.min(...lngs);
        const latDiff = Math.max(...lats) - Math.min(...lats);
        const maxDiff = Math.max(lngDiff, latDiff);
        let zoom = 6;
        if (maxDiff < 0.1) zoom = 10;
        else if (maxDiff < 0.5) zoom = 8;
        else if (maxDiff < 1) zoom = 7;
        else zoom = 6;

        if (!mounted) return;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          attributionControl: false,
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        // Add compact attribution
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        map.on('load', () => {
          if (!mounted) return;

          // Add markers for each place
          places.forEach((place, index) => {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `<div class="marker-pin">${index + 1}</div>`;
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.cursor = 'pointer';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            const marker = new mapboxgl.Marker(el)
              .setLngLat(place.coordinates)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div class="p-3">
                      <h3 class="font-semibold text-sm text-gray-900 mb-1">${place.name}</h3>
                      <p class="text-xs text-gray-600">${place.city}</p>
                    </div>
                  `)
              )
              .addTo(map);

            markersRef.current.push(marker);
          });

          // Add route line if we have multiple places
          if (coordinates.length > 1) {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                }
              }
            });

            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.7
              }
            });
          }
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [places]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" />
      <style jsx global>{`
        .mapboxgl-popup-content {
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-pin {
          width: 36px;
          height: 36px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </>
  );
}


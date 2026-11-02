import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Open CartoDB Voyager raster tiles (OpenStreetMap-based, open & free)
const OPEN_RASTER_STYLE = {
  version: 8,
  sources: {
    'carto-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-tiles-layer',
      type: 'raster',
      source: 'carto-tiles',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

const rawToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const hasValidMapboxToken = typeof rawToken === 'string' && rawToken.startsWith('pk.eyJ');

if (hasValidMapboxToken) {
  mapboxgl.accessToken = rawToken;
} else {
  // Client dummy token satisfying Mapbox GL JS internal format check
  mapboxgl.accessToken = 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiZHVtbXkifQ.dummy';
}

const MapboxMap = ({
  center = [78.9629, 20.5937], // Default to center of India
  zoom = 4,
  markers = [], // Array of { id, longitude, latitude, color, popupHTML, onClick }
  onMapLoad,
  onClick,
  height = '400px',
  width = '100%',
  className = '',
  interactive = true,
  style = 'mapbox://styles/mapbox/streets-v12'
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRefs = useRef({});

  const sanitizedCenter = [
    typeof center?.[0] === 'number' ? center[0] : parseFloat(center?.[0]) || 78.9629,
    typeof center?.[1] === 'number' ? center[1] : parseFloat(center?.[1]) || 20.5937,
  ];

  const mapStyle = hasValidMapboxToken ? (style || 'mapbox://styles/mapbox/streets-v12') : OPEN_RASTER_STYLE;

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: sanitizedCenter,
        zoom: zoom,
        interactive: interactive
      });

      if (interactive) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      map.current.on('load', () => {
        if (onMapLoad) onMapLoad(map.current);
      });

      if (onClick) {
        map.current.on('click', (e) => {
          onClick(e.lngLat);
        });
      }
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const centerLng = center?.[0];
  const centerLat = center?.[1];

  // Update center and zoom when props change
  useEffect(() => {
    if (map.current && sanitizedCenter.length === 2 && !isNaN(sanitizedCenter[0]) && !isNaN(sanitizedCenter[1])) {
      map.current.flyTo({ center: sanitizedCenter, zoom });
    }
  }, [centerLng, centerLat, zoom]);

  // Update markers when props change
  useEffect(() => {
    if (!map.current) return;

    const currentMarkerIds = markers.map(m => m.id);
    Object.keys(markerRefs.current).forEach(id => {
      if (!currentMarkerIds.includes(id)) {
        markerRefs.current[id].remove();
        delete markerRefs.current[id];
      }
    });

    markers.forEach(markerProps => {
      const { id, longitude, latitude, color = '#3B82F6', popupHTML, onClick } = markerProps;

      const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude);
      const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);

      if (isNaN(lng) || isNaN(lat)) {
        return;
      }

      if (!markerRefs.current[id]) {
        const mapboxMarker = new mapboxgl.Marker({ color })
          .setLngLat([lng, lat])
          .addTo(map.current);

        if (popupHTML) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);
          mapboxMarker.setPopup(popup);
        }

        if (onClick) {
          const markerElement = mapboxMarker.getElement();
          markerElement.style.cursor = 'pointer';
          markerElement.addEventListener('click', () => {
            onClick(markerProps);
          });
        }

        markerRefs.current[id] = mapboxMarker;
      } else {
        markerRefs.current[id].setLngLat([lng, lat]);
        if (popupHTML) {
          const popup = markerRefs.current[id].getPopup();
          if (popup) {
            popup.setHTML(popupHTML);
          } else {
            markerRefs.current[id].setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML));
          }
        }
      }
    });
  }, [markers]);

  return (
    <div
      ref={mapContainer}
      className={`map-container ${className}`}
      style={{ height, width, borderRadius: '0.75rem', overflow: 'hidden', position: 'relative' }}
    />
  );
};

export default MapboxMap;

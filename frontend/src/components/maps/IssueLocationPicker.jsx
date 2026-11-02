import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

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
  mapboxgl.accessToken = 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiZHVtbXkifQ.dummy';
}

const IssueLocationPicker = ({
  initialLocation,
  onLocationSelect,
  height = '350px',
  className = ''
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const defaultCenter = [78.9629, 20.5937]; // India
  const currentCenter = initialLocation
    ? [parseFloat(initialLocation.longitude) || 78.9629, parseFloat(initialLocation.latitude) || 20.5937]
    : defaultCenter;

  const mapStyle = hasValidMapboxToken ? 'mapbox://styles/mapbox/streets-v12' : OPEN_RASTER_STYLE;

  const onDragEnd = () => {
    if (!marker.current) return;
    const lngLat = marker.current.getLngLat();
    onLocationSelect({ latitude: lngLat.lat, longitude: lngLat.lng });
  };

  const updateMarker = (lng, lat) => {
    if (!map.current) return;

    if (!marker.current) {
      marker.current = new mapboxgl.Marker({ color: '#EF4444', draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);
      
      marker.current.on('dragend', onDragEnd);
    } else {
      marker.current.setLngLat([lng, lat]);
    }

    map.current.flyTo({ center: [lng, lat], zoom: 15 });
    onLocationSelect({ latitude: lat, longitude: lng });
  };

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    const zoomLevel = initialLocation ? 15 : 4;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: currentCenter,
        zoom: zoomLevel
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
        marker.current = new mapboxgl.Marker({ color: '#EF4444', draggable: true })
          .setLngLat([parseFloat(initialLocation.longitude), parseFloat(initialLocation.latitude)])
          .addTo(map.current);

        marker.current.on('dragend', onDragEnd);
      }

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        updateMarker(lng, lat);
      });
    } catch (err) {
      console.error('Failed to initialize location picker map:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarker(longitude, latitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get user location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Pin Issue Location <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
        </button>
      </div>

      {locationError && (
        <p className="text-xs text-red-500">{locationError}</p>
      )}

      <div className="relative border rounded-xl overflow-hidden border-gray-200 shadow-sm">
        <div ref={mapContainer} style={{ height, width: '100%' }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 text-sm font-medium text-gray-600 flex items-center gap-2 pointer-events-none">
          <MapPin className="w-4 h-4 text-red-500" />
          Click on map or drag pin to select location
        </div>
      </div>
    </div>
  );
};

export default IssueLocationPicker;

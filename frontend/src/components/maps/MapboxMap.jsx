import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// Use the token from env variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

import { MapPin, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    if (!mapboxgl.accessToken) {
      console.warn("Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.");
      return; // Do not initialize Mapbox to prevent crash
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: center,
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

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update center and zoom when props change
  useEffect(() => {
    if (map.current && center && center.length === 2) {
      map.current.flyTo({ center, zoom });
    }
  }, [center, zoom]);

  // Update markers when props change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers that are not in the new list
    const currentMarkerIds = markers.map(m => m.id);
    Object.keys(markerRefs.current).forEach(id => {
      if (!currentMarkerIds.includes(id)) {
        markerRefs.current[id].remove();
        delete markerRefs.current[id];
      }
    });

    // Add or update markers
    markers.forEach(markerProps => {
      const { id, longitude, latitude, color = '#3B82F6', popupHTML, onClick } = markerProps;
      
      // Skip invalid coordinates
      if (typeof longitude !== 'number' || typeof latitude !== 'number' || 
          isNaN(longitude) || isNaN(latitude)) {
        return;
      }

      if (!markerRefs.current[id]) {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'marker';
        
        const mapboxMarker = new mapboxgl.Marker({ color })
          .setLngLat([longitude, latitude])
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
        // Update existing marker
        markerRefs.current[id].setLngLat([longitude, latitude]);
        
        // If color changed, ideally we'd recreate it or update its SVG, but for simplicity here we assume color is constant or handled via custom HTML
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
      style={{ height, width, borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }} 
    />
  );
};

export default MapboxMap;

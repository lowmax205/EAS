import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { devError } from "../../components/common/devLogger";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPicker = React.forwardRef(
  (
    {
      onLocationSelect,
      initialLocation = null,
      className = "",
      isInline = false,
    },
    ref
  ) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (map.current) return; // initialize map only once

      // Wait a bit for the container to be properly rendered
      const initMap = () => {
        if (!mapContainer.current) return;

        // Function to initialize map with given coordinates
        const initializeMap = (
          lat,
          lng,
          address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        ) => {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [lng, lat],
            zoom: 15,
            attributionControl: false,
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

          // Add attribution control at bottom-left
          map.current.addControl(
            new mapboxgl.AttributionControl({
              compact: true,
            }),
            "bottom-left"
          );

          map.current.on("load", () => {
            setIsLoading(false);

            // Get the current map center to create initial marker
            const center = map.current.getCenter();
            const currentLocation = {
              lat: center.lat,
              lng: center.lng,
              latitude: center.lat,
              longitude: center.lng,
              address: address,
            };

            // Create initial marker
            marker.current = new mapboxgl.Marker({
              draggable: true,
              color: "#22C55E", // SNSU primary green color
            })
              .setLngLat([center.lng, center.lat])
              .addTo(map.current);

            // Handle marker drag
            marker.current.on("dragend", () => {
              const lngLat = marker.current.getLngLat();
              handleLocationChange(lngLat.lat, lngLat.lng);
            });

            // Set initial location
            setSelectedLocation(currentLocation);
            if (onLocationSelect) {
              onLocationSelect(currentLocation);
            }
          });

          // Handle map clicks to place/move marker
          map.current.on("click", (e) => {
            const { lat, lng } = e.lngLat;

            // Move marker to clicked location
            if (marker.current) {
              marker.current.setLngLat([lng, lat]);
            }

            handleLocationChange(lat, lng);
          });
        };

        // Try to get user's current location first
        if (navigator.geolocation && !initialLocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              initializeMap(latitude, longitude, "Your current location");
            },
            (error) => {
              devError("Geolocation error:", error.message);
              // Fallback to SNSU coordinates if geolocation fails
              const fallbackLocation = {
                lat: 10.3157,
                lng: 123.8854,
                address:
                  "Southwestern University PHINMA, Urgello Street, Cebu City",
              };
              initializeMap(
                fallbackLocation.lat,
                fallbackLocation.lng,
                fallbackLocation.address
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000, // Cache for 1 minute
            }
          );
        } else {
          // Use initial location if provided, otherwise fallback to SNSU
          const defaultLocation = initialLocation || {
            lat: 10.3157,
            lng: 123.8854,
            address:
              "Southwestern University PHINMA, Urgello Street, Cebu City",
          };
          initializeMap(
            defaultLocation.lat,
            defaultLocation.lng,
            defaultLocation.address
          );
        }
      };

      // Use timeout to ensure container is rendered
      const timer = setTimeout(initMap, 100);

      return () => {
        clearTimeout(timer);
        if (map.current) {
          map.current.remove();
        }
      };
    }, []);

    // Handle map resize when container becomes visible
    useEffect(() => {
      if (map.current && mapContainer.current) {
        // Trigger resize after a short delay to ensure container is visible
        const timer = setTimeout(() => {
          map.current.resize();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [isLoading]);

    // Add intersection observer to detect when map becomes visible (for transitions)
    useEffect(() => {
      if (!mapContainer.current || !map.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && map.current) {
              // Map is now visible, trigger resize
              setTimeout(() => {
                map.current.resize();
              }, 100);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(mapContainer.current);

      return () => {
        observer.disconnect();
      };
    }, [map.current]);

    const handleLocationChange = async (lat, lng) => {
      try {
        // Try to get address from reverse geocoding (simplified)
        let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        // You could add reverse geocoding here if needed
        // For now, we'll just use coordinates as address

        const location = {
          lat,
          lng,
          latitude: lat, // Also provide latitude/longitude for compatibility
          longitude: lng,
          address,
        };
        setSelectedLocation(location);

        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } catch (error) {
        devError("Error updating location:", error);

        // Fallback to just coordinates
        const location = {
          lat,
          lng,
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
        setSelectedLocation(location);

        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    };

    // Method to update location from external source (like LocationPicker)
    const updateLocation = (location) => {
      if (!map.current || !marker.current) return;

      const { lat, lng } = location;

      // Update map center and marker
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
      });

      marker.current.setLngLat([lng, lat]);

      const formattedLocation = {
        ...location,
        latitude: lat,
        longitude: lng,
      };
      setSelectedLocation(formattedLocation);

      if (onLocationSelect) {
        onLocationSelect(formattedLocation);
      }
    };

    // Method to trigger map resize (useful for parent components)
    const resizeMap = () => {
      if (map.current) {
        setTimeout(() => {
          map.current.resize();
        }, 100);
      }
    };

    // Expose updateLocation and resizeMap methods to parent components
    React.useImperativeHandle(ref, () => ({
      updateLocation,
      resizeMap,
    }));

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Loading map...
              </span>
            </div>
          </div>
        )}

        <div
          ref={mapContainer}
          className={`w-full rounded-lg ${
            isInline ? "h-[400px]" : "h-full min-h-[300px]"
          }`}
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s" }}
        />

        {selectedLocation && (
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Location:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {selectedLocation.address}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {selectedLocation.lat.toFixed(6)},{" "}
              {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Click or drag marker to select location
          </p>
        </div>
      </div>
    );
  }
);

MapPicker.displayName = "MapPicker";

export default MapPicker;

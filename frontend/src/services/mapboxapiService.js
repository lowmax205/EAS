/**
 * Mapbox API Service - Location and mapping services
 * This service handles location-based features, GPS verification,
 * and mapping functionality for the EAS-React application
 */

import { API_DELAYS } from "../components/common/constants/index";
import { devError } from "../components/common/devLogger";

// Mapbox API functions for location services
export const mapboxService = {
  // Get current user location
  async getCurrentLocation() {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_EVENTS)
      );

      // Use browser geolocation API
      if (!navigator.geolocation) {
        return {
          success: false,
          message: "Geolocation is not supported by this browser",
        };
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              success: true,
              data: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
              },
            });
          },
          (error) => {
            let message = "Failed to get current location";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = "Location access denied by user";
                break;
              case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable";
                break;
              case error.TIMEOUT:
                message = "Location request timed out";
                break;
              default:
                message = "Unknown error occurred while getting location";
                break;
            }
            resolve({
              success: false,
              message,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });
    } catch (error) {
      devError("Error getting current location:", error);
      return {
        success: false,
        message: "Failed to get current location",
      };
    }
  },

  // Verify user is within event location radius
  async verifyLocationWithinRadius(
    userLocation,
    eventLocation,
    radiusInMeters = 50
  ) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_CATEGORIES)
      );

      if (!userLocation || !eventLocation) {
        return {
          success: false,
          message: "Invalid location data provided",
        };
      }

      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      const isWithinRadius = distance <= radiusInMeters;

      return {
        success: true,
        data: {
          isWithinRadius,
          distance: Math.round(distance),
          radiusInMeters,
          userLocation,
          eventLocation,
        },
      };
    } catch (error) {
      devError("Error verifying location:", error);
      return {
        success: false,
        message: "Failed to verify location",
      };
    }
  },

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Mock reverse geocoding - get address from coordinates
  async reverseGeocode(latitude, longitude) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_CATEGORIES)
      );

      // Mock address data - in real implementation, this would use Mapbox API
      const mockAddress = {
        address: "Sample Address, City, Province",
        city: "Sample City",
        province: "Sample Province",
        country: "Philippines",
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };

      return {
        success: true,
        data: mockAddress,
      };
    } catch (error) {
      devError("Error reverse geocoding:", error);
      return {
        success: false,
        message: "Failed to get address information",
      };
    }
  },

  // Get directions between two points
  async getDirections(startLocation, endLocation) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_EVENTS)
      );

      if (!startLocation || !endLocation) {
        return {
          success: false,
          message: "Invalid location data provided",
        };
      }

      const distance = this.calculateDistance(
        startLocation.latitude,
        startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      // Mock directions data
      const mockDirections = {
        distance: Math.round(distance),
        duration: Math.round(distance / 83.33), // Assuming 5 km/h walking speed
        steps: [
          {
            instruction: "Head towards the event location",
            distance: Math.round(distance),
            duration: Math.round(distance / 83.33),
          },
        ],
        polyline: `${startLocation.latitude},${startLocation.longitude};${endLocation.latitude},${endLocation.longitude}`,
      };

      return {
        success: true,
        data: mockDirections,
      };
    } catch (error) {
      devError("Error getting directions:", error);
      return {
        success: false,
        message: "Failed to get directions",
      };
    }
  },

  // Search for places near a location
  async searchPlaces(query, location, radius = 1000) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_CATEGORIES)
      );

      // Mock search results
      const mockPlaces = [
        {
          id: 1,
          name: `${query} - Sample Location 1`,
          address: "Sample Address 1, City, Province",
          latitude: location.latitude + 0.001,
          longitude: location.longitude + 0.001,
          distance: Math.round(Math.random() * radius),
          category: "venue",
        },
        {
          id: 2,
          name: `${query} - Sample Location 2`,
          address: "Sample Address 2, City, Province",
          latitude: location.latitude - 0.001,
          longitude: location.longitude - 0.001,
          distance: Math.round(Math.random() * radius),
          category: "venue",
        },
      ];

      return {
        success: true,
        data: mockPlaces,
      };
    } catch (error) {
      devError("Error searching places:", error);
      return {
        success: false,
        message: "Failed to search places",
      };
    }
  },
};

export default mapboxService;

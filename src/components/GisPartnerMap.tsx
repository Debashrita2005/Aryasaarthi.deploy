'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Partner, PartnerType } from '@/lib/types';
import { PARTNERS } from '@/lib/partnerData';
import { computeHaversineDistance, computeEligibilityStatus, generateEligibilityReason } from '@/lib/partnerService';
import { useI18n } from '@/lib/i18n/context';
import { getLocalizedPartnerUI } from '@/lib/i18n/localizationHelper';
import {
  Navigation,
  MapPin,
  Building2,
  Compass,
  ExternalLink,
  Search,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  RefreshCw,
  LocateFixed,
  Layers,
  Map as MapIcon,
  Globe,
  Route as RouteIcon,
  Car,
  Clock,
  Star,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Radio,
} from 'lucide-react';

interface GisPartnerMapProps {
  schemeCode?: string;
  schemeName?: string;
  maxHeight?: string;
  showFilters?: boolean;
  className?: string;
  onSelectPartner?: (partner: Partner) => void;
  initialUserCoords?: { lat: number; lng: number } | null;
  initialPincode?: string;
  onUserCoordsChange?: (coords: { lat: number; lng: number } | null, pincode?: string) => void;
}

interface RouteInfo {
  distanceKm: string;
  durationMins: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coordinates: [number, number][];
}

export function GisPartnerMap({
  schemeCode = 'ALL',
  schemeName,
  maxHeight = '520px',
  showFilters = true,
  className = '',
  onSelectPartner,
  initialUserCoords = null,
  initialPincode = '',
  onUserCoordsChange,
}: GisPartnerMapProps) {
  const { language, t } = useI18n();
  const partnerUI = getLocalizedPartnerUI(language);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersByIdRef = useRef<Map<string, any>>(new Map());

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(initialUserCoords);
  const [pincodeInput, setPincodeInput] = useState<string>(initialPincode);
  const [pincodeSearching, setPincodeSearching] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>('');

  const [selectedScheme, setSelectedScheme] = useState<string>(schemeCode);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<'ALL' | 'SCA' | 'BANK' | 'RRB'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locating, setLocating] = useState<boolean>(false);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [leafletReady, setLeafletReady] = useState<boolean>(false);

  // Route & Navigation State
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [showRouteCard, setShowRouteCard] = useState<boolean>(true);

  // In-App "Start Your Ride" Live Simulation Mode
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navIndex, setNavIndex] = useState<number>(0);
  const [isNavPaused, setIsNavPaused] = useState<boolean>(false);
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync props
  useEffect(() => {
    if (initialUserCoords) {
      setUserCoords(initialUserCoords);
    }
  }, [initialUserCoords]);

  useEffect(() => {
    if (initialPincode) {
      setPincodeInput(initialPincode);
    }
  }, [initialPincode]);

  useEffect(() => {
    if (schemeCode) {
      setSelectedScheme(schemeCode);
    }
  }, [schemeCode]);

  // Compute filtered & sorted partners
  const filteredPartners = useMemo(() => {
    return PARTNERS.filter((p) => {
      // Scheme filter
      if (selectedScheme !== 'ALL' && !p.supported_scheme_codes.includes(selectedScheme)) {
        return false;
      }
      // State filter
      if (selectedState !== 'ALL' && p.state !== selectedState) {
        return false;
      }
      // Partner type filter
      if (partnerTypeFilter !== 'ALL' && p.partner_type !== partnerTypeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q) || (p.nameHi && p.nameHi.toLowerCase().includes(q));
        const matchDistrict = p.district.toLowerCase().includes(q);
        const matchState = p.state.toLowerCase().includes(q);
        const matchAddress = p.address.toLowerCase().includes(q);
        if (!matchName && !matchDistrict && !matchState && !matchAddress) return false;
      }
      return true;
    }).map((p) => {
      const distanceKm = userCoords
        ? computeHaversineDistance(userCoords.lat, userCoords.lng, p.latitude, p.longitude)
        : null;
      const eligibilityStatus = computeEligibilityStatus(p);
      const eligibilityReason = generateEligibilityReason(eligibilityStatus, distanceKm ?? undefined);
      return { ...p, distanceKm, eligibilityStatus, eligibilityReason };
    }).sort((a, b) => {
      // Prioritize eligible before restricted
      const tierA = a.eligibilityStatus === 'eligible' ? 0 : a.eligibilityStatus === 'restricted' ? 1 : 2;
      const tierB = b.eligibilityStatus === 'eligible' ? 0 : b.eligibilityStatus === 'restricted' ? 1 : 2;
      if (tierA !== tierB) return tierA - tierB;

      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return a.state.localeCompare(b.state);
    });
  }, [selectedScheme, selectedState, partnerTypeFilter, searchQuery, userCoords]);

  // Nearest partner when userCoords is active
  const nearestPartner = useMemo(() => {
    if (!userCoords || filteredPartners.length === 0) return null;
    return filteredPartners[0];
  }, [userCoords, filteredPartners]);

  // Auto-select nearest partner if none is selected yet
  useEffect(() => {
    if (nearestPartner && !activePartner) {
      setActivePartner(nearestPartner);
    }
  }, [nearestPartner, activePartner]);

  // Initialize OpenStreetMap via Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [22.9734, 78.6569],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // OpenStreetMap standard tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | NSFDC Citizen GIS',
          maxZoom: 19,
        }).addTo(map);

        // Layer groups
        const routeLayer = L.layerGroup().addTo(map);
        routeLayerRef.current = routeLayer;

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        mapInstanceRef.current = map;
        setLeafletReady(true);

        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // suppress cleanup errors
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        routeLayerRef.current = null;
        navMarkerRef.current = null;
        userMarkerRef.current = null;
        markersByIdRef.current.clear();
      }
    };
  }, []);

  // Update OpenStreetMap Markers
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('leaflet').then((L: any) => {
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();
      markersByIdRef.current.clear();

      const createPartnerIcon = (type: PartnerType | string, isSelected: boolean, isNearest: boolean) => {
        let bgClass = 'bg-emerald-600';
        let label = 'SCA';

        if (type === 'BANK' || type === 'PSB') {
          bgClass = 'bg-blue-600';
          label = 'Bank';
        } else if (type === 'RRB') {
          bgClass = 'bg-amber-600';
          label = 'RRB';
        } else if (type === 'OTHER') {
          bgClass = 'bg-purple-600';
          label = 'Partner';
        }

        const size = isSelected ? 40 : isNearest ? 36 : 30;

        return L.divIcon({
          className: 'custom-partner-marker',
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              border: ${isSelected || isNearest ? '3px solid #ffffff' : '2px solid white'};
              transform: translate(-50%, -50%);
              cursor: pointer;
              transition: all 0.2s ease;
            " class="${bgClass} ${isSelected ? 'ring-4 ring-emerald-400 scale-110' : isNearest ? 'ring-3 ring-amber-400' : ''}">
              ${isNearest ? '⭐ ' : ''}${label}
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bounds = L.latLngBounds([]);

      filteredPartners.forEach((partner, idx) => {
        const isSelected = activePartner?.id === partner.id;
        const isNearest = Boolean(userCoords && idx === 0);

        const marker = L.marker([partner.latitude, partner.longitude], {
          icon: createPartnerIcon(partner.partner_type, isSelected, isNearest),
        });

        const distanceHtml = partner.distanceKm !== null && partner.distanceKm !== undefined
          ? `<div style="font-size: 11px; font-weight: 800; color: #047857; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
              <span>📍</span>
              <span>${partner.distanceKm.toFixed(1)} km ${partnerUI.fromLocation}</span>
              ${isNearest ? '<span style="background: #fef3c7; color: #b45309; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 900;">NEAREST</span>' : ''}
            </div>`
          : '';

        const directionsUrl = userCoords
          ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${partner.latitude},${partner.longitude}&travelmode=driving`
          : `https://www.openstreetmap.org/?mlat=${partner.latitude}&mlon=${partner.longitude}#map=16/${partner.latitude}/${partner.longitude}`;

        const isBank = partner.partner_type === 'BANK' || partner.partner_type === 'PSB';
        const isSca = partner.partner_type === 'SCA';
        const typeBadgeText = isSca ? partnerUI.sca : isBank ? partnerUI.bank : partner.partner_type === 'RRB' ? partnerUI.rrb : partnerUI.other;
        const badgeBg = isSca ? '#dcfce7' : isBank ? '#dbeafe' : '#fef3c7';
        const badgeColor = isSca ? '#166534' : isBank ? '#1e40af' : '#92400e';

        const displayName = language === 'hi' && partner.nameHi ? partner.nameHi : partner.name;
        const displayAddress = language === 'hi' && partner.addressHi ? partner.addressHi : partner.address;

        const popupContent = `
          <div style="font-family: inherit; width: 260px; padding: 14px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor};">
                ${typeBadgeText}
              </span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">${partner.state}</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; line-height: 1.3; color: #0f172a;">
              ${displayName}
            </h4>
            ${distanceHtml}
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #475569; line-height: 1.4;">
              ${displayAddress}
            </p>
            <div style="margin-bottom: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 3px;">
                ${t.partners.supportedSchemes}
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${partner.supported_scheme_codes.map((c) => `<span style="font-size: 10px; font-weight: 700; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 1px 6px; border-radius: 4px;">${c}</span>`).join('')}
              </div>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 800; background: #15803d; color: #ffffff; padding: 6px 12px; border-radius: 8px; text-decoration: none; width: 100%; text-align: center;" title="Start Your Ride">
                🚗 Start Your Ride (Navigate) ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setActivePartner(partner);
          setShowRouteCard(true);
          if (onSelectPartner) onSelectPartner(partner);
        });

        markersLayer.addLayer(marker);
        markersByIdRef.current.set(partner.id, marker);
        bounds.extend([partner.latitude, partner.longitude]);
      });

      // User location marker for Leaflet
      if (userCoords && !isNavigating) {
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #0284c7;
              border: 3px solid white;
              box-shadow: 0 0 0 5px rgba(2, 132, 199, 0.45);
              transform: translate(-50%, -50%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
            ">
              📍
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const uMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 });
        uMarker.bindPopup(`
          <div style="padding: 10px; font-family: inherit; font-size: 12px; font-weight: 700; color: #0369a1;">
            🎯 ${locationLabel || t.mapUI.yourLocation}
          </div>
        `);
        markersLayer.addLayer(uMarker);
        userMarkerRef.current = uMarker;
        bounds.extend([userCoords.lat, userCoords.lng]);
      }

      // If no route is active and not navigating, fit partner markers
      if (!userCoords && bounds.isValid() && filteredPartners.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });
  }, [leafletReady, filteredPartners, userCoords, activePartner, isNavigating, language, locationLabel, onSelectPartner, partnerUI, t]);

  // Fetch and draw road route between userCoords and activePartner
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || !routeLayerRef.current) return;
    if (!userCoords || !activePartner) {
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
      }
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    setRouteLoading(true);

    async function fetchAndDrawRoute() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = await import('leaflet');
      if (!isMounted || !routeLayerRef.current || !mapInstanceRef.current) return;

      const origin = `${userCoords!.lng},${userCoords!.lat}`;
      const destination = `${activePartner!.longitude},${activePartner!.latitude}`;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`;

      let routeCoords: [number, number][] = [];
      let distanceKm = '';
      let durationMins = 0;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(osrmUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            distanceKm = (route.distance / 1000).toFixed(1);
            durationMins = Math.max(1, Math.round(route.duration / 60));
            // OSRM returns [lng, lat], Leaflet polyline expects [lat, lng]
            routeCoords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          }
        }
      } catch (err) {
        console.warn('OSRM route fetch failed or timed out, using geodesic line fallback:', err);
      }

      // Fallback to straight line if OSRM failed
      if (routeCoords.length === 0) {
        const haversineDist = computeHaversineDistance(
          userCoords!.lat,
          userCoords!.lng,
          activePartner!.latitude,
          activePartner!.longitude
        );
        distanceKm = haversineDist.toFixed(1);
        durationMins = Math.round((haversineDist / 40) * 60); // approx 40 km/h driving speed
        routeCoords = [
          [userCoords!.lat, userCoords!.lng],
          [activePartner!.latitude, activePartner!.longitude],
        ];
      }

      if (!isMounted || !routeLayerRef.current) return;

      const layer = routeLayerRef.current;
      layer.clearLayers();

      // 1. Casing / glow layer for contrast
      const glowPolyline = L.polyline(routeCoords, {
        color: '#0369a1',
        weight: 8,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layer.addLayer(glowPolyline);

      // 2. Main vivid road line
      const mainPolyline = L.polyline(routeCoords, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });
      layer.addLayer(mainPolyline);

      setRouteInfo({
        distanceKm,
        durationMins,
        coordinates: routeCoords,
      });
      setRouteLoading(false);
      setShowRouteCard(true);

      // Fit map bounds if not currently in active navigation mode
      if (!isNavigating) {
        try {
          const routeBounds = L.latLngBounds(routeCoords);
          routeBounds.extend([userCoords!.lat, userCoords!.lng]);
          routeBounds.extend([activePartner!.latitude, activePartner!.longitude]);
          mapInstanceRef.current.fitBounds(routeBounds, {
            padding: [50, 50],
            maxZoom: 14,
          });
        } catch (e) {
          // ignore bounds errors
        }
      }
    }

    fetchAndDrawRoute();

    return () => {
      isMounted = false;
    };
  }, [leafletReady, userCoords, activePartner, isNavigating]);

  // Handle in-map "Start Your Ride" live simulation
  const startInAppRide = async () => {
    if (!routeInfo || routeInfo.coordinates.length < 2 || !mapInstanceRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = await import('leaflet');
    setIsNavigating(true);
    setIsNavPaused(false);
    setNavIndex(0);

    const startPt = routeInfo.coordinates[0];
    mapInstanceRef.current.flyTo(startPt, 16, { duration: 1.5 });

    // Create custom vehicle navigator marker
    if (navMarkerRef.current) {
      navMarkerRef.current.remove();
    }

    const vehicleIcon = L.divIcon({
      className: 'custom-nav-vehicle',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #15803d;
          border: 3.5px solid white;
          box-shadow: 0 0 0 6px rgba(21, 128, 61, 0.4), 0 8px 20px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transform: translate(-50%, -50%);
          animation: pulse 1.5s infinite;
        ">
          🚗
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const vMarker = L.marker(startPt, { icon: vehicleIcon, zIndexOffset: 2000 });
    vMarker.addTo(mapInstanceRef.current);
    navMarkerRef.current = vMarker;
  };

  // Nav movement ticker
  useEffect(() => {
    if (!isNavigating || isNavPaused || !routeInfo || !mapInstanceRef.current) {
      if (navTimerRef.current) clearInterval(navTimerRef.current);
      return;
    }

    const coords = routeInfo.coordinates;
    const stepIntervalMs = 900; // time per waypoint step

    navTimerRef.current = setInterval(() => {
      setNavIndex((prev) => {
        const next = prev + 1;
        if (next >= coords.length) {
          clearInterval(navTimerRef.current!);
          return coords.length - 1;
        }

        const currentCoord = coords[next];
        if (navMarkerRef.current) {
          navMarkerRef.current.setLatLng(currentCoord);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(currentCoord, { animate: true, duration: 0.8 });
        }
        return next;
      });
    }, stepIntervalMs);

    return () => {
      if (navTimerRef.current) clearInterval(navTimerRef.current);
    };
  }, [isNavigating, isNavPaused, routeInfo]);

  // Stop in-app navigation
  const stopInAppRide = () => {
    setIsNavigating(false);
    setIsNavPaused(false);
    setNavIndex(0);
    if (navTimerRef.current) clearInterval(navTimerRef.current);
    if (navMarkerRef.current) {
      navMarkerRef.current.remove();
      navMarkerRef.current = null;
    }
    // Re-fit route overview
    if (routeInfo && mapInstanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('leaflet').then((L: any) => {
        const bounds = L.latLngBounds(routeInfo.coordinates);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      });
    }
  };

  // Handle Pincode Search
  const handlePincodeSearch = useCallback(async (pinToSearch: string) => {
    const cleanPin = pinToSearch.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      alert(language === 'hi' ? 'कृपया 6 अंकों का वैध पिनकोड दर्ज करें।' : 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setPincodeSearching(true);
    try {
      const res = await fetch(`/api/geocode-pincode?pincode=${cleanPin}`);
      const data = await res.json();

      if (res.ok && data.success && data.lat && data.lng) {
        const coords = { lat: data.lat, lng: data.lng };
        setUserCoords(coords);
        setLocationLabel(data.displayName || `PIN: ${cleanPin}`);
        if (onUserCoordsChange) {
          onUserCoordsChange(coords, cleanPin);
        }

        // Auto-select nearest partner after coords update
        const sorted = PARTNERS.map((p) => ({
          ...p,
          dist: computeHaversineDistance(coords.lat, coords.lng, p.latitude, p.longitude),
        })).sort((a, b) => a.dist - b.dist);

        if (sorted.length > 0) {
          setActivePartner(sorted[0]);
          setShowRouteCard(true);
        }

        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.flyTo([coords.lat, coords.lng], 11, { duration: 1.2 });
          } catch (e) {
            // map animation error
          }
        }
      } else {
        alert(language === 'hi' ? 'पिनकोड नहीं मिला। कृपया पुनः प्रयास करें।' : 'Unable to find location for this pincode. Please try again.');
      }
    } catch (err) {
      console.error('Pincode search error:', err);
      alert(language === 'hi' ? 'पिनकोड खोजने में त्रुटि।' : 'Error looking up pincode.');
    } finally {
      setPincodeSearching(false);
    }
  }, [language, onUserCoordsChange]);

  // Locate User via HTML5 Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(t.mapUI.geoNotSupported);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setLocationLabel('Current Live Location');
        setLocating(false);
        if (onUserCoordsChange) {
          onUserCoordsChange(coords);
        }

        // Auto-select nearest partner
        const sorted = PARTNERS.map((p) => ({
          ...p,
          dist: computeHaversineDistance(coords.lat, coords.lng, p.latitude, p.longitude),
        })).sort((a, b) => a.dist - b.dist);

        if (sorted.length > 0) {
          setActivePartner(sorted[0]);
          setShowRouteCard(true);
        }

        if (mapInstanceRef.current && mapContainerRef.current) {
          try {
            mapInstanceRef.current.flyTo([coords.lat, coords.lng], 12, { duration: 1.2 });
          } catch (e) {
            // map may have been removed
          }
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocating(false);
        alert(
          language === 'hi'
            ? 'स्थान अनुमति नहीं मिली। कृपया अपना 6-अंकीय पिनकोड दर्ज करें।'
            : 'Location permission denied. Please enter your 6-digit PIN code in the search box.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const states = Array.from(new Set(PARTNERS.map((p) => p.state))).sort();

  // Navigation URLs
  const googleNavigationUrl = userCoords && activePartner
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activePartner.latitude},${activePartner.longitude}&travelmode=driving`
    : '';

  const osmNavigationUrl = userCoords && activePartner
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords.lat}%2C${userCoords.lng}%3B${activePartner.latitude}%2C${activePartner.longitude}`
    : '';

  // Progress metrics for active navigation
  const navPercent = routeInfo && routeInfo.coordinates.length > 1
    ? Math.round((navIndex / (routeInfo.coordinates.length - 1)) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Filter & Routing Toolbar */}
      {showFilters && !isNavigating && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Quick Search */}
            <div className="relative min-w-[140px] sm:min-w-[170px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.mapUI.searchPlaceholder}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Pincode Quick Search Input */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">PIN:</span>
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handlePincodeSearch(pincodeInput)}
                placeholder="6 digits"
                maxLength={6}
                className="w-16 sm:w-20 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => handlePincodeSearch(pincodeInput)}
                disabled={pincodeSearching || pincodeInput.length < 6}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded text-[10px] font-black transition-all shadow-xs"
              >
                {pincodeSearching ? '...' : 'Find'}
              </button>
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">{t.mapUI.allStates}</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Partner Type Pills */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPartnerTypeFilter('ALL')}
                className={`px-2 py-1 rounded-md transition-all ${partnerTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All ({PARTNERS.length})
              </button>
              <button
                type="button"
                onClick={() => setPartnerTypeFilter('SCA')}
                className={`px-2 py-1 rounded-md transition-all ${partnerTypeFilter === 'SCA' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-800'}`}
              >
                SCA
              </button>
              <button
                type="button"
                onClick={() => setPartnerTypeFilter('BANK')}
                className={`px-2 py-1 rounded-md transition-all ${partnerTypeFilter === 'BANK' ? 'bg-blue-700 text-white shadow-xs' : 'text-blue-800'}`}
              >
                Banks
              </button>
              <button
                type="button"
                onClick={() => setPartnerTypeFilter('RRB')}
                className={`px-2 py-1 rounded-md transition-all ${partnerTypeFilter === 'RRB' ? 'bg-amber-700 text-white shadow-xs' : 'text-amber-800'}`}
              >
                RRB
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
              {filteredPartners.length} {t.mapUI.locationsAvailable}
            </span>

            {/* Locate Me (GPS) Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="touch-target px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all focus:ring-2 focus:ring-emerald-400"
            >
              {locating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-emerald-100" />
              )}
              <span>{locating ? t.common.loading : partnerUI.locateMe}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Map + Side Directory Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative">
        {/* Map Canvas: OpenStreetMap via Leaflet */}
        <div className="lg:col-span-8 relative bg-slate-100" style={{ height: maxHeight, minHeight: '480px' }}>
          <div className="w-full h-full relative" style={{ height: maxHeight, minHeight: '480px' }}>
            <div ref={mapContainerRef} className="w-full h-full" style={{ height: maxHeight, minHeight: '480px' }} />

            {/* OpenStreetMap Floating Badge */}
            {!isNavigating && (
              <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200/90 flex items-center gap-2 text-[11px] font-bold text-slate-800 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  OpenStreetMap GIS
                </span>
                <span className="text-slate-300 font-normal">|</span>
                <span className="text-slate-600 font-semibold">{filteredPartners.length} Locations</span>
              </div>
            )}

            {/* In-App Live Navigation HUD (When Ride is Started) */}
            {isNavigating && activePartner && routeInfo && (
              <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[500] bg-slate-900/95 text-white p-4 rounded-3xl shadow-2xl border border-emerald-500/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" />
                      Live Navigation Active
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsNavPaused(!isNavPaused)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                      title={isNavPaused ? 'Resume Navigation' : 'Pause Navigation'}
                    >
                      {isNavPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={stopInAppRide}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs"
                    >
                      Exit Ride
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 mb-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-5 h-5 text-emerald-400 shrink-0 transform -rotate-45" />
                    <span className="text-xs font-bold text-slate-200">
                      {navPercent >= 95
                        ? 'Arriving at destination on the right'
                        : 'Proceed along routed corridor toward destination'}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white truncate">
                    {language === 'hi' && activePartner.nameHi ? activePartner.nameHi : activePartner.name}
                  </h4>
                </div>

                {/* Progress & Live Telemetry */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/60 p-2 rounded-xl mb-3 border border-slate-800">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">Progress</span>
                    <span className="text-xs font-black text-emerald-400">{navPercent}%</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">Distance</span>
                    <span className="text-xs font-black text-white">{routeInfo.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase">Est. Time</span>
                    <span className="text-xs font-black text-blue-400">~{routeInfo.durationMins} mins</span>
                  </div>
                </div>

                {/* External Fullscreen Native GPS Redirect */}
                <a
                  href={googleNavigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <span>Launch External Voice GPS ↗</span>
                </a>
              </div>
            )}

            {/* Active Live Driving Route Floating Banner (CALL BUTTON REMOVED) */}
            {userCoords && activePartner && showRouteCard && routeInfo && !isNavigating && (
              <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-[400] bg-white/98 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-blue-200 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          Live Driving Route
                        </span>
                        {nearestPartner?.id === activePartner.id && (
                          <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                            Nearest
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 truncate max-w-[240px]">
                        To: {language === 'hi' && activePartner.nameHi ? activePartner.nameHi : activePartner.name}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRouteCard(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 mb-3 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Distance</span>
                    <span className="text-base font-black text-emerald-800">{routeInfo.distanceKm} km</span>
                  </div>
                  <div className="border-l border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">Est. Drive Time</span>
                    <span className="text-base font-black text-blue-800">~{routeInfo.durationMins} mins</span>
                  </div>
                </div>

                {/* Primary Action Buttons: Start Your Ride In-Map & Redirected Live GPS */}
                <div className="space-y-2">
                  {/* Button 1: Start Your Ride (In-App Live Navigation Mode) */}
                  <button
                    type="button"
                    onClick={startInAppRide}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Car className="w-4 h-4" />
                    <span>Start Your Ride (In-Map Guidance)</span>
                  </button>

                  {/* Button 2: Redirected External Live GPS Navigation */}
                  <a
                    href={googleNavigationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title="Opens Voice-Guided Turn-by-Turn GPS navigation"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Launch Native Turn-by-Turn GPS Navigation ↗</span>
                  </a>

                  {/* Open in OpenStreetMap direct link */}
                  <div className="text-center pt-0.5">
                    <a
                      href={osmNavigationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 underline"
                    >
                      View raw directions in OpenStreetMap ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Map Legend Floating Overlay */}
            {!isNavigating && (
              <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs p-2.5 rounded-2xl shadow-lg border border-slate-200 text-[10px] font-bold flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs inline-block"></span>
                  <span>SCA (Agency)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-800">
                  <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs inline-block"></span>
                  <span>Nationalized Bank</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs inline-block"></span>
                  <span>Rural Bank (RRB)</span>
                </div>
                {userCoords && (
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <span className="w-3 h-3 rounded-full bg-sky-600 border-2 border-white shadow-xs inline-block"></span>
                    <span>You (Live/PIN)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Synchronized Partner Directory List */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col" style={{ maxHeight }}>
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">
              {t.mapUI.serviceDirectory}
            </span>
            {userCoords && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>📍</span>
                <span>Sorted by distance</span>
              </span>
            )}
          </div>

          {/* Scrollable Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner, idx) => {
                const isSelected = activePartner?.id === partner.id;
                const isNearest = Boolean(userCoords && idx === 0);

                const cardDirectionsUrl = userCoords
                  ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${partner.latitude},${partner.longitude}&travelmode=driving`
                  : `https://www.openstreetmap.org/?mlat=${partner.latitude}&mlon=${partner.longitude}#map=16/${partner.latitude}/${partner.longitude}`;

                return (
                  <div
                    key={partner.id}
                    onClick={() => {
                      setActivePartner(partner);
                      setShowRouteCard(true);
                      if (mapInstanceRef.current && mapContainerRef.current) {
                        try {
                          mapInstanceRef.current.flyTo([partner.latitude, partner.longitude], 13, { duration: 1.2 });
                          const marker = markersByIdRef.current.get(partner.id);
                          if (marker) {
                            marker.openPopup();
                          }
                        } catch (e) {
                          // map may have been removed
                        }
                      }
                      if (onSelectPartner) onSelectPartner(partner);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border relative ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                        : isNearest
                        ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                        : partner.eligibilityStatus === 'restricted'
                        ? 'bg-slate-50/80 border-amber-200 hover:border-amber-300'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    {isNearest && (
                      <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>Nearest Authorized Provider</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          partner.partner_type === 'SCA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : partner.partner_type === 'BANK'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {partner.partner_type}
                        </span>

                        {partner.eligibilityStatus && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            partner.eligibilityStatus === 'restricted'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : partner.eligibilityStatus === 'ineligible'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {partner.eligibilityStatus === 'restricted' ? 'Restricted' : partner.eligibilityStatus === 'ineligible' ? 'Ineligible' : 'Eligible'}
                          </span>
                        )}
                      </div>

                      {partner.distanceKm !== null && partner.distanceKm !== undefined && (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {partner.distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                      {language === 'hi' && partner.nameHi ? partner.nameHi : partner.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-1">
                      {partner.address}
                    </p>

                    {partner.eligibilityReason && (
                      <p className={`text-[10px] font-medium leading-snug mb-2 p-1.5 rounded-lg ${
                        partner.eligibilityStatus === 'restricted'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                          : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                      }`}>
                        {partner.eligibilityReason}
                      </p>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100 text-[11px]">
                      <a
                        href={cardDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                        title="Start Your Ride"
                      >
                        <RouteIcon className="w-3.5 h-3.5" />
                        <span>{userCoords ? 'Start Your Ride ↗' : t.mapUI.navigate}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                {t.mapUI.noMatching}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

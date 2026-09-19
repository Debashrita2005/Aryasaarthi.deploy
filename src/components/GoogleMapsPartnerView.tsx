'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Partner } from '@/lib/types';
import {
  loadGoogleMaps,
  GOOGLE_MAPS_ACCESSIBILITY_STYLE,
  getGoogleMapsMarkerIcon,
  getGoogleMapsApiKey,
  isGoogleMapsKeyConfigured,
  setStoredGoogleMapsApiKey,
  removeStoredGoogleMapsApiKey,
} from '@/lib/maps/googleMapsLoader';
import { useI18n } from '@/lib/i18n/context';
import { getLocalizedPartnerUI } from '@/lib/i18n/localizationHelper';
import {
  MapPin,
  Building2,
  Phone,
  Compass,
  ExternalLink,
  Layers,
  RotateCcw,
  AlertTriangle,
  Navigation,
  Search,
  Key,
  CheckCircle2,
  X,
  Sparkles,
  Car,
  Clock,
  Info,
  Maximize2,
  Share2,
} from 'lucide-react';

interface GoogleMapsPartnerViewProps {
  partners: (Partner & { distanceKm?: number | null })[];
  userCoords: { lat: number; lng: number } | null;
  activePartner: Partner | null;
  onSelectPartner: (partner: Partner) => void;
  maxHeight?: string;
  selectedScheme?: string;
  className?: string;
  onOpenKeyModal?: () => void;
}

export function GoogleMapsPartnerView({
  partners,
  userCoords,
  activePartner,
  onSelectPartner,
  maxHeight = '560px',
  selectedScheme = 'ALL',
  className = '',
  onOpenKeyModal,
}: GoogleMapsPartnerViewProps) {
  const { language, t } = useI18n();
  const partnerUI = getLocalizedPartnerUI(language);

  type PartnerWithDist = Partner & { distanceKm?: number | null };

  // Map DOM Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Real Google Maps Refs
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<{ [id: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userCircleRef = useRef<google.maps.Circle | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  // Leaflet Tile Map Fallback Refs (When Google Maps Key is pending)
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any>(null);
  const leafletTileRef = useRef<any>(null);
  const leafletRouteRef = useRef<any>(null);

  // Engine & Key states
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showKeyModalLocal, setShowKeyModalLocal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  // Map Configuration states
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | 'ALL'>('ALL');
  const [mapSearchText, setMapSearchText] = useState<string>('');

  // Route & Directions states
  const [activeRoute, setActiveRoute] = useState<{
    partner: PartnerWithDist;
    distanceText: string;
    durationText: string;
  } | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState<boolean>(false);

  // Check key on mount
  useEffect(() => {
    const configured = isGoogleMapsKeyConfigured();
    setHasApiKey(configured);
    const existing = getGoogleMapsApiKey();
    setApiKeyInput(existing);
  }, []);

  // Filter partners by radius and search text
  const displayedPartners = useMemo(() => {
    let list = partners;
    if (mapSearchText.trim()) {
      const q = mapSearchText.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameHi && p.nameHi.toLowerCase().includes(q)) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
      );
    }
    if (radiusKm !== 'ALL' && userCoords) {
      list = list.filter((p) => {
        if (p.distanceKm !== undefined && p.distanceKm !== null) {
          return p.distanceKm <= radiusKm;
        }
        return true;
      });
    }
    return list;
  }, [partners, mapSearchText, radiusKm, userCoords]);

  // -------------------------------------------------------------
  // 1. LIVE GOOGLE MAPS LOADER (When API key is provided)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!hasApiKey) return;

    let isMounted = true;

    async function initGoogleMaps() {
      try {
        setLoading(true);
        setLoadError(null);

        // Clean up Leaflet map if previously loaded
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const googleObj = await loadGoogleMaps();
        if (!isMounted || !mapContainerRef.current) return;

        const initialCenter = userCoords
          ? { lat: userCoords.lat, lng: userCoords.lng }
          : { lat: 22.5937, lng: 78.9629 };

        const map = new googleObj.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: userCoords ? 9 : 5,
          mapTypeId:
            mapType === 'roadmap'
              ? googleObj.maps.MapTypeId.ROADMAP
              : googleObj.maps.MapTypeId.HYBRID,
          styles: mapType === 'roadmap' ? GOOGLE_MAPS_ACCESSIBILITY_STYLE : [],
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: googleObj.maps.ControlPosition.RIGHT_BOTTOM,
          },
        });

        googleMapRef.current = map;
        infoWindowRef.current = new googleObj.maps.InfoWindow();
        directionsServiceRef.current = new googleObj.maps.DirectionsService();
        directionsRendererRef.current = new googleObj.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#059669',
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
        });

        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Google Maps Initialization Warning:', err);
        setLoadError(err.message || 'Google Maps API failed to load.');
        setHasApiKey(false);
        setLoading(false);
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [hasApiKey]);

  // Update Google Maps markers & bounds
  useEffect(() => {
    if (!hasApiKey || !googleMapRef.current || typeof google === 'undefined' || !google.maps) return;

    const map = googleMapRef.current;
    Object.values(googleMarkersRef.current).forEach((m) => m.setMap(null));
    googleMarkersRef.current = {};

    const bounds = new google.maps.LatLngBounds();

    displayedPartners.forEach((partner) => {
      const position = { lat: partner.latitude, lng: partner.longitude };
      bounds.extend(position);

      const markerType =
        partner.partner_type === 'SCA'
          ? 'SCA'
          : partner.partner_type === 'RRB'
          ? 'RRB'
          : 'BANK';
      const icon = getGoogleMapsMarkerIcon(markerType);

      const marker = new google.maps.Marker({
        position,
        map,
        title: partner.name,
        icon,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        onSelectPartner(partner);
        showGoogleInfoWindow(partner, marker);
      });

      googleMarkersRef.current[partner.id] = marker;
    });

    if (userCoords) {
      const userPos = { lat: userCoords.lat, lng: userCoords.lng };
      bounds.extend(userPos);

      if (!userMarkerRef.current) {
        userMarkerRef.current = new google.maps.Marker({
          position: userPos,
          map,
          title: t.mapUI.yourLocation,
          icon: getGoogleMapsMarkerIcon('USER'),
          zIndex: 999,
        });
      } else {
        userMarkerRef.current.setPosition(userPos);
      }
    }

    if (displayedPartners.length > 0) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 14) map.setZoom(14);
        google.maps.event.removeListener(listener);
      });
    }
  }, [displayedPartners, userCoords, hasApiKey]);

  // -------------------------------------------------------------
  // 2. INTERACTIVE TILE MAP ENGINE (When API key is pending)
  // -------------------------------------------------------------
  useEffect(() => {
    if (hasApiKey) return;
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeafletMap() {
      try {
        setLoading(true);
        const L = await import('leaflet');
        if (!isMounted || !mapContainerRef.current) return;

        // Re-use or initialize map
        if (!leafletMapRef.current) {
          const center = userCoords ? [userCoords.lat, userCoords.lng] : [22.9734, 78.6569];
          const map = L.map(mapContainerRef.current, {
            center: center as [number, number],
            zoom: userCoords ? 9 : 5,
            zoomControl: false,
          });

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          leafletMapRef.current = map;
          leafletMarkersRef.current = L.layerGroup().addTo(map);
          leafletRouteRef.current = L.layerGroup().addTo(map);
        }

        // Set tile layer
        const map = leafletMapRef.current;
        if (leafletTileRef.current) {
          map.removeLayer(leafletTileRef.current);
        }

        const tileUrl =
          mapType === 'roadmap'
            ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

        const tileLayer = L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap | Google Maps Partner Engine Preview',
          maxZoom: 18,
        }).addTo(map);
        leafletTileRef.current = tileLayer;

        setLoading(false);
      } catch (err) {
        console.warn('Leaflet tile map error:', err);
        setLoading(false);
      }
    }

    initLeafletMap();

    return () => {
      isMounted = false;
    };
  }, [hasApiKey, mapType]);

  // Cleanup Leaflet on unmount to prevent '_leaflet_pos' crash
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        try {
          // Stop any ongoing animations before unmounting
          leafletMapRef.current.stop();
          leafletMapRef.current.off();
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn('Leaflet unmount cleanup warning:', e);
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Leaflet markers & user location
  useEffect(() => {
    if (hasApiKey || !leafletMapRef.current || !leafletMarkersRef.current) return;

    import('leaflet').then((L) => {
      const map = leafletMapRef.current;
      const markersLayer = leafletMarkersRef.current;
      markersLayer.clearLayers();

      const bounds = L.latLngBounds([]);

      displayedPartners.forEach((partner) => {
        const isSelected = activePartner?.id === partner.id;
        bounds.extend([partner.latitude, partner.longitude]);

        const pinBg =
          partner.partner_type === 'SCA'
            ? 'background: #15803d;'
            : partner.partner_type === 'RRB'
            ? 'background: #d97706;'
            : 'background: #1d4ed8;';

        const pinIcon = L.divIcon({
          className: 'google-style-pin',
          html: `
            <div style="
              ${pinBg}
              width: ${isSelected ? 36 : 28}px;
              height: ${isSelected ? 36 : 28}px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2.5px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 10px;">
                ${partner.partner_type === 'SCA' ? 'S' : partner.partner_type === 'RRB' ? 'R' : 'B'}
              </span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });

        const marker = L.marker([partner.latitude, partner.longitude], { icon: pinIcon });

        const directionsUrl = userCoords
          ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${partner.latitude},${partner.longitude}`
          : `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;

        const schemesHtml = partner.supported_scheme_codes
          .map(
            (c) =>
              `<span style="display:inline-block; font-size:10px; font-weight:700; background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; padding:1px 5px; border-radius:4px; margin-right:3px; margin-bottom:3px;">${c}</span>`
          )
          .join('');

        const popupHtml = `
          <div style="padding: 10px; max-width: 280px; font-family: sans-serif;">
            <div style="font-size: 10px; font-weight: 800; color: #15803d; text-transform: uppercase; margin-bottom: 4px;">
              ${partner.partner_type === 'SCA' ? partnerUI.sca : partner.partner_type === 'RRB' ? partnerUI.rrb : partnerUI.bank}
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              ${language === 'hi' && partner.nameHi ? partner.nameHi : partner.name}
            </h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
              ${partner.address}, ${partner.district}, ${partner.state}
            </p>
            ${partner.eligibilityReason ? `
              <div style="font-size: 10px; font-weight: 600; color: ${partner.eligibilityStatus === 'restricted' ? '#92400e' : '#065f46'}; background: ${partner.eligibilityStatus === 'restricted' ? '#fef3c7' : '#ecfdf5'}; border: 1px solid ${partner.eligibilityStatus === 'restricted' ? '#fde68a' : '#a7f3d0'}; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px; line-height: 1.25;">
                ${partner.eligibilityReason}
              </div>
            ` : ''}
            <div style="margin-bottom: 6px;">${schemesHtml}</div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
              <a href="tel:${partner.phone}" style="font-size: 11px; font-weight: 700; color: #15803d; text-decoration: none;">📞 ${partner.phone}</a>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; font-weight: 800; background: #15803d; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none;">नेविगेट करें</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          onSelectPartner(partner);
          requestGoogleDirections(partner);
        });

        marker.addTo(markersLayer);
      });

      // User location marker & radius circle
      if (userCoords) {
        bounds.extend([userCoords.lat, userCoords.lng]);

        const userPin = L.divIcon({
          className: 'user-pin',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              background: #0284c7;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 12px rgba(2, 132, 199, 0.8);
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        L.marker([userCoords.lat, userCoords.lng], { icon: userPin }).addTo(markersLayer);

        if (radiusKm !== 'ALL') {
          L.circle([userCoords.lat, userCoords.lng], {
            radius: (radiusKm as number) * 1000,
            color: '#0284c7',
            weight: 1.5,
            fillColor: '#38bdf8',
            fillOpacity: 0.12,
          }).addTo(markersLayer);
        }
      }

      if (displayedPartners.length > 0 && map) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    });
  }, [displayedPartners, userCoords, radiusKm, hasApiKey, activePartner]);

  // Request driving directions & draw route polyline
  const requestGoogleDirections = (partner: PartnerWithDist) => {
    if (!userCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;
      window.open(url, '_blank');
      return;
    }

    setCalculatingRoute(true);

    // If live Google Maps is active
    if (hasApiKey && directionsServiceRef.current && directionsRendererRef.current) {
      directionsServiceRef.current.route(
        {
          origin: { lat: userCoords.lat, lng: userCoords.lng },
          destination: { lat: partner.latitude, lng: partner.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          setCalculatingRoute(false);
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            setActiveRoute({
              partner,
              distanceText: leg?.distance?.text || `${partner.distanceKm?.toFixed(1)} km`,
              durationText: leg?.duration?.text || 'Est. 30 mins',
            });
          }
        }
      );
      return;
    }

    // Interactive Tile Map Route Drawing (Leaflet mode)
    if (leafletMapRef.current && leafletRouteRef.current) {
      import('leaflet').then((L) => {
        const routeLayer = leafletRouteRef.current;
        routeLayer.clearLayers();

        const latlngs = [
          [userCoords.lat, userCoords.lng],
          [partner.latitude, partner.longitude],
        ];

        L.polyline(latlngs as any, {
          color: '#059669',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(routeLayer);

        const distKm = partner.distanceKm || 15;
        const estMinutes = Math.round(distKm * 2.2);

        setActiveRoute({
          partner,
          distanceText: `${distKm.toFixed(1)} km`,
          durationText: estMinutes > 60 ? `${Math.floor(estMinutes / 60)}h ${estMinutes % 60}m` : `${estMinutes} mins`,
        });

        setCalculatingRoute(false);
      });
    }
  };

  // Clear active route
  const clearRoute = () => {
    setActiveRoute(null);
    if (directionsRendererRef.current) {
      directionsRendererRef.current.set('directions', null);
    }
    if (leafletRouteRef.current) {
      leafletRouteRef.current.clearLayers();
    }
  };

  // Show InfoWindow on Google Maps marker
  const showGoogleInfoWindow = (
    partner: PartnerWithDist,
    marker: google.maps.Marker
  ) => {
    if (!infoWindowRef.current || !googleMapRef.current) return;

    const directionsUrl = userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${partner.latitude},${partner.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;

    const contentString = `
      <div style="font-family: Inter, sans-serif; padding: 6px; max-width: 290px; color: #0f172a;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 9999px;">
          ${partner.partner_type === 'SCA' ? partnerUI.sca : partner.partner_type === 'RRB' ? partnerUI.rrb : partnerUI.bank}
        </span>
        <h4 style="font-size: 14px; font-weight: 800; margin: 6px 0 4px 0; color: #0f172a;">
          ${language === 'hi' && partner.nameHi ? partner.nameHi : partner.name}
        </h4>
        <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
          ${partner.address}, ${partner.district}, ${partner.state}
        </p>
        ${partner.eligibilityReason ? `
          <div style="font-size: 10px; font-weight: 600; color: ${partner.eligibilityStatus === 'restricted' ? '#92400e' : '#065f46'}; background: ${partner.eligibilityStatus === 'restricted' ? '#fef3c7' : '#ecfdf5'}; border: 1px solid ${partner.eligibilityStatus === 'restricted' ? '#fde68a' : '#a7f3d0'}; padding: 4px 6px; border-radius: 6px; margin-bottom: 8px; line-height: 1.25;">
            ${partner.eligibilityReason}
          </div>
        ` : ''}
        <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
          <a href="tel:${partner.phone}" style="font-size: 11px; font-weight: 700; color: #15803d; text-decoration: none;">📞 ${partner.phone}</a>
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 800; background: #15803d; color: #ffffff; padding: 4px 10px; border-radius: 8px; text-decoration: none;">Directions</a>
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(contentString);
    infoWindowRef.current.open(googleMapRef.current, marker);
  };

  // Save API Key via Modal
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setStoredGoogleMapsApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      setKeySaveMessage('Google Maps API Key saved! Activating live Google Maps Platform...');
      setTimeout(() => {
        setShowKeyModalLocal(false);
        setKeySaveMessage(null);
        window.location.reload();
      }, 1000);
    }
  };

  // Remove API Key
  const handleRemoveApiKey = () => {
    removeStoredGoogleMapsApiKey();
    setApiKeyInput('');
    setHasApiKey(false);
    setKeySaveMessage('API Key removed');
    setTimeout(() => {
      setShowKeyModalLocal(false);
      setKeySaveMessage(null);
    }, 800);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 ${className}`}>
      {/* TOP FLOATING CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Brand Badge & Platform Indicator */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black text-slate-900 tracking-tight">
            Google Maps™
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              hasApiKey
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            {hasApiKey
              ? (language === 'hi' ? 'लाइव गूगल मैप्स' : 'Live Platform')
              : (language === 'hi' ? 'लोकल मैप सक्रिय' : 'Localhost Active')}
          </span>
        </div>

        {/* Center: Radius Filter */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-700">
          <span className="px-2 text-slate-500 text-[10px] uppercase font-black">
            {language === 'hi' ? 'दायरा:' : 'Radius:'}
          </span>
          {[
            { val: 'ALL', label: language === 'hi' ? 'सभी' : 'All' },
            { val: 25, label: '25 km' },
            { val: 50, label: '50 km' },
            { val: 100, label: '100 km' },
          ].map((r) => (
            <button
              key={r.val.toString()}
              type="button"
              onClick={() => setRadiusKm(r.val as any)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                radiusKm === r.val
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Right: Roadmap vs Satellite & API Key Trigger */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'roadmap'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.mapUI.roadmap}
            </button>
            <button
              type="button"
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'hybrid'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.mapUI.satellite}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenKeyModal) onOpenKeyModal();
              else setShowKeyModalLocal(true);
            }}
            className="bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">
              {hasApiKey ? (language === 'hi' ? 'कुंजी' : 'API Key') : (language === 'hi' ? 'कुंजी जोड़ें' : 'Add API Key')}
            </span>
          </button>
        </div>
      </div>

      {/* FLOATING ROUTE SUMMARY CARD (Turn-by-turn driving route) */}
      {activeRoute && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-300 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>{t.mapUI.drivingRoute}</span>
            </div>
            <button
              type="button"
              onClick={clearRoute}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-bold text-slate-900 truncate">
            {language === 'hi' && activeRoute.partner.nameHi
              ? activeRoute.partner.nameHi
              : activeRoute.partner.name}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs bg-emerald-50/80 p-2 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">
                {t.mapUI.distance}
              </span>
              <span className="font-extrabold text-emerald-900 text-sm">
                {activeRoute.distanceText}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">
                {t.mapUI.estDuration}
              </span>
              <span className="font-extrabold text-emerald-900 text-sm">
                {activeRoute.durationText}
              </span>
            </div>
          </div>

          <a
            href={
              userCoords
                ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeRoute.partner.latitude},${activeRoute.partner.longitude}`
                : `https://www.google.com/maps/dir/?api=1&destination=${activeRoute.partner.latitude},${activeRoute.partner.longitude}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t.mapUI.openInGoogleMaps}</span>
          </a>
        </div>
      )}

      {/* TOP NOTIFICATION BANNER (When API key is pending) */}
      {!hasApiKey && (
        <div className="absolute top-12 left-3 right-3 z-20 p-2.5 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 flex items-center justify-between gap-2 px-3 text-xs shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {language === 'hi'
                ? 'लोकल मैप सक्रिय • गूगल मैप्स एपीआई कुंजी मिलने पर यहाँ दर्ज करें'
                : 'Interactive Map running locally • Add your Google Maps API Key anytime'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeyModalLocal(true)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition-colors shrink-0"
          >
            {language === 'hi' ? 'कुंजी दर्ज करें' : 'Enter API Key'}
          </button>
        </div>
      )}

      {/* MAP CANVAS CONTAINER (Active both with Google Maps JS & Leaflet Tiles) */}
      <div
        ref={mapContainerRef}
        style={{ height: maxHeight, width: '100%' }}
        className="w-full h-full min-h-[460px] relative z-10"
      />

      {/* IN-APP GOOGLE MAPS API KEY MODAL */}
      {showKeyModalLocal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {language === 'hi' ? 'गूगल मैप्स एपीआई कुंजी' : 'Google Maps Platform API Key'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModalLocal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {language === 'hi'
                ? 'वर्तमान में मैप बिना एपीआई कुंजी के पूरी तरह काम कर रहा है। जब आपके पास गूगल मैप्स एपीआई कुंजी उपलब्ध हो, तो आप उसे यहाँ दर्ज कर सकते हैं।'
                : 'The map is currently running with full local interactivity. When you obtain your official Google Maps API key, paste it below to switch to Google Maps Platform.'}
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />

              {keySaveMessage && (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{keySaveMessage}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              {hasApiKey ? (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  {t.mapUI.clearKey}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  {language === 'hi' ? 'कुंजी वैकल्पिक है' : 'Optional at runtime'}
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModalLocal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t.mapUI.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className={`px-5 py-2 text-xs font-extrabold rounded-xl text-white shadow-sm transition-all ${
                    apiKeyInput.trim()
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  {t.mapUI.saveAndActivate}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

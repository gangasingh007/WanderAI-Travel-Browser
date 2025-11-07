"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { SAMPLE_ITINERARIES, getRouteCoordinates, getStartPoint } from "./SampleItineraries";

/**
 * MapCanvas
 *
 * Purpose
 * - Host and manage the interactive map instance.
 * - This scaffolding intentionally avoids importing mapbox-gl until the token is configured
 *   and the dependency is installed, to prevent runtime/bundle errors during setup.
 *
 * Implementation Plan (see README Map Steps)
 * 1) Install mapbox-gl and configure NEXT_PUBLIC_MAPBOX_TOKEN
 * 2) Dynamically import mapbox-gl within useEffect (client-only)
 * 3) Initialize the map with a clean light style and 3D buildings
 * 4) Add sources/layers for markers (GeoJSON) and optional clustering
 * 5) Wire drag-and-drop events to add markers at drop coordinates
 */
export type Pin = {
  id: string;
  type: string;
  lngLat: [number, number];
  title: string;
  description: string;
};

export default function MapCanvas({ 
  enableEditing = true, 
  useDirections = false,
  onPinsChange,
  onPathModeChange,
  isPathModeExternal,
  onUndoRedoChange,
  undoRedoRef,
  initialCenter = [78.4, 23.5], // Default: India center
  initialZoom = 5.5, // Default: India view
  onMapReady,
  showSampleItineraries = false,
  initialPins,
}: { 
  enableEditing?: boolean; 
  useDirections?: boolean;
  onPinsChange?: (pins: Pin[]) => void;
  onPathModeChange?: (isPathMode: boolean) => void;
  isPathModeExternal?: boolean;
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void;
  undoRedoRef?: React.MutableRefObject<{ undo: () => Promise<void>; redo: () => Promise<void> } | null>;
  initialCenter?: [number, number];
  initialZoom?: number;
  onMapReady?: (flyToLocation: (center: [number, number], zoom?: number) => void) => void;
  showSampleItineraries?: boolean;
  initialPins?: Pin[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const itineraryMarkersRef = useRef<Map<string, any>>(new Map());
  const itineraryPinsRef = useRef<Map<string, any>>(new Map());
  const itinerarySourcesRef = useRef<Set<string>>(new Set());
  const itineraryLayersRef = useRef<Set<string>>(new Set());
  const [selected, setSelected] = useState<{
    id: string;
    type: string;
    lngLat: [number, number];
    title: string;
    description: string;
  } | null>(null);
  const routeRef = useRef<{ id: string; lngLat: [number, number]; isFromCustomPath?: boolean }[]>([]);
  // Track all pins with their full details
  const pinsRef = useRef<Map<string, Pin>>(new Map());
  // Track all mapbox markers by pin ID
  const markersRef = useRef<Map<string, any>>(new Map());
  const [routeSelected, setRouteSelected] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  // Path drawing state
  const [isPathModeInternal, setIsPathModeInternal] = useState(false);
  const prevPathModeRef = useRef(false);
  const isPathMode = isPathModeExternal !== undefined ? isPathModeExternal : isPathModeInternal;
  const setIsPathMode = (value: boolean) => {
    if (isPathModeExternal === undefined) {
      setIsPathModeInternal(value);
    }
    if (onPathModeChange) {
      onPathModeChange(value);
    }
  };
  const isPathModeRef = useRef(false); // Ref to check current path mode in event handlers
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  const pathPointsRef = useRef<[number, number][]>([]); // Ref version to avoid dependency issues
  // Track last path end point to connect new pins
  const lastPathEndPointRef = useRef<[number, number] | null>(null);
  // Custom paths (freehand) stored separately - won't trigger directions
  const customPathsRef = useRef<[number, number][][]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    pathPointsRef.current = pathPoints;
  }, [pathPoints]);
  
  // Undo/Redo history
  type HistorySnapshot = {
    pins: Pin[]; // Store as array for JSON serialization
    route: { id: string; lngLat: [number, number]; isFromCustomPath?: boolean }[];
    customPaths: [number, number][][];
  };
  const historyRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef(false);
  
  // Render a premium-looking round white marker with a black glyph
  const createMarkerElement = useCallback((type: string) => {
    const el = document.createElement("div");
    el.setAttribute("aria-label", `${type} marker`);
    el.style.width = "28px";
    el.style.height = "28px";
    el.style.display = "grid";
    el.style.placeItems = "center";
    el.style.background = "#fff";
    el.style.borderRadius = "9999px";
    el.style.border = "2px solid #000";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
    const src = type === "HOTEL" ? "/icons/flaticon/hotel.svg"
      : type === "FOOD" ? "/icons/flaticon/food.svg"
      : type === "ATTRACTION" ? "/icons/flaticon/attraction.svg"
      : type === "CAR" ? "/icons/flaticon/car.svg"
      : type === "BIKE" ? "/icons/flaticon/bike.svg"
      : type === "RICKSHAW" ? "/icons/flaticon/rickshaw.svg"
      : type === "PLANE" ? "/icons/flaticon/plane.svg"
      : type === "TRAIN" ? "/icons/flaticon/train.svg"
      : type === "START" ? "/icons/flaticon/start.svg"
      : type === "END" ? "/icons/flaticon/end.svg"
      : "/icons/flaticon/pin.svg";
    el.innerHTML = `<img src="${src}" width="16" height="16" alt="${type}" style="filter: brightness(0);" />`;
    return el;
  }, []);
  
  // Save snapshot to history
  const saveHistory = useCallback(() => {
    if (isUndoingRedoingRef.current) return;
    
    // Convert Map to array for serialization
    const pinsArray = Array.from(pinsRef.current.values());
    
    const snapshot: HistorySnapshot = {
      pins: JSON.parse(JSON.stringify(pinsArray)), // Deep clone pins array
      route: JSON.parse(JSON.stringify(routeRef.current)),
      customPaths: JSON.parse(JSON.stringify(customPathsRef.current)),
    };
    
    // Remove any history after current index (if we're not at the end)
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    
    historyRef.current.push(snapshot);
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history to 50 items
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
    }
    
    // Notify parent about undo/redo availability
    if (onUndoRedoChange) {
      onUndoRedoChange(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    }
  }, [onUndoRedoChange]);
  
  // Restore from snapshot
  const restoreSnapshot = useCallback(async (snapshot: HistorySnapshot) => {
    isUndoingRedoingRef.current = true;
    
    const map = mapRef.current;
    if (!map) {
      isUndoingRedoingRef.current = false;
      return;
    }
    
    // Remove all existing markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current.clear();
    
    // Clear all existing custom path layers and sources
    for (let i = 0; i < 100; i++) { // Reasonable limit
      const sourceId = `custom-path-${i}`;
      const layerId = `custom-path-layer-${i}`;
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
    
    // Restore state - convert pins array back to Map
    pinsRef.current = new Map(
      snapshot.pins.map((pin: Pin) => [pin.id, pin])
    );
    routeRef.current = JSON.parse(JSON.stringify(snapshot.route));
    customPathsRef.current = JSON.parse(JSON.stringify(snapshot.customPaths));
    
    // CRITICAL: Sync routeRef coordinates with actual pin coordinates
    // This ensures routeRef always has the correct pin positions
    for (let i = 0; i < routeRef.current.length; i++) {
      const routePin = routeRef.current[i];
      const actualPin = pinsRef.current.get(routePin.id);
      if (actualPin) {
        // Update routeRef coordinate to match actual pin coordinate
        routeRef.current[i].lngLat = [...actualPin.lngLat] as [number, number];
      }
    }
    
    // Recreate markers
    await import("mapbox-gl").then(async (mapboxgl) => {
      for (const pin of pinsRef.current.values()) {
          const markerEl = createMarkerElement(pin.type);
          markerEl.style.cursor = "pointer";
          
          const marker = new mapboxgl.default.Marker({ element: markerEl, draggable: true })
            .setLngLat(pin.lngLat as [number, number])
            .addTo(map);
          
          markersRef.current.set(pin.id, marker);
          
          // Re-attach click handler
          markerEl.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (isPathModeRef.current) {
              const markerLngLat: [number, number] = [pin.lngLat[0], pin.lngLat[1]];
              setPathPoints(prev => {
                const updated = [...prev, markerLngLat];
                pathPointsRef.current = updated;
                return updated;
              });
              return;
            }
            pinsRef.current.set(pin.id, pin);
            if (onPinsChange) {
              onPinsChange(Array.from(pinsRef.current.values()));
            }
            setSelected(pin);
          });
          
          // Re-attach drag handler
          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            const updatedPin = { ...pin, lngLat: [pos.lng, pos.lat] as [number, number] };
            pinsRef.current.set(pin.id, updatedPin);
            if (onPinsChange) {
              onPinsChange(Array.from(pinsRef.current.values()));
            }
            if (selected && selected.id === pin.id) {
              setSelected(updatedPin);
            }
            
            // Update route if this pin is in routeRef
            const routeIdx = routeRef.current.findIndex((r) => r.id === pin.id);
            if (routeIdx >= 0) {
              routeRef.current[routeIdx].lngLat = [pos.lng, pos.lat];
              if (updateRouteLineRef.current) {
                updateRouteLineRef.current();
              }
            }
          });
        }
        
        // Restore routes and custom paths - this will recalculate all routes
        if (updateRouteLineRef.current) {
          await updateRouteLineRef.current();
        }
        
        // Update pins change callback
        if (onPinsChange) {
          onPinsChange(Array.from(pinsRef.current.values()));
        }
      });
    
    isUndoingRedoingRef.current = false;
  }, [createMarkerElement, onPinsChange, selected]);
  
  // Expose undo/redo functions via ref
  const handleUndo = useCallback(async () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const snapshot = historyRef.current[historyIndexRef.current];
    await restoreSnapshot(snapshot);
    if (onUndoRedoChange) {
      onUndoRedoChange(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    }
  }, [restoreSnapshot, onUndoRedoChange]);
  
  const handleRedo = useCallback(async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const snapshot = historyRef.current[historyIndexRef.current];
    await restoreSnapshot(snapshot);
    if (onUndoRedoChange) {
      onUndoRedoChange(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    }
  }, [restoreSnapshot, onUndoRedoChange]);
  
  // Expose undo/redo via ref
  useEffect(() => {
    if (undoRedoRef) {
      undoRedoRef.current = {
        undo: handleUndo,
        redo: handleRedo,
      };
    }
  }, [undoRedoRef, handleUndo, handleRedo]);
  
  // Update undo/redo availability
  useEffect(() => {
    if (onUndoRedoChange) {
      onUndoRedoChange(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    }
  }, [onUndoRedoChange]);
  
  // Save initial state
  useEffect(() => {
    if (mapRef.current && enableEditing) {
      const snapshot: HistorySnapshot = {
        pins: [], // Empty array, not Map
        route: [],
        customPaths: [],
      };
      historyRef.current = [snapshot];
      historyIndexRef.current = 0;
      // Notify about undo/redo availability
      if (onUndoRedoChange) {
        onUndoRedoChange(false, false);
      }
    }
  }, [enableEditing, onUndoRedoChange]);

  // Handle external path mode changes (finish path when toggled off)
  useEffect(() => {
    if (isPathModeExternal !== undefined) {
      const wasActive = prevPathModeRef.current;
      const isActive = isPathModeExternal;
      
      // Use ref to get current pathPoints to avoid dependency issues
      const currentPathPoints = pathPointsRef.current;
      
      if (wasActive && !isActive && currentPathPoints.length >= 2) {
        // Path mode was turned off externally and we have points - finish the path
        // This will be handled by the finish path logic
        const finishPath = async () => {
          const savedPath = [...currentPathPoints];
          customPathsRef.current.push(savedPath);
          
          const endPoint: [number, number] = [savedPath[savedPath.length - 1][0], savedPath[savedPath.length - 1][1]];
          
          await import("mapbox-gl").then(async (mapboxgl) => {
            const markerEl = createMarkerElement("PIN");
            const id = crypto.randomUUID();
            markerEl.style.cursor = "pointer";
            
            const endMarker = new mapboxgl.default.Marker({ element: markerEl, draggable: true })
              .setLngLat(endPoint as [number, number])
              .addTo(mapRef.current);
            
            markersRef.current.set(id, endMarker);
            
            const actualEndPoint: [number, number] = [endPoint[0], endPoint[1]];
            
            markerEl.addEventListener("click", (ev) => {
              ev.stopPropagation();
              const pinData: Pin = {
                id,
                type: "PIN",
                lngLat: actualEndPoint,
                title: "",
                description: "",
              };
              pinsRef.current.set(id, pinData);
              if (onPinsChange) {
                onPinsChange(Array.from(pinsRef.current.values()));
              }
              setSelected(pinData);
            });
            
            routeRef.current.push({ 
              id, 
              lngLat: actualEndPoint, 
              isFromCustomPath: true 
            });
            
            savedPath[savedPath.length - 1] = actualEndPoint;
            lastPathEndPointRef.current = actualEndPoint;
            
            const pinData: Pin = {
              id,
              type: "PIN",
              lngLat: actualEndPoint,
              title: "",
              description: "",
            };
            pinsRef.current.set(id, pinData);
            if (onPinsChange) {
              onPinsChange(Array.from(pinsRef.current.values()));
            }
            
            endMarker.on("dragend", () => {
              const pos = endMarker.getLngLat();
              const lastPath = customPathsRef.current[customPathsRef.current.length - 1];
              if (lastPath && lastPath.length > 0) {
                lastPath[lastPath.length - 1] = [pos.lng, pos.lat];
              }
              lastPathEndPointRef.current = [pos.lng, pos.lat];
              const idx = routeRef.current.findIndex((p) => p.id === id);
              if (idx >= 0) {
                routeRef.current[idx].lngLat = [pos.lng, pos.lat];
              }
              const pin = pinsRef.current.get(id);
              if (pin) {
                const updatedPin = { ...pin, lngLat: [pos.lng, pos.lat] as [number, number] };
                pinsRef.current.set(id, updatedPin);
                if (onPinsChange) {
                  onPinsChange(Array.from(pinsRef.current.values()));
                }
                if (selected && selected.id === id) {
                  setSelected(updatedPin);
                }
              }
              if (updateRouteLineRef.current) {
                updateRouteLineRef.current();
              }
            });
          });
          
          if (updateRouteLineRef.current) {
            await updateRouteLineRef.current();
          }
          setPathPoints([]);
          pathPointsRef.current = [];
          isPathModeRef.current = false;
          
          // Save history after path completion and route update
          saveHistory();
        };
        
        finishPath();
      } else if (!isActive && wasActive) {
        // Just clearing path mode without saving - only if we were previously active
        setPathPoints([]);
        pathPointsRef.current = [];
        lastPathEndPointRef.current = null;
      }
      
      prevPathModeRef.current = isActive;
      isPathModeRef.current = isActive;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPathModeExternal, createMarkerElement, onPinsChange, selected]);
  
  // Store updateRouteLine ref to use in the effect
  const updateRouteLineRef = useRef<(() => Promise<void>) | null>(null);

  // Fetch directions (no alternatives support)
  const fetchDirections = async (a: [number, number], b: [number, number]) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return [a, b];
      const profile = "driving";
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${a[0]},${a[1]};${b[0]},${b[1]}?geometries=geojson&overview=full&access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) return [a, b];
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates;
      return Array.isArray(coords) && coords.length > 1 ? coords : [a, b];
    } catch {
      return [a, b];
    }
  };


  const updateRouteLine = useCallback(async () => {
    const map = mapRef.current as any;
    if (!map) return;
    if (!enableEditing) return;
    
    // Filter out custom path pins from route calculation
    // Only process regular pins and connections FROM custom path ends
    const regularPins = routeRef.current.filter(p => !p.isFromCustomPath);
    const customPathEndPins = routeRef.current.filter(p => p.isFromCustomPath);
    
    // Build coordinate list for directions API
    // Strategy: Only include regular pins, exclude custom path end pins
    // Also exclude regular pins that come BEFORE a custom path end (since that segment is hand-drawn)
    let coords: [number, number][] = [];
    const pinIndices: number[] = []; // Track which routeRef indices correspond to coords
    
    // Track which segments have custom paths (to skip route calculation)
    const segmentsWithCustomPaths = new Set<number>();
    
    // First pass: identify all regular pins and mark segments with custom paths
    for (let i = 0; i < routeRef.current.length; i++) {
      const pin = routeRef.current[i];
      
      // Skip custom path end pins themselves
      if (pin.isFromCustomPath) {
        // Mark that the segment BEFORE this custom path end has a hand-drawn path
        // (the regular pin before this custom path end should not connect via directions)
        if (i > 0) {
          // Find the last regular pin before this custom path end
          for (let j = i - 1; j >= 0; j--) {
            if (!routeRef.current[j]?.isFromCustomPath) {
              segmentsWithCustomPaths.add(j);
              console.log(`[updateRouteLine] Segment ending at index ${i} (custom path end) - regular pin at index ${j} should not create route`);
              break;
            }
          }
        }
        continue;
      }
      
      // Include regular pins in the route calculation
      coords.push(pin.lngLat);
      pinIndices.push(i);
    }
    
    // Debug: verify pin sequence
    if (coords.length > 0) {
      console.log(`[updateRouteLine] Building route from ${coords.length} pins:`, coords.map((c, i) => `Pin${i}(${c[0].toFixed(4)},${c[1].toFixed(4)})`).join(' -> '));
    }
    
    // If directions enabled, fetch per-segment route and stitch
    // Skip routes that end at custom path end pins (those paths are already drawn manually)
    if (useDirections && coords.length >= 2) {
      const stitched: [number, number][] = [];
      const allSegments: [number, number][][] = [];
      
      // Track custom path ends we encounter to use as route starting points
      let lastCustomPathEnd: [number, number] | null = null;
      let lastCustomPathEndIdx = -1;
      
      // Track which destination pins we've already created routes to (to prevent duplicates)
      const processedDestinations = new Set<number>();
      
      for (let i = 0; i < coords.length - 1; i++) {
        const sourcePinIdx = pinIndices[i];
        const destPinIdx = pinIndices[i + 1];
        
        // CRITICAL CHECK: If the NEXT pin in routeRef (immediately after source) is a custom path end, 
        // skip creating route FROM source (hand-drawn path exists)
        const nextPinInRouteRef = routeRef.current[sourcePinIdx + 1];
        if (nextPinInRouteRef?.isFromCustomPath) {
          // The segment FROM sourcePin TO nextPinInRouteRef is hand-drawn - skip creating directions route
          console.log(`[updateRouteLine] Segment ${i}: Skipping route FROM pin ${i} (index ${sourcePinIdx}) - next pin is custom path end (hand-drawn)`);
          
          // Find if there's a regular pin after the custom path end to connect to
          // Look ahead in routeRef to find the next regular pin after the custom path end
          let customPathEndIdx = sourcePinIdx + 1;
          let foundNextRegularPin = false;
          for (let j = customPathEndIdx + 1; j < routeRef.current.length; j++) {
            if (!routeRef.current[j]?.isFromCustomPath) {
              // Found a regular pin after the custom path end
              // Find this regular pin in coords to see if we need to create a route to it
              for (let k = 0; k < pinIndices.length; k++) {
                if (pinIndices[k] === j && !processedDestinations.has(k)) {
                  // Found it in coords at index k, and we haven't processed it yet
                  // We need to create route FROM custom path end TO this regular pin
                  
                  // Get the custom path end location - make sure we have a valid coordinate
                  const customPathEndPin = routeRef.current[customPathEndIdx];
                  if (!customPathEndPin || !customPathEndPin.lngLat) {
                    console.error(`[updateRouteLine] Invalid custom path end pin at index ${customPathEndIdx}`);
                    break;
                  }
                  
                  // Use the custom path's last point if available (more accurate)
                  // Count how many custom path ends came BEFORE this one to get the correct custom path index
                  let customPathNum = 0;
                  for (let idx = 0; idx < customPathEndIdx; idx++) {
                    if (routeRef.current[idx]?.isFromCustomPath) {
                      customPathNum++;
                    }
                  }
                  
                  let customPathEndLocation: [number, number];
                  if (customPathNum > 0 && customPathsRef.current[customPathNum - 1] && customPathsRef.current[customPathNum - 1].length > 0) {
                    // Use the actual last point from the custom path (most accurate)
                    const pathLastPoint = customPathsRef.current[customPathNum - 1][customPathsRef.current[customPathNum - 1].length - 1];
                    customPathEndLocation = [pathLastPoint[0], pathLastPoint[1]];
                    console.log(`[updateRouteLine] Using custom path ${customPathNum - 1} last point for route start (custom path end at index ${customPathEndIdx})`);
                  } else {
                    // Fall back to pin location
                    customPathEndLocation = customPathEndPin.lngLat;
                    console.log(`[updateRouteLine] Using pin location for route start (custom path end at index ${customPathEndIdx})`);
                  }
                  
                  const startPoint = customPathEndLocation;
                  const endPoint = coords[k];
                  
                  console.log(`[updateRouteLine] Creating route FROM custom path end at index ${customPathEndIdx} to regular pin at coords index ${k} (routeRef index ${j})`);
                  
                  const seg = await fetchDirections(startPoint, endPoint);
                  allSegments.push(seg);
                  
                  // DON'T stitch - this starts from custom path end, separate from previous segments
                  stitched.push(...seg);
                  processedDestinations.add(k); // Mark this destination as processed
                  foundNextRegularPin = true;
                  break;
                }
              }
              if (foundNextRegularPin) break;
            }
          }
          
          continue;
        }
        
        // Skip if we've already processed this destination (e.g., from custom path end)
        if (processedDestinations.has(i + 1)) {
          console.log(`[updateRouteLine] Segment ${i}: Skipping - destination pin ${i+1} already processed`);
          continue;
        }
        
        // Check if there's a custom path end between source and destination in routeRef
        let hasCustomPathEndBetween = false;
        let customPathEndIdx = -1;
        for (let j = sourcePinIdx + 1; j < destPinIdx; j++) {
          if (routeRef.current[j]?.isFromCustomPath) {
            hasCustomPathEndBetween = true;
            customPathEndIdx = j;
            
            // Use the custom path's actual last point if available (more accurate)
            // Count custom path ends before this one to find the correct custom path
            let customPathNum = 0;
            for (let idx = 0; idx < j; idx++) {
              if (routeRef.current[idx]?.isFromCustomPath) {
                customPathNum++;
              }
            }
            
            let customPathLocation: [number, number];
            if (customPathNum > 0 && customPathsRef.current[customPathNum - 1] && customPathsRef.current[customPathNum - 1].length > 0) {
              // Use the actual last point from the custom path (most accurate)
              const pathLastPoint = customPathsRef.current[customPathNum - 1][customPathsRef.current[customPathNum - 1].length - 1];
              customPathLocation = [pathLastPoint[0], pathLastPoint[1]];
              console.log(`[updateRouteLine] Using custom path ${customPathNum - 1} last point for route start`);
            } else {
              // Fall back to pin location
              customPathLocation = routeRef.current[j].lngLat;
              console.log(`[updateRouteLine] Using pin location for route start`);
            }
            
            lastCustomPathEnd = customPathLocation;
            lastCustomPathEndIdx = j;
            console.log(`[updateRouteLine] Found custom path end at routeRef index ${j} between regular pins ${i} and ${i+1}`);
            break;
          }
        }
        
        // Determine start and end points
        let startPoint: [number, number];
        const endPoint = coords[i + 1];
        
        // If there's a custom path end between source and destination:
        // Create route FROM the custom path end TO the destination (not from source pin)
        if (hasCustomPathEndBetween) {
          // Start route FROM the custom path end (not from source pin)
          startPoint = lastCustomPathEnd!;
          console.log(`[updateRouteLine] Segment ${i}: Creating route FROM custom path end at index ${customPathEndIdx} to pin ${i+1}`);
          // Mark destination as processed to prevent duplicates
          processedDestinations.add(i + 1);
        } else {
          // Check if we need to start FROM a custom path end before the source pin
          let shouldStartFromCustomPathEnd = false;
          if (sourcePinIdx > 0) {
            // Check if the pin immediately before sourcePinIdx in routeRef is a custom path end
            const prevPin = routeRef.current[sourcePinIdx - 1];
            if (prevPin?.isFromCustomPath) {
              shouldStartFromCustomPathEnd = true;
              
              // Use the custom path's actual last point if available (more accurate)
              // Count custom path ends before this one to find the correct custom path
              let customPathNum = 0;
              for (let idx = 0; idx < sourcePinIdx - 1; idx++) {
                if (routeRef.current[idx]?.isFromCustomPath) {
                  customPathNum++;
                }
              }
              
              let customPathLocation: [number, number];
              if (customPathNum > 0 && customPathsRef.current[customPathNum - 1] && customPathsRef.current[customPathNum - 1].length > 0) {
                // Use the actual last point from the custom path (most accurate)
                const pathLastPoint = customPathsRef.current[customPathNum - 1][customPathsRef.current[customPathNum - 1].length - 1];
                customPathLocation = [pathLastPoint[0], pathLastPoint[1]];
                console.log(`[updateRouteLine] Using custom path ${customPathNum - 1} last point for route start`);
              } else {
                // Fall back to pin location
                customPathLocation = prevPin.lngLat;
                console.log(`[updateRouteLine] Using pin location for route start`);
              }
              
              lastCustomPathEnd = customPathLocation;
              lastCustomPathEndIdx = sourcePinIdx - 1;
              console.log(`[updateRouteLine] Source pin ${i} should start FROM custom path end at routeRef index ${lastCustomPathEndIdx}`);
            }
          }
          
          // Normal route segment
          startPoint = shouldStartFromCustomPathEnd && lastCustomPathEnd ? lastCustomPathEnd : coords[i];
        }
        
        console.log(`[updateRouteLine] Creating route segment ${i}:`, {
          startPoint,
          endPoint,
          hasCustomPathEndBetween,
          fromCustomPathEnd: hasCustomPathEndBetween || (sourcePinIdx > 0 && routeRef.current[sourcePinIdx - 1]?.isFromCustomPath)
        });
        
        const seg = await fetchDirections(startPoint, endPoint);
        allSegments.push(seg);
          
        // Stitch segments together
        // CRITICAL: When starting from a custom path end, DON'T stitch to previous segment!
        if (stitched.length > 0 && seg.length > 0) {
          if (hasCustomPathEndBetween) {
            // Starting from custom path end - DON'T stitch!
          } else if (sourcePinIdx > 0 && routeRef.current[sourcePinIdx - 1]?.isFromCustomPath) {
            // Starting from custom path end - DON'T stitch!
          } else {
            // Normal stitching - connect to end of previous segment
            seg[0] = stitched[stitched.length - 1];
          }
        }
        
        stitched.push(...seg);
      }
      
      // Use stitched coords ONLY if we have calculated routes
      // Never use raw pin coordinates as they would create unwanted straight line routes
      if (stitched.length > 1) {
        coords = stitched;
      } else if (stitched.length > 0) {
        // Even a single segment is valid if it's calculated
        coords = stitched;
      } else {
        // If no segments were calculated (all skipped), don't draw any route
        // This prevents creating unwanted routes between pins
        coords = [];
      }
    }

    // Use the calculated route coordinates
    const finalCoords = coords;

    // Draw main route (always blue, always visible)
    // Only draw calculated routes (not raw pin coordinates which would create straight lines)
    // If useDirections is false, draw straight lines between all pins
    const hasCalculatedRoutes = useDirections && finalCoords.length > 0;
    const shouldDrawRoute = !useDirections || hasCalculatedRoutes;
    
    if (finalCoords.length >= 2 && shouldDrawRoute) {
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: finalCoords,
            },
            properties: {},
          },
        ],
      } as any;

      if (!map.getSource("route-source")) {
        map.addSource("route-source", { type: "geojson", data: geojson });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#2563eb",
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });
      } else {
        map.getSource("route-source").setData(geojson);
        map.setPaintProperty("route-line", "line-color", "#2563eb");
        map.setPaintProperty("route-line", "line-width", 6);
        map.setPaintProperty("route-line", "line-opacity", 0.95);
      }
    }

    
    // Draw custom paths (freehand paths)
    customPathsRef.current.forEach((customPath, pathIdx) => {
      if (customPath.length < 2) return;
      const customGeojson = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: { type: "LineString", coordinates: customPath },
          properties: {},
        }],
      } as any;
      
      const sourceId = `custom-path-${pathIdx}`;
      const layerId = `custom-path-layer-${pathIdx}`;
      
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data: customGeojson });
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#2563eb",
            "line-width": 4,
            "line-opacity": 0.9,
          },
        });
      } else {
        map.getSource(sourceId).setData(customGeojson);
      }
    });
  }, [enableEditing, useDirections]);
  
  // Update the ref when updateRouteLine changes
  useEffect(() => {
    updateRouteLineRef.current = updateRouteLine;
  }, [updateRouteLine]);

  // Render initial pins passed from parent
  // Load initial pins once per change without causing parent state loops
  useEffect(() => {
    const map = mapRef.current as any;
    if (!mapReady) return;
    if (!initialPins || initialPins.length === 0) return;

    (async () => {
      const mapboxgl = await import("mapbox-gl");

      // Clear any existing markers and state before loading initial pins
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      pinsRef.current.clear();
      routeRef.current = [];

      // Sort pins by orderIndex if present to create route order
      const sorted = [...initialPins].sort((a: any, b: any) => {
        const ai = typeof a.orderIndex === 'number' ? a.orderIndex : 0;
        const bi = typeof b.orderIndex === 'number' ? b.orderIndex : 0;
        return ai - bi;
      });

      for (const rawPin of sorted) {
        const id = rawPin.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2));
        const pin: Pin = {
          id,
          type: rawPin.type || "PIN",
          lngLat: rawPin.lngLat,
          title: rawPin.title || "",
          description: rawPin.description || "",
        };

        const markerEl = createMarkerElement(pin.type);
        markerEl.style.cursor = "pointer";
        const marker = new mapboxgl.default.Marker({ element: markerEl, draggable: true })
          .setLngLat(pin.lngLat as [number, number])
          .addTo(map);

        markersRef.current.set(id, marker);
        pinsRef.current.set(id, pin);
        // Build the route in the same order as pins
        routeRef.current.push({ id, lngLat: pin.lngLat });

        markerEl.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (isPathModeRef.current) return;
          setSelected(pin);
        });

        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          const updatedPin = { ...pin, lngLat: [pos.lng, pos.lat] as [number, number] };
          pinsRef.current.set(id, updatedPin);
          // Update routeRef for this pin as well
          const rIdx = routeRef.current.findIndex(r => r.id === id);
          if (rIdx >= 0) routeRef.current[rIdx].lngLat = [pos.lng, pos.lat];
          if (onPinsChange) {
            onPinsChange(Array.from(pinsRef.current.values()));
          }
          if (selected && selected.id === id) {
            setSelected(updatedPin);
          }
          // Recompute route if needed
          if (updateRouteLineRef.current) updateRouteLineRef.current();
        });
      }

      // Do NOT call onPinsChange here to avoid parent-state render loops

      // Draw directions between pins if enabled
      if (updateRouteLineRef.current) await updateRouteLineRef.current();

      // Save initial history snapshot
      saveHistory();
    })();
  }, [mapReady, initialPins, createMarkerElement, saveHistory]);

  useEffect(() => {
    // Guard: do not re-initialize if map already exists
    if (mapRef.current) return;
    (async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          setError("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
          return;
        }
        const mapboxgl = await import("mapbox-gl");
        mapboxgl.default.accessToken = token;
        const map = new mapboxgl.default.Map({
          container: containerRef.current!,
          // Use a richer, more detailed base style
          // Options: streets-v12 (detailed POIs), outdoors-v12 (terrain/paths)
          style: "mapbox://styles/mapbox/streets-v12",
          center: initialCenter,
          zoom: initialZoom,
          pitch: 50,
          bearing: -10,
          // We'll manage attribution control manually to use compact mode
          attributionControl: false,
          logoPosition: "bottom-left",
        });
        mapRef.current = map;

        // Add navigation (+/-/compass) on the left for quick access
        map.addControl(new mapboxgl.default.NavigationControl({ visualizePitch: true }), "top-left");
        // Add compact attribution (required by Mapbox TOS)
        map.addControl(new mapboxgl.default.AttributionControl({ compact: true }) as any, "bottom-right");

        // Expose flyToLocation function to parent
        const flyToLocation = (center: [number, number], zoom: number = 12) => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center,
              zoom,
              duration: 1500,
              essential: true,
            });
          }
        };

        map.on("load", () => {
          setMapReady(true);
          // Terrain source
          if (!map.getSource("mapbox-dem")) {
            map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 14,
            } as any);
          }
          // Enable terrain for 3D relief
          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 } as any);

          // Expose flyToLocation to parent component
          if (onMapReady) {
            onMapReady(flyToLocation);
          }

          // Load sample itineraries if enabled
          if (showSampleItineraries) {
            (async () => {
              const mapboxgl = await import("mapbox-gl");
              
              for (const itinerary of SAMPLE_ITINERARIES) {
                const sourceId = `itinerary-${itinerary.id}`;
                const routeLayerId = `route-${itinerary.id}`;
                const routeCoordinates = getRouteCoordinates(itinerary);

                // Add route as GeoJSON LineString
                if (!map.getSource(sourceId)) {
                  map.addSource(sourceId, {
                    type: "geojson",
                    data: {
                      type: "Feature",
                      properties: {
                        color: itinerary.color,
                        title: itinerary.title,
                      },
                      geometry: {
                        type: "LineString",
                        coordinates: routeCoordinates,
                      },
                    },
                  });
                  itinerarySourcesRef.current.add(sourceId);
                }

                // Add route line layer - visible and clear
                if (!map.getLayer(routeLayerId)) {
                  map.addLayer({
                    id: routeLayerId,
                    type: "line",
                    source: sourceId,
                    filter: ["==", "$type", "LineString"],
                    layout: {
                      "line-join": "round",
                      "line-cap": "round",
                    },
                    paint: {
                      "line-color": itinerary.color,
                      "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 4,
                        10, 6,
                        15, 8,
                      ],
                      "line-opacity": 0.9,
                    },
                  });
                  itineraryLayersRef.current.add(routeLayerId);
                  
                  // Add outline for better visibility
                  map.addLayer({
                    id: `${routeLayerId}-outline`,
                    type: "line",
                    source: sourceId,
                    filter: ["==", "$type", "LineString"],
                    layout: {
                      "line-join": "round",
                      "line-cap": "round",
                    },
                    paint: {
                      "line-color": "#ffffff",
                      "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 6,
                        10, 8,
                        15, 10,
                      ],
                      "line-opacity": 0.6,
                      "line-gap-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 4,
                        10, 6,
                        15, 8,
                      ],
                    },
                  });
                  itineraryLayersRef.current.add(`${routeLayerId}-outline`);
                }

                // Add pins at each stop along the route using the same style as createMarkerElement
                itinerary.route.forEach((routePoint, index) => {
                  // Skip first point (already has button)
                  if (index === 0) return;
                  
                  const pinId = `pin-${itinerary.id}-${index}`;
                  if (!itineraryPinsRef.current.has(pinId)) {
                    // Use the same pin style as createMarkerElement
                    const pinEl = createMarkerElement(routePoint.type);
                    pinEl.style.cursor = "pointer";
                    
                    // Add number badge for order
                    const badge = document.createElement("div");
                    badge.style.position = "absolute";
                    badge.style.top = "-8px";
                    badge.style.right = "-8px";
                    badge.style.width = "18px";
                    badge.style.height = "18px";
                    badge.style.borderRadius = "50%";
                    badge.style.backgroundColor = "white";
                    badge.style.border = "2px solid black";
                    badge.style.display = "flex";
                    badge.style.alignItems = "center";
                    badge.style.justifyContent = "center";
                    badge.style.fontSize = "10px";
                    badge.style.fontWeight = "700";
                    badge.style.color = "black";
                    badge.style.lineHeight = "1";
                    badge.style.zIndex = "1000";
                    badge.textContent = String(routePoint.order);
                    pinEl.appendChild(badge);

                    // Set transform origin to prevent positioning issues
                    pinEl.style.transformOrigin = "center center";
                    
                    // Hover effect for pins
                    pinEl.addEventListener("mouseenter", () => {
                      pinEl.style.transform = "scale(1.15)";
                      pinEl.style.zIndex = "20";
                    });
                    pinEl.addEventListener("mouseleave", () => {
                      pinEl.style.transform = "scale(1)";
                      pinEl.style.zIndex = "10";
                    });

                    const pinMarker = new mapboxgl.default.Marker({ 
                      element: pinEl,
                      anchor: "center" // Center anchor to prevent movement
                    })
                      .setLngLat(routePoint.lngLat)
                      .addTo(map);

                    itineraryPinsRef.current.set(pinId, pinMarker);
                  }
                });

                // Add clickable button at start point
                if (!itineraryMarkersRef.current.has(itinerary.id)) {
                  const startPoint = getStartPoint(itinerary);
                  const firstRoutePoint = itinerary.route[0];
                  
                  const buttonEl = document.createElement("div");
                  buttonEl.style.padding = "8px 12px";
                  buttonEl.style.backgroundColor = "white";
                  buttonEl.style.border = "2px solid black";
                  buttonEl.style.borderRadius = "6px";
                  buttonEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                  buttonEl.style.cursor = "pointer";
                  buttonEl.style.fontSize = "12px";
                  buttonEl.style.fontWeight = "600";
                  buttonEl.style.color = "black";
                  buttonEl.style.whiteSpace = "nowrap";
                  buttonEl.style.display = "flex";
                  buttonEl.style.alignItems = "center";
                  buttonEl.style.gap = "6px";
                  buttonEl.style.transition = "all 0.2s";
                  buttonEl.textContent = itinerary.title;
                  
                  // Add colored dot indicator
                  const dot = document.createElement("span");
                  dot.style.width = "8px";
                  dot.style.height = "8px";
                  dot.style.borderRadius = "50%";
                  dot.style.backgroundColor = itinerary.color;
                  dot.style.display = "inline-block";
                  buttonEl.insertBefore(dot, buttonEl.firstChild);

                  // Hover effects - fix positioning by using transform-origin
                  buttonEl.style.transformOrigin = "center center";
                  buttonEl.addEventListener("mouseenter", () => {
                    buttonEl.style.backgroundColor = "#f5f5f5";
                    buttonEl.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  });
                  buttonEl.addEventListener("mouseleave", () => {
                    buttonEl.style.backgroundColor = "white";
                    buttonEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                  });

                  // Add click handler to fly to itinerary
                  buttonEl.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (routeCoordinates.length > 0) {
                      const bounds = routeCoordinates.reduce(
                        (acc, coord) => {
                          return {
                            minLng: Math.min(acc.minLng, coord[0]),
                            maxLng: Math.max(acc.maxLng, coord[0]),
                            minLat: Math.min(acc.minLat, coord[1]),
                            maxLat: Math.max(acc.maxLat, coord[1]),
                          };
                        },
                        { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
                      );
                      map.fitBounds(
                        [
                          [bounds.minLng, bounds.minLat],
                          [bounds.maxLng, bounds.maxLat],
                        ],
                        { padding: 80, duration: 1500 }
                      );
                    }
                  });

                  // Use center anchor to prevent movement when panning
                  const marker = new mapboxgl.default.Marker({ 
                    element: buttonEl, 
                    anchor: "center" // Changed from "bottom" to "center" to prevent movement
                  })
                    .setLngLat(startPoint)
                    .addTo(map);

                  itineraryMarkersRef.current.set(itinerary.id, marker);
                }
              }
            })();
          }

          // Sky layer for nicer horizon
          if (!map.getLayer("sky")) {
            map.addLayer({
              id: "sky",
              type: "sky",
              paint: {
                "sky-type": "atmosphere",
                "sky-atmosphere-sun": [0.0, 0.0],
                "sky-atmosphere-sun-intensity": 5.0,
              },
            } as any);
          }

          // 3D buildings above labels
          const layers = map.getStyle().layers || [];
          const labelLayerId = layers.find((l: any) => l.type === "symbol" && l.layout && l.layout["text-field"])?.id;
          if (!map.getLayer("3d-buildings")) {
            map.addLayer(
              {
                id: "3d-buildings",
                source: "composite",
                "source-layer": "building",
                filter: ["==", "extrude", "true"],
                type: "fill-extrusion",
                minzoom: 15,
                paint: {
                  "fill-extrusion-color": "#cbd5e1",
                  "fill-extrusion-height": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    15,
                    0,
                    16,
                    ["get", "height"],
                  ],
                  "fill-extrusion-base": ["get", "min_height"],
                  "fill-extrusion-opacity": 0.6,
                },
              } as any,
              labelLayerId
            );
          }
        });

        const onResize = () => map.resize();
        window.addEventListener("resize", onResize);

        // ResizeObserver to handle sidebar collapse/expand and container size changes
        let ro: ResizeObserver | null = null;
        if (containerRef.current) {
          ro = new ResizeObserver(() => {
            // Defer to next frame to ensure layout has settled
            requestAnimationFrame(() => map.resize());
          });
          ro.observe(containerRef.current);
        }
        return () => {
          window.removeEventListener("resize", onResize);
          if (ro) ro.disconnect();
          map.remove();
        };
      } catch (e: any) {
        setError(e?.message ?? "Map failed to load");
      }
    })();
  }, [enableEditing, isPathMode]);

  // Handle map clicks for path drawing (including clicking on markers)
  useEffect(() => {
    const map = mapRef.current as any;
    if (!map || !enableEditing) return;

    const handleClick = (e: any) => {
      if (isPathModeRef.current) {
        // In path mode, any click (including on markers) adds to path
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setPathPoints(prev => {
          const updated = [...prev, lngLat];
          pathPointsRef.current = updated;
          return updated;
        });
        e.preventDefault?.(); // Prevent marker click handler if it exists
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [enableEditing, isPathMode]);

  // Render path preview on map
  useEffect(() => {
    const map = mapRef.current as any;
    if (!map || !enableEditing || !isPathMode || pathPoints.length < 2) {
      // Clean up if path mode disabled or not enough points
      if (map && map.getSource("path-preview")) {
        if (map.getLayer("path-preview-line")) map.removeLayer("path-preview-line");
        map.removeSource("path-preview");
      }
      return;
    }

    const geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "LineString", coordinates: pathPoints },
        properties: {},
      }],
    } as any;

    if (!map.getSource("path-preview")) {
      map.addSource("path-preview", { type: "geojson", data: geojson });
      map.addLayer({
        id: "path-preview-line",
        type: "line",
        source: "path-preview",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#2563eb",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    } else {
      map.getSource("path-preview").setData(geojson);
    }
  }, [pathPoints, isPathMode, enableEditing]);

  return (
    <div className="relative"
      onDragOver={enableEditing ? (e) => {
        e.preventDefault();
      } : undefined}
      onDrop={enableEditing ? (e) => {
        e.preventDefault();
        try {
          if (!mapRef.current) return;
          const payloadStr = e.dataTransfer.getData("application/json");
          if (!payloadStr) return;
          const payload = JSON.parse(payloadStr) as { id: string; type: string };
          const container = containerRef.current!;
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const lngLat = mapRef.current.unproject([x, y]).toArray();

          // Create and add marker to map
          import("mapbox-gl").then((mapboxgl) => {
            const markerEl = createMarkerElement(payload.type);
            // Add click to open details (but only if not in path mode)
            const id = crypto.randomUUID();
            markerEl.style.cursor = "pointer";
              markerEl.addEventListener("click", (ev) => {
                ev.stopPropagation();
                // If in path mode, clicking marker adds to path instead of opening sidebar
                if (isPathModeRef.current) {
                  const markerLngLat: [number, number] = [lngLat[0], lngLat[1]];
                  setPathPoints(prev => {
                    const updated = [...prev, markerLngLat];
                    pathPointsRef.current = updated;
                    return updated;
                  });
                  return;
                }
              const pinData: Pin = {
                id,
                type: payload.type,
                lngLat: lngLat as [number, number],
                title: "",
                description: "",
              };
              pinsRef.current.set(id, pinData);
              if (onPinsChange) {
                onPinsChange(Array.from(pinsRef.current.values()));
              }
              setSelected(pinData);
            });

            // Draggable marker to allow fine-tuning of the route path
            const draggableMarker = new mapboxgl.default.Marker({ element: markerEl, draggable: true })
              .setLngLat(lngLat as [number, number])
              .addTo(mapRef.current);

            markersRef.current.set(id, draggableMarker);

            // Add the new regular pin to routeRef
            // It will automatically connect to the last pin in routeRef
            // (either previous regular pin or custom path end pin if one exists)
            routeRef.current.push({ id, lngLat: lngLat as [number, number] });
            
            // Clear last path end ref after using it (connection will be established via routeRef)
            if (lastPathEndPointRef.current) {
              lastPathEndPointRef.current = null;
            }
            
            // Ensure route calculation happens with the updated routeRef, then save history
            updateRouteLine().then(() => {
              // Save history after pin addition and route update completes
              saveHistory();
            });

            draggableMarker.on("dragend", () => {
              const pos = draggableMarker.getLngLat();
              const idx = routeRef.current.findIndex((p) => p.id === id);
              if (idx >= 0) {
                routeRef.current[idx].lngLat = [pos.lng, pos.lat];
                // Update pin in pinsRef
                const pin = pinsRef.current.get(id);
                if (pin) {
                  const updatedPin = { ...pin, lngLat: [pos.lng, pos.lat] as [number, number] };
                  pinsRef.current.set(id, updatedPin);
                  if (onPinsChange) {
                    onPinsChange(Array.from(pinsRef.current.values()));
                  }
                  // Update selected if this is the selected pin
                  if (selected && selected.id === id) {
                    setSelected(updatedPin);
                  }
                }
                updateRouteLine();
              }
            });
          });
        } catch (err) {
          // silent fail; keep UI responsive
        }
      } : undefined}
    >
      <div
        ref={containerRef}
        className="h-[70vh] w-full rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden"
        aria-label="Interactive map canvas"
        style={{ cursor: isPathMode ? "crosshair" : "default" }}
      />
      {error && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        </div>
      )}

      {/* Path drawing controls - only show if path mode is managed internally */}
      {enableEditing && isPathModeExternal === undefined && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={async () => {
              if (isPathMode && pathPoints.length >= 2) {
                // Save path as custom freehand route
                const savedPath = [...pathPoints];
                customPathsRef.current.push(savedPath);
                
                // Add a pin marker at the end point of the path
                // Make sure we create a fresh copy of the coordinate to avoid reference issues
                const endPoint: [number, number] = [savedPath[savedPath.length - 1][0], savedPath[savedPath.length - 1][1]];
                
                await import("mapbox-gl").then(async (mapboxgl) => {
                  const markerEl = createMarkerElement("PIN");
                  const id = crypto.randomUUID();
                  markerEl.style.cursor = "pointer";
                  
                  // Create draggable marker at the end point first
                  const endMarker = new mapboxgl.default.Marker({ element: markerEl, draggable: true })
                    .setLngLat(endPoint as [number, number])
                    .addTo(mapRef.current);
                  
                  markersRef.current.set(id, endMarker);
                  
                  // Use the endPoint directly - it's already accurate from the path
                  // Don't re-read from marker as it might not be fully positioned yet
                  const actualEndPoint: [number, number] = [endPoint[0], endPoint[1]];
                  
                  // Add click handler for the pin - use actual marker position
                  markerEl.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    if (isPathModeRef.current) {
                      // Shouldn't happen since we exit path mode, but just in case
                      return;
                    }
                    const pinData: Pin = {
                      id,
                      type: "PIN",
                      lngLat: actualEndPoint,
                      title: "",
                      description: "",
                    };
                    pinsRef.current.set(id, pinData);
                    if (onPinsChange) {
                      onPinsChange(Array.from(pinsRef.current.values()));
                    }
                    setSelected(pinData);
                  });
                  
                  // Add end pin to routeRef immediately so it's tracked correctly
                  // Use the actual marker position, not the path point (to ensure accuracy)
                  routeRef.current.push({ 
                    id, 
                    lngLat: actualEndPoint, 
                    isFromCustomPath: true 
                  });
                  
                  // Update the saved path's last point to match the actual marker position
                  savedPath[savedPath.length - 1] = actualEndPoint;
                  
                  // Store end point reference for future connections (backup tracking)
                  // Use the actual marker position, not the original path point
                  lastPathEndPointRef.current = actualEndPoint;
                  
                  // Create pin data with actual position and store in pinsRef
                  const pinData: Pin = {
                    id,
                    type: "PIN",
                    lngLat: actualEndPoint,
                    title: "",
                    description: "",
                  };
                  pinsRef.current.set(id, pinData);
                  if (onPinsChange) {
                    onPinsChange(Array.from(pinsRef.current.values()));
                  }
                  
                  // Handle marker drag - update custom path end point
                  endMarker.on("dragend", () => {
                    const pos = endMarker.getLngLat();
                    // Update the last point of the saved path
                    const lastPath = customPathsRef.current[customPathsRef.current.length - 1];
                    if (lastPath && lastPath.length > 0) {
                      lastPath[lastPath.length - 1] = [pos.lng, pos.lat];
                    }
                    // Update the reference
                    lastPathEndPointRef.current = [pos.lng, pos.lat];
                    // Update the pin in routeRef
                    const idx = routeRef.current.findIndex((p) => p.id === id);
                    if (idx >= 0) {
                      routeRef.current[idx].lngLat = [pos.lng, pos.lat];
                    }
                    // Update pin in pinsRef
                    const pin = pinsRef.current.get(id);
                    if (pin) {
                      const updatedPin = { ...pin, lngLat: [pos.lng, pos.lat] as [number, number] };
                      pinsRef.current.set(id, updatedPin);
                      if (onPinsChange) {
                        onPinsChange(Array.from(pinsRef.current.values()));
                      }
                      // Update selected if this is the selected pin
                      if (selected && selected.id === id) {
                        setSelected(updatedPin);
                      }
                    }
                    updateRouteLine();
                  });
                });
                
                // Update route to show the custom path and the new pin
                await updateRouteLine();
                
                // Save history after path completion
                saveHistory();
                
                // Clear path mode
                setIsPathMode(false);
                isPathModeRef.current = false; // Update ref
                setPathPoints([]);
              } else {
                // Just toggle mode if not saving
                const newPathMode = !isPathMode;
                setIsPathMode(newPathMode);
                isPathModeRef.current = newPathMode; // Update ref
                if (!newPathMode) {
                  setPathPoints([]);
                  lastPathEndPointRef.current = null; // Clear last path end when canceling
                } else {
                  // Close sidebar when entering path mode
                  setSelected(null);
                }
              }
            }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              isPathMode
                ? "bg-black text-white border-black"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            {isPathMode ? "✓ Finish Path" : "Draw Path"}
          </button>
          {isPathMode && pathPoints.length > 0 && (
            <button
              onClick={() => {
                setIsPathMode(false);
                isPathModeRef.current = false; // Update ref
                setPathPoints([]);
                lastPathEndPointRef.current = null; // Clear last path end when canceling
              }}
              className="ml-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Path preview layer */}
      {enableEditing && isPathMode && pathPoints.length > 1 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Path preview is rendered via useEffect hook */}
        </div>
      )}


      {/* Right-side Details Sidebar (only in editing mode) */}
      {enableEditing && selected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/0" />
        </div>
      )}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={enableEditing && selected ? { x: 0, opacity: 1 } : { x: 400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="pointer-events-auto absolute inset-y-0 right-0 w-full max-w-md"
      >
      {enableEditing && selected && (
        <div className="h-full bg-white border-l border-gray-200 shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white/90 backdrop-blur z-10">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-full bg-black grid place-items-center shadow">
                <span className="sr-only">{selected.type}</span>
                <span className="text-[11px] text-white uppercase tracking-wide leading-none font-semibold select-none">
                  {selected.type[0]}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{selected.type} Marker</div>
                <div className="text-xs text-gray-500">{selected.lngLat[1].toFixed(4)}, {selected.lngLat[0].toFixed(4)}</div>
              </div>
            </div>
            <button
              className="h-8 w-8 grid place-items-center rounded-md border border-gray-200 hover:bg-gray-50"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              value={selected.title}
              onChange={(e) => {
                const updated = { ...selected, title: e.target.value };
                setSelected(updated);
                pinsRef.current.set(selected.id, updated);
                if (onPinsChange) {
                  onPinsChange(Array.from(pinsRef.current.values()));
                }
              }}
              placeholder="Add a short title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Description</label>
              {selected.description.trim().length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                  <span className="h-4 w-4 grid place-items-center rounded-full bg-gray-900 text-white leading-none font-semibold">i</span>
                  has info
                </span>
              )}
            </div>
            <textarea
              value={selected.description}
              onChange={(e) => {
                const updated = { ...selected, description: e.target.value };
                setSelected(updated);
                pinsRef.current.set(selected.id, updated);
                if (onPinsChange) {
                  onPinsChange(Array.from(pinsRef.current.values()));
                }
              }}
              placeholder="Add details, tips, notes..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>

          {/* Type-specific quick fields (UI only for now) */}
          <div className="px-5 py-3 border-t border-gray-100 space-y-3">
            {selected.type === "HOTEL" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price level</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black">
                    <option>Unknown</option>
                    <option>$</option>
                    <option>$$</option>
                    <option>$$$</option>
                    <option>$$$$</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black">
                    <option>—</option>
                    <option>3.0+</option>
                    <option>4.0+</option>
                    <option>4.5+</option>
                  </select>
                </div>
              </div>
            )}
            {selected.type === "FOOD" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cuisine</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400" placeholder="e.g., Indian, Italian" />
              </div>
            )}
            {selected.type === "ATTRACTION" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Best Time</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400" placeholder="e.g., Sunset, Weekdays" />
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                // Update pin data in pinsRef
                pinsRef.current.set(selected.id, selected);
                if (onPinsChange) {
                  onPinsChange(Array.from(pinsRef.current.values()));
                }
                  // Add a small info badge to the marker element (optimistic UI)
                  try {
                    const badge = document.createElement("span");
                    badge.style.position = "absolute";
                    badge.style.right = "-4px";
                    badge.style.top = "-4px";
                    badge.style.width = "16px";
                    badge.style.height = "16px";
                    badge.style.borderRadius = "9999px";
                    badge.style.background = "#111";
                    badge.style.color = "#fff";
                    badge.style.fontSize = "10px";
                    badge.style.fontWeight = "600";
                    badge.style.display = "grid";
                    badge.style.placeItems = "center";
                    badge.style.lineHeight = "1";
                    badge.textContent = "i";
                    // Find the nearest marker by coordinate match
                    const map = mapRef.current as any;
                    const markers = (map?._markers || []) as any[];
                    const marker = markers.find((m: any) => {
                      const ll = m.getLngLat();
                    return Math.abs(ll.lng - selected.lngLat[0]) < 1e-6 && Math.abs(ll.lat - selected.lngLat[1]) < 1e-6;
                    });
                    if (marker) {
                      const el = marker.getElement();
                      // Avoid duplicating badge
                      if (!el.querySelector('[data-badge="info"]')) {
                        badge.setAttribute("data-badge", "info");
                        el.style.position = "relative";
                        el.appendChild(badge);
                      }
                    }
                  } catch {}
              }}
              className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}



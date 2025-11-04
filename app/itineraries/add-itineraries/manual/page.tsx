"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import MapCanvas, { type Pin } from "@/components/map/MapCanvas";
import MarkerPalette from "@/components/map/MarkerPalette";
import MapSearchBar from "@/components/map/MapSearchBar";
import { motion } from "framer-motion";

export default function ItinAddManualPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPathMode, setIsPathMode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoRedoRef = useRef<{ undo: () => Promise<void>; redo: () => Promise<void> } | null>(null);
  const flyToLocationRef = useRef<((center: [number, number], zoom?: number) => void) | null>(null);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/itineraries/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim() || "Untitled Itinerary",
          description: description.trim() || undefined,
          isPublic: false, // Drafts are always private
          pins: pins.map((pin, index) => ({
            latitude: pin.lngLat[1],
            longitude: pin.lngLat[0],
            title: pin.title.trim() || `Point ${index + 1}`,
            description: pin.description.trim() || undefined,
            type: pin.type,
            icon: pin.type === "CUSTOM" ? "PIN" : pin.type,
            orderIndex: index,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save draft");
      }

      setSaveSuccess(true);
      // Reset form after successful save
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setIsPublic(false);
        setPins([]);
        setSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSaveError(error.message || "An error occurred while saving the draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setSaveError("Title is required");
      return;
    }

    if (pins.length === 0) {
      setSaveError("Please add at least one pin to the map");
      return;
    }

    // Validate that all pins have titles
    const pinsWithoutTitles = pins.filter((pin) => !pin.title.trim());
    if (pinsWithoutTitles.length > 0) {
      setSaveError("All pins must have a title. Please click on each pin and add a title.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/itineraries/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          isPublic,
          pins: pins.map((pin, index) => ({
            latitude: pin.lngLat[1],
            longitude: pin.lngLat[0],
            title: pin.title.trim(),
            description: pin.description.trim() || undefined,
            type: pin.type,
            icon: pin.type === "CUSTOM" ? "PIN" : pin.type,
            orderIndex: index,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create itinerary");
      }

      setSaveSuccess(true);
      // Reset form after successful save
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setIsPublic(false);
        setPins([]);
        setSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSaveError(error.message || "An error occurred while saving the itinerary");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6 relative">
        {/* Header with Save Buttons */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create Itinerary</h1>
            <p className="text-sm text-gray-500">Plan your journey by adding pins and drawing paths</p>
          </div>
          
          {/* Save Buttons - Top Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="px-5 py-2.5 rounded-lg border-2 border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || pins.length === 0}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-black to-gray-800 text-white text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isSaving ? "Saving..." : "Save Itinerary"}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm"
          >
            {saveError}
          </motion.div>
        )}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 shadow-sm"
          >
            Itinerary saved successfully!
          </motion.div>
        )}

        {/* Itinerary Form - Premium Styled */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Itinerary Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend in Paris, Summer Road Trip"
              className="w-full max-w-2xl rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your itinerary... Share what makes this journey special."
              rows={4}
              className="w-full max-w-2xl rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-300 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">Optional: Describe your itinerary, add notes, or share details about your journey</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                  isPublic ? 'bg-black' : 'bg-gray-300'
                } group-hover:opacity-80`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    isPublic ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Make this itinerary public
              </span>
            </label>
            {pins.length > 0 && (
              <span className="ml-auto text-sm text-gray-500 font-medium">
                {pins.length} pin{pins.length !== 1 ? "s" : ""} added
              </span>
            )}
          </div>
        </div>

        {/* All Map Controls in One Line */}
        <div className="flex items-center gap-4 mb-4">
          {/* Search Bar - Leftmost */}
          <div className="flex-1 max-w-md relative z-30">
            <MapSearchBar
              onSelectPlace={(center, placeName) => {
                if (flyToLocationRef.current) {
                  flyToLocationRef.current(center, 14);
                }
              }}
            />
          </div>

          {/* Undo/Redo Buttons - Middle Left */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => undoRedoRef.current?.undo()}
              disabled={!canUndo}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center"
              title="Undo (Ctrl+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => undoRedoRef.current?.redo()}
              disabled={!canRedo}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
              </svg>
            </button>
          </div>

          {/* Draw Path Button - Middle Right */}
          <button
            onClick={() => {
              if (isPathMode) {
                // Finish path - MapCanvas will handle this via useEffect when isPathModeExternal changes
                setIsPathMode(false);
              } else {
                // Start path mode
                setIsPathMode(true);
              }
            }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
              isPathMode
                ? "bg-black text-white border-black"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            {isPathMode ? "✓ Finish Path" : "Draw Path"}
          </button>

          {/* Marker Palette - Rightmost */}
          <MarkerPalette />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <MapCanvas 
            useDirections 
            onPinsChange={setPins} 
            onPathModeChange={setIsPathMode}
            isPathModeExternal={isPathMode}
            undoRedoRef={undoRedoRef}
            onMapReady={(flyToLocation) => {
              flyToLocationRef.current = flyToLocation;
            }}
            onUndoRedoChange={(undo, redo) => {
              setCanUndo(undo);
              setCanRedo(redo);
            }}
          />
        </motion.div>
      </main>
    </div>
  );
}



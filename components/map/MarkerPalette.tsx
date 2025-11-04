"use client";

import { HTMLAttributes } from "react";

type PaletteItem = {
  id: string;
  label: string;
  icon: JSX.Element;
  type: "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN" | "START" | "END" | "BIKE" | "RICKSHAW" | "PLANE" | "TRAIN";
};

const Img = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} width={18} height={18} />
);

const DEFAULT_ITEMS: PaletteItem[] = [
  { id: "start", label: "Start", type: "START", icon: <Img src="/icons/flaticon/start.svg" alt="Start" /> },
  { id: "end", label: "End", type: "END", icon: <Img src="/icons/flaticon/end.svg" alt="End" /> },
  { id: "pin", label: "Pin", type: "PIN", icon: <Img src="/icons/flaticon/pin.svg" alt="Pin" /> },
  { id: "hotel", label: "Hotel", type: "HOTEL", icon: <Img src="/icons/flaticon/hotel.svg" alt="Hotel" /> },
  { id: "food", label: "Food", type: "FOOD", icon: <Img src="/icons/flaticon/food.svg" alt="Food" /> },
  { id: "attraction", label: "Attraction", type: "ATTRACTION", icon: <Img src="/icons/flaticon/attraction.svg" alt="Attraction" /> },
  { id: "bike", label: "Bike", type: "BIKE", icon: <Img src="/icons/flaticon/bike.svg" alt="Bike" /> },
  { id: "rickshaw", label: "Rickshaw", type: "RICKSHAW", icon: <Img src="/icons/flaticon/rickshaw.svg" alt="Rickshaw" /> },
  { id: "car", label: "Car", type: "CAR", icon: <Img src="/icons/flaticon/car.svg" alt="Car" /> },
  { id: "plane", label: "Plane", type: "PLANE", icon: <Img src="/icons/flaticon/plane.svg" alt="Plane" /> },
  { id: "train", label: "Train", type: "TRAIN", icon: <Img src="/icons/flaticon/train.svg" alt="Train" /> },
];

/**
 * MarkerPalette
 *
 * Purpose
 * - Minimal drag-source palette for adding markers to the map.
 *
 * Integration notes
 * - On dragStart, set a dataTransfer payload (e.g., JSON.stringify of the item).
 * - MapCanvas should listen for dragover/drop and convert screen coords to lngLat.
 */
export default function MarkerPalette(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm">
      {DEFAULT_ITEMS.map((item) => (
        <button
          key={item.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ id: item.id, type: item.type }));
          }}
          className="group relative grid place-items-center h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition text-black"
          aria-label={`Drag ${item.label}`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}



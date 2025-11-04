"use client";

export interface SampleItinerary {
  id: string;
  title: string;
  color: string;
  description: string;
  route: RoutePoint[]; // Array of route points with details
  duration: string;
  category: string;
}

export interface RoutePoint {
  lngLat: [number, number]; // [longitude, latitude]
  name: string;
  type: "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN";
  description?: string;
  order: number;
}

// Comprehensive sample itineraries data with detailed route points
export const SAMPLE_ITINERARIES: SampleItinerary[] = [
  {
    id: "1",
    title: "Chandigarh to Delhi",
    color: "#0E8EEB", // Brand blue
    description: "A scenic road trip from the planned city to India's capital",
    duration: "1 day",
    category: "Road Trip",
    route: [
      {
        lngLat: [76.7794, 30.7333],
        name: "Chandigarh",
        type: "CUSTOM",
        description: "Start your journey from the beautiful planned city",
        order: 1,
      },
      {
        lngLat: [77.1025, 28.6139],
        name: "Delhi",
        type: "CUSTOM",
        description: "Arrive at India's vibrant capital city",
        order: 2,
      },
    ],
  },
  {
    id: "2",
    title: "Manali Adventure Trail",
    color: "#4ECDC4", // Teal
    description: "Mountain adventure through Manali's stunning landscapes",
    duration: "3 days",
    category: "Adventure",
    route: [
      {
        lngLat: [77.1865, 32.2432],
        name: "Manali",
        type: "HOTEL",
        description: "Base camp in the heart of Manali",
        order: 1,
      },
      {
        lngLat: [77.2144, 32.2396],
        name: "Solang Valley",
        type: "ATTRACTION",
        description: "Adventure activities and snow sports",
        order: 2,
      },
      {
        lngLat: [77.1589, 32.2744],
        name: "Rohtang Pass",
        type: "ATTRACTION",
        description: "Breathtaking mountain pass with stunning views",
        order: 3,
      },
    ],
  },
  {
    id: "3",
    title: "Jaipur Heritage Tour",
    color: "#FF6B6B", // Red
    description: "Explore the royal heritage of Rajasthan's Pink City",
    duration: "2 days",
    category: "Heritage",
    route: [
      {
        lngLat: [75.7873, 26.9124],
        name: "Jaipur City",
        type: "HOTEL",
        description: "Stay in the heart of the Pink City",
        order: 1,
      },
      {
        lngLat: [75.8249, 26.9220],
        name: "City Palace",
        type: "ATTRACTION",
        description: "Royal residence showcasing Rajasthani architecture",
        order: 2,
      },
      {
        lngLat: [75.8249, 26.8850],
        name: "Hawa Mahal",
        type: "ATTRACTION",
        description: "Palace of Winds - iconic five-story palace",
        order: 3,
      },
      {
        lngLat: [75.8500, 26.8855],
        name: "Amer Fort",
        type: "ATTRACTION",
        description: "Magnificent hilltop fort with intricate designs",
        order: 4,
      },
    ],
  },
  {
    id: "4",
    title: "Mumbai to Goa Coastal Drive",
    color: "#95E1D3", // Mint
    description: "Beautiful coastal journey from financial capital to beach paradise",
    duration: "2 days",
    category: "Coastal",
    route: [
      {
        lngLat: [72.8777, 19.0760],
        name: "Mumbai",
        type: "CUSTOM",
        description: "Start from the bustling city of dreams",
        order: 1,
      },
      {
        lngLat: [73.8567, 18.5204],
        name: "Pune",
        type: "FOOD",
        description: "Stop for authentic Maharashtrian cuisine",
        order: 2,
      },
      {
        lngLat: [73.8278, 15.4909],
        name: "Goa",
        type: "HOTEL",
        description: "Relax at pristine beaches of Goa",
        order: 3,
      },
    ],
  },
  {
    id: "5",
    title: "Kerala Backwaters",
    color: "#A8E6CF", // Green
    description: "Serene journey through Kerala's famous backwaters",
    duration: "3 days",
    category: "Nature",
    route: [
      {
        lngLat: [76.2673, 9.9312],
        name: "Kochi",
        type: "HOTEL",
        description: "Historic port city with colonial architecture",
        order: 1,
      },
      {
        lngLat: [76.2993, 9.5900],
        name: "Alappuzha",
        type: "ATTRACTION",
        description: "Venice of the East - famous for backwaters",
        order: 2,
      },
      {
        lngLat: [76.3388, 9.4981],
        name: "Kumarakom",
        type: "HOTEL",
        description: "Bird sanctuary and tranquil backwater experience",
        order: 3,
      },
    ],
  },
  {
    id: "6",
    title: "Udaipur Royal Experience",
    color: "#FF8B94", // Pink
    description: "Immerse in the royal charm of Udaipur",
    duration: "2 days",
    category: "Heritage",
    route: [
      {
        lngLat: [73.7128, 24.5854],
        name: "Udaipur",
        type: "HOTEL",
        description: "City of Lakes - stay near the beautiful lakes",
        order: 1,
      },
      {
        lngLat: [73.6800, 24.5760],
        name: "City Palace",
        type: "ATTRACTION",
        description: "Largest palace complex in Rajasthan",
        order: 2,
      },
      {
        lngLat: [73.6840, 24.5711],
        name: "Lake Pichola",
        type: "ATTRACTION",
        description: "Scenic lake with boat rides and sunset views",
        order: 3,
      },
    ],
  },
  {
    id: "7",
    title: "Darjeeling Tea Trail",
    color: "#C7CEEA", // Purple
    description: "Journey through tea gardens and mountain vistas",
    duration: "3 days",
    category: "Nature",
    route: [
      {
        lngLat: [88.2636, 27.0360],
        name: "Darjeeling",
        type: "HOTEL",
        description: "Hill station known for tea gardens and toy train",
        order: 1,
      },
      {
        lngLat: [88.3044, 27.0333],
        name: "Tiger Hill",
        type: "ATTRACTION",
        description: "Sunrise point with views of Kanchenjunga",
        order: 2,
      },
      {
        lngLat: [88.2600, 27.0500],
        name: "Tea Gardens",
        type: "ATTRACTION",
        description: "Visit tea plantations and learn about tea processing",
        order: 3,
      },
    ],
  },
  {
    id: "8",
    title: "Rishikesh Spiritual Journey",
    color: "#FFB6C1", // Light Pink
    description: "Yoga and spirituality in the yoga capital of the world",
    duration: "2 days",
    category: "Spiritual",
    route: [
      {
        lngLat: [78.2676, 30.0869],
        name: "Rishikesh",
        type: "HOTEL",
        description: "Gateway to the Himalayas and yoga capital",
        order: 1,
      },
      {
        lngLat: [78.2928, 30.0869],
        name: "Laxman Jhula",
        type: "ATTRACTION",
        description: "Suspension bridge over the Ganges",
        order: 2,
      },
      {
        lngLat: [78.3000, 30.0800],
        name: "Ram Jhula",
        type: "ATTRACTION",
        description: "Another iconic bridge with ashrams nearby",
        order: 3,
      },
    ],
  },
  {
    id: "9",
    title: "Varanasi Ghats Experience",
    color: "#FFA07A", // Light Salmon
    description: "Spiritual journey along the sacred Ganges",
    duration: "2 days",
    category: "Spiritual",
    route: [
      {
        lngLat: [83.0050, 25.3176],
        name: "Varanasi",
        type: "HOTEL",
        description: "Ancient city on the banks of Ganges",
        order: 1,
      },
      {
        lngLat: [83.0100, 25.3100],
        name: "Dashashwamedh Ghat",
        type: "ATTRACTION",
        description: "Main ghat known for evening Ganga Aarti",
        order: 2,
      },
      {
        lngLat: [83.0200, 25.3150],
        name: "Manikarnika Ghat",
        type: "ATTRACTION",
        description: "Sacred cremation ghat",
        order: 3,
      },
    ],
  },
  {
    id: "10",
    title: "Agra Golden Triangle",
    color: "#98D8C8", // Mint Green
    description: "Iconic monuments of India's Golden Triangle",
    duration: "2 days",
    category: "Heritage",
    route: [
      {
        lngLat: [77.2090, 28.5355],
        name: "Agra",
        type: "HOTEL",
        description: "City of the Taj Mahal",
        order: 1,
      },
      {
        lngLat: [78.0421, 27.1750],
        name: "Taj Mahal",
        type: "ATTRACTION",
        description: "Iconic white marble mausoleum",
        order: 2,
      },
      {
        lngLat: [78.0418, 27.1753],
        name: "Agra Fort",
        type: "ATTRACTION",
        description: "Red sandstone fort with Mughal architecture",
        order: 3,
      },
    ],
  },
];

// Helper function to get route coordinates for map lines
export function getRouteCoordinates(itinerary: SampleItinerary): [number, number][] {
  return itinerary.route.map(point => point.lngLat);
}

// Helper function to get first point for button placement
export function getStartPoint(itinerary: SampleItinerary): [number, number] {
  return itinerary.route[0].lngLat;
}

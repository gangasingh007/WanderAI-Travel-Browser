"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import ItineraryMap from "@/components/map/ItineraryMap";

// Mock data - in production, fetch from API based on id
const getItineraryData = (id: string) => {
  const itineraries: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Golden Triangle Adventure',
      creator: {
        name: '@the.city.nomad',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
        bio: 'Exploring hidden gems in bustling cities across Asia. Sharing authentic travel experiences and local insights.',
        followers: 12500,
        following: 320
      },
      description: `This journey through India's Golden Triangle was nothing short of magical. Starting in the vibrant capital of Delhi, I was immediately struck by the incredible contrast between ancient history and modern life. The Red Fort and Jama Masjid took my breath away, while the bustling streets of Old Delhi offered some of the most incredible street food I've ever tasted.

From Delhi, we journeyed to Agra, home of the iconic Taj Mahal. Words can't describe the feeling of seeing this monument at sunrise - it's truly one of the world's most beautiful buildings. The intricate marble work and the love story behind it made this stop unforgettable.

Jaipur, the Pink City, was our final destination and what a way to end! The Amber Fort perched on the hillside, the City Palace with its stunning architecture, and the vibrant markets filled with textiles and jewelry - every moment was a feast for the senses.

The journey was a perfect blend of history, culture, and incredible food. Each city had its own unique character, and the people we met along the way were incredibly warm and welcoming. This trip truly opened my eyes to the rich tapestry of Indian culture.`,
      image: 'https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?w=1600&q=80',
      views: 12400,
      saves: 890,
      rating: 4.8,
      days: 7,
      stops: 24,
      tags: ['culture', 'food'],
      destination: 'Delhi, Jaipur, Agra',
      places: [
        {
          id: '1',
          name: 'Red Fort',
          city: 'Delhi',
          coordinates: [77.2410, 28.6562],
          description: 'A magnificent 17th-century fort complex that served as the main residence of Mughal emperors.',
          image: 'https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
          visitDuration: '2-3 hours',
          bestTime: 'Morning',
          tips: 'Arrive early to avoid crowds. The sound and light show in the evening is spectacular.'
        },
        {
          id: '2',
          name: 'Jama Masjid',
          city: 'Delhi',
          coordinates: [77.2339, 28.6506],
          description: 'One of the largest mosques in India, built by Shah Jahan with stunning red sandstone and white marble.',
          image: 'https://images.unsplash.com/photo-1554720372-43797b5b4a70?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
          visitDuration: '1-2 hours',
          bestTime: 'Early morning or evening',
          tips: 'Dress modestly. The view from the minaret is worth the climb.'
        },
        {
          id: '3',
          name: 'Taj Mahal',
          city: 'Agra',
          coordinates: [78.0421, 27.1751],
          description: 'The iconic white marble mausoleum, a symbol of eternal love and one of the Seven Wonders of the World.',
          image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
          visitDuration: '3-4 hours',
          bestTime: 'Sunrise (6 AM)',
          tips: 'Visit at sunrise for the best lighting and fewer crowds. The marble changes color throughout the day.'
        },
        {
          id: '4',
          name: 'Agra Fort',
          city: 'Agra',
          coordinates: [78.0269, 27.1797],
          description: 'A UNESCO World Heritage site, this red sandstone fort offers stunning views of the Taj Mahal.',
          image: 'https://images.unsplash.com/photo-1668361984091-86ca775c3a90?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735',
          visitDuration: '2-3 hours',
          bestTime: 'Late afternoon',
          tips: 'Combine with Taj Mahal visit. The fort has beautiful gardens and palaces inside.'
        },
        {
          id: '5',
          name: 'Amber Fort',
          city: 'Jaipur',
          coordinates: [75.8513, 26.9855],
          description: 'A majestic fort-palace complex with stunning architecture, located on a hilltop overlooking Maota Lake.',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
          visitDuration: '3-4 hours',
          bestTime: 'Morning',
          tips: 'Take an elephant ride up or walk. The Sheesh Mahal (Mirror Palace) is a must-see.'
        },
        {
          id: '6',
          name: 'City Palace',
          city: 'Jaipur',
          coordinates: [75.8267, 26.9260],
          description: 'A beautiful complex of palaces, courtyards, and gardens, still partially occupied by the royal family.',
          image: 'https://images.unsplash.com/photo-1602339752474-f77aa7bcaecd?w=800&q=80',
          visitDuration: '2-3 hours',
          bestTime: 'Morning',
          tips: 'The museum inside has fascinating royal artifacts. Don\'t miss the four gates representing different seasons.'
        }
      ],
      timeline: [
        { day: 1, title: 'Arrival in Delhi', description: 'Check into hotel, explore Connaught Place, evening food walk in Old Delhi' },
        { day: 2, title: 'Delhi Heritage Tour', description: 'Red Fort, Jama Masjid, India Gate, Lotus Temple' },
        { day: 3, title: 'Travel to Agra', description: 'Morning train to Agra, visit Agra Fort, sunset at Mehtab Bagh viewing Taj Mahal' },
        { day: 4, title: 'Taj Mahal Sunrise', description: 'Early morning Taj Mahal visit, Fatehpur Sikri day trip' },
        { day: 5, title: 'Travel to Jaipur', description: 'Drive to Jaipur, check in, explore local markets' },
        { day: 6, title: 'Jaipur Exploration', description: 'Amber Fort, City Palace, Jantar Mantar, Hawa Mahal' },
        { day: 7, title: 'Departure', description: 'Last minute shopping, visit to Albert Hall Museum, departure' }
      ],
      highlights: [
        'Sunrise visit to Taj Mahal',
        'Elephant ride at Amber Fort',
        'Street food tour in Old Delhi',
        'Shopping at Jaipur\'s colorful markets',
        'Sound and light show at Red Fort'
      ],
      budget: {
        accommodation: '$400',
        food: '$150',
        transport: '$200',
        activities: '$100',
        total: '$850'
      }
    }
  };
  return itineraries[id] || itineraries['1'];
};

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser || null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (params.id) {
      const data = getItineraryData(params.id as string);
      setItinerary(data);
    }
  }, [params.id]);


  if (loading || !itinerary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Hero Section with Creator Info */}
        <section className="relative">
          <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
            <img
              src={itinerary.image}
              alt={itinerary.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            
            <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
              >
                <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4 drop-shadow-lg">
                  {itinerary.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
                  {itinerary.destination}
                </p>
                
                {/* Creator Card */}
                <div className="flex items-center gap-4 mb-8">
                  <img
                    src={itinerary.creator.avatar}
                    alt={itinerary.creator.name}
                    className="w-16 h-16 rounded-full border-4 border-white/50 object-cover"
                  />
                  <div>
                    <p className="text-white font-semibold text-lg">{itinerary.creator.name}</p>
                    <p className="text-white/80 text-sm">{itinerary.creator.followers.toLocaleString()} followers</p>
                  </div>
                  <button className="ml-auto px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-medium hover:bg-white/30 transition-all">
                    Follow
                  </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    <span>{itinerary.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                    <span>{itinerary.saves} saves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>{itinerary.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{itinerary.days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{itinerary.stops} stops</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Creator Story Section */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={itinerary.creator.avatar}
                  alt={itinerary.creator.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-black">{itinerary.creator.name}</h2>
                  <p className="text-black/60">{itinerary.creator.bio}</p>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-semibold text-black mb-6">About This Journey</h3>
                <p className="text-black/80 leading-relaxed whitespace-pre-line">
                  {itinerary.description}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-black mb-8">Journey Map</h2>
              <div className="relative rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] overflow-hidden">
                <div className="w-full h-[600px]">
                  {itinerary && itinerary.places && itinerary.places.length > 0 && (
                    <ItineraryMap 
                      places={itinerary.places.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        city: p.city,
                        coordinates: p.coordinates
                      }))}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Places Section */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-black mb-12">Places to Visit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itinerary.places.map((place: any, index: number) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] hover:shadow-[0_12px_48px_rgba(31,38,135,0.25)] transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-xl mb-1">{place.name}</h3>
                        <p className="text-white/90 text-sm">{place.city}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-black/70 mb-4 leading-relaxed">{place.description}</p>
                      <div className="space-y-2 text-sm text-black/60">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Duration: {place.visitDuration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Best time: {place.bestTime}</span>
                        </div>
                      </div>
                      {place.tips && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">💡 Tip</p>
                          <p className="text-xs text-blue-800">{place.tips}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-black mb-12">Journey Timeline</h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200" />
                <div className="space-y-8">
                  {itinerary.timeline.map((day: any, index: number) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative flex items-start gap-6"
                    >
                      <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                        {day.day}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-6">
                          <h3 className="text-xl font-semibold text-black mb-2">{day.title}</h3>
                          <p className="text-black/70 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Highlights & Budget Section */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-8"
            >
              <h2 className="text-2xl font-semibold text-black mb-6">Journey Highlights</h2>
              <ul className="space-y-3">
                {itinerary.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-black/80">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Budget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-8"
            >
              <h2 className="text-2xl font-semibold text-black mb-6">Budget Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(itinerary.budget).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-black/70 capitalize">{key === 'total' ? 'Total' : key}:</span>
                    <span className={`font-semibold ${key === 'total' ? 'text-2xl text-blue-600' : 'text-black'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Similar Itineraries */}
        <section className="px-6 md:px-12 lg:px-20 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-black mb-12">Similar Journeys</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: 'Himalayan Adventure Journey',
                    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
                    description: 'Explore more amazing destinations'
                  },
                  {
                    id: 2,
                    title: 'Coastal Konkan Journey',
                    image: 'https://images.unsplash.com/photo-1580741186862-c5d0bf2aff33?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
                    description: 'Explore more amazing destinations'
                  },
                  {
                    id: 3,
                    title: 'Royal Heritage Trail (Rajasthan)',
                    image: 'https://images.unsplash.com/photo-1600954700722-b9a768fc9397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1615',
                    description: 'Explore more amazing destinations'
                  }
                ].map((journey) => (
                  <Link key={journey.id} href={`/itinerary/${journey.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] hover:shadow-[0_12px_48px_rgba(31,38,135,0.25)] transition-all cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={journey.image}
                          alt={journey.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-blue-600 transition-colors">
                          {journey.title}
                        </h3>
                        <p className="text-black/60 text-sm">{journey.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}


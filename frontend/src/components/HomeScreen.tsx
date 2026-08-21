import React, { useState } from 'react';
import {
  Search,
  Wrench,
  Zap,
  Sparkles,
  Cpu,
  Snowflake,
  Star,
  Clock,
  ShieldCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkle,
  MapPin,
  Radio,
  Navigation,
  ArrowRight,
  Hammer,
  Paintbrush,
  Shield,
} from 'lucide-react';
import { CategoryId, ServiceCategory, ServiceItem } from '../types';
import { SERVICE_CATEGORIES } from '../data/mockData';

interface HomeScreenProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onInstantBookService: (service: ServiceItem) => void;
  onOpenPromiseModal: () => void;
  onOpenLiveMap?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectCategory,
  onInstantBookService,
  onOpenPromiseModal,
  onOpenLiveMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all services for real-time search
  const allServices = SERVICE_CATEGORIES.flatMap((cat) => cat.services);
  const filteredServices = searchQuery.trim()
    ? allServices.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'plumbing':
        return <Wrench className="w-6 h-6" />;
      case 'electrical':
        return <Zap className="w-6 h-6" />;
      case 'cleaning':
        return <Sparkles className="w-6 h-6" />;
      case 'appliance':
        return <Cpu className="w-6 h-6" />;
      case 'ac':
        return <Snowflake className="w-6 h-6" />;
      case 'carpenter':
        return <Hammer className="w-6 h-6" />;
      case 'painting':
        return <Paintbrush className="w-6 h-6" />;
      case 'pest_control':
        return <Shield className="w-6 h-6" />;
      case 'maintenance':
        return <Wrench className="w-6 h-6" />;
      default:
        return <Wrench className="w-6 h-6" />;
    }
  };

  return (
    <div id="home-screen" className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Search Bar Section */}
      <section className="mb-6 mt-1">
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#737685]">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for AC repair, cleaning, electricians..."
            className="w-full bg-white border border-[#c3c6d6] text-[#191c1e] placeholder:text-[#737685] rounded-full py-3.5 md:py-4 pl-12 pr-10 focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 text-base shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="max-w-2xl mx-auto mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-20 relative">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>Matching Nashik Services ({filteredServices.length})</span>
              <span className="text-[#006e2f] font-medium">1-Day Service Promise Eligible</span>
            </div>
            {filteredServices.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      onInstantBookService(service);
                      setSearchQuery('');
                    }}
                    className="p-3.5 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-12 h-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-[#003d9b]">
                          {service.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{service.shortDesc}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-900">₹{service.price}</span>
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" /> {service.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-xs bg-[#003d9b] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                      Book
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 text-xs">
                No matching service found for "{searchQuery}". Try "AC repair", "tap leak", or "deep clean".
              </div>
            )}
          </div>
        )}
      </section>

      {/* Promotional Banner: The 1-Day Service Promise (Matching screenshot) */}
      <section className="mb-8">
        <div className="bg-[#003d9b] text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg flex items-center justify-between">
          <div className="z-10 relative max-w-[80%] sm:max-w-[70%]">
            <span className="bg-[#006e2f] text-white text-xs font-bold px-2.5 py-1 rounded-md mb-3 inline-flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Nashik Exclusive
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">
              The 1-Day Service Promise
            </h2>
            <p className="text-sm sm:text-base text-blue-100/90 font-normal mb-5 max-w-lg leading-relaxed">
              Guaranteed expert resolution within 24 hours, or your service is on us.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="promise-book-now-btn"
                onClick={() => onSelectCategory('plumbing')}
                className="bg-white text-[#003d9b] text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
              >
                Book Now
              </button>
              <button
                onClick={onOpenPromiseModal}
                className="text-xs text-blue-200 hover:text-white underline underline-offset-4 flex items-center gap-1"
              >
                How it works <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Watermark Clock Icon */}
          <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none text-white">
            <Clock className="w-36 h-36 sm:w-48 sm:h-48 stroke-[1.2]" />
          </div>
        </div>
      </section>

      {/* Service Categories Bento Grid (Matching screenshot layout) */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[#191c1e] tracking-tight">Explore Services</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Verified local professionals delivered to your doorstep</p>
          </div>
          <button
            id="see-all-services-btn"
            onClick={() => onSelectCategory('plumbing')}
            className="text-[#003d9b] text-sm font-semibold hover:underline flex items-center gap-0.5"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          {/* Highlight Category: Plumbing Services (Large hero card spanning 2 cols) */}
          <div
            id="category-card-plumbing"
            onClick={() => onSelectCategory('plumbing')}
            className="col-span-2 row-span-2 bg-white border border-[#c3c6d6] rounded-2xl p-6 hover:border-[#003d9b] hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden relative cursor-pointer"
          >
            <div className="z-10">
              <span className="bg-[#eceef0] text-[#191c1e] p-3.5 rounded-2xl inline-flex mb-4 group-hover:bg-[#0052cc] group-hover:text-white transition-colors shadow-xs">
                <Wrench className="w-6 h-6" />
              </span>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#003d9b] transition-colors">
                  Plumbing Services
                </h4>
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  High Demand
                </span>
              </div>
              <p className="text-sm text-[#434654] max-w-[280px] leading-relaxed">
                Leak repairs, pipe installations, and full bathroom renovations.
              </p>
            </div>

            <div className="z-10 mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#003d9b]">
              <span>4+ Services Available</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Giant watermark icon in background */}
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity text-gray-900 pointer-events-none">
              <Wrench className="w-48 h-48" />
            </div>
          </div>

          {/* Standard Categories Grid */}
          <div
            id="category-card-electrical"
            onClick={() => onSelectCategory('electrical')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Zap className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Electrical</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Fan, MCB, Wiring</span>
          </div>

          <div
            id="category-card-cleaning"
            onClick={() => onSelectCategory('cleaning')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Sparkles className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Home Cleaning</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Full Home, Bath, Sofa</span>
          </div>

          <div
            id="category-card-appliance"
            onClick={() => onSelectCategory('appliance')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Cpu className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Appliance Repair</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Fridge, RO, Washer</span>
          </div>

          <div
            id="category-card-ac"
            onClick={() => onSelectCategory('ac')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Snowflake className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">AC Service</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Jet Wash, Gas Refill</span>
          </div>

          <div
            id="category-card-carpenter"
            onClick={() => onSelectCategory('carpenter')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Hammer className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Carpenter</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Locks, Furniture, Drill</span>
          </div>

          <div
            id="category-card-painting"
            onClick={() => onSelectCategory('painting')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Paintbrush className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Painting</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Touch-up, Waterproof</span>
          </div>

          <div
            id="category-card-pest_control"
            onClick={() => onSelectCategory('pest_control')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Shield className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Pest Control</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Cockroach, Termite</span>
          </div>

          <div
            id="category-card-maintenance"
            onClick={() => onSelectCategory('maintenance')}
            className="bg-white border border-[#c3c6d6] rounded-2xl p-5 hover:border-[#003d9b] hover:shadow-sm transition-all group flex flex-col items-center text-center cursor-pointer justify-center min-h-[140px]"
          >
            <span className="bg-[#f2f4f6] text-[#003d9b] p-4 rounded-2xl mb-3 group-hover:bg-[#dae2ff] transition-colors">
              <Wrench className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-[#191c1e] group-hover:text-[#003d9b]">Maintenance</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Mounting, Grouting</span>
          </div>
        </div>
      </section>

      {/* Recommended for You Section (Matching Screenshot) */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#191c1e] tracking-tight">Recommended for You</h3>
          <span className="text-xs font-semibold text-[#006e2f] bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            ★ Top Rated in Nashik
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Deep AC Cleaning */}
          <div className="bg-white border border-[#c3c6d6] rounded-2xl overflow-hidden hover:border-[#003d9b] transition-all shadow-xs hover:shadow-md flex flex-col h-full group">
            <div className="h-44 bg-[#e6e8ea] w-full relative overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQdlbVmH8Yzrfw_3lqg6m2CquHJ3o_0C--8NCPgT7EoLU_GpvCiegkD230H1Ef4G47U6hUHqzBWMsTVm-r40c5z_fv7eSiPNhrEKm84WeuO73Kn0qW1Rd08Zw-Kj_Wfy_AamSfgACrI6xJCDsyRwHU_xzGxMRA5WZYm4SregCaRYMs-hK0KPyvJwYm-n4obxUXgWfIA_FMKNQwBCGGw3McsNF7eCGZj2a3Ohe4PKqKJ8SWFHRVVT8T"
                alt="Deep AC Cleaning technician servicing indoor split unit"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#006e2f] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                <Award className="w-3 h-3" /> Bestseller
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#003d9b]">
                  Deep AC Cleaning
                </h4>
                <div className="flex items-center text-[#006e2f] bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#006e2f] text-[#006e2f] mr-1" />
                  4.8
                </div>
              </div>
              <p className="text-xs text-[#434654] mb-4 line-clamp-2 leading-relaxed">
                Complete indoor and outdoor unit chemical wash for optimal cooling performance.
              </p>
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#eceef0]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#737685]">Starting at</span>
                  <span className="text-base font-bold text-gray-900">₹499</span>
                </div>
                <button
                  id="book-deep-ac-btn"
                  onClick={() => onInstantBookService(SERVICE_CATEGORIES[4].services[1])}
                  className="bg-[#003d9b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0052cc] transition-colors active:scale-95 duration-200 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Bathroom Deep Clean */}
          <div className="bg-white border border-[#c3c6d6] rounded-2xl overflow-hidden hover:border-[#003d9b] transition-all shadow-xs hover:shadow-md flex flex-col h-full group">
            <div className="h-44 bg-[#e6e8ea] w-full relative overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqNVa4JQL9ZI6ByPC00nNmv30tw-z6r3heDg_IXXpx9pKmSekLvNRWKK28Px4I-JCJRMVaDMdzo6wELGTwDTizcRhXQjgyc_g5rel0grjkpRzCO0PzrFTK94W3oqc_uguMCKGll31QHXxa7Pq5fv_YvePKsntfdm08urd4s6fO3QMLNE7HWw84q3frbUmdFO96BGbU9dsIEmSaL3StGrt7LvBJ3W-6CG03ZpVeDEjQhhbUeAT_9n1P"
                alt="Bathroom Deep Clean modern sanitized setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                Popular
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#003d9b]">
                  Bathroom Deep Clean
                </h4>
                <div className="flex items-center text-[#006e2f] bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#006e2f] text-[#006e2f] mr-1" />
                  4.9
                </div>
              </div>
              <p className="text-xs text-[#434654] mb-4 line-clamp-2 leading-relaxed">
                Intensive multi-surface cleaning removing hard water stains and sanitizing all fixtures.
              </p>
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#eceef0]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#737685]">Starting at</span>
                  <span className="text-base font-bold text-gray-900">₹799</span>
                </div>
                <button
                  id="book-bath-clean-btn"
                  onClick={() => onInstantBookService(SERVICE_CATEGORIES[2].services[2])}
                  className="bg-[#003d9b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0052cc] transition-colors active:scale-95 duration-200 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Electrical Inspection */}
          <div className="bg-white border border-[#c3c6d6] rounded-2xl overflow-hidden hover:border-[#003d9b] transition-all shadow-xs hover:shadow-md flex flex-col h-full group">
            <div className="h-44 bg-[#e6e8ea] w-full relative overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGZ4Oo3SaH1ARkvXwAU3aeu1P0jo2Dk5zO4ht75FM2uYEONaT7LFgJLWsxUZZeqMhsKjX6SDBWk_qlbRsaP23G9EDYufuTwF9Kqu72yVw4oi5_NqLjxpDTDULhjXjbIVRWbPaOwd-C8g464IPlA-OtCU3hZGf8M4vNEKzyAmyfEKaiScdRfWBu5k6EfGdpA__zvZVejSNyWQe3XWokqD6M9mBsG7HQQbA__YwbIrcax_qcL6gZ6D_t"
                alt="Expert electrical inspection and breaker maintenance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                Essential Safety
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#003d9b]">
                  Electrical Inspection
                </h4>
                <div className="flex items-center text-[#006e2f] bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#006e2f] text-[#006e2f] mr-1" />
                  4.7
                </div>
              </div>
              <p className="text-xs text-[#434654] mb-4 line-clamp-2 leading-relaxed">
                Comprehensive safety check of household wiring, switches, and main panel by certified pros.
              </p>
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#eceef0]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#737685]">Starting at</span>
                  <span className="text-base font-bold text-gray-900">₹299</span>
                </div>
                <button
                  id="book-elec-insp-btn"
                  onClick={() => onInstantBookService(SERVICE_CATEGORIES[1].services[2])}
                  className="bg-[#003d9b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0052cc] transition-colors active:scale-95 duration-200 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Map & Nashik Service Hubs Showcase Banner */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-[#003d9b] via-[#002766] to-[#00173d] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-blue-900">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live GPS Dispatch & 6 Nashik Hubs</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Track Nearby Pros & Real-Time Availability
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Explore real-time coverage across Gangapur Road, College Road, Indira Nagar, Nashik Road, Panchavati, and Mumbai Naka with live AI route grounding.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-200">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" /> ~12m Avg Arrival
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-blue-300" /> 82 On-Duty Pros
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6bff8f]" /> 1-Day Promise
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
              {onOpenLiveMap && (
                <button
                  id="home-open-live-map-btn"
                  onClick={onOpenLiveMap}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#6bff8f] text-[#004e1f] hover:bg-[#85ff9e] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open Live Map Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-green-50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#003d9b] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#6bff8f]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">URBN Trust Guarantee for Nashik</h4>
            <p className="text-xs text-gray-600">
              Every job includes verified KYC pros, 30-day rework warranty, and fixed upfront rates.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPromiseModal}
          className="text-xs font-bold text-[#003d9b] bg-white border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 shrink-0 transition-colors"
        >
          View Guarantee Policy
        </button>
      </section>
    </div>
  );
};

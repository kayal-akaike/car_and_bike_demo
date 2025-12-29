import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, User, ChevronDown } from 'lucide-react';
import ChatbotWidget from './components/ChatbotWidget';
import ChatbotPopup from './components/ChatbotPopup';
import Login from './components/Login';
import logo from './assets/image.png';
import banner from './assets/banner1.webp';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <img src={logo} alt="" className="h-8" />
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Cars or Bikes, Eg: Nexon, or BMW"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2e500] focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Location and User */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-[#46443f] hover:text-black transition-colors">
                <MapPin size={18} />
                <span className="font-medium">{selectedCity}</span>
                <ChevronDown size={16} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User size={24} className="text-[#46443f]" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-[#46443f]">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center space-x-8 py-3">
              <button className="text-white font-medium hover:text-[#f2e500] transition-colors flex items-center space-x-1">
                <span>NEW CARS</span>
                <ChevronDown size={16} />
              </button>
              <button className="text-white font-medium hover:text-[#f2e500] transition-colors flex items-center space-x-1">
                <span>NEW BIKES</span>
                <ChevronDown size={16} />
              </button>
              <button className="text-white font-medium hover:text-[#f2e500] transition-colors flex items-center space-x-1">
                <span>USED CARS</span>
                <ChevronDown size={16} />
              </button>
              <button className="text-white font-medium hover:text-[#f2e500] transition-colors flex items-center space-x-1">
                <span>NEWS &amp; REVIEWS</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Banner */}
      <section className="relative h-[300px] overflow-hidden bg-gray-100">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url(${banner})`,
          }}
        />
      </section>

      {/* Find Your Desired New Car Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[#46443f]">Find Your Desired New Car</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('brand')}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'brand'
                    ? 'bg-[#46443f] text-white'
                    : 'bg-white text-[#46443f] border-2 border-[#46443f] hover:bg-[#46443f] hover:text-white'
                }`}
              >
                BY BRAND
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeTab === 'budget'
                    ? 'bg-[#46443f] text-white'
                    : 'bg-white text-[#46443f] border-2 border-[#46443f] hover:bg-[#46443f] hover:text-white'
                }`}
              >
                BY BUDGET
              </button>
            </div>
          </div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-end space-x-4">
              {/* Brand Dropdown */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Which brand interests you?
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#f2e500] focus:border-transparent text-gray-700">
                    <option>Select Brand</option>
                    <option>Mahindra</option>
                    <option>Tata</option>
                    <option>Maruti Suzuki</option>
                    <option>Hyundai</option>
                    <option>Honda</option>
                    <option>Toyota</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              {/* Model Input */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Do you have a model in mind?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter model name"
                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2e500] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#f2e500] text-[#46443f] px-10 py-2.5 rounded-lg font-bold text-base hover:bg-[#d9cf00] transition-colors shadow-lg"
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chatbot */}
      <ChatbotWidget
        onClick={() => setIsChatOpen(!isChatOpen)}
        isOpen={isChatOpen}
      />

      <AnimatePresence>
        {isChatOpen && (
          <ChatbotPopup onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

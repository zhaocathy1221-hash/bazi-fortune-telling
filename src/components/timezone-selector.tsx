'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationData, searchCities, getCalibratedBirthTime } from '@/lib/timezone-calculator';

interface TimezoneSelectorProps {
  birthDate: Date;
  onTimeCalibrated: (calibration: any) => void;
}

export function TimezoneSelector({ birthDate, onTimeCalibrated }: TimezoneSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [calibrationResult, setCalibrationResult] = useState<any>(null);

  const searchResults = searchCities(searchQuery);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowResults(false);
    
    // Calculate calibrated time
    const calibration = getCalibratedBirthTime(birthDate, location);
    setCalibrationResult(calibration);
    onTimeCalibrated(calibration);
  };

  const getTimeOffsetDescription = (offset: number) => {
    const minutes = Math.abs(Math.round(offset / (60 * 1000)));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const sign = offset >= 0 ? '+' : '-';
    
    if (hours > 0) {
      return `${sign}${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`;
    }
    return `${sign}${mins}分钟`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-600" />
          出生地点与时区校准
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          为确保八字计算准确，请选择您的出生地点。我们将根据地理位置自动校准真太阳时。
        </p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择出生地点
        </label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="输入城市名称，如：北京、上海..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {searchResults.map((city) => (
                <motion.button
                  key={`${city.name}-${city.latitude}`}
                  onClick={() => handleLocationSelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                  whileHover={{ backgroundColor: '#f3e8ff' }}
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">{city.name}</div>
                      <div className="text-sm text-gray-500">
                        {city.country} • 经度: {city.longitude.toFixed(2)}° • 纬度: {city.latitude.toFixed(2)}°
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedLocation && calibrationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            时间校准结果
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">原始时间：</span>
              <span className="font-mono">{calibrationResult.originalTime.toLocaleString('zh-CN')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">时区调整：</span>
              <span className="text-orange-600">{getTimeOffsetDescription(calibrationResult.timezoneOffset)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">真太阳时调整：</span>
              <span className="text-green-600">{getTimeOffsetDescription(calibrationResult.solarTimeOffset)}</span>
            </div>
            
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">校准后时间：</span>
              <span className="font-mono font-bold text-blue-600">{calibrationResult.calibratedTime.toLocaleString('zh-CN')}</span>
            </div>
            
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
              💡 真太阳时是考虑了地球公转轨道偏心率产生的时差调整
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { AstronomicalTimeCalculator, CHINESE_CITIES } from '@/lib/astronomical-time';

interface BirthInfoInputProps {
  onSubmit: (data: {
    birthDate: Date;
    birthTime: string;
    gender: 'male' | 'female';
    calendarType: 'lunar' | 'solar';
    birthPlace: string;
    location: { name: string; longitude: number; latitude: number; timezone: number };
    useTrueSolarTime: boolean;
  }) => void;
}

export default function BirthInfoInput({ onSubmit }: BirthInfoInputProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [calendarType, setCalendarType] = useState<'lunar' | 'solar' | ''>('');
  const [birthPlace, setBirthPlace] = useState('');
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!birthDate) {
      newErrors.birthDate = '请选择出生日期';
    }

    if (!birthTime) {
      newErrors.birthTime = '请选择出生时间';
    }

    if (!gender) {
      newErrors.gender = '请选择性别';
    }

    if (!calendarType) {
      newErrors.calendarType = '请选择历法类型';
    }

    if (!birthPlace) {
      newErrors.birthPlace = '请选择出生地';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const location = AstronomicalTimeCalculator.getLocationByCity(birthPlace);
      if (location) {
        onSubmit({
          birthDate: new Date(birthDate),
          birthTime,
          gender: gender as 'male' | 'female',
          calendarType: calendarType as 'lunar' | 'solar',
          birthPlace,
          location,
          useTrueSolarTime
        });
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">请输入您的出生信息</h2>
        <p className="text-gray-600">我们将为您计算八字并进行运势解读</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 出生日期 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            出生日期
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setErrors({ ...errors, birthDate: '' });
            }}
            max={today}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.birthDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
          )}
        </div>

        {/* 出生时间 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            出生时间
          </label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setErrors({ ...errors, birthTime: '' });
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.birthTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.birthTime && (
            <p className="mt-1 text-sm text-red-600">{errors.birthTime}</p>
          )}
        </div>

        {/* 性别选择 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            性别
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: '男' },
              { value: 'female', label: '女' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setGender(option.value as 'male' | 'female');
                  setErrors({ ...errors, gender: '' });
                }}
                className={`px-4 py-2 rounded-md border-2 transition-all ${
                  gender === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* 出生地选择 */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            出生地
          </label>
          <select
            value={birthPlace}
            onChange={(e) => {
              setBirthPlace(e.target.value);
              setErrors({ ...errors, birthPlace: '' });
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.birthPlace ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">请选择出生地</option>
            {Object.keys(CHINESE_CITIES).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.birthPlace && (
            <p className="mt-1 text-sm text-red-600">{errors.birthPlace}</p>
          )}
        </div>

        {/* 真太阳时选择 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            时间类型
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={useTrueSolarTime}
                onChange={(e) => setUseTrueSolarTime(e.target.checked)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-gray-900">真太阳时</div>
                <div className="text-sm text-gray-500">根据出生地经度计算，精度更高</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={!useTrueSolarTime}
                onChange={(e) => setUseTrueSolarTime(!e.target.checked)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-gray-900">标准时间</div>
                <div className="text-sm text-gray-500">使用所在时区的标准时间</div>
              </div>
            </label>
          </div>
        </div>

        {/* 历法选择 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            历法类型
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'solar', label: '阳历', description: '公历日期' },
              { value: 'lunar', label: '农历', description: '阴历日期' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCalendarType(option.value as 'lunar' | 'solar');
                  setErrors({ ...errors, calendarType: '' });
                }}
                className={`px-4 py-3 rounded-md border-2 transition-all text-left ${
                  calendarType === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
          {errors.calendarType && (
            <p className="mt-1 text-sm text-red-600">{errors.calendarType}</p>
          )}
        </div>

        {/* 提交按钮 */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          开始八字分析
        </motion.button>
      </form>

      {/* 说明文字 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>${calendarType === 'lunar' ? '系统会自动将农历转换为公历进行计算' : '请确保输入的日期为公历日期'}</p>
        <p className="mt-1">您的个人信息将被严格保密，仅用于八字计算</p>
      </div>
    </motion.div>
  );
}
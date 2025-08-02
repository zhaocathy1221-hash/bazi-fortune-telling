'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimezoneSelector } from './timezone-selector';
import { LocationData, getCalibratedBirthTime } from '@/lib/timezone-calculator';

interface EnhancedBirthInfo {
  birthDate: Date;
  birthTime: string;
  gender: 'male' | 'female';
  calendarType: 'lunar' | 'solar';
  location: LocationData;
  calibratedTime: Date;
  timeCalibration: any;
}

interface EnhancedBirthInputProps {
  onSubmit: (data: EnhancedBirthInfo) => void;
}

export default function EnhancedBirthInput({ onSubmit }: EnhancedBirthInputProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [calendarType, setCalendarType] = useState<'lunar' | 'solar' | ''>('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [timeCalibration, setTimeCalibration] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(1);

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!birthDate) newErrors.birthDate = '请选择出生日期';
      if (!birthTime) newErrors.birthTime = '请选择出生时间';
      if (!gender) newErrors.gender = '请选择性别';
      if (!calendarType) newErrors.calendarType = '请选择历法类型';
    }

    if (currentStep === 2) {
      if (!location) newErrors.location = '请选择出生地点';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleLocationSelect = (calibration: any) => {
    setLocation(calibration.location);
    setTimeCalibration(calibration);
    setErrors({});
  };

  const handleFinalSubmit = () => {
    if (validateStep(2) && location && timeCalibration) {
      const birthDateTime = new Date(`${birthDate}T${birthTime}`);
      
      onSubmit({
        birthDate: birthDateTime,
        birthTime,
        gender: gender as 'male' | 'female',
        calendarType: calendarType as 'lunar' | 'solar',
        location,
        calibratedTime: timeCalibration.calibratedTime,
        timeCalibration
      });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= stepNumber 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {stepNumber}
          </div>
          {stepNumber < 2 && (
            <div className={`w-16 h-0.5 ${
              step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
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
        {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
      </div>

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
        {errors.birthTime && <p className="mt-1 text-sm text-red-600">{errors.birthTime}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            性别
          </label>
          <div className="grid grid-cols-2 gap-2">
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
                className={`px-3 py-2 rounded-md border-2 transition-all ${
                  gender === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            历法
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'solar', label: '阳历' },
              { value: 'lunar', label: '农历' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCalendarType(option.value as 'lunar' | 'solar');
                  setErrors({ ...errors, calendarType: '' });
                }}
                className={`px-3 py-2 rounded-md border-2 transition-all text-center ${
                  calendarType === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.calendarType && <p className="mt-1 text-sm text-red-600">{errors.calendarType}</p>}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const birthDateTime = birthDate && birthTime ? new Date(`${birthDate}T${birthTime}`) : new Date();
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <Globe className="w-6 h-6 mr-2 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">选择出生地点</h3>
          </div>
          <p className="text-sm text-gray-600">
            请选择您的出生地点，我们将根据地理位置自动校准真太阳时
          </p>
        </div>

        <TimezoneSelector
          birthDate={birthDateTime}
          onTimeCalibrated={handleLocationSelect}
        />

        {errors.location && <p className="text-sm text-red-600 text-center">{errors.location}</p>}
      </motion.div>
    );
  };

  const renderStep3 = () => {
    if (!timeCalibration || !location) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">确认信息</h3>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">出生日期：</span>
            <span>{birthDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">出生时间：</span>
            <span>{birthTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">性别：</span>
            <span>{gender === 'male' ? '男' : '女'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">历法：</span>
            <span>{calendarType === 'lunar' ? '农历' : '阳历'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">出生地点：</span>
            <span>{location.name}, {location.country}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-gray-800">校准后时间：</span>
            <span className="font-bold text-purple-600">
              {timeCalibration.calibratedTime.toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">完整出生信息录入</h2>
        <p className="text-gray-600">精确到分钟，确保八字计算准确无误</p>
      </div>

      <StepIndicator />

      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <div>
          {step > 1 && (
            <motion.button
              type="button"
              onClick={handlePreviousStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              上一步
            </motion.button>
          )}
        </div>

        <div>
          {step < 3 ? (
            <motion.button
              type="button"
              onClick={handleNextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              下一步
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleFinalSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              开始八字分析
            </motion.button>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        {step === 1 && "第1步：基本信息"}
        {step === 2 && "第2步：地点与时区校准"}
        {step === 3 && "第3步：确认信息"}
      </div>
    </motion.div>
  );
}
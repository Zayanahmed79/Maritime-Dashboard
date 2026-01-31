"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

type Language = 'en' | 'ur' | 'bal'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
  isUrdu: boolean
  isBalochi: boolean
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'dashboard.title': {
    en: 'Maritime Safety & Awareness Dashboard',
    ur: 'سمندری حفاظت اور آگاہی ڈیش بورڈ',
    bal: 'زر ءِ حفاظت ءُ آگاہی ڈیش بورڈ'
  },
  'dashboard.subtitle': {
    en: 'Real-time maritime safety for fishermen and coastal communities',
    ur: 'ماہی گیروں اور ساحلی برادریوں کے لیے ریئل ٹائم سمندری حفاظت',
    bal: 'مید ءُ زر ءِ مردم آنی ھاترا رئیل ٹائم رکّ'
  },
  'status.live': {
    en: 'LIVE',
    ur: 'براہ راست',
    bal: 'زندگ'
  },
  'status.offline': {
    en: 'OFFLINE',
    ur: 'آف لائن',
    bal: 'بند'
  },
  'emergency': {
    en: 'Emergency',
    ur: 'ایمرجنسی',
    bal: 'ہنگامی'
  },
  'emergency.help': {
    en: 'Emergency Help',
    ur: 'ہنگامی مدد',
    bal: 'ہنگامی مدد'
  },

  // Weather Widget
  'weather.title': {
    en: 'Weather Conditions',
    ur: 'موسمی حالات',
    bal: 'موسم ءِ حال'
  },
  'weather.wind': {
    en: 'Wind Speed',
    ur: 'ہوا کی رفتار',
    bal: 'گوات ءِ تیزی'
  },
  'weather.waves': {
    en: 'Wave Height',
    ur: 'لہر کی اونچائی',
    bal: 'چول ءِ برزی'
  },
  'weather.visibility': {
    en: 'Visibility',
    ur: 'مرئیت',
    bal: 'گند ءِ حد'
  },
  'weather.temperature': {
    en: 'Temperature',
    ur: 'درجہ حرارت',
    bal: 'گرم ءُ سرد'
  },
  'weather.humidity': {
    en: 'Humidity',
    ur: 'نمی',
    bal: 'نمی'
  },
  'weather.pressure': {
    en: 'Pressure',
    ur: 'دباؤ',
    bal: 'دباؤ'
  },
  'weather.safe': {
    en: 'Safe',
    ur: 'محفوظ',
    bal: 'رکّ'
  },
  'weather.caution': {
    en: 'Caution',
    ur: 'احتیاط',
    bal: 'حیال'
  },
  'weather.danger': {
    en: 'Danger',
    ur: 'خطرہ',
    bal: 'خطرہ'
  },

  // Boundary Widget
  'boundary.title': {
    en: 'Boundary Distance',
    ur: 'سرحدی فاصلہ',
    bal: 'سیم ءِ مُر'
  },
  'boundary.nearest': {
    en: 'Nearest Boundary',
    ur: 'قریب ترین سرحد',
    bal: 'نزیک ترین سیم'
  },
  'boundary.international': {
    en: 'International Waters',
    ur: 'بین الاقوامی پانی',
    bal: 'میان استمانی آپ'
  },
  'boundary.national': {
    en: 'National Waters',
    ur: 'قومی پانی',
    bal: 'ملکی آپ'
  },
  'boundary.restricted': {
    en: 'Restricted Zone',
    ur: 'ممنوعہ علاقہ',
    bal: 'بندیں ہند'
  },
  'boundary.fishing': {
    en: 'Fishing Zone',
    ur: 'ماہی گیری کا علاقہ',
    bal: 'شکار ءِ ہند'
  },
  'boundary.safe': {
    en: 'Safe Distance',
    ur: 'محفوظ فاصلہ',
    bal: 'رکّ ءِ مُر'
  },
  'boundary.warning': {
    en: 'Warning - Approaching',
    ur: 'انتباہ - قریب آ رہے ہیں',
    bal: 'ہوش - نزیک'
  },
  'boundary.danger': {
    en: 'Danger - Too Close',
    ur: 'خطرہ - بہت قریب',
    bal: 'خطرہ - باز نزیک'
  },

  // Traffic Widget
  'traffic.title': {
    en: 'Vessel Traffic',
    ur: 'جہازوں کی آمدورفت',
    bal: 'بوحیگ ءِ راہ'
  },
  'traffic.nearby': {
    en: 'Nearby Vessels',
    ur: 'قریبی جہاز',
    bal: 'نزیک ءِ بوحیگ'
  },
  'traffic.density': {
    en: 'Traffic Density',
    ur: 'ٹریفک کی کثافت',
    bal: 'گرد ءِ بوحیگ'
  },
  'traffic.collision_risk': {
    en: 'Collision Risk',
    ur: 'تصادم کا خطرہ',
    bal: 'ڈک ءِ خطرہ'
  },
  'traffic.low': {
    en: 'Low',
    ur: 'کم',
    bal: 'کم'
  },
  'traffic.moderate': {
    en: 'Moderate',
    ur: 'معتدل',
    bal: 'میان'
  },
  'traffic.high': {
    en: 'High',
    ur: 'زیادہ',
    bal: 'باز'
  },

  // Map Controls
  'map.title': {
    en: 'Maritime Map',
    ur: 'سمندری نقشہ',
    bal: 'زر ءِ نقشہ'
  },
  'map.vessels': {
    en: 'Vessels',
    ur: 'جہاز',
    bal: 'بوحیگ'
  },
  'map.boundaries': {
    en: 'Boundaries',
    ur: 'سرحدیں',
    bal: 'سیم'
  },
  'map.weather': {
    en: 'Weather',
    ur: 'موسم',
    bal: 'موسم'
  },
  'map.zones': {
    en: 'Zones',
    ur: 'علاقے',
    bal: 'ہند'
  },
  'map.your_location': {
    en: 'Your Location',
    ur: 'آپ کا مقام',
    bal: 'وتی ہند'
  },
  'map.reset': {
    en: 'Reset View',
    ur: 'نظارہ دوبارہ ترتیب دیں',
    bal: 'نقشہ ءِ صاف'
  },
  'map.layers': {
    en: 'Map Layers',
    ur: 'نقشہ کی تہیں',
    bal: 'نقشہ ءِ تہا'
  },

  // Alerts
  'alerts.title': {
    en: 'Active Alerts',
    ur: 'فعال انتباہات',
    bal: 'جار'
  },
  'alerts.none': {
    en: 'No active alerts',
    ur: 'کوئی فعال انتباہ نہیں',
    bal: 'ہچ جار نیست'
  },
  'alerts.weather_warning': {
    en: 'Weather Warning',
    ur: 'موسمی انتباہ',
    bal: 'موسم ءِ جار'
  },
  'alerts.boundary_warning': {
    en: 'Boundary Warning',
    ur: 'سرحدی انتباہ',
    bal: 'سیم ءِ جار'
  },
  'alerts.zone_warning': {
    en: 'Zone Warning',
    ur: 'علاقے کا انتباہ',
    bal: 'ہند ءِ جار'
  },
  'alerts.traffic_warning': {
    en: 'Traffic Warning',
    ur: 'ٹریفک انتباہ',
    bal: 'راہ ءِ جار'
  },
  'alerts.storm_alert': {
    en: 'Storm Alert',
    ur: 'طوفان کا انتباہ',
    bal: 'طوفان ءِ جار'
  },
  'alerts.high_waves': {
    en: 'High Waves Alert',
    ur: 'بلند لہروں کا انتباہ',
    bal: 'برزیں چول ءِ جار'
  },
  'alerts.strong_winds': {
    en: 'Strong Winds',
    ur: 'تیز ہوائیں',
    bal: 'تیزیں گوات'
  },
  'alerts.low_visibility': {
    en: 'Low Visibility',
    ur: 'کم مرئیت',
    bal: 'کم گند'
  },
  'alerts.approaching_boundary': {
    en: 'Approaching International Boundary',
    ur: 'بین الاقوامی سرحد قریب آ رہی ہے',
    bal: 'میان استمانی سیم نزیک'
  },
  'alerts.restricted_zone': {
    en: 'Entering Restricted Zone',
    ur: 'ممنوعہ علاقے میں داخل ہو رہے ہیں',
    bal: 'بندیں ہند ءِ تہا'
  },
  'alerts.high_traffic': {
    en: 'High Traffic Area',
    ur: 'زیادہ ٹریفک کا علاقہ',
    bal: 'باز بوحیگ ءِ ہند'
  },

  // Education Section
  'education.title': {
    en: 'Safety Education',
    ur: 'حفاظتی تعلیم',
    bal: 'رکّ ءِ وانگ'
  },
  'education.zones_title': {
    en: 'Maritime Zones',
    ur: 'سمندری علاقے',
    bal: 'زر ءِ ہند'
  },
  'education.zones_desc': {
    en: 'Learn about different maritime zones and boundaries',
    ur: 'مختلف سمندری علاقوں اور حدود کے بارے میں جانیں',
    bal: 'زر ءِ ہند ءُ سیم آنی بابت ءَ بزان'
  },
  'education.safety_title': {
    en: 'Safety Guidelines',
    ur: 'حفاظتی ہدایات',
    bal: 'رکّ ءِ راہ'
  },
  'education.safety_desc': {
    en: 'Essential safety rules for fishing at sea',
    ur: 'سمندر میں ماہی گیری کے لیے ضروری حفاظتی اصول',
    bal: 'زر ءِ تہا شکار ءِ رکّ ءِ قانون'
  },
  'education.emergency_title': {
    en: 'Emergency Procedures',
    ur: 'ہنگامی طریقہ کار',
    bal: 'ہنگامی کار'
  },
  'education.emergency_desc': {
    en: 'What to do in case of emergency at sea',
    ur: 'سمندر میں ہنگامی صورتحال میں کیا کریں',
    bal: 'زر ءِ تہا ہنگامی حالات ءِ تہا چی کنے'
  },
  'education.contacts_title': {
    en: 'Emergency Contacts',
    ur: 'ہنگامی رابطے',
    bal: 'ہنگامی نمبر'
  },
  'education.contacts_desc': {
    en: 'Important numbers for maritime emergencies',
    ur: 'سمندری ہنگامی صورتحال کے لیے اہم نمبر',
    bal: 'زر ءِ ہنگامی خاص نمبر'
  },

  // Zones Information
  'zones.territorial': {
    en: 'Territorial Waters (0-12 nm)',
    ur: 'علاقائی پانی (0-12 بحری میل)',
    bal: 'ملکی آپ (0-12 nm)'
  },
  'zones.territorial_desc': {
    en: 'Full sovereignty of coastal state. Fishing allowed with license.',
    ur: 'ساحلی ریاست کی مکمل حاکمیت۔ لائسنس کے ساتھ ماہی گیری کی اجازت۔',
    bal: 'ملک ءِ حکومت۔ لائسنس ءِ گوں شکار۔'
  },
  'zones.contiguous': {
    en: 'Contiguous Zone (12-24 nm)',
    ur: 'متصل علاقہ (12-24 بحری میل)',
    bal: 'متصل ہند (12-24 nm)'
  },
  'zones.contiguous_desc': {
    en: 'State can enforce customs and immigration laws.',
    ur: 'ریاست کسٹم اور امیگریشن قوانین نافذ کر سکتی ہے۔',
    bal: 'کسٹمز ءُ امیگریشن ءِ قانون۔'
  },
  'zones.eez': {
    en: 'Exclusive Economic Zone (24-200 nm)',
    ur: 'خصوصی اقتصادی علاقہ (24-200 بحری میل)',
    bal: 'معاشی ہند (24-200 nm)'
  },
  'zones.eez_desc': {
    en: 'State has rights to natural resources. Fishing regulated.',
    ur: 'ریاست کو قدرتی وسائل کے حقوق ہیں۔ ماہی گیری منظم ہے۔',
    bal: 'قدرتی وسائل۔ شکار ءِ قانون۔'
  },
  'zones.international': {
    en: 'International Waters (200+ nm)',
    ur: 'بین الاقوامی پانی (200+ بحری میل)',
    bal: 'میان استمانی آپ (200+ nm)'
  },
  'zones.international_desc': {
    en: 'Outside national jurisdiction. Different rules apply.',
    ur: 'قومی دائرہ اختیار سے باہر۔ مختلف اصول لاگو ہوتے ہیں۔',
    bal: 'ملک ءِ حد ءَ ڈر۔ دگہ قانون۔'
  },

  // Safety Guidelines
  'safety.check_weather': {
    en: 'Always check weather before departure',
    ur: 'روانگی سے پہلے ہمیشہ موسم چیک کریں',
    bal: 'روگ ءَ پیش موسم چیک کن'
  },
  'safety.inform': {
    en: 'Inform family about your trip plan',
    ur: 'اپنے سفر کے منصوبے کے بارے میں خاندان کو مطلع کریں',
    bal: 'وتی سفر ءِ بابت ءَ لوگ ءَ حال دے'
  },
  'safety.equipment': {
    en: 'Carry safety equipment (life jackets, flares)',
    ur: 'حفاظتی سامان ساتھ رکھیں (لائف جیکٹس، فلیئرز)',
    bal: 'رکّ ءِ سامان گون کن'
  },
  'safety.communication': {
    en: 'Keep communication devices charged',
    ur: 'مواصلاتی آلات چارج رکھیں',
    bal: 'حال ءِ ڈیوائس چارج کن'
  },
  'safety.boundaries': {
    en: 'Respect maritime boundaries',
    ur: 'سمندری حدود کا احترام کریں',
    bal: 'زر ءِ سیم ءِ خیال کن'
  },
  'safety.avoid_night': {
    en: 'Avoid fishing in poor visibility',
    ur: 'کم مرئیت میں ماہی گیری سے گریز کریں',
    bal: 'کم گند ءِ تہا شکار مہ کن'
  },

  // Emergency Procedures
  'emergency.mayday': {
    en: 'MAYDAY Call',
    ur: 'میڈے کال',
    bal: 'مے ڈے کال'
  },
  'emergency.mayday_desc': {
    en: 'Use VHF Channel 16 for emergencies. Say "MAYDAY" three times.',
    ur: 'ہنگامی صورتحال کے لیے VHF چینل 16 استعمال کریں۔ "میڈے" تین بار کہیں۔',
    bal: 'VHF Channel 16 کار ءَ بیار۔ "مے ڈے" سے بار گو۔'
  },
  'emergency.man_overboard': {
    en: 'Man Overboard',
    ur: 'آدمی پانی میں گرا',
    bal: 'مردم آپ ءِ تہا'
  },
  'emergency.man_overboard_desc': {
    en: 'Throw flotation device. Keep visual contact. Call for help.',
    ur: 'تیرنے کا آلہ پھینکیں۔ نظر رکھیں۔ مدد کے لیے پکاریں۔',
    bal: 'ترگ ءِ چیز دور دے۔ نظر دار۔ مدد لوٹ۔'
  },
  'emergency.fire': {
    en: 'Fire on Board',
    ur: 'جہاز پر آگ',
    bal: 'بوحیگ ءِ تہا آس'
  },
  'emergency.fire_desc': {
    en: 'Use fire extinguisher. If uncontrollable, prepare to abandon vessel.',
    ur: 'آگ بجھانے والا آلہ استعمال کریں۔ قابو نہ ہو تو جہاز چھوڑنے کی تیاری کریں۔',
    bal: 'آس ءِ کشگ۔ اگر کنٹرول نہ بیت، بوحیگ ءَ یلہ کن۔'
  },

  // Contact Numbers
  'contact.coast_guard': {
    en: 'Coast Guard',
    ur: 'کوسٹ گارڈ',
    bal: 'کوسٹ گارڈ'
  },
  'contact.navy': {
    en: 'Pakistan Navy',
    ur: 'پاکستان نیوی',
    bal: 'پاکستان نیوی'
  },
  'contact.maritime': {
    en: 'Maritime Security',
    ur: 'بحری سیکیورٹی',
    bal: 'میری ٹائم سیکیورٹی'
  },
  'contact.fisheries': {
    en: 'Fisheries Department',
    ur: 'محکمہ ماہی گیری',
    bal: 'فشریز ڈیپارٹمنٹ'
  },
  'contact.rescue': {
    en: 'Search & Rescue',
    ur: 'تلاش و بچاؤ',
    bal: 'سرچ اینڈ ریسکیو'
  },

  // Vessel Types
  'vessel.fishing': {
    en: 'Fishing Vessel',
    ur: 'ماہی گیری کا جہاز',
    bal: 'شکار ءِ بوحیگ'
  },
  'vessel.cargo': {
    en: 'Cargo Ship',
    ur: 'کارگو جہاز',
    bal: 'سامان ءِ جہاز'
  },
  'vessel.tanker': {
    en: 'Tanker',
    ur: 'ٹینکر',
    bal: 'ٹینکر'
  },
  'vessel.passenger': {
    en: 'Passenger Vessel',
    ur: 'مسافر جہاز',
    bal: 'مسافر ءِ بوحیگ'
  },
  'vessel.military': {
    en: 'Military Vessel',
    ur: 'فوجی جہاز',
    bal: 'فوجی بوحیگ'
  },
  'vessel.speed': {
    en: 'Speed',
    ur: 'رفتار',
    bal: 'تیزی'
  },
  'vessel.heading': {
    en: 'Heading',
    ur: 'سمت',
    bal: 'زاویہ'
  },
  'vessel.distance': {
    en: 'Distance',
    ur: 'فاصلہ',
    bal: 'مُر'
  },

  // Units
  'unit.knots': {
    en: 'knots',
    ur: 'ناٹ',
    bal: 'ناٹ'
  },
  'unit.meters': {
    en: 'meters',
    ur: 'میٹر',
    bal: 'میٹر'
  },
  'unit.km': {
    en: 'km',
    ur: 'کلومیٹر',
    bal: 'کلومیٹر'
  },
  'unit.nm': {
    en: 'nm',
    ur: 'بحری میل',
    bal: 'nm'
  },

  // Time
  'time.last_updated': {
    en: 'Last Updated',
    ur: 'آخری اپڈیٹ',
    bal: 'گڈی آپڈیٹ'
  },
  'time.ago': {
    en: 'ago',
    ur: 'پہلے',
    bal: 'پیش'
  },
  'time.minutes': {
    en: 'minutes',
    ur: 'منٹ',
    bal: 'منٹ'
  },
  'time.seconds': {
    en: 'seconds',
    ur: 'سیکنڈ',
    bal: 'سیکنڈ'
  },

  // General
  'language': {
    en: 'English',
    ur: 'اردو',
    bal: 'بلوچی'
  },
  'close': {
    en: 'Close',
    ur: 'بند کریں',
    bal: 'بند کن'
  },
  'view_details': {
    en: 'View Details',
    ur: 'تفصیلات دیکھیں',
    bal: 'تفصیل گند'
  },
  'learn_more': {
    en: 'Learn More',
    ur: 'مزید جانیں',
    bal: 'زیادہ بزان'
  },
  'call_now': {
    en: 'Call Now',
    ur: 'ابھی کال کریں',
    bal: 'کال کن'
  },
  'dos_donts': {
    en: "Do's & Don'ts",
    ur: 'کریں اور نہ کریں',
    bal: 'کن ءُ مہ کن'
  },
  'do': {
    en: 'Do',
    ur: 'کریں',
    bal: 'کن'
  },
  'dont': {
    en: 'Don\'t',
    ur: 'نہ کریں',
    bal: 'مہ کن'
  },
  // Settings
  'settings.title': {
    en: 'Settings',
    ur: 'ترتیبات',
    bal: 'سیٹنگز'
  },
  'settings.api_keys': {
    en: 'API Keys',
    ur: 'API کیز',
    bal: 'API کیز'
  },
  'settings.ais_key': {
    en: 'AIS Stream API Key',
    ur: 'AIS Stream کی',
    bal: 'AIS Stream Key'
  },
  'settings.weather_key': {
    en: 'OpenWeather API Key',
    ur: 'OpenWeather کی',
    bal: 'OpenWeather Key'
  },
  'settings.save': {
    en: 'Save Settings',
    ur: 'محفوظ کریں',
    bal: 'محفوظ کن'
  },
  'settings.saved': {
    en: 'Settings Saved',
    ur: 'ترتیبات محفوظ ہوگئیں',
    bal: 'سیٹنگز محفوظ بوت'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      if (prev === 'en') return 'ur'
      if (prev === 'ur') return 'bal'
      return 'en'
    })
  }, [])

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key
  }, [language])

  const isUrdu = language === 'ur'
  const isBalochi = language === 'bal'

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isUrdu, isBalochi }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

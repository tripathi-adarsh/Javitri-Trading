import { createContext, useContext, useState, useEffect } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',   flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिंदी',      flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी',      flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી',    flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు',     flag: '🇮🇳' },
]

export const TRANSLATIONS = {
  en: {
    // Nav
    nav_home:         'Home',
    nav_about:        'About Us',
    nav_plans:        'Investment Plans',
    nav_services:     'Services',
    nav_contact:      'Contact Us',
    nav_whatsapp:     'WhatsApp',
    nav_telegram:     'Telegram',
    nav_admin:        'Admin',

    // Top Bar
    govt_recognized:  'Startup India: DIPP291171',

    // Hero
    hero_headline:    'Investment, Financial Guidance & Insurance Solutions.',
    hero_sub:         'Javitri Trading Service Pvt. Ltd. delivers disciplined investment plans, comprehensive vehicle insurance, family health coverage, and daughter\'s future wealth security across India.',
    hero_cta_calc:    'Explore Plans',
    hero_cta_services:'Our Services',
    hero_cta_contact: 'Contact Us',
    hero_badge_plans: 'Investment Plans',
    hero_badge_auto:  'Vehicle Insurance (2 & 4 Wheeler)',
    hero_badge_health:'Family Health Insurance',
    hero_badge_vivah: 'Daughter\'s Future & Marriage Fund',

    // Services Intro & Cards
    services_heading: 'Our Comprehensive Financial & Protection Offerings',
    services_subheading: 'Tailored solutions for wealth generation, asset protection, and guaranteed family security.',
    service_equity_title: 'Structured Investment Plans',
    service_equity_desc: 'Disciplined capital growth based strictly on active Monday to Friday stock market sessions (22 trading days/month) with transparent daily payout benchmarks.',
    service_auto_title: 'Vehicle Insurance (Bike & Car)',
    service_auto_desc: 'Instant two-wheeler and four-wheeler comprehensive vehicle coverage with zero-depreciation riders, 24x7 roadside assistance, and paperless policy issuance.',
    service_health_title: 'Family Health Insurance',
    service_health_desc: 'Complete medical protection for your family with cashless hospital network across India, critical illness riders, and zero room-rent capping options.',
    service_vivah_title: 'Daughter\'s Future & Marriage Fund',
    service_vivah_desc: 'Dedicated goal-based long-term wealth compounding designed to secure your daughter’s marriage and higher education with financial peace of mind.',
    service_demat_title: 'Demat & Account Onboarding Support',
    service_demat_desc: 'Personalized assistance for opening and verifying SEBI-registered Demat accounts, fee optimization, and smooth depository linkages.',
    service_mentorship_title: 'Technical Market Analysis & Education',
    service_mentorship_desc: 'Master candlestick price action, order book depth, hedging strategies, and macroeconomic indicators with experienced mentors.',

    // Simulator
    sim_title:        'Monday to Friday Return Simulator',
    sim_subtitle:     'Real-time return projections calculated strictly across 5 active trading sessions per week (Monday to Friday, ~22 days/month).',
    sim_step1:        '1. Select Investment Plan',
    sim_step2:        '2. Select Trading Tenure',
    sim_trading_days: 'Trading Days',
    sim_daily:        'Mon–Fri Daily Payout',
    sim_weekly:       'Weekly Total (5 Sessions)',
    sim_monthly:      'Monthly Return (22 Sessions)',
    sim_total:        'Total Projected Payout',
    sim_selected_portfolio: 'Selected Investment Plan',
    sim_principal_deal: 'Principal Investment',
    sim_disclaimer:   '* Illustrative figures based on standard Monday to Friday market sessions. Sat & Sun are market holidays.',
    sim_cta:          'Register for this Plan',

    // Plans Section
    plans_heading:    'Transparent Corporate Investment Plans',
    plans_subheading: 'Every plan operates with clearly documented terms, Monday to Friday schedules, and strict regulatory adherence. Click any plan to register.',
    plans_tier:       'Plan',
    plans_standard:   'Standard',
    plans_daily_label:'Daily:',
    plans_weekly_label:'Weekly:',
    plans_monthly_label:'Monthly:',
    plans_explore_all:'Explore All Investment Plans',
    plans_loading:    'Loading plans from database…',

    // Facilities Gallery
    gallery_heading:  'Corporate Headquarters & Infrastructure',
    gallery_subheading:'Explore the registered facilities of Javitri Trading Service Pvt. Ltd. Click any photograph to view high-resolution facility details.',
    gallery_zoom:     'Click to Zoom',

    // Ethos
    ethos_heading:    'Institutional Framework & Integrity',
    pillar1_title:    'Absolute Statutory Transparency',
    pillar1_desc:     'All plan terms, insurance policies, and agreements are formally documented with zero hidden conditions.',
    pillar2_title:    'Comprehensive Protection & Insurance',
    pillar2_desc:     'Protecting your vehicles, health, and family milestones with verified underwriting and claim assistance.',
    pillar3_title:    'Monday to Friday Discipline',
    pillar3_desc:     'Our trading operations strictly align with standard Indian exchange schedules (NSE/BSE), eliminating weekend volatility risk.',

    // CTA Banner
    cta_title:        'Ready to Secure Your Financial Future with Javitri Trading Service Pvt. Ltd.?',
    cta_desc:         'Register for an investment plan, request bike/car/health insurance quotes, or start planning for your daughter’s marriage today.',
    cta_register:     'Register for a Plan',
    cta_whatsapp:     'Chat on WhatsApp',
    cta_telegram:     'Join Telegram Channel',
    cta_contact:      'Contact Corporate Office',

    // Contact Page
    contact_heading:  'Contact Javitri Trading Service Pvt. Ltd.',
    contact_subheading:'Have questions regarding our investment plans, Bike/Car insurance, Health policies, or Beti Vivah plans? Our advisory team is available Monday to Friday.',
    contact_registry_card: 'Corporate Registry Details',
    contact_registered_office: 'Registered Corporate Office',
    contact_get_directions: 'Get Google Maps Directions',
    contact_form_title: 'Send an Official Inquiry',
    contact_form_sub: 'Fill out the details below and a dedicated advisory manager will contact you within 24 business hours.',
    contact_name_label:'Full Name',
    contact_name_ph:  'Rahul Sharma',
    contact_phone_label:'Mobile Number',
    contact_phone_ph: '9876543210',
    contact_email_label:'Email Address',
    contact_email_ph: 'rahul@example.com',
    contact_service_label: 'Select Service / Inquiry Type',
    contact_service_default: 'Choose a service...',
    contact_opt_plan: 'Corporate Investment Plan',
    contact_opt_auto: 'Bike / Car Insurance (Vehicle)',
    contact_opt_health: 'Health Insurance (Parivar Suraksha)',
    contact_opt_vivah: 'Beti Ke Vivah & Kanya Suraksha Plan',
    contact_opt_demat: 'Demat & Account Onboarding',
    contact_opt_general: 'General Corporate Inquiry',
    contact_msg_label:'Your Message / Requirements',
    contact_msg_ph:   'Please provide details of your enquiry or coverage requirements...',
    contact_submit:   'Submit Official Inquiry',
    contact_anti_fraud:'Anti-Fraud Advisory: Javitri Trading Service Pvt. Ltd. will never ask for your net banking passwords, UPI PINs, OTPs, or confidential credentials.',

    // Footer
    footer_tagline:   'Premier corporate platform for structured stock market investment plans, vehicle & health insurance, and daughter marriage wealth planning across India.',
    footer_quick_nav: 'Quick Navigation',
    footer_services:  'Our Core Services',
    footer_address_title: 'Registered Office',
    footer_operating_hours: 'Operating Hours: Monday to Friday (09:00 - 18:00 IST)',
    footer_weekend_closed: 'Saturday & Sunday Closed',
    footer_rights:    'All rights reserved.',
  },

  hi: {
    // Nav
    nav_home:         'होम',
    nav_about:        'हमारे बारे में',
    nav_plans:        'निवेश प्लान्स',
    nav_services:     'सेवाएं',
    nav_contact:      'संपर्क',
    nav_whatsapp:     'WhatsApp',
    nav_telegram:     'Telegram',
    nav_admin:        'Admin',

    // Top Bar
    govt_recognized:  'सरकारी मान्यता: स्टार्टअप इंडिया (DIPP291171)',

    // Hero
    hero_headline:    'निवेश, वित्तीय मार्गदर्शन एवं बीमा समाधान',
    hero_sub:         'जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड आपके लिए लाई है अनुशासित निवेश योजनाएं, संपूर्ण वाहन बीमा, पारिवारिक स्वास्थ्य सुरक्षा एवं बेटी के सुरक्षित भविष्य की योजनाएं।',
    hero_cta_calc:    'प्लान्स देखें',
    hero_cta_services:'हमारी सेवाएं',
    hero_cta_contact: 'संपर्क करें',
    hero_badge_plans: 'निवेश योजनाएं',
    hero_badge_auto:  'वाहन सुरक्षा (बाइक व कार)',
    hero_badge_health:'पारिवारिक स्वास्थ्य सुरक्षा',
    hero_badge_vivah: 'कन्या भविष्य एवं विवाह कोष',

    // Services Intro & Cards
    services_heading: 'हमारी प्रमुख वित्तीय एवं सुरक्षा सेवाएं',
    services_subheading: 'धन सृजन, वाहन व स्वास्थ्य सुरक्षा और परिवार के भविष्य हेतु पूर्णतः पारदर्शी समाधान।',
    service_equity_title: 'संरचित कॉर्पोरेट निवेश योजनाएं',
    service_equity_desc: 'सोमवार से शुक्रवार (महीने के 22 ट्रेडिंग दिवस) सक्रिय शेयर बाजार पर आधारित अनुशासित पूंजी वृद्धि और पारदर्शी दैनिक पेआउट।',
    service_auto_title: 'वाहन बीमा (बाइक एवं कार सुरक्षा)',
    service_auto_desc: 'दोपहिया एवं चारपहिया वाहनों के लिए कैशलेस गैरेज नेटवर्क, जीरो-डेप्रिसिएशन कवर और तत्काल डिजिटल पॉलिसी जारी करने की सुविधा।',
    service_health_title: 'संपूर्ण पारिवारिक स्वास्थ्य बीमा',
    service_health_desc: 'पूरे भारत के शीर्ष अस्पतालों में कैशलेस इलाज, गंभीर बीमारियों का कवर एवं बिना किसी रूम-रेंट कैपिंग के संपूर्ण मेडिकल सुरक्षा।',
    service_vivah_title: 'कन्या भविष्य एवं विवाह बचत योजना',
    service_vivah_desc: 'आपकी लाडली बेटी के सुखद विवाह एवं उच्च शिक्षा के लिए समर्पित दीर्घकालिक सुरक्षित बचत एवं गारंटीड वेल्थ निर्माण योजना।',
    service_demat_title: 'डीमैट एवं खाता ऑनबोर्डिंग सहायता',
    service_demat_desc: 'SEBI-पंजीकृत प्रमुख डिपॉजिटरी पार्टिसिपेंट्स के साथ सुरक्षित डीमैट खाता खोलने, सत्यापन एवं ब्रोकरेज बचत में सीधी सहायता।',
    service_mentorship_title: 'तकनीकी विश्लेषण एवं बाजार प्रशिक्षण',
    service_mentorship_desc: 'कैंडलस्टिक चार्ट पैटर्न, ऑर्डर बुक डेप्थ, हेजिंग रणनीतियों और जोखिम प्रबंधन का अनुभवी मेंटर्स द्वारा व्यावहारिक प्रशिक्षण।',

    // Simulator
    sim_title:        'सोमवार से शुक्रवार रिटर्न सिम्युलेटर',
    sim_subtitle:     'सप्ताह के 5 सक्रिय मार्केट ट्रेडिंग सत्रों (सोमवार से शुक्रवार, ~22 दिन प्रति माह) के आधार पर रीयल-टाइम रिटर्न कैलकुलेशन।',
    sim_step1:        '1. निवेश प्लान चुनें',
    sim_step2:        '2. ट्रेडिंग अवधि चुनें',
    sim_trading_days: 'ट्रेडिंग दिन',
    sim_daily:        'सोम–शुक्र दैनिक पेआउट',
    sim_weekly:       'साप्ताहिक कुल (5 सत्र)',
    sim_monthly:      'मासिक रिटर्न (22 सत्र)',
    sim_total:        'कुल अनुमानित पेआउट',
    sim_selected_portfolio: 'चयनित निवेश प्लान',
    sim_principal_deal: 'मूल निवेश पूंजी',
    sim_disclaimer:   '* मानक सोमवार से शुक्रवार मार्केट सत्रों पर आधारित सांकेतिक आंकड़े। शनिवार एवं रविवार बाजार अवकाश रहते हैं।',
    sim_cta:          'इस प्लान के लिए पंजीकरण करें',

    // Plans Section
    plans_heading:    'पारदर्शी कॉर्पोरेट निवेश योजनाएं',
    plans_subheading: 'प्रत्येक प्लान स्पष्ट नियमों, सोमवार से शुक्रवार के पेआउट और कड़े वैधानिक अनुपालन के साथ आता है। रजिस्टर करने के लिए क्लिक करें।',
    plans_tier:       'प्लान',
    plans_standard:   'स्टैंडर्ड',
    plans_daily_label:'दैनिक पेआउट:',
    plans_weekly_label:'साप्ताहिक:',
    plans_monthly_label:'मासिक:',
    plans_explore_all:'सभी निवेश प्लान्स देखें',
    plans_loading:    'डेटाबेस से प्लान्स लोड हो रहे हैं…',

    // Facilities Gallery
    gallery_heading:  'कॉर्पोरेट मुख्यालय एवं भौतिक इंफ्रास्ट्रक्चर',
    gallery_subheading:'जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड के पंजीकृत परिसर एवं सुविधाओं का विवरण। उच्च रिज़ॉल्यूशन के लिए फोटो पर क्लिक करें।',
    gallery_zoom:     'बड़ा करके देखें',

    // Ethos
    ethos_heading:    'संस्थागत विश्वसनीयता एवं मूल्य',
    pillar1_title:    '100% वैधानिक एवं कानूनी पारदर्शिता',
    pillar1_desc:     'सभी निवेश नियम, बीमा पॉलिसियां और एग्रीमेंट्स औपचारिक रूप से प्रमाणित हैं। कोई छुपा हुआ शुल्क नहीं।',
    pillar2_title:    'संपूर्ण सुरक्षा एवं बीमा संरक्षण',
    pillar2_desc:     'आपके वाहन, स्वास्थ्य एवं पारिवारिक जीवन के हर अहम पड़ाव की पूर्ण सुरक्षा और क्लेम सहायता।',
    pillar3_title:    'सोमवार से शुक्रवार का कड़ा अनुशासन',
    pillar3_desc:     'हमारी ट्रेडिंग प्रणाली भारतीय स्टॉक एक्सचेंज (NSE/BSE) के 5-दिवसीय चक्र पर काम करती है, जिससे सप्ताहांत का जोखिम शून्य रहता है।',

    // CTA Banner
    cta_title:        'क्या आप जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड के साथ अपना भविष्य सुरक्षित करने के लिए तैयार हैं?',
    cta_desc:         'आज ही निवेश प्लान चुनें, बाइक/कार/हेल्थ इंश्योरेंस कोटेशन प्राप्त करें, या बेटी के विवाह की वित्तीय सुरक्षा आरंभ करें।',
    cta_register:     'प्लान के लिए रजिस्टर करें',
    cta_whatsapp:     'व्हाट्सएप पर चैट करें',
    cta_telegram:     'टेलीग्राम चैनल से जुड़ें',
    cta_contact:      'कॉर्पोरेट ऑफिस से संपर्क करें',

    // Contact Page
    contact_heading:  'जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड से संपर्क करें',
    contact_subheading:'हमारे निवेश प्लान्स, बाइक/कार इंश्योरेंस, हेल्थ इंश्योरेंस या बेटी विवाह योजना से संबंधित किसी भी प्रश्न के लिए हम सोमवार से शुक्रवार उपलब्ध हैं।',
    contact_registry_card: 'कॉर्पोरेट पंजीकरण विवरण',
    contact_registered_office: 'पंजीकृत कॉर्पोरेट कार्यालय',
    contact_get_directions: 'गूगल मैप्स पर रास्ता देखें',
    contact_form_title: 'आधिकारिक पूछताछ फॉर्म भेजें',
    contact_form_sub: 'कृपया नीचे विवरण भरें, हमारे वरिष्ठ सलाहकार 24 कार्य घंटों के भीतर आपसे संपर्क करेंगे।',
    contact_name_label:'पूरा नाम',
    contact_name_ph:  'राहुल शर्मा',
    contact_phone_label:'मोबाइल नंबर',
    contact_phone_ph: '9876543210',
    contact_email_label:'ईमेल पता',
    contact_email_ph: 'rahul@example.com',
    contact_service_label: 'सेवा / पूछताछ का प्रकार चुनें',
    contact_service_default: 'सेवा का चयन करें...',
    contact_opt_plan: 'कॉर्पोरेट निवेश योजना',
    contact_opt_auto: 'बाइक / कार बीमा (वाहन सुरक्षा)',
    contact_opt_health: 'हेल्थ इंश्योरेंस (परिवार सुरक्षा)',
    contact_opt_vivah: 'बेटी के विवाह एवं कन्या सुरक्षा योजना',
    contact_opt_demat: 'डीमैट एवं खाता सहायता',
    contact_opt_general: 'सामान्य कॉर्पोरेट पूछताछ',
    contact_msg_label:'आपका संदेश / विवरण',
    contact_msg_ph:   'कृपया अपनी आवश्यकता या पूछताछ का विवरण लिखें...',
    contact_submit:   'पूछताछ सबमिट करें',
    contact_anti_fraud:'धोखाधड़ी चेतावनी: जावित्री ट्रेडिंग सर्विस प्राइवेट लिमिटेड कभी भी आपके नेट बैंकिंग पासवर्ड, यूपीआई पिन, ओटीपी या गोपनीय जानकारी नहीं मांगती।',

    // Footer
    footer_tagline:   'संरचित शेयर बाजार निवेश योजनाओं, वाहन व स्वास्थ्य बीमा और बेटी विवाह बचत के लिए भारत का विश्वसनीय कॉर्पोरेट प्लेटफॉर्म।',
    footer_quick_nav: 'त्वरित नेविगेशन',
    footer_services:  'हमारी प्रमुख सेवाएं',
    footer_address_title: 'कॉर्पोरेट मुख्यालय एवं पंजीकृत कार्यालय',
    footer_operating_hours: 'कार्य दिवस: सोमवार से शुक्रवार (09:00 - 18:00 IST)',
    footer_weekend_closed: 'शनिवार एवं रविवार अवकाश',
    footer_rights:    'सर्वाधिकार सुरक्षित।',
  },
}

// Fallback helper for mr, gu, ta, te to inherit hindi/english seamlessly
const SUPPORTED_LANGS = ['mr', 'gu', 'ta', 'te']
SUPPORTED_LANGS.forEach(code => {
  TRANSLATIONS[code] = {
    ...TRANSLATIONS.hi,
    nav_home: code === 'mr' ? 'होम' : code === 'gu' ? 'હોમ' : code === 'ta' ? 'முகப்பு' : 'హోమ్',
    nav_about: code === 'mr' ? 'आमच्याबद्दल' : code === 'gu' ? 'અમારા વિશે' : code === 'ta' ? 'அறிமுகம்' : 'గురించి',
    nav_plans: code === 'mr' ? 'योजना' : code === 'gu' ? 'પ્લાન્સ' : code === 'ta' ? 'திட்டங்கள்' : 'ప్లాన్లు',
    nav_services: code === 'mr' ? 'सेवा' : code === 'gu' ? 'સેવાઓ' : code === 'ta' ? 'சேவைகள்' : 'సేవలు',
    nav_contact: code === 'mr' ? 'संपर्क' : code === 'gu' ? 'સંપર્ક' : code === 'ta' ? 'தொடர்பு' : 'సంప్రదింపు',
    nav_whatsapp: 'WhatsApp',
    nav_telegram: 'Telegram',
    nav_admin: 'Admin',
  }
})

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('javitri_lang') || 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = (newLang) => {
    setLangState(newLang)
    try {
      localStorage.setItem('javitri_lang', newLang)
    } catch {}
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['hi']?.[key] ?? TRANSLATIONS['en']?.[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}

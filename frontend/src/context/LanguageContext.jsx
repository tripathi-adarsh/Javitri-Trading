import { createContext, useContext, useState } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',   flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिंदी',      flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी',      flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી',    flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు',     flag: '🇮🇳' },
]

// ── All UI string translations ────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // Nav
    nav_home:         'Home',
    nav_about:        'About Us',
    nav_plans:        'Investment Plans',
    nav_services:     'Our Services',
    // nav_learning:     'Learning Support',
    // nav_risk:         'Risk Disclosure',
    nav_contact:      'Contact Us',
    nav_whatsapp:     'WhatsApp',
    nav_admin:        'Admin',

    // Hero
    hero_headline:    'Learn the Stock Market with Confidence',
    hero_sub:         'Explore stock market education, trading guidance, market analysis, and beginner learning support.',
    hero_cta1:        'Explore Our Services',
    hero_cta2:        'Contact Us on WhatsApp',
    hero_badge1:      'Stock Market Education',
    hero_badge2:      'Trading Guidance',
    hero_badge3:      'Market Analysis',
    hero_badge4:      'Beginner Support',

    // Plans
    plans_title:      'Investment Plans',
    plans_sub:        'Ten investment plans with proposed daily figures. Monday–Friday schedule.',
    plans_illustrative: 'Illustrative only.',
    plans_contact:    'Contact Us',
    plans_whatsapp:   'Enquire on WhatsApp',
    plans_proposed:   'Proposed Daily *',
    plans_investment: 'Investment Amount',

    // Services
    services_title:   'Our Services',
    services_sub:     'Educational and guidance services to navigate the stock market.',

    // Learning
    learning_title:   'Start Your Learning Journey',
    learning_sub:     'Structured educational support for beginners and learners.',
    learning_cta:     'Start Learning Today',

    // Contact
    contact_title:    'Get in Touch',
    contact_sub:      'Have a question? Reach out to us.',
    contact_name:     'Full Name',
    contact_phone:    'Mobile Number',
    contact_email:    'Email Address',
    contact_message:  'Message',
    contact_send:     'Send Message',
    contact_success:  'Message Sent',
    contact_success_sub: 'Our team will respond within 1–2 business days (Monday to Friday).',
    contact_privacy:  'By submitting this form, you consent to Javitri Trading Service Pvt. Ltd. storing your contact information to respond to your enquiry.',
    contact_whatsapp: 'Chat on WhatsApp',
    contact_directions: 'Get Google Maps Directions',
    contact_office1:  'Our Office',
    contact_office2:  'Our Office',
    contact_schedule: 'Monday to Friday',
    contact_click_call: 'Click to call',

    // About
    about_title:      'About Javitri Trading Service',
    about_sub:        'Stock market education and trading guidance based in Uttar Pradesh.',

    // Risk
    risk_title:       'Risk Disclosure Statement',
    risk_notice:      'Important — Please Read Before Proceeding',

    // Footer
    footer_tagline:   'Stock market education, trading guidance, and beginner learning support.',
    footer_nav:       'Navigation',
    footer_legal:     'Legal',
    footer_contact:   'Contact',
    footer_copyright: 'All rights reserved.',

    // Common
    read_more:        'Read More',
    contact_us:       'Contact Us',
    view_plans:       'View Plans',
    whatsapp_us:      'WhatsApp Us',
    get_directions:   'Get Directions',
    risk_disclosure:  'Risk Disclosure',
    terms:            'Terms & Conditions',
    privacy:          'Privacy Policy',
  },

  hi: {
    nav_home:         'होम',
    nav_about:        'हमारे बारे में',
    nav_plans:        'निवेश योजनाएं',
    nav_services:     'हमारी सेवाएं',
    // nav_learning:     'सीखने का समर्थन',
    // nav_risk:         'जोखिम प्रकटीकरण',
    nav_contact:      'संपर्क करें',
    nav_whatsapp:     'व्हाट्सएप',
    nav_admin:        'एडमिन',

    hero_headline:    'आत्मविश्वास के साथ शेयर बाज़ार सीखें',
    hero_sub:         'शेयर बाज़ार शिक्षा, ट्रेडिंग मार्गदर्शन, बाज़ार विश्लेषण और शुरुआती शिक्षण समर्थन।',
    hero_cta1:        'हमारी सेवाएं देखें',
    hero_cta2:        'व्हाट्सएप पर संपर्क करें',
    hero_badge1:      'शेयर बाज़ार शिक्षा',
    hero_badge2:      'ट्रेडिंग मार्गदर्शन',
    hero_badge3:      'बाज़ार विश्लेषण',
    hero_badge4:      'शुरुआती सहायता',

    plans_title:      'निवेश योजनाएं',
    plans_sub:        'प्रस्तावित दैनिक आंकड़ों के साथ दस निवेश योजनाएं। सोमवार–शुक्रवार कार्यक्रम।',
    plans_illustrative: 'केवल उदाहरण।',
    plans_contact:    'संपर्क करें',
    plans_whatsapp:   'व्हाट्सएप पर पूछें',
    plans_proposed:   'प्रस्तावित दैनिक *',
    plans_investment: 'निवेश राशि',

    services_title:   'हमारी सेवाएं',
    services_sub:     'शेयर बाज़ार को समझने के लिए शैक्षिक और मार्गदर्शन सेवाएं।',

    learning_title:   'अपनी सीखने की यात्रा शुरू करें',
    learning_sub:     'शुरुआती और शिक्षार्थियों के लिए संरचित शैक्षिक समर्थन।',
    learning_cta:     'आज सीखना शुरू करें',

    contact_title:    'संपर्क करें',
    contact_sub:      'कोई प्रश्न है? हमसे संपर्क करें।',
    contact_name:     'पूरा नाम',
    contact_phone:    'मोबाइल नंबर',
    contact_email:    'ईमेल पता',
    contact_message:  'संदेश',
    contact_send:     'संदेश भेजें',
    contact_success:  'संदेश भेजा गया',
    contact_success_sub: 'हमारी टीम 1–2 कार्य दिवसों में जवाब देगी।',
    contact_privacy:  'फॉर्म जमा करके आप हमारी गोपनीयता नीति के अनुसार संपर्क जानकारी संग्रहीत करने की सहमति देते हैं।',
    contact_whatsapp: 'व्हाट्सएप पर चैट करें',
    contact_directions: 'गूगल मैप्स पर दिशा-निर्देश',
    contact_office1:  'सूरत कार्यालय',
    contact_office2:  'हमारा कार्यालय',
    contact_schedule: 'सोमवार से शुक्रवार',
    contact_click_call: 'कॉल करने के लिए क्लिक करें',

    about_title:      'जावित्री ट्रेडिंग सर्विस के बारे में',
    about_sub:        'उत्तर प्रदेश में स्थित शेयर बाज़ार शिक्षा और ट्रेडिंग मार्गदर्शन।',

    risk_title:       'जोखिम प्रकटीकरण विवरण',
    risk_notice:      'महत्वपूर्ण — आगे बढ़ने से पहले पढ़ें',

    footer_tagline:   'शेयर बाज़ार शिक्षा, ट्रेडिंग मार्गदर्शन और शुरुआती शिक्षण समर्थन।',
    footer_nav:       'नेविगेशन',
    footer_legal:     'कानूनी',
    footer_contact:   'संपर्क',
    footer_copyright: 'सर्वाधिकार सुरक्षित।',
    footer_risk:      'जोखिम: शेयर बाज़ार निवेश में वित्तीय जोखिम शामिल है।',

    read_more:        'अधिक पढ़ें',
    contact_us:       'संपर्क करें',
    view_plans:       'योजनाएं देखें',
    whatsapp_us:      'व्हाट्सएप करें',
    get_directions:   'दिशा-निर्देश प्राप्त करें',
    risk_disclosure:  'जोखिम प्रकटीकरण',
    terms:            'नियम और शर्तें',
    privacy:          'गोपनीयता नीति',
  },

  mr: {
    nav_home:         'मुख्यपृष्ठ',
    nav_about:        'आमच्याबद्दल',
    nav_plans:        'गुंतवणूक योजना',
    nav_services:     'आमच्या सेवा',
    // nav_learning:     'शिक्षण समर्थन',
    // nav_risk:         'जोखीम प्रकटीकरण',
    nav_contact:      'संपर्क करा',
    nav_whatsapp:     'व्हाट्सअ‍ॅप',
    nav_admin:        'अ‍ॅडमिन',

    hero_headline:    'आत्मविश्वासाने शेअर बाजार शिका',
    hero_sub:         'शेअर बाजार शिक्षण, ट्रेडिंग मार्गदर्शन, बाजार विश्लेषण आणि नवशिक्यांसाठी शिक्षण समर्थन।',
    hero_cta1:        'आमच्या सेवा पाहा',
    hero_cta2:        'व्हाट्सअ‍ॅपवर संपर्क करा',
    hero_badge1:      'शेअर बाजार शिक्षण',
    hero_badge2:      'ट्रेडिंग मार्गदर्शन',
    hero_badge3:      'बाजार विश्लेषण',
    hero_badge4:      'नवशिक्यांसाठी मदत',

    plans_title:      'गुंतवणूक योजना',
    plans_sub:        'प्रस्तावित दैनंदिन आकड्यांसह दहा गुंतवणूक योजना। सोमवार–शुक्रवार वेळापत्रक।',
    plans_illustrative: 'केवळ उदाहरणात्मक. हमी परतावा नाही.',
    plans_contact:    'संपर्क करा',
    plans_whatsapp:   'व्हाट्सअ‍ॅपवर चौकशी करा',
    plans_proposed:   'प्रस्तावित दैनंदिन *',
    plans_investment: 'गुंतवणूक रक्कम',

    services_title:   'आमच्या सेवा',
    services_sub:     'शेअर बाजार समजण्यासाठी शैक्षणिक आणि मार्गदर्शन सेवा।',

    learning_title:   'तुमचा शिक्षण प्रवास सुरू करा',
    learning_sub:     'नवशिक्यांसाठी संरचित शैक्षणिक समर्थन।',
    learning_cta:     'आज शिकणे सुरू करा',

    contact_title:    'संपर्क साधा',
    contact_sub:      'काही प्रश्न आहे का? आमच्याशी संपर्क करा।',
    contact_name:     'पूर्ण नाव',
    contact_phone:    'मोबाईल क्रमांक',
    contact_email:    'ईमेल पत्ता',
    contact_message:  'संदेश',
    contact_send:     'संदेश पाठवा',
    contact_success:  'संदेश पाठवला',
    contact_success_sub: 'आमची टीम 1–2 कामकाजाच्या दिवसांत उत्तर देईल.',
    contact_privacy:  'फॉर्म सबमिट करून आपण आमच्या गोपनीयता धोरणानुसार संपर्क माहिती संग्रहित करण्यास संमती देता।',
    contact_whatsapp: 'व्हाट्सअ‍ॅपवर चॅट करा',
    contact_directions: 'गूगल मॅप्सवर दिशा',
    contact_office1:  'सुरत कार्यालय',
    contact_office2:  'फतेहपूर कार्यालय',
    contact_schedule: 'सोमवार ते शुक्रवार',
    contact_click_call: 'कॉल करण्यासाठी क्लिक करा',

    about_title:      'जावित्री ट्रेडिंग सर्विसबद्दल',
    about_sub:        'उत्तर प्रदेशातून शेअर बाजार शिक्षण आणि ट्रेडिंग मार्गदर्शन।',

    risk_title:       'जोखीम प्रकटीकरण विधान',
    risk_notice:      'महत्त्वाचे — पुढे जाण्यापूर्वी वाचा',

    footer_tagline:   'शेअर बाजार शिक्षण, ट्रेडिंग मार्गदर्शन आणि नवशिक्यांसाठी शिक्षण समर्थन।',
    footer_nav:       'नेव्हिगेशन',
    footer_legal:     'कायदेशीर',
    footer_contact:   'संपर्क',
    footer_copyright: 'सर्व हक्क राखीव।',
    footer_risk:      'जोखीम: शेअर बाजार गुंतवणुकीत आर्थिक जोखीम असते.',

    read_more:        'अधिक वाचा',
    contact_us:       'संपर्क करा',
    view_plans:       'योजना पाहा',
    whatsapp_us:      'व्हाट्सअ‍ॅप करा',
    get_directions:   'दिशा मिळवा',
    risk_disclosure:  'जोखीम प्रकटीकरण',
    terms:            'अटी आणि शर्ती',
    privacy:          'गोपनीयता धोरण',
  },

  gu: {
    nav_home:         'હોમ',
    nav_about:        'અમારા વિશે',
    nav_plans:        'રોકાણ યોજનાઓ',
    nav_services:     'અમારી સેવાઓ',
    // nav_learning:     'શીખવાની સહાય',
    // nav_risk:         'જોખમ જાહેરાત',
    nav_contact:      'સંપર્ક કરો',
    nav_whatsapp:     'વૉટ્સઍપ',
    nav_admin:        'એડમિન',

    hero_headline:    'આત્મવિશ્વાસ સાથે શેર બજાર શીખો',
    hero_sub:         'શેર બજાર શિક્ષણ, ટ્રેડિંગ માર્ગદર્શન, બજાર વિશ્લેષણ અને નવા શીખનારા માટે સહાય।',
    hero_cta1:        'અમારી સેવાઓ જુઓ',
    hero_cta2:        'વૉટ્સઍપ પર સંપર્ક કરો',
    hero_badge1:      'શેર બજાર શિક્ષણ',
    hero_badge2:      'ટ્રેડિંગ માર્ગદર્શન',
    hero_badge3:      'બજાર વિશ્લેષણ',
    hero_badge4:      'નવા શીખનારા માટે સહાય',

    plans_title:      'રોકાણ યોજનાઓ',
    plans_sub:        'દૈનિક આંકડાઓ સાથે દસ રોકાણ યોજનાઓ। સોમ–શુક્ર સમયપત્રક।',
    plans_illustrative: 'માત્ર ઉદાહરણ. ગેરેન્ટેડ વળતર નથી.',
    plans_contact:    'સંપર્ક કરો',
    plans_whatsapp:   'વૉટ્સઍપ પર પૂછો',
    plans_proposed:   'પ્રસ્તાવિત દૈનિક *',
    plans_investment: 'રોકાણ રકમ',

    services_title:   'અમારી સેવાઓ',
    services_sub:     'શેર બજાર સમજવા માટે શૈક્ષણિક અને માર્ગદર્શન સેવાઓ।',

    learning_title:   'તમારી શીખવાની સફર શરૂ કરો',
    learning_sub:     'નવા શીખનારા માટે સંરચિત શૈક્ષણિક સહાય।',
    learning_cta:     'આજે શીખવાનું શરૂ કરો',

    contact_title:    'સંપર્ક કરો',
    contact_sub:      'કોઈ પ્રશ્ન છે? અમારો સંપર્ક કરો.',
    contact_name:     'પૂરું નામ',
    contact_phone:    'મોબાઈલ નંબર',
    contact_email:    'ઈમેઈલ સરનામું',
    contact_message:  'સંદેશ',
    contact_send:     'સંદેશ મોકલો',
    contact_success:  'સંદેશ મોકલ્યો',
    contact_success_sub: 'અમારી ટીમ 1–2 કામકાજના દિવસોમાં જવાબ આપશે.',
    contact_privacy:  'ફોર્મ સબમિટ કરીને તમે અમારી ગોપનીયતા નીતિ અનુસાર સંપર્ક માહિતી સ્ટોર કરવાની સંમતિ આપો છો.',
    contact_whatsapp: 'વૉટ્સઍપ પર ચેટ કરો',
    contact_directions: 'ગૂગલ મૅપ્સ પર દિશા',
    contact_office1:  'સૂરત ઓફિસ',
    contact_office2:  'ફતેહપુર ઓફિસ',
    contact_schedule: 'સોમવાર થી શુક્રવાર',
    contact_click_call: 'કૉલ કરવા ક્લિક કરો',

    about_title:      'જાવિત્રી ટ્રેડિંગ સર્વિસ વિશે',
    about_sub:        'ગુજરાત અને ઉત્તર પ્રદેશ સ્થિત શેર બજાર શિક્ષણ અને ટ્રેડિંગ માર્ગદર્શન।',

    risk_title:       'જોખમ જાહેરાત નિવેદન',
    risk_notice:      'મહત્વપૂર્ણ — આગળ વધતા પહેલા વાંચો',

    footer_tagline:   'શેર બજાર શિક્ષણ, ટ્રેડિંગ માર્ગદર્શન અને નવા શીખનારા માટે સહાય।',
    footer_nav:       'નેવિગેશન',
    footer_legal:     'કાનૂની',
    footer_contact:   'સંપર્ક',
    footer_copyright: 'સર્વ હક્ક સુરક્ષિત.',
    footer_risk:      'જોખમ: શેર બજાર રોકાણમાં નાણાકીય જોખમ છે. વળતરની ગેરંટી નથી.',

    read_more:        'વધુ વાંચો',
    contact_us:       'સંપર્ક કરો',
    view_plans:       'યોજનાઓ જુઓ',
    whatsapp_us:      'વૉટ્સઍપ કરો',
    get_directions:   'દિશા મેળવો',
    risk_disclosure:  'જોખમ જાહેરાત',
    terms:            'નિયમો અને શરતો',
    privacy:          'ગોપનીયતા નીતિ',
  },

  ta: {
    nav_home:         'முகப்பு',
    nav_about:        'எங்களைப் பற்றி',
    nav_plans:        'முதலீட்டு திட்டங்கள்',
    nav_services:     'எங்கள் சேவைகள்',
    // nav_learning:     'கற்றல் ஆதரவு',
    // nav_risk:         'அபாய வெளிப்பாடு',
    nav_contact:      'தொடர்பு கொள்ளுங்கள்',
    nav_whatsapp:     'வாட்ஸ்அப்',
    nav_admin:        'நிர்வாகி',

    hero_headline:    'நம்பிக்கையுடன் பங்குச் சந்தை கற்றுக்கொள்ளுங்கள்',
    hero_sub:         'பங்குச் சந்தை கல்வி, வர்த்தக வழிகாட்டுதல், சந்தை பகுப்பாய்வு மற்றும் தொடக்கநிலை கற்றல் ஆதரவு.',
    hero_cta1:        'எங்கள் சேவைகளை ஆராயுங்கள்',
    hero_cta2:        'வாட்ஸ்அப்பில் தொடர்பு கொள்ளுங்கள்',
    hero_badge1:      'பங்குச் சந்தை கல்வி',
    hero_badge2:      'வர்த்தக வழிகாட்டுதல்',
    hero_badge3:      'சந்தை பகுப்பாய்வு',
    hero_badge4:      'தொடக்கநிலை ஆதரவு',

    plans_title:      'முதலீட்டு திட்டங்கள்',
    plans_sub:        'திங்கள்–வெள்ளி அட்டவணையில் பத்து முதலீட்டு திட்டங்கள்.',
    plans_illustrative: 'விளக்கமாக மட்டுமே. உத்தரவாத வருமானம் இல்லை.',
    plans_contact:    'தொடர்பு கொள்ளுங்கள்',
    plans_whatsapp:   'வாட்ஸ்அப்பில் விசாரிக்கவும்',
    plans_proposed:   'முன்மொழியப்பட்ட தினசரி *',
    plans_investment: 'முதலீட்டு தொகை',

    services_title:   'எங்கள் சேவைகள்',
    services_sub:     'பங்குச் சந்தையை புரிந்துகொள்ள கல்வி மற்றும் வழிகாட்டுதல் சேவைகள்.',

    learning_title:   'உங்கள் கற்றல் பயணத்தை தொடங்குங்கள்',
    learning_sub:     'தொடக்கநிலையினருக்கான கட்டமைக்கப்பட்ட கல்வி ஆதரவு.',
    learning_cta:     'இன்றே கற்றலை தொடங்குங்கள்',

    contact_title:    'தொடர்பு கொள்ளுங்கள்',
    contact_sub:      'கேள்வி இருக்கிறதா? எங்களை தொடர்பு கொள்ளுங்கள்.',
    contact_name:     'முழு பெயர்',
    contact_phone:    'மொபைல் எண்',
    contact_email:    'மின்னஞ்சல் முகவரி',
    contact_message:  'செய்தி',
    contact_send:     'செய்தி அனுப்பு',
    contact_success:  'செய்தி அனுப்பப்பட்டது',
    contact_success_sub: 'எங்கள் குழு 1–2 வணிக நாட்களில் பதிலளிப்பார்கள்.',
    contact_privacy:  'படிவத்தை சமர்ப்பிப்பதன் மூலம் தொடர்பு தகவலை சேமிக்க சம்மதிக்கிறீர்கள்.',
    contact_whatsapp: 'வாட்ஸ்அப்பில் அரட்டை அடிக்கவும்',
    contact_directions: 'கூகிள் மேப்ஸ் திசைகள்',
    contact_office1:  'சூரத் அலுவலகம்',
    contact_office2:  'ஃபதேபூர் அலுவலகம்',
    contact_schedule: 'திங்கள் முதல் வெள்ளி வரை',
    contact_click_call: 'அழைக்க கிளிக் செய்யவும்',

    about_title:      'ஜவித்ரி டிரேடிங் சர்வீஸ் பற்றி',
    about_sub:        'குஜராத் மற்றும் உத்தர பிரதேசத்தில் பங்குச் சந்தை கல்வி மற்றும் வர்த்தக வழிகாட்டுதல்.',

    risk_title:       'அபாய வெளிப்பாடு அறிக்கை',
    risk_notice:      'முக்கியம் — தொடர்வதற்கு முன் படிக்கவும்',

    footer_tagline:   'பங்குச் சந்தை கல்வி, வர்த்தக வழிகாட்டுதல் மற்றும் தொடக்கநிலை கற்றல் ஆதரவு.',
    footer_nav:       'வழிசெலுத்தல்',
    footer_legal:     'சட்டப்பூர்வ',
    footer_contact:   'தொடர்பு',
    footer_copyright: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    footer_risk:      'அபாயம்: பங்குச் சந்தை முதலீட்டில் நிதி ஆபத்து உள்ளது. வருமானம் உத்தரவாதமில்லை.',

    read_more:        'மேலும் படிக்க',
    contact_us:       'தொடர்பு கொள்ளுங்கள்',
    view_plans:       'திட்டங்களைப் பார்க்கவும்',
    whatsapp_us:      'வாட்ஸ்அப் செய்யுங்கள்',
    get_directions:   'திசைகள் பெறுக',
    risk_disclosure:  'அபாய வெளிப்பாடு',
    terms:            'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    privacy:          'தனியுரிமை கொள்கை',
  },

  te: {
    nav_home:         'హోమ్',
    nav_about:        'మా గురించి',
    nav_plans:        'పెట్టుబడి ప్రణాళికలు',
    nav_services:     'మా సేవలు',
    //:     'నేర్చుకునే మద్దతు',
    // nav_risk:         'రిస్క్ వెల్లడి',
    nav_contact:      'సంప్రదించండి',
    nav_whatsapp:     'వాట్సాప్',
    nav_admin:        'అడ్మిన్',

    hero_headline:    'నమ్మకంతో స్టాక్ మార్కెట్ నేర్చుకోండి',
    hero_sub:         'స్టాక్ మార్కెట్ విద్య, ట్రేడింగ్ మార్గదర్శకత్వం, మార్కెట్ విశ్లేషణ మరియు ప్రారంభకుల నేర్చుకునే మద్దతు.',
    hero_cta1:        'మా సేవలను అన్వేషించండి',
    hero_cta2:        'వాట్సాప్‌లో సంప్రదించండి',
    hero_badge1:      'స్టాక్ మార్కెట్ విద్య',
    hero_badge2:      'ట్రేడింగ్ మార్గదర్శకత్వం',
    hero_badge3:      'మార్కెట్ విశ్లేషణ',
    hero_badge4:      'ప్రారంభకుల మద్దతు',

    plans_title:      'పెట్టుబడి ప్రణాళికలు',
    plans_sub:        'సోమ–శుక్ర షెడ్యూల్‌తో పది పెట్టుబడి ప్రణాళికలు.',
    plans_illustrative: 'కేవలం ఉదాహరణాత్మకం. హామీ రాబడి కాదు.',
    plans_contact:    'సంప్రదించండి',
    plans_whatsapp:   'వాట్సాప్‌లో విచారించండి',
    plans_proposed:   'ప్రతిపాదిత రోజువారీ *',
    plans_investment: 'పెట్టుబడి మొత్తం',

    services_title:   'మా సేవలు',
    services_sub:     'స్టాక్ మార్కెట్‌ను అర్థం చేసుకోవడానికి విద్యా మరియు మార్గదర్శక సేవలు.',

    learning_title:   'మీ నేర్చుకునే ప్రయాణం ప్రారంభించండి',
    learning_sub:     'ప్రారంభకులకు నిర్మాణాత్మక విద్యా మద్దతు.',
    learning_cta:     'ఈరోజు నేర్చుకోవడం ప్రారంభించండి',

    contact_title:    'సంప్రదించండి',
    contact_sub:      'ఏదైనా ప్రశ్న ఉందా? మమ్మల్ని సంప్రదించండి.',
    contact_name:     'పూర్తి పేరు',
    contact_phone:    'మొబైల్ నంబర్',
    contact_email:    'ఇమెయిల్ చిరునామా',
    contact_message:  'సందేశం',
    contact_send:     'సందేశం పంపండి',
    contact_success:  'సందేశం పంపబడింది',
    contact_success_sub: 'మా బృందం 1–2 వ్యాపార రోజులలో స్పందిస్తుంది.',
    contact_privacy:  'ఫారమ్ సమర్పించడం ద్వారా మీరు మా గోప్యతా విధానం ప్రకారం సంప్రదింపు సమాచారాన్ని నిల్వ చేయడానికి అంగీకరిస్తున్నారు.',
    contact_whatsapp: 'వాట్సాప్‌లో చాట్ చేయండి',
    contact_directions: 'గూగుల్ మ్యాప్స్ దిశలు',
    contact_office1:  'సూరత్ కార్యాలయం',
    contact_office2:  'ఫతేపూర్ కార్యాలయం',
    contact_schedule: 'సోమవారం నుండి శుక్రవారం',
    contact_click_call: 'కాల్ చేయడానికి క్లిక్ చేయండి',

    about_title:      'జావిత్రి ట్రేడింగ్ సర్వీస్ గురించి',
    about_sub:        'గుజరాత్ మరియు ఉత్తరప్రదేశ్‌లో స్టాక్ మార్కెట్ విద్య మరియు ట్రేడింగ్ మార్గదర్శకత్వం.',

    risk_title:       'రిస్క్ వెల్లడి ప్రకటన',
    risk_notice:      'ముఖ్యమైనది — ముందుకు వెళ్ళే ముందు చదవండి',

    footer_tagline:   'స్టాక్ మార్కెట్ విద్య, ట్రేడింగ్ మార్గదర్శకత్వం మరియు ప్రారంభకుల నేర్చుకునే మద్దతు.',
    footer_nav:       'నావిగేషన్',
    footer_legal:     'చట్టపరమైన',
    footer_contact:   'సంప్రదింపు',
    footer_copyright: 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
    footer_risk:      'రిస్క్: స్టాక్ మార్కెట్ పెట్టుబడిలో ఆర్థిక ప్రమాదం ఉంది. రాబడికి హామీ లేదు.',

    read_more:        'మరింత చదవండి',
    contact_us:       'సంప్రదించండి',
    view_plans:       'ప్రణాళికలు చూడండి',
    whatsapp_us:      'వాట్సాప్ చేయండి',
    get_directions:   'దిశలు పొందండి',
    risk_disclosure:  'రిస్క్ వెల్లడి',
    terms:            'నిబంధనలు & షరతులు',
    privacy:          'గోప్యతా విధానం',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key
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

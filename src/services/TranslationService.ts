// Servicio de traducción usando Lingva Translate (proxy gratuito de Google Translate)
class LingvaTranslateService {
  private baseUrl = 'https://lingva.ml/api/v1';

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      // Lingva usa códigos de idioma estándar
      const sourceLang = sourceLanguage === 'auto' ? 'auto' : sourceLanguage;
      const targetLang = targetLanguage;
      
      const encodedText = encodeURIComponent(text);
      const url = `${this.baseUrl}/${sourceLang}/${targetLang}/${encodedText}`;
      
      console.log('Calling Lingva Translate:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.translation) {
        return data.translation;
      } else {
        throw new Error('No translation received from Lingva');
      }
    } catch (error) {
      console.error('Lingva translation error:', error);
      throw error;
    }
  }
}

// Servicio de traducción gratuito alternativo (MyMemory)
class MyMemoryTranslateService {
  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const langPair = `${sourceLanguage}|${targetLanguage}`;
      const encodedText = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;
      
      console.log('Calling MyMemory API:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      } else {
        throw new Error('MyMemory translation failed');
      }
    } catch (error) {
      console.error('MyMemory translation error:', error);
      throw error;
    }
  }
}

// Diccionario básico para casos offline
class BasicDictionaryService {
  private basicDict: { [key: string]: { [key: string]: string } } = {
    'es-en': {
      'hola': 'hello',
      'adiós': 'goodbye',
      'gracias': 'thank you',
      'por favor': 'please',
      'sí': 'yes',
      'no': 'no',
      'buenos días': 'good morning',
      'buenas tardes': 'good afternoon',
      'buenas noches': 'good night',
      'cómo estás': 'how are you',
      'muy bien': 'very well',
      'lo siento': 'sorry',
      'disculpe': 'excuse me',
      'no entiendo': 'I don\'t understand',
      'habla más despacio': 'speak more slowly',
      'cuánto cuesta': 'how much does it cost',
      'dónde está': 'where is',
      'qué hora es': 'what time is it',
      'me llamo': 'my name is',
      'mucho gusto': 'nice to meet you',
      'de nada': 'you\'re welcome',
      'con permiso': 'excuse me',
      'hasta luego': 'see you later',
      'buen día': 'good day',
      'feliz cumpleaños': 'happy birthday',
      'salud': 'cheers',
      'ayuda': 'help',
      'agua': 'water',
      'comida': 'food',
      'baño': 'bathroom',
      'hospital': 'hospital',
      'policía': 'police',
      'aeropuerto': 'airport',
      'hotel': 'hotel',
      'restaurante': 'restaurant',
      'taxi': 'taxi',
      'dinero': 'money',
      'precio': 'price',
      'caro': 'expensive',
      'barato': 'cheap'
    },
    'en-es': {
      'hello': 'hola',
      'goodbye': 'adiós',
      'thank you': 'gracias',
      'please': 'por favor',
      'yes': 'sí',
      'no': 'no',
      'good morning': 'buenos días',
      'good afternoon': 'buenas tardes',
      'good night': 'buenas noches',
      'how are you': 'cómo estás',
      'very well': 'muy bien',
      'sorry': 'lo siento',
      'excuse me': 'disculpe',
      'I don\'t understand': 'no entiendo',
      'speak more slowly': 'habla más despacio',
      'how much does it cost': 'cuánto cuesta',
      'where is': 'dónde está',
      'what time is it': 'qué hora es',
      'my name is': 'me llamo',
      'nice to meet you': 'mucho gusto',
      'you\'re welcome': 'de nada',
      'see you later': 'hasta luego',
      'good day': 'buen día',
      'happy birthday': 'feliz cumpleaños',
      'cheers': 'salud',
      'help': 'ayuda',
      'water': 'agua',
      'food': 'comida',
      'bathroom': 'baño',
      'hospital': 'hospital',
      'police': 'policía',
      'airport': 'aeropuerto',
      'hotel': 'hotel',
      'restaurant': 'restaurante',
      'taxi': 'taxi',
      'money': 'dinero',
      'price': 'precio',
      'expensive': 'caro',
      'cheap': 'barato'
    }
  };

  translateText(text: string, sourceLanguage: string, targetLanguage: string): string {
    const dictKey = `${sourceLanguage}-${targetLanguage}`;
    const dict = this.basicDict[dictKey] || {};
    
    const lowerText = text.toLowerCase().trim();
    
    // Buscar traducción exacta
    if (dict[lowerText]) {
      return dict[lowerText];
    }
    
    // Buscar palabras individuales
    const words = lowerText.split(' ');
    const translatedWords = words.map(word => dict[word] || word);
    
    if (translatedWords.some((word, index) => dict[words[index].toLowerCase()])) {
      return translatedWords.join(' ');
    }
    
    // Si no hay traducción, devolver el texto original
    return `[Sin traducción] ${text}`;
  }
}

export class TranslationService {
  private lingvaService: LingvaTranslateService;
  private myMemoryService: MyMemoryTranslateService;
  private basicService: BasicDictionaryService;

  constructor() {
    this.lingvaService = new LingvaTranslateService();
    this.myMemoryService = new MyMemoryTranslateService();
    this.basicService = new BasicDictionaryService();
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    console.log('Starting free translation:', { text, sourceLanguage, targetLanguage });

    // Intentar con Lingva Translate primero (mejor calidad)
    try {
      console.log('Trying Lingva Translate...');
      const translation = await this.lingvaService.translateText(text, sourceLanguage, targetLanguage);
      console.log('Lingva translation successful:', translation);
      return translation;
    } catch (error) {
      console.log('Lingva failed, trying MyMemory...', error);
    }

    // Si Lingva falla, intentar con MyMemory
    try {
      console.log('Trying MyMemory...');
      const translation = await this.myMemoryService.translateText(text, sourceLanguage, targetLanguage);
      console.log('MyMemory translation successful:', translation);
      return translation;
    } catch (error) {
      console.log('MyMemory failed, using basic dictionary...', error);
    }

    // Como último recurso, usar diccionario básico
    console.log('Using basic dictionary...');
    const translation = this.basicService.translateText(text, sourceLanguage, targetLanguage);
    console.log('Basic dictionary result:', translation);
    return translation;
  }

  detectLanguage(text: string): 'es' | 'en' {
    // Detección mejorada basada en patrones de idioma
    const spanishPatterns = [
      // Artículos y preposiciones comunes en español
      /\b(el|la|los|las|un|una|de|del|al|en|con|por|para|que|y|o|pero|si|no|se|te|me|le|lo|su|sus|mi|mis|tu|tus)\b/gi,
      // Verbos comunes en español
      /\b(es|son|está|están|tiene|tienen|hace|hacen|dice|dicen|va|van|viene|vienen)\b/gi,
      // Terminaciones típicas del español
      /\w+(ción|sión|dad|tad|mente|ando|endo|ado|ido)$/gi
    ];

    const englishPatterns = [
      // Artículos y preposiciones comunes en inglés
      /\b(the|a|an|and|or|but|if|of|to|in|on|at|by|for|with|from|up|about|into|through|during|before|after|above|below|between|among|this|that|these|those|i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their)\b/gi,
      // Verbos comunes en inglés
      /\b(is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|may|might|must|go|goes|went|come|comes|came|get|gets|got|make|makes|made|take|takes|took|see|sees|saw|know|knows|knew|think|thinks|thought|say|says|said|tell|tells|told)\b/gi,
      // Terminaciones típicas del inglés
      /\w+(ing|ed|er|est|ly|tion|sion|ness|ment|able|ible)$/gi
    ];

    let spanishScore = 0;
    let englishScore = 0;

    // Contar coincidencias para español
    spanishPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        spanishScore += matches.length;
      }
    });

    // Contar coincidencias para inglés
    englishPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        englishScore += matches.length;
      }
    });

    // Factores adicionales de detección
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    
    // Caracteres específicos del español
    const spanishChars = (text.match(/[ñáéíóúü¿¡]/gi) || []).length;
    spanishScore += spanishChars * 2;

    // Patrones de puntuación en español
    if (text.includes('¿') || text.includes('¡')) {
      spanishScore += 3;
    }

    // Si no hay suficiente información, usar heurística simple
    if (spanishScore === 0 && englishScore === 0) {
      // Palabras muy comunes como último recurso
      const veryCommonSpanish = ['que', 'de', 'la', 'el', 'y', 'es', 'en', 'un', 'se', 'no'];
      const veryCommonEnglish = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'you', 'that'];
      
      veryCommonSpanish.forEach(word => {
        if (text.toLowerCase().includes(word)) spanishScore += 1;
      });
      
      veryCommonEnglish.forEach(word => {
        if (text.toLowerCase().includes(word)) englishScore += 1;
      });
    }

    return spanishScore > englishScore ? 'es' : 'en';
  }
}
// Enhanced Pronunciation System for Smart Flashcard App
// Provides native-quality pronunciation using multiple services

class EnhancedPronunciation {
    constructor() {
        this.audioCache = new Map();
        this.currentAudio = null;
        this.services = {
            googleTTS: true,
            azureTTS: false, // Requires API key
            amazonPolly: false, // Requires API key
            browserTTS: true // Fallback
        };
        
        // Language-specific voice mappings for better pronunciation
        this.voiceMapping = {
            'en': { service: 'google', voice: 'en-US', accent: 'US' },
            'sv': { service: 'google', voice: 'sv-SE', accent: 'SE' },
            'de': { service: 'google', voice: 'de-DE', accent: 'DE' },
            'fr': { service: 'google', voice: 'fr-FR', accent: 'FR' },
            'es': { service: 'google', voice: 'es-ES', accent: 'ES' },
            'it': { service: 'google', voice: 'it-IT', accent: 'IT' },
            'pt': { service: 'google', voice: 'pt-BR', accent: 'BR' },
            'ru': { service: 'google', voice: 'ru-RU', accent: 'RU' },
            'ja': { service: 'google', voice: 'ja-JP', accent: 'JP' },
            'ko': { service: 'google', voice: 'ko-KR', accent: 'KR' },
            'zh': { service: 'google', voice: 'zh-CN', accent: 'CN' },
            'ar': { service: 'google', voice: 'ar-SA', accent: 'SA' },
            'hi': { service: 'google', voice: 'hi-IN', accent: 'IN' },
            'nl': { service: 'google', voice: 'nl-NL', accent: 'NL' },
            'pl': { service: 'google', voice: 'pl-PL', accent: 'PL' },
            'tr': { service: 'google', voice: 'tr-TR', accent: 'TR' },
            'th': { service: 'google', voice: 'th-TH', accent: 'TH' },
            'vi': { service: 'google', voice: 'vi-VN', accent: 'VN' }
        };
    }

    // Main pronunciation method
    async pronounce(text, language = 'en', options = {}) {
        if (!text || text.trim() === '') return;

        const cacheKey = `${text}_${language}`;
        
        // Check cache first
        if (this.audioCache.has(cacheKey)) {
            return this.playFromCache(cacheKey);
        }

        // Stop any currently playing audio
        this.stopCurrentAudio();

        try {
            // Try services in order of preference
            const audioUrl = await this.getAudioUrl(text, language, options);
            if (audioUrl) {
                return this.playAudio(audioUrl, cacheKey);
            }
        } catch (error) {
            console.warn('Enhanced pronunciation failed, falling back to browser TTS:', error);
            return this.fallbackToBrowserTTS(text, language);
        }
    }

    // Get audio URL from the best available service
    async getAudioUrl(text, language, options = {}) {
        const voiceConfig = this.voiceMapping[language] || this.voiceMapping['en'];
        
        // Try Google Translate TTS (free, high quality)
        if (this.services.googleTTS) {
            try {
                return await this.getGoogleTTSUrl(text, language, voiceConfig);
            } catch (error) {
                console.warn('Google TTS failed:', error);
            }
        }

        // Try Azure Cognitive Services (requires API key)
        if (this.services.azureTTS && options.azureKey) {
            try {
                return await this.getAzureTTSUrl(text, language, voiceConfig, options.azureKey);
            } catch (error) {
                console.warn('Azure TTS failed:', error);
            }
        }

        // Try Amazon Polly (requires API key)
        if (this.services.amazonPolly && options.awsCredentials) {
            try {
                return await this.getPollyTTSUrl(text, language, voiceConfig, options.awsCredentials);
            } catch (error) {
                console.warn('Amazon Polly failed:', error);
            }
        }

        return null;
    }

    // Google Translate TTS (Free, high quality)
    async getGoogleTTSUrl(text, language, voiceConfig) {
        // Google Translate TTS endpoint (unofficial but widely used)
        const baseUrl = 'https://translate.google.com/translate_tts';
        const params = new URLSearchParams({
            ie: 'UTF-8',
            q: text,
            tl: language,
            client: 'tw-ob',
            textlen: text.length.toString()
        });

        return `${baseUrl}?${params.toString()}`;
    }

    // Azure Cognitive Services TTS (Premium, requires API key)
    async getAzureTTSUrl(text, language, voiceConfig, apiKey) {
        const region = 'eastus'; // You can make this configurable
        const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
        
        const ssml = `
            <speak version='1.0' xml:lang='${voiceConfig.voice}'>
                <voice xml:lang='${voiceConfig.voice}' name='${this.getAzureVoiceName(language)}'>
                    ${text}
                </voice>
            </speak>
        `;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
            },
            body: ssml
        });

        if (response.ok) {
            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);
        }
        throw new Error('Azure TTS request failed');
    }

    // Amazon Polly TTS (Premium, requires AWS credentials)
    async getPollyTTSUrl(text, language, voiceConfig, awsCredentials) {
        // This would require AWS SDK implementation
        // For now, return null to fall back to other services
        return null;
    }

    // Enhanced browser TTS with better voice selection and mobile support
    async fallbackToBrowserTTS(text, language) {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            speechSynthesis.cancel();

            // Wait for voices to load on mobile
            const speakWithVoices = () => {
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Get available voices and select the best one for the language
                const voices = speechSynthesis.getVoices();
                const bestVoice = this.selectBestVoice(voices, language);
                
                if (bestVoice) {
                    utterance.voice = bestVoice;
                }
                
                utterance.lang = this.voiceMapping[language]?.voice || language;
                utterance.rate = 0.9; // Slightly slower for better comprehension
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onend = () => resolve();
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    reject(error);
                };

                // Mobile-specific: Add a small delay to ensure proper initialization
                setTimeout(() => {
                    try {
                        speechSynthesis.speak(utterance);
                    } catch (error) {
                        reject(error);
                    }
                }, 100);
            };

            // Check if voices are already loaded
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                speakWithVoices();
            } else {
                // Wait for voices to load (important for mobile)
                speechSynthesis.onvoiceschanged = () => {
                    speechSynthesis.onvoiceschanged = null; // Remove listener
                    speakWithVoices();
                };
                
                // Fallback timeout for mobile browsers that don't fire the event
                setTimeout(() => {
                    if (speechSynthesis.onvoiceschanged) {
                        speechSynthesis.onvoiceschanged = null;
                        speakWithVoices();
                    }
                }, 1000);
            }
        });
    }

    // Select the best available voice for a language
    selectBestVoice(voices, language) {
        // First, try to find a native voice for the language
        let nativeVoices = voices.filter(voice => 
            voice.lang.startsWith(language) && voice.localService
        );
        
        if (nativeVoices.length === 0) {
            // If no native voices, try any voice for the language
            nativeVoices = voices.filter(voice => voice.lang.startsWith(language));
        }

        if (nativeVoices.length === 0) {
            return null;
        }

        // Prefer female voices (often clearer) and higher quality voices
        const femaleVoices = nativeVoices.filter(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            !voice.name.toLowerCase().includes('male')
        );

        return femaleVoices.length > 0 ? femaleVoices[0] : nativeVoices[0];
    }

    // Play audio from URL
    async playAudio(audioUrl, cacheKey) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;

            audio.onloadeddata = () => {
                // Cache the audio for future use
                this.audioCache.set(cacheKey, audioUrl);
            };

            audio.onended = () => {
                this.currentAudio = null;
                resolve();
            };

            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                reject(error);
            };

            audio.play().catch(reject);
        });
    }

    // Play from cache
    async playFromCache(cacheKey) {
        const audioUrl = this.audioCache.get(cacheKey);
        if (audioUrl) {
            return this.playAudio(audioUrl, cacheKey);
        }
    }

    // Stop currently playing audio
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }

        // Also stop speech synthesis
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    // Get Azure voice name for language
    getAzureVoiceName(language) {
        const azureVoices = {
            'en': 'en-US-JennyNeural',
            'sv': 'sv-SE-SofiaNeural',
            'de': 'de-DE-KatjaNeural',
            'fr': 'fr-FR-DeniseNeural',
            'es': 'es-ES-ElviraNeural',
            'it': 'it-IT-ElsaNeural',
            'pt': 'pt-BR-FranciscaNeural',
            'ru': 'ru-RU-SvetlanaNeural',
            'ja': 'ja-JP-NanamiNeural',
            'ko': 'ko-KR-SunHiNeural',
            'zh': 'zh-CN-XiaoxiaoNeural',
            'ar': 'ar-SA-ZariyahNeural',
            'hi': 'hi-IN-SwaraNeural',
            'nl': 'nl-NL-ColetteNeural',
            'pl': 'pl-PL-ZofiaNeural',
            'tr': 'tr-TR-EmelNeural',
            'th': 'th-TH-PremwadeeNeural',
            'vi': 'vi-VN-HoaiMyNeural'
        };
        return azureVoices[language] || azureVoices['en'];
    }

    // Clear audio cache
    clearCache() {
        this.audioCache.clear();
    }

    // Get cache size
    getCacheSize() {
        return this.audioCache.size;
    }

    // Test pronunciation with different services
    async testPronunciation(text = 'Hello, world!', language = 'en') {
        console.log('Testing pronunciation services...');
        
        try {
            await this.pronounce(text, language);
            console.log('✅ Pronunciation test successful');
        } catch (error) {
            console.error('❌ Pronunciation test failed:', error);
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPronunciation;
} else {
    window.EnhancedPronunciation = EnhancedPronunciation;
}

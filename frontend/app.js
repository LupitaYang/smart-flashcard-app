// Flashcard App - Main JavaScript File
class FlashcardApp {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.currentCardIndex = 0;
        this.studySession = [];
        this.sessionStats = {
            today: 0,
            total: 0,
            streak: 0
        };
        this.settings = {
            cardsPerSession: 20,
            autoPlayAudio: true,
            showExamples: true
        };
        this.currentMode = 'study'; // 'study', 'add', 'manage'
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
        this.loadSampleCards();
    }

    // Data Management
    loadData() {
        const savedCards = localStorage.getItem('flashcards');
        const savedStats = localStorage.getItem('flashcardStats');
        const savedSettings = localStorage.getItem('flashcardSettings');

        if (savedCards) {
            this.cards = JSON.parse(savedCards);
        }

        if (savedStats) {
            this.sessionStats = JSON.parse(savedStats);
        }

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveData() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
        localStorage.setItem('flashcardStats', JSON.stringify(this.sessionStats));
        localStorage.setItem('flashcardSettings', JSON.stringify(this.settings));
    }

    loadSampleCards() {
        if (this.cards.length === 0) {
            const sampleCards = [
                {
                    id: Date.now() + 1,
                    frontText: 'Hello',
                    backText: 'Hej',
                    frontLang: 'en',
                    backLang: 'sv',
                    category: 'Daily Words',
                    example: 'Hello, how are you? - Hej, hur mår du?',
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now()
                },
                {
                    id: Date.now() + 2,
                    frontText: 'Thank you',
                    backText: 'Tack',
                    frontLang: 'en',
                    backLang: 'sv',
                    category: 'Daily Words',
                    example: 'Thank you very much - Tack så mycket',
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now()
                },
                {
                    id: Date.now() + 3,
                    frontText: 'Good morning',
                    backText: 'God morgon',
                    frontLang: 'en',
                    backLang: 'sv',
                    category: 'Daily Words',
                    example: 'Good morning everyone - God morgon alla',
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now()
                }
            ];
            this.cards = sampleCards;
            this.saveData();
        }
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.getElementById('addCardBtn').addEventListener('click', () => this.showAddCardMode());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        
        // Study Mode
        document.getElementById('startStudyBtn').addEventListener('click', () => this.startStudySession());
        document.getElementById('showAnswerBtn').addEventListener('click', () => this.showAnswer());
        document.getElementById('hardBtn').addEventListener('click', () => this.rateCard(0));
        document.getElementById('goodBtn').addEventListener('click', () => this.rateCard(3));
        document.getElementById('easyBtn').addEventListener('click', () => this.rateCard(5));

        // Audio buttons
        document.getElementById('frontAudioBtn').addEventListener('click', () => this.playAudio('front'));
        document.getElementById('backAudioBtn').addEventListener('click', () => this.playAudio('back'));

        // Add Card Mode
        document.getElementById('addCardForm').addEventListener('submit', (e) => this.handleAddCard(e));
        document.getElementById('cancelAddBtn').addEventListener('click', () => this.showStudyMode());
        document.getElementById('translateBtn').addEventListener('click', () => this.translateText());

        // Settings
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettings());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleImportFile(e));

        // Settings inputs
        document.getElementById('cardsPerSession').addEventListener('change', (e) => {
            this.settings.cardsPerSession = parseInt(e.target.value);
            this.saveData();
        });
        document.getElementById('autoPlayAudio').addEventListener('change', (e) => {
            this.settings.autoPlayAudio = e.target.checked;
            this.saveData();
        });
        document.getElementById('showExamples').addEventListener('change', (e) => {
            this.settings.showExamples = e.target.checked;
            this.saveData();
        });
    }

    // UI Management
    updateUI() {
        this.updateStats();
        this.updateSettings();
    }

    updateStats() {
        document.getElementById('todayCount').textContent = this.sessionStats.today;
        document.getElementById('totalCount').textContent = this.cards.length;
        document.getElementById('streakCount').textContent = this.sessionStats.streak;
    }

    updateSettings() {
        document.getElementById('cardsPerSession').value = this.settings.cardsPerSession;
        document.getElementById('autoPlayAudio').checked = this.settings.autoPlayAudio;
        document.getElementById('showExamples').checked = this.settings.showExamples;
    }

    showStudyMode() {
        this.currentMode = 'study';
        document.getElementById('studyMode').style.display = 'block';
        document.getElementById('addCardMode').style.display = 'none';
        document.getElementById('cardManagement').style.display = 'none';
    }

    showAddCardMode() {
        this.currentMode = 'add';
        document.getElementById('studyMode').style.display = 'none';
        document.getElementById('addCardMode').style.display = 'block';
        document.getElementById('cardManagement').style.display = 'none';
        document.getElementById('frontTextInput').focus();
    }

    showSettings() {
        document.getElementById('settingsModal').style.display = 'flex';
    }

    hideSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    // Study Session Management
    startStudySession() {
        const dueCards = this.getDueCards();
        this.studySession = dueCards.slice(0, this.settings.cardsPerSession);
        
        if (this.studySession.length === 0) {
            alert('No cards are due for review right now. Great job staying on top of your studies!');
            return;
        }

        this.currentCardIndex = 0;
        this.showCurrentCard();
        
        document.getElementById('startStudyBtn').style.display = 'none';
        document.getElementById('studyButtons').style.display = 'block';
        
        this.updateProgress();
    }

    getDueCards() {
        const now = Date.now();
        return this.cards.filter(card => card.nextReview <= now);
    }

    showCurrentCard() {
        if (this.currentCardIndex >= this.studySession.length) {
            this.endStudySession();
            return;
        }

        this.currentCard = this.studySession[this.currentCardIndex];
        
        // Update card display
        document.getElementById('frontLanguage').textContent = this.getLanguageName(this.currentCard.frontLang);
        document.getElementById('frontText').textContent = this.currentCard.frontText;
        document.getElementById('backLanguage').textContent = this.getLanguageName(this.currentCard.backLang);
        document.getElementById('backText').textContent = this.currentCard.backText;
        
        if (this.settings.showExamples && this.currentCard.example) {
            document.getElementById('exampleSentence').textContent = this.currentCard.example;
            document.getElementById('exampleSentence').style.display = 'block';
        } else {
            document.getElementById('exampleSentence').style.display = 'none';
        }

        // Reset card flip
        document.getElementById('cardFront').style.display = 'block';
        document.getElementById('cardBack').style.display = 'none';
        document.getElementById('showAnswerBtn').style.display = 'block';
        document.querySelector('.difficulty-buttons').style.display = 'none';

        // Auto-play audio if enabled
        if (this.settings.autoPlayAudio) {
            setTimeout(() => this.playAudio('front'), 500);
        }

        this.updateProgress();
    }

    showAnswer() {
        document.getElementById('cardFront').style.display = 'none';
        document.getElementById('cardBack').style.display = 'block';
        document.getElementById('showAnswerBtn').style.display = 'none';
        document.querySelector('.difficulty-buttons').style.display = 'flex';

        // Auto-play back audio if enabled
        if (this.settings.autoPlayAudio) {
            setTimeout(() => this.playAudio('back'), 300);
        }
    }

    rateCard(quality) {
        this.updateCardSchedule(this.currentCard, quality);
        this.sessionStats.today++;
        this.currentCardIndex++;
        this.showCurrentCard();
        this.saveData();
    }

    updateProgress() {
        const progress = (this.currentCardIndex / this.studySession.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${this.currentCardIndex} / ${this.studySession.length}`;
    }

    endStudySession() {
        document.getElementById('frontText').textContent = 'Session Complete! 🎉';
        document.getElementById('cardBack').style.display = 'none';
        document.getElementById('cardFront').style.display = 'block';
        document.getElementById('studyButtons').style.display = 'none';
        document.getElementById('startStudyBtn').style.display = 'block';
        document.getElementById('startStudyBtn').innerHTML = '<i class="fas fa-play"></i> Start New Session';
        
        this.updateStats();
        this.saveData();
    }

    // Spaced Repetition Algorithm (SM-2)
    updateCardSchedule(card, quality) {
        if (quality >= 3) {
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            card.repetitions++;
        } else {
            card.repetitions = 0;
            card.interval = 1;
        }

        card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (card.easeFactor < 1.3) {
            card.easeFactor = 1.3;
        }

        card.nextReview = Date.now() + (card.interval * 24 * 60 * 60 * 1000);
        card.difficulty = quality;
    }

    // Audio Functionality
    playAudio(side) {
        const text = side === 'front' ? this.currentCard.frontText : this.currentCard.backText;
        const lang = side === 'front' ? this.currentCard.frontLang : this.currentCard.backLang;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getSpeechLang(lang);
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    getSpeechLang(langCode) {
        const langMap = {
            'en': 'en-US',
            'sv': 'sv-SE',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'it': 'it-IT'
        };
        return langMap[langCode] || 'en-US';
    }

    // Translation Integration
    async translateText() {
        const frontText = document.getElementById('frontTextInput').value.trim();
        const fromLang = document.getElementById('frontLanguageSelect').value;
        const toLang = document.getElementById('backLanguageSelect').value;

        if (!frontText) {
            alert('Please enter text to translate');
            return;
        }

        document.getElementById('translateBtn').classList.add('loading');
        
        try {
            // Using a free translation service (MyMemory API)
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(frontText)}&langpair=${fromLang}|${toLang}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                document.getElementById('backTextInput').value = data.responseData.translatedText;
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback: show a message about manual translation
            alert('Auto-translation is not available. Please enter the translation manually.');
        } finally {
            document.getElementById('translateBtn').classList.remove('loading');
        }
    }

    // Card Management
    handleAddCard(e) {
        e.preventDefault();
        
        const frontText = document.getElementById('frontTextInput').value.trim();
        const backText = document.getElementById('backTextInput').value.trim();
        const frontLang = document.getElementById('frontLanguageSelect').value;
        const backLang = document.getElementById('backLanguageSelect').value;
        const example = document.getElementById('exampleInput').value.trim();
        const category = document.getElementById('categoryInput').value.trim() || 'General';

        if (!frontText || !backText) {
            alert('Please fill in both the word/phrase and translation fields');
            return;
        }

        const newCard = {
            id: Date.now(),
            frontText,
            backText,
            frontLang,
            backLang,
            category,
            example,
            difficulty: 0,
            nextReview: Date.now(),
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            created: Date.now()
        };

        this.cards.push(newCard);
        this.saveData();
        this.updateStats();

        // Reset form
        document.getElementById('addCardForm').reset();
        
        // Show success message
        alert('Card added successfully!');
        
        // Return to study mode
        this.showStudyMode();
    }

    // Utility Functions
    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'sv': 'Swedish',
            'de': 'German',
            'fr': 'French',
            'es': 'Spanish',
            'it': 'Italian'
        };
        return languages[code] || code.toUpperCase();
    }

    // Data Export/Import
    exportData() {
        const data = {
            cards: this.cards,
            stats: this.sessionStats,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.cards && Array.isArray(data.cards)) {
                    if (confirm('This will replace all your current cards. Are you sure?')) {
                        this.cards = data.cards;
                        if (data.stats) this.sessionStats = data.stats;
                        if (data.settings) this.settings = { ...this.settings, ...data.settings };
                        
                        this.saveData();
                        this.updateUI();
                        alert('Data imported successfully!');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('Error importing file. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});

// Service Worker Registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Enhanced Smart Flashcard App - Complete Feature Set
class EnhancedFlashcardApp {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.currentCardIndex = 0;
        this.studySession = [];
        this.sessionStats = {
            today: 0,
            total: 0,
            streak: 0,
            lastStudyDate: null,
            totalStudyTime: 0,
            averageAccuracy: 0
        };
        this.settings = {
            cardsPerSession: 20,
            autoPlayAudio: true,
            showExamples: true,
            enableSwipe: true,
            studyReminders: false,
            reminderTime: '19:00',
            darkMode: false,
            voiceRecognition: false,
            keyboardShortcuts: true
        };
        this.currentMode = 'study';
        this.achievements = [];
        this.studyTimer = null;
        this.sessionStartTime = null;
        this.swipeHandler = null;
        this.voiceRecognition = null;
        this.installPrompt = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupPWA();
        this.bindEvents();
        this.setupSwipeGestures();
        this.setupKeyboardShortcuts();
        this.setupVoiceRecognition();
        this.setupNotifications();
        this.updateUI();
        this.loadSampleCards();
        this.checkAchievements();
        this.applyTheme();
    }

    // PWA Setup
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }

        // PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallPrompt();
        });

        // Handle URL parameters for shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        if (action === 'study') {
            this.startStudySession();
        } else if (action === 'add') {
            this.showAddCardMode();
        }
    }

    showInstallPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt show';
        prompt.innerHTML = `
            <div class="install-prompt-content">
                <h4>📱 Install Smart Flashcards</h4>
                <p>Add to your home screen for the best experience!</p>
            </div>
            <div class="install-prompt-buttons">
                <button class="btn btn-primary btn-small" id="installApp">Install</button>
                <button class="btn btn-secondary btn-small" id="dismissInstall">Later</button>
            </div>
        `;
        document.body.appendChild(prompt);

        document.getElementById('installApp').addEventListener('click', () => {
            if (this.installPrompt) {
                this.installPrompt.prompt();
                this.installPrompt.userChoice.then((result) => {
                    if (result.outcome === 'accepted') {
                        this.showNotification('App installed successfully! 🎉', 'success');
                    }
                    this.installPrompt = null;
                    prompt.remove();
                });
            }
        });

        document.getElementById('dismissInstall').addEventListener('click', () => {
            prompt.remove();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
    }

    // Data Management with Enhanced Features
    loadData() {
        const savedCards = localStorage.getItem('flashcards');
        const savedStats = localStorage.getItem('flashcardStats');
        const savedSettings = localStorage.getItem('flashcardSettings');
        const savedAchievements = localStorage.getItem('flashcardAchievements');

        if (savedCards) {
            this.cards = JSON.parse(savedCards);
        }

        if (savedStats) {
            this.sessionStats = { ...this.sessionStats, ...JSON.parse(savedStats) };
        }

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        if (savedAchievements) {
            this.achievements = JSON.parse(savedAchievements);
        }

        // Update streak based on last study date
        this.updateStreak();
    }

    saveData() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
        localStorage.setItem('flashcardStats', JSON.stringify(this.sessionStats));
        localStorage.setItem('flashcardSettings', JSON.stringify(this.settings));
        localStorage.setItem('flashcardAchievements', JSON.stringify(this.achievements));
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.sessionStats.lastStudyDate;
        
        if (!lastStudy) {
            this.sessionStats.streak = 0;
        } else {
            const lastStudyDate = new Date(lastStudy);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastStudyDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                this.sessionStats.streak = 0;
            }
        }
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
                    category: '🗣️ Daily Words',
                    example: 'Hello, how are you? - Hej, hur mår du?',
                    image: null,
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now(),
                    accuracy: 0,
                    timesStudied: 0
                },
                {
                    id: Date.now() + 2,
                    frontText: 'Thank you',
                    backText: 'Tack',
                    frontLang: 'en',
                    backLang: 'sv',
                    category: '🗣️ Daily Words',
                    example: 'Thank you very much - Tack så mycket',
                    image: null,
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now(),
                    accuracy: 0,
                    timesStudied: 0
                },
                {
                    id: Date.now() + 3,
                    frontText: 'Piano',
                    backText: 'Piano',
                    frontLang: 'en',
                    backLang: 'sv',
                    category: '🎹 Piano Terms',
                    example: 'I play the piano - Jag spelar piano',
                    image: null,
                    difficulty: 0,
                    nextReview: Date.now(),
                    interval: 1,
                    repetitions: 0,
                    easeFactor: 2.5,
                    created: Date.now(),
                    accuracy: 0,
                    timesStudied: 0
                }
            ];
            this.cards = sampleCards;
            this.saveData();
        }
    }

    // Enhanced Event Binding
    bindEvents() {
        // Navigation
        document.getElementById('addCardBtn').addEventListener('click', () => this.showAddCardMode());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        
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
        
        // Category selection
        document.getElementById('categorySelect').addEventListener('change', (e) => this.handleCategoryChange(e));
        
        // Image upload
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImage').addEventListener('click', () => this.removeImage());

        // Settings
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettings());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleImportFile(e));

        // Enhanced Settings
        this.bindSettingsEvents();
    }

    bindSettingsEvents() {
        const settingsMap = {
            'cardsPerSession': (value) => parseInt(value),
            'autoPlayAudio': (value) => value,
            'showExamples': (value) => value,
            'enableSwipe': (value) => { this.setupSwipeGestures(); return value; },
            'studyReminders': (value) => { this.setupNotifications(); return value; },
            'reminderTime': (value) => { this.setupNotifications(); return value; }
        };

        Object.keys(settingsMap).forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.addEventListener('change', (e) => {
                    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                    this.settings[setting] = settingsMap[setting](value);
                    this.saveData();
                });
            }
        });
    }

    // Dark Mode
    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applyTheme();
        this.saveData();
        
        const icon = document.querySelector('#darkModeToggle i');
        icon.className = this.settings.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showNotification(
            `${this.settings.darkMode ? 'Dark' : 'Light'} mode enabled`,
            'success'
        );
    }

    applyTheme() {
        if (this.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // Swipe Gestures
    setupSwipeGestures() {
        if (!this.settings.enableSwipe) return;

        const flashcard = document.getElementById('flashcard');
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;

        const handleStart = (e) => {
            if (!this.currentCard || document.getElementById('cardFront').style.display !== 'none') return;
            
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            isDragging = true;
            flashcard.style.transition = 'none';
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            
            const touch = e.touches ? e.touches[0] : e;
            currentX = touch.clientX - startX;
            currentY = touch.clientY - startY;
            
            // Only allow horizontal swipes
            if (Math.abs(currentX) > Math.abs(currentY)) {
                e.preventDefault();
                flashcard.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
                
                // Show swipe indicators
                this.showSwipeIndicator(currentX);
            }
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            flashcard.style.transition = 'transform 0.3s ease';
            
            const threshold = 100;
            if (Math.abs(currentX) > threshold) {
                if (currentX < -threshold) {
                    this.rateCard(0); // Hard (swipe left)
                } else if (currentX > threshold) {
                    this.rateCard(5); // Easy (swipe right)
                }
            } else {
                flashcard.style.transform = '';
            }
            
            this.hideSwipeIndicator();
            currentX = 0;
            currentY = 0;
        };

        // Touch events
        flashcard.addEventListener('touchstart', handleStart, { passive: false });
        flashcard.addEventListener('touchmove', handleMove, { passive: false });
        flashcard.addEventListener('touchend', handleEnd);

        // Mouse events for desktop testing
        flashcard.addEventListener('mousedown', handleStart);
        flashcard.addEventListener('mousemove', handleMove);
        flashcard.addEventListener('mouseup', handleEnd);
        flashcard.addEventListener('mouseleave', handleEnd);
    }

    showSwipeIndicator(deltaX) {
        let overlay = document.querySelector('.card-swipe-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'card-swipe-overlay';
            document.getElementById('cardBack').appendChild(overlay);
        }

        const threshold = 100;
        const opacity = Math.min(Math.abs(deltaX) / threshold, 1);
        
        if (deltaX < -50) {
            overlay.className = 'card-swipe-overlay hard';
            overlay.textContent = '❌ Hard';
            overlay.style.opacity = opacity;
        } else if (deltaX > 50) {
            overlay.className = 'card-swipe-overlay easy';
            overlay.textContent = '👍 Easy';
            overlay.style.opacity = opacity;
        } else {
            overlay.style.opacity = 0;
        }
    }

    hideSwipeIndicator() {
        const overlay = document.querySelector('.card-swipe-overlay');
        if (overlay) {
            overlay.style.opacity = 0;
        }
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        if (!this.settings.keyboardShortcuts) return;

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (document.getElementById('showAnswerBtn').style.display !== 'none') {
                        this.showAnswer();
                    }
                    break;
                case '1':
                    if (document.querySelector('.difficulty-buttons').style.display !== 'none') {
                        this.rateCard(0);
                    }
                    break;
                case '2':
                    if (document.querySelector('.difficulty-buttons').style.display !== 'none') {
                        this.rateCard(3);
                    }
                    break;
                case '3':
                    if (document.querySelector('.difficulty-buttons').style.display !== 'none') {
                        this.rateCard(5);
                    }
                    break;
                case 'a':
                    if (this.currentCard) {
                        this.playAudio(document.getElementById('cardFront').style.display === 'none' ? 'back' : 'front');
                    }
                    break;
                case '?':
                    this.toggleShortcutsHelp();
                    break;
            }
        });

        this.createShortcutsHelp();
    }

    createShortcutsHelp() {
        const help = document.createElement('div');
        help.className = 'shortcuts-help';
        help.innerHTML = `
            <h4>⌨️ Keyboard Shortcuts</h4>
            <ul>
                <li><kbd>Space</kbd> Show answer</li>
                <li><kbd>1</kbd> Hard</li>
                <li><kbd>2</kbd> Good</li>
                <li><kbd>3</kbd> Easy</li>
                <li><kbd>A</kbd> Play audio</li>
                <li><kbd>?</kbd> Toggle this help</li>
            </ul>
        `;
        document.body.appendChild(help);
    }

    toggleShortcutsHelp() {
        const help = document.querySelector('.shortcuts-help');
        help.classList.toggle('show');
    }

    // Voice Recognition
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceRecognition = new SpeechRecognition();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'en-US';

        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.handleVoiceCommand(transcript);
        };

        this.voiceRecognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.showNotification('Voice recognition error', 'error');
        };
    }

    handleVoiceCommand(command) {
        if (command.includes('show answer')) {
            this.showAnswer();
        } else if (command.includes('hard')) {
            this.rateCard(0);
        } else if (command.includes('good')) {
            this.rateCard(3);
        } else if (command.includes('easy')) {
            this.rateCard(5);
        } else if (command.includes('next')) {
            if (document.querySelector('.difficulty-buttons').style.display !== 'none') {
                this.rateCard(3);
            }
        }
    }

    // Notifications and Reminders
    setupNotifications() {
        if (!this.settings.studyReminders) return;

        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.scheduleReminder();
                    }
                });
            } else if (Notification.permission === 'granted') {
                this.scheduleReminder();
            }
        }
    }

    scheduleReminder() {
        const [hours, minutes] = this.settings.reminderTime.split(':');
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            new Notification('📚 Time to study!', {
                body: 'Your daily flashcard session is waiting for you.',
                icon: 'icons/icon-192x192.png',
                badge: 'icons/icon-72x72.png'
            });
            
            // Schedule next reminder
            this.scheduleReminder();
        }, timeUntilReminder);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Enhanced UI Management
    updateUI() {
        this.updateStats();
        this.updateSettings();
        this.updateCategoryOptions();
    }

    updateStats() {
        document.getElementById('todayCount').textContent = this.sessionStats.today;
        document.getElementById('totalCount').textContent = this.cards.length;
        document.getElementById('streakCount').textContent = this.sessionStats.streak;
    }

    updateSettings() {
        Object.keys(this.settings).forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[setting];
                } else {
                    element.value = this.settings[setting];
                }
            }
        });
    }

    updateCategoryOptions() {
        const categories = [...new Set(this.cards.map(card => card.category))];
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    }

    // Enhanced Study Session Management
    startStudySession() {
        const dueCards = this.getDueCards();
        this.studySession = dueCards.slice(0, this.settings.cardsPerSession);
        
        if (this.studySession.length === 0) {
            this.showNotification('🎉 No cards due for review! Great job staying on top of your studies!', 'success');
            return;
        }

        this.currentCardIndex = 0;
        this.sessionStartTime = Date.now();
        this.showCurrentCard();
        
        document.getElementById('startStudyBtn').style.display = 'none';
        document.getElementById('studyButtons').style.display = 'block';
        
        this.updateProgress();
        this.startSessionTimer();
        
        this.showNotification(`📚 Study session started! ${this.studySession.length} cards to review`, 'success');
    }

    startSessionTimer() {
        const timer = document.createElement('div');
        timer.className = 'session-timer';
        timer.id = 'sessionTimer';
        document.body.appendChild(timer);

        this.studyTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timer.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
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
        
        // Handle images
        this.displayCardImage();
        
        // Handle examples
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

    displayCardImage() {
        const frontCard = document.getElementById('cardFront');
        const backCard = document.getElementById('cardBack');
        
        // Remove existing images
        const existingImages = document.querySelectorAll('.card-image');
        existingImages.forEach(img => img.remove());
        
        if (this.currentCard.image) {
            const frontImg = document.createElement('img');
            frontImg.src = this.currentCard.image;
            frontImg.className = 'card-image';
            frontImg.alt = this.currentCard.frontText;
            
            const backImg = frontImg.cloneNode();
            
            frontCard.insertBefore(frontImg, frontCard.querySelector('.word-text'));
            backCard.insertBefore(backImg, backCard.querySelector('.word-text'));
        }
    }

    endStudySession() {
        const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        this.sessionStats.totalStudyTime += sessionTime;
        this.sessionStats.lastStudyDate = new Date().toDateString();
        
        // Update streak
        const today = new Date().toDateString();
        if (this.sessionStats.lastStudyDate !== today) {
            this.sessionStats.streak++;
        }

        document.getElementById('frontText').textContent = '🎉 Session Complete!';
        document.getElementById('cardBack').style.display = 'none';
        document.getElementById('cardFront').style.display = 'block';
        document.getElementById('studyButtons').style.display = 'none';
        document.getElementById('startStudyBtn').style.display = 'block';
        document.getElementById('startStudyBtn').innerHTML = '<i class="fas fa-play"></i> Start New Session';
        
        // Clear timer
        if (this.studyTimer) {
            clearInterval(this.studyTimer);
            const timer = document.getElementById('sessionTimer');
            if (timer) timer.remove();
        }
        
        this.updateStats();
        this.saveData();
        this.checkAchievements();
        
        const minutes = Math.floor(sessionTime / 60);
        const seconds = sessionTime % 60;
        this.showNotification(
            `🏆 Session completed in ${minutes}:${seconds.toString().padStart(2, '0')}! Cards studied: ${this.studySession.length}`,
            'success'
        );
    }

    rateCard(quality) {
        this.updateCardSchedule(this.currentCard, quality);
        this.currentCard.timesStudied++;
        this.currentCard.accuracy = ((this.currentCard.accuracy * (this.currentCard.timesStudied - 1)) + (quality >= 3 ? 1 : 0)) / this.currentCard.timesStudied;
        
        this.sessionStats.today++;
        this.currentCardIndex++;
        this.showCurrentCard();
        this.saveData();
    }

    // Enhanced Audio with Multiple Voices
    playAudio(side) {
        const text = side === 'front' ? this.currentCard.frontText : this.currentCard.backText;
        const lang = side === 'front' ? this.currentCard.frontLang : this.currentCard.backLang;
        
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getSpeechLang(lang);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Try to find a native voice for the language
            const voices = speechSynthesis.getVoices();
            const nativeVoice = voices.find(voice => voice.lang.startsWith(lang));
            if (nativeVoice) {
                utterance.voice = nativeVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }

    // Enhanced Card Management
    handleAddCard(e) {
        e.preventDefault();
        
        const frontText = document.getElementById('frontTextInput').value.trim();
        const backText = document.getElementById('backTextInput').value.trim();
        const frontLang = document.getElementById('frontLanguageSelect').value;
        const backLang = document.getElementById('backLanguageSelect').value;
        const example = document.getElementById('exampleInput').value.trim();
        const categorySelect = document.getElementById('categorySelect');
        const categoryInput = document.getElementById('categoryInput');
        const category = categorySelect.value === 'custom' ? categoryInput.value.trim() : categorySelect.value || 'General';
        const imageInput = document.getElementById('imageInput');
        const image = imageInput.files[0] ? this.currentImageData : null;

        if (!frontText || !backText) {
            this.showNotification('Please fill in both the word/phrase and translation fields', 'error');
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
            image,
            difficulty: 0,
            nextReview: Date.now(),
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            created: Date.now(),
            accuracy: 0,
            timesStudied: 0
        };

        this.cards.push(newCard);
        this.saveData();
        this.updateStats();
        this.updateCategoryOptions();

        // Reset form
        document.getElementById('addCardForm').reset();
        this.removeImage();
        
        this.showNotification('Card added successfully! 🎉', 'success');
        this.showStudyMode();
    }

    // Image handling
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(src) {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        img.src = src;
        preview.style.display = 'flex';
    }

    removeImage() {
        this.currentImageData = null;
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('imageInput').value = '';
    }

    handleCategoryChange(e) {
        const categoryInput = document.getElementById('categoryInput');
        if (e.target.value === 'custom') {
            categoryInput.style.display = 'block';
            categoryInput.focus();
        } else {
            categoryInput.style.display = 'none';
        }
    }

    // Enhanced translation with better error handling
    async translateText() {
        const frontText = document.getElementById('frontTextInput').value.trim();
        const fromLang = document.getElementById('frontLanguageSelect').value;
        const toLang = document.getElementById('backLanguageSelect').value;

        if (!frontText) {
            this.showNotification('Please enter text to translate', 'warning');
            return;
        }

        document.getElementById('translateBtn').classList.add('loading');
        
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(frontText)}&langpair=${fromLang}|${toLang}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                document.getElementById('backTextInput').value = data.responseData.translatedText;
                this.showNotification('Translation completed! ✨', 'success');
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification('Auto-translation unavailable. Please enter translation manually.', 'warning');
        } finally {
            document.getElementById('translateBtn').classList.remove('loading');
        }
    }

    // Achievements System
    checkAchievements() {
        const newAchievements = [];

        // First card achievement
        if (this.cards.length >= 1 && !this.achievements.includes('first_card')) {
            newAchievements.push({
                id: 'first_card',
                title: 'Getting Started! 🌱',
                description: 'Added your first flashcard'
            });
        }

        // Study streak achievements
        if (this.sessionStats.streak >= 7 && !this.achievements.includes('week_streak')) {
            newAchievements.push({
                id: 'week_streak',
                title: 'Week Warrior! 🔥',
                description: '7-day study streak'
            });
        }

        if (this.sessionStats.streak >= 30 && !this.achievements.includes('month_streak')) {
            newAchievements.push({
                id: 'month_streak',
                title: 'Monthly Master! 🏆',
                description: '30-day study streak'
            });
        }

        // Card collection achievements
        if (this.cards.length >= 50 && !this.achievements.includes('collector')) {
            newAchievements.push({
                id: 'collector',
                title: 'Card Collector! 📚',
                description: 'Created 50 flashcards'
            });
        }

        if (this.cards.length >= 100 && !this.achievements.includes('library')) {
            newAchievements.push({
                id: 'library',
                title: 'Living Library! 📖',
                description: 'Created 100 flashcards'
            });
        }

        // Study session achievements
        if (this.sessionStats.today >= 50 && !this.achievements.includes('study_marathon')) {
            newAchievements.push({
                id: 'study_marathon',
                title: 'Study Marathon! 🏃‍♂️',
                description: 'Studied 50 cards in one day'
            });
        }

        // Show new achievements
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement.id);
            this.showAchievement(achievement);
        });

        if (newAchievements.length > 0) {
            this.saveData();
        }
    }

    showAchievement(achievement) {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge show';
        badge.innerHTML = `
            <div class="badge-icon">${achievement.title.split(' ')[1]}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
        `;
        document.body.appendChild(badge);

        setTimeout(() => {
            badge.classList.remove('show');
            setTimeout(() => badge.remove(), 300);
        }, 3000);
    }

    // Navigation methods
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

    showAnswer() {
        document.getElementById('cardFront').style.display = 'none';
        document.getElementById('cardBack').style.display = 'block';
        document.getElementById('showAnswerBtn').style.display = 'none';
        document.querySelector('.difficulty-buttons').style.display = 'flex';

        if (this.settings.autoPlayAudio) {
            setTimeout(() => this.playAudio('back'), 300);
        }
    }

    updateProgress() {
        const progress = (this.currentCardIndex / this.studySession.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${this.currentCardIndex} / ${this.studySession.length}`;
    }

    getDueCards() {
        const now = Date.now();
        return this.cards.filter(card => card.nextReview <= now);
    }

    // Spaced Repetition Algorithm (Enhanced SM-2)
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

    // Data Export/Import with enhanced features
    exportData() {
        const data = {
            cards: this.cards,
            stats: this.sessionStats,
            settings: this.settings,
            achievements: this.achievements,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-flashcards-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully! 📁', 'success');
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
                    if (confirm('This will replace all your current data. Are you sure?')) {
                        this.cards = data.cards;
                        if (data.stats) this.sessionStats = { ...this.sessionStats, ...data.stats };
                        if (data.settings) this.settings = { ...this.settings, ...data.settings };
                        if (data.achievements) this.achievements = data.achievements;
                        
                        this.saveData();
                        this.updateUI();
                        this.applyTheme();
                        this.showNotification('Data imported successfully! 🎉', 'success');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing file. Please check the file format.', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the enhanced app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new EnhancedFlashcardApp();
});

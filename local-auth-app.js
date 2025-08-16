// Smart Flashcard App with Local Authentication Simulation
class LocalAuthFlashcardApp {
    constructor() {
        this.user = null;
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
        this.currentImageData = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindAuthEvents();
        this.setupPWA();
        this.bindEvents();
        this.setupSwipeGestures();
        this.setupKeyboardShortcuts();
        this.setupVoiceRecognition();
        this.setupNotifications();
        this.applyTheme();
        this.checkAuthState();
    }

    // Local Authentication Simulation
    checkAuthState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.onUserSignedIn();
        } else {
            this.onUserSignedOut();
        }
    }

    // Authentication Event Handlers
    bindAuthEvents() {
        // Login form
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('googleSignInBtn').addEventListener('click', () => this.signInWithGoogle());
        
        // Signup form
        document.getElementById('signupBtn').addEventListener('click', () => this.handleSignup());
        document.getElementById('googleSignUpBtn').addEventListener('click', () => this.signInWithGoogle());
        
        // Form switching
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => this.toggleUserMenu());
        document.getElementById('signOutBtn').addEventListener('click', () => this.signOut());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
        document.getElementById('syncBtn').addEventListener('click', () => this.syncData());
        document.getElementById('upgradeBtn').addEventListener('click', () => this.showUpgrade());

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').style.display = 'none';
            }
        });
    }

    // Local Authentication Methods
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showAuthLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const existingUser = users.find(u => u.email === email && u.password === password);

            if (existingUser) {
                this.user = {
                    uid: existingUser.id,
                    email: existingUser.email,
                    displayName: existingUser.name
                };
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                this.showNotification('Welcome back! 🎉', 'success');
                this.onUserSignedIn();
            } else {
                this.showNotification('Invalid email or password', 'error');
            }
            
            this.showAuthLoading(false);
        }, 1000);
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showNotification('Please agree to the Terms of Service', 'error');
            return;
        }

        this.showAuthLoading(true);

        // Simulate signup delay
        setTimeout(() => {
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                this.showNotification('An account with this email already exists', 'error');
                this.showAuthLoading(false);
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password, // In real app, this would be hashed
                createdAt: new Date().toISOString(),
                plan: 'free'
            };

            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            // Sign in the new user
            this.user = {
                uid: newUser.id,
                email: newUser.email,
                displayName: newUser.name
            };
            localStorage.setItem('currentUser', JSON.stringify(this.user));

            this.showNotification('Account created successfully! Welcome! 🎉', 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1500);
    }

    async signInWithGoogle() {
        this.showAuthLoading(true);

        // Simulate Google sign-in
        setTimeout(() => {
            const googleUser = {
                uid: 'google_' + Date.now(),
                email: 'demo@gmail.com',
                displayName: 'Demo User'
            };

            this.user = googleUser;
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification('Welcome! 🎉', 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1000);
    }

    async signOut() {
        localStorage.removeItem('currentUser');
        this.user = null;
        this.showNotification('Signed out successfully', 'success');
        this.onUserSignedOut();
    }

    // User State Management
    onUserSignedIn() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        this.updateUserInfo();
        this.loadUserData();
        this.showSyncStatus('synced');
    }

    onUserSignedOut() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        this.showLoginForm();
        
        // Clear local data
        this.cards = [];
        this.sessionStats = {
            today: 0,
            total: 0,
            streak: 0,
            lastStudyDate: null,
            totalStudyTime: 0,
            averageAccuracy: 0
        };
        this.updateUI();
    }

    updateUserInfo() {
        if (!this.user) return;

        const displayName = this.user.displayName || 'User';
        const email = this.user.email || '';

        document.getElementById('userName').textContent = displayName.split(' ')[0];
        document.getElementById('dropdownUserName').textContent = displayName;
        document.getElementById('dropdownUserEmail').textContent = email;
    }

    // Data Management (Enhanced with user-specific storage)
    loadData() {
        if (!this.user) return;

        const userKey = `flashcards_${this.user.uid}`;
        const statsKey = `stats_${this.user.uid}`;
        const settingsKey = `settings_${this.user.uid}`;
        const achievementsKey = `achievements_${this.user.uid}`;

        const savedCards = localStorage.getItem(userKey);
        const savedStats = localStorage.getItem(statsKey);
        const savedSettings = localStorage.getItem(settingsKey);
        const savedAchievements = localStorage.getItem(achievementsKey);

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

        this.updateStreak();
    }

    saveData() {
        if (!this.user) return;

        const userKey = `flashcards_${this.user.uid}`;
        const statsKey = `stats_${this.user.uid}`;
        const settingsKey = `settings_${this.user.uid}`;
        const achievementsKey = `achievements_${this.user.uid}`;

        localStorage.setItem(userKey, JSON.stringify(this.cards));
        localStorage.setItem(statsKey, JSON.stringify(this.sessionStats));
        localStorage.setItem(settingsKey, JSON.stringify(this.settings));
        localStorage.setItem(achievementsKey, JSON.stringify(this.achievements));
    }

    loadUserData() {
        this.loadData();
        this.updateUI();
        this.loadSampleCards();
        this.checkAchievements();
    }

    syncData() {
        // Simulate cloud sync
        this.showSyncStatus('syncing');
        setTimeout(() => {
            this.saveData();
            this.showSyncStatus('synced');
            this.showNotification('Data synced successfully! ☁️', 'success');
        }, 1000);
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

    // UI Helper Methods
    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('authTitle').textContent = 'Welcome Back';
        document.getElementById('authSubtitle').textContent = 'Sign in to continue your learning journey';
    }

    showSignupForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('authTitle').textContent = 'Join Smart Flashcards';
        document.getElementById('authSubtitle').textContent = 'Create your free account to get started';
    }

    showAuthLoading(show) {
        document.getElementById('loginForm').style.display = show ? 'none' : (document.getElementById('signupForm').style.display === 'block' ? 'none' : 'block');
        document.getElementById('signupForm').style.display = show ? 'none' : (document.getElementById('loginForm').style.display === 'block' ? 'none' : 'block');
        document.getElementById('authLoading').style.display = show ? 'block' : 'none';
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    showProfile() {
        this.showNotification('Profile settings coming soon! 👤', 'info');
        document.getElementById('userDropdown').style.display = 'none';
    }

    showUpgrade() {
        this.showNotification('Premium features coming soon! 👑', 'info');
        document.getElementById('userDropdown').style.display = 'none';
    }

    showSyncStatus(status) {
        let existingStatus = document.querySelector('.sync-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = `sync-status ${status}`;
        
        let icon, text;
        switch (status) {
            case 'syncing':
                icon = 'fas fa-sync-alt';
                text = 'Syncing...';
                break;
            case 'synced':
                icon = 'fas fa-cloud-upload-alt';
                text = 'Synced';
                break;
            case 'error':
                icon = 'fas fa-exclamation-triangle';
                text = 'Sync Error';
                break;
        }

        statusDiv.innerHTML = `<i class="${icon}"></i> ${text}`;
        document.body.appendChild(statusDiv);

        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    // PWA Setup
    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallPrompt();
        });

        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        if (action === 'study') {
            setTimeout(() => this.startStudySession(), 1000);
        } else if (action === 'add') {
            setTimeout(() => this.showAddCardMode(), 1000);
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

        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
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

    // Enhanced Card Management
    async handleAddCard(e) {
        e.preventDefault();
        
        const frontText = document.getElementById('frontTextInput').value.trim();
        const backText = document.getElementById('backTextInput').value.trim();
        const frontLang = document.getElementById('frontLanguageSelect').value;
        const backLang = document.getElementById('backLanguageSelect').value;
        const example = document.getElementById('exampleInput').value.trim();
        const categorySelect = document.getElementById('categorySelect');
        const categoryInput = document.getElementById('categoryInput');
        const category = categorySelect.value === 'custom' ? categoryInput.value.trim() : categorySelect.value || 'General';
        const image = this.currentImageData;

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
        this.checkAchievements();
    }

    // Study Session Management
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
        if (this.sessionStats.lastStudyDate === today) {
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

    // Spaced Repetition Algorithm
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

    // Audio functionality
    playAudio(side) {
        const text = side === 'front' ? this.currentCard.frontText : this.currentCard.backText;
        const lang = side === 'front' ? this.currentCard.frontLang : this.currentCard.backLang;
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getSpeechLang(lang);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            const voices = speechSynthesis.getVoices();
            const nativeVoice = voices.find(voice => voice.lang.startsWith(lang));
            if (nativeVoice) {
                utterance.voice = nativeVoice;
            }
            
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

    // Image handling
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
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

    // Translation
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

    // UI Management
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

    // Achievements System
    checkAchievements() {
        const newAchievements = [];

        if (this.cards.length >= 1 && !this.achievements.includes('first_card')) {
            newAchievements.push({
                id: 'first_card',
                title: 'Getting Started! 🌱',
                description: 'Added your first flashcard'
            });
        }

        if (this.sessionStats.streak >= 7 && !this.achievements.includes('week_streak')) {
            newAchievements.push({
                id: 'week_streak',
                title: 'Week Warrior! 🔥',
                description: '7-day study streak'
            });
        }

        if (this.cards.length >= 50 && !this.achievements.includes('collector')) {
            newAchievements.push({
                id: 'collector',
                title: 'Card Collector! 📚',
                description: 'Created 50 flashcards'
            });
        }

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

    // Placeholder methods for features
    setupSwipeGestures() {
        // Mobile swipe implementation
    }

    setupKeyboardShortcuts() {
        // Keyboard shortcuts implementation
    }

    setupVoiceRecognition() {
        // Voice recognition implementation
    }

    setupNotifications() {
        // Notification setup implementation
    }

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

// Initialize the local auth app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new LocalAuthFlashcardApp();
});

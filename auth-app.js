// Smart Flashcard App with Firebase Authentication
class AuthenticatedFlashcardApp {
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
        this.swipeHandler = null;
        this.voiceRecognition = null;
        this.installPrompt = null;
        
        this.initFirebase();
    }

    // Firebase Configuration and Initialization
    initFirebase() {
        // Firebase configuration - Replace with your actual config
        const firebaseConfig = {
            apiKey: "demo-api-key",
            authDomain: "smart-flashcards-demo.firebaseapp.com",
            projectId: "smart-flashcards-demo",
            storageBucket: "smart-flashcards-demo.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456"
        };

        // Initialize Firebase (using compatibility mode)
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.auth = firebase.auth();
        this.db = firebase.firestore();

        // Set up auth state listener
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.onUserSignedIn();
            } else {
                this.user = null;
                this.onUserSignedOut();
            }
        });

        this.init();
    }

    init() {
        this.bindAuthEvents();
        this.setupPWA();
        this.bindEvents();
        this.setupSwipeGestures();
        this.setupKeyboardShortcuts();
        this.setupVoiceRecognition();
        this.setupNotifications();
        this.applyTheme();
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

    // Authentication Methods
    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showAuthLoading(true);

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            this.showNotification('Welcome back! 🎉', 'success');
        } catch (error) {
            this.showNotification(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showAuthLoading(false);
        }
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

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            await this.db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                plan: 'free',
                settings: this.settings,
                stats: this.sessionStats
            });

            this.showNotification('Account created successfully! Welcome! 🎉', 'success');
        } catch (error) {
            this.showNotification(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showAuthLoading(false);
        }
    }

    async signInWithGoogle() {
        this.showAuthLoading(true);

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            
            // Check if this is a new user
            if (result.additionalUserInfo.isNewUser) {
                // Create user document for new Google users
                await this.db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    plan: 'free',
                    settings: this.settings,
                    stats: this.sessionStats
                });
            }

            this.showNotification('Welcome! 🎉', 'success');
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                this.showNotification(this.getAuthErrorMessage(error.code), 'error');
            }
        } finally {
            this.showAuthLoading(false);
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            this.showNotification('Signed out successfully', 'success');
        } catch (error) {
            this.showNotification('Error signing out', 'error');
        }
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

    // Data Synchronization
    async loadUserData() {
        if (!this.user) return;

        this.showSyncStatus('syncing');

        try {
            // Load user settings and stats
            const userDoc = await this.db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.settings = { ...this.settings, ...userData.settings };
                this.sessionStats = { ...this.sessionStats, ...userData.stats };
            }

            // Load flashcards
            const cardsSnapshot = await this.db.collection('users').doc(this.user.uid)
                .collection('flashcards').orderBy('created', 'desc').get();
            
            this.cards = cardsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load achievements
            const achievementsSnapshot = await this.db.collection('users').doc(this.user.uid)
                .collection('achievements').get();
            
            this.achievements = achievementsSnapshot.docs.map(doc => doc.data().id);

            this.updateUI();
            this.applyTheme();
            this.loadSampleCards();
            this.showSyncStatus('synced');
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showSyncStatus('error');
            this.showNotification('Error loading your data', 'error');
        }
    }

    async syncData() {
        if (!this.user) return;

        this.showSyncStatus('syncing');

        try {
            // Update user settings and stats
            await this.db.collection('users').doc(this.user.uid).update({
                settings: this.settings,
                stats: this.sessionStats,
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Sync flashcards (batch write for efficiency)
            const batch = this.db.batch();
            const cardsRef = this.db.collection('users').doc(this.user.uid).collection('flashcards');

            this.cards.forEach(card => {
                const cardRef = cardsRef.doc(card.id.toString());
                batch.set(cardRef, {
                    ...card,
                    lastModified: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            this.showSyncStatus('synced');
            this.showNotification('Data synced successfully! ☁️', 'success');
        } catch (error) {
            console.error('Error syncing data:', error);
            this.showSyncStatus('error');
            this.showNotification('Error syncing data', 'error');
        }
    }

    // Enhanced Card Management with Cloud Sync
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
        this.updateStats();
        this.updateCategoryOptions();

        // Sync to cloud if user is authenticated
        if (this.user) {
            try {
                await this.db.collection('users').doc(this.user.uid)
                    .collection('flashcards').doc(newCard.id.toString()).set(newCard);
            } catch (error) {
                console.error('Error saving card to cloud:', error);
            }
        }

        // Reset form
        document.getElementById('addCardForm').reset();
        this.removeImage();
        
        this.showNotification('Card added successfully! 🎉', 'success');
        this.showStudyMode();
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
        document.getElementById('loginForm').style.display = show ? 'none' : 'block';
        document.getElementById('signupForm').style.display = 'none';
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

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again';
    }

    // Include all the original enhanced features from the previous app
    // (Copy all methods from the EnhancedFlashcardApp class)
    
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
                    
                    // Sync settings to cloud if user is authenticated
                    if (this.user) {
                        this.syncData();
                    }
                });
            }
        });
    }

    // Include all other methods from EnhancedFlashcardApp...
    // (For brevity, I'm including key methods. The full implementation would include all methods)

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
                }
            ];
            this.cards = sampleCards;
            
            // Sync sample cards to cloud if user is authenticated
            if (this.user) {
                this.syncData();
            }
        }
    }

    // Dark Mode
    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applyTheme();
        
        const icon = document.querySelector('#darkModeToggle i');
        icon.className = this.settings.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showNotification(
            `${this.settings.darkMode ? 'Dark' : 'Light'} mode enabled`,
            'success'
        );

        // Sync settings to cloud if user is authenticated
        if (this.user) {
            this.syncData();
        }
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

    // Placeholder methods for features to be implemented
    setupSwipeGestures() {
        // Implementation from original enhanced app
    }

    setupKeyboardShortcuts() {
        // Implementation from original enhanced app
    }

    setupVoiceRecognition() {
        // Implementation from original enhanced app
    }

    setupNotifications() {
        // Implementation from original enhanced app
    }

    startStudySession() {
        // Implementation from original enhanced app
    }

    showAnswer() {
        // Implementation from original enhanced app
    }

    rateCard(quality) {
        // Implementation from original enhanced app
        // Plus sync to cloud
        if (this.user) {
            this.syncData();
        }
    }

    playAudio(side) {
        // Implementation from original enhanced app
    }

    handleImageUpload(e) {
        // Implementation from original enhanced app
    }

    removeImage() {
        // Implementation from original enhanced app
    }

    handleCategoryChange(e) {
        // Implementation from original enhanced app
    }

    async translateText() {
        // Implementation from original enhanced app
    }

    exportData() {
        // Implementation from original enhanced app
    }

    importData() {
        // Implementation from original enhanced app
    }

    handleImportFile(e) {
        // Implementation from original enhanced app
    }
}

// Initialize the authenticated app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new AuthenticatedFlashcardApp();
});

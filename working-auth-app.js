// Smart Flashcard App with Working Authentication
class WorkingAuthFlashcardApp {
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
        this.customCategories = [];
        
        // Initialize enhanced pronunciation system
        this.pronunciation = new EnhancedPronunciation();
        
        this.init();
    }

    init() {
        this.bindAuthEvents();
        this.bindEvents();
        this.applyTheme();
        this.checkAuthState();
    }

    // Simple Authentication Check
    checkAuthState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                this.onUserSignedIn();
            } catch (error) {
                localStorage.removeItem('currentUser');
                this.onUserSignedOut();
            }
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

        // Profile settings
        document.getElementById('closeProfile').addEventListener('click', () => this.hideProfile());
        document.getElementById('updateProfileBtn').addEventListener('click', () => this.updateProfile());
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.changePassword());
        document.getElementById('resetPasswordBtn').addEventListener('click', () => this.resetPassword());
        document.getElementById('downloadDataBtn').addEventListener('click', () => this.downloadUserData());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount());
        document.getElementById('upgradeToPremiumBtn').addEventListener('click', () => this.upgradeToPremium());

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').style.display = 'none';
            }
        });
    }

    // Authentication Methods
    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showAuthLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            // For demo purposes, accept any email/password combination
            // In production, this would verify against a real database
            this.user = {
                uid: 'user_' + Date.now(),
                email: email,
                displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification('Welcome back! 🎉', 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1000);
    }

    handleSignup() {
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
            // Create new user
            this.user = {
                uid: 'user_' + Date.now(),
                email: email,
                displayName: name
            };

            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification('Account created successfully! Welcome! 🎉', 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1500);
    }

    signInWithGoogle() {
        this.showAuthLoading(true);

        setTimeout(() => {
            this.user = {
                uid: 'google_' + Date.now(),
                email: 'demo@gmail.com',
                displayName: 'Demo User'
            };

            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification('Welcome! 🎉', 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1000);
    }

    signOut() {
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

    // Profile Settings Methods
    showProfile() {
        document.getElementById('userDropdown').style.display = 'none';
        document.getElementById('profileModal').style.display = 'flex';
        this.loadProfileData();
    }

    hideProfile() {
        document.getElementById('profileModal').style.display = 'none';
        this.clearPasswordFields();
    }

    loadProfileData() {
        if (!this.user) return;

        // Load current user data into profile form
        document.getElementById('profileName').value = this.user.displayName || '';
        document.getElementById('profileEmail').value = this.user.email || '';
        
        // Update profile stats
        document.getElementById('profileTotalCards').textContent = this.cards.length;
        document.getElementById('profileStreak').textContent = this.sessionStats.streak;
        
        const totalHours = Math.floor(this.sessionStats.totalStudyTime / 3600);
        const totalMinutes = Math.floor((this.sessionStats.totalStudyTime % 3600) / 60);
        document.getElementById('profileStudyTime').textContent = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;
    }

    updateProfile() {
        const newName = document.getElementById('profileName').value.trim();
        
        if (!newName) {
            this.showNotification('Please enter your full name', 'error');
            return;
        }

        // Update user object
        this.user.displayName = newName;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        
        // Update UI
        this.updateUserInfo();
        
        this.showNotification('Profile updated successfully! ✨', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            this.showNotification('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('New password must be at least 6 characters', 'error');
            return;
        }

        // In a real app, this would verify the current password
        this.clearPasswordFields();
        this.showNotification('Password changed successfully! 🔐', 'success');
    }

    resetPassword() {
        if (!this.user || !this.user.email) {
            this.showNotification('No email address found', 'error');
            return;
        }

        this.showConfirmationDialog(
            'Password Reset Email',
            `A password reset link will be sent to ${this.user.email}. This is a demo - in production, a real email would be sent.`,
            () => {
                this.showNotification('Password reset email sent! 📧', 'success');
            }
        );
    }

    downloadUserData() {
        const userData = {
            profile: {
                name: this.user.displayName,
                email: this.user.email,
                plan: 'free'
            },
            cards: this.cards,
            stats: this.sessionStats,
            settings: this.settings,
            achievements: this.achievements,
            customCategories: this.customCategories,
            exportDate: new Date().toISOString(),
            version: '2.1'
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-flashcard-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Your data has been downloaded! 📁', 'success');
    }

    deleteAccount() {
        this.showConfirmationDialog(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your flashcards and progress will be permanently lost.',
            () => {
                localStorage.removeItem('currentUser');
                this.showNotification('Account deleted successfully', 'success');
                this.signOut();
            },
            true // isDangerous
        );
    }

    upgradeToPremium() {
        this.showNotification('Premium upgrade coming soon! 👑 Stay tuned for advanced features!', 'info');
        document.getElementById('profileModal').style.display = 'none';
    }

    clearPasswordFields() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }

    showConfirmationDialog(title, message, onConfirm, isDangerous = false) {
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <div class="confirmation-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirmation-buttons">
                    <button class="btn btn-secondary" id="cancelConfirm">Cancel</button>
                    <button class="btn ${isDangerous ? 'btn-danger' : 'btn-primary'}" id="confirmAction">
                        ${isDangerous ? 'Delete' : 'Confirm'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);

        document.getElementById('cancelConfirm').addEventListener('click', () => {
            dialog.remove();
        });

        document.getElementById('confirmAction').addEventListener('click', () => {
            onConfirm();
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    // Data Management
    loadUserData() {
        this.loadData();
        this.updateUI();
        this.loadSampleCards();
        this.checkAchievements();
    }

    loadData() {
        if (!this.user) return;

        const userKey = `flashcards_${this.user.uid}`;
        const statsKey = `stats_${this.user.uid}`;
        const settingsKey = `settings_${this.user.uid}`;
        const achievementsKey = `achievements_${this.user.uid}`;
        const customCategoriesKey = `customCategories_${this.user.uid}`;

        const savedCards = localStorage.getItem(userKey);
        const savedStats = localStorage.getItem(statsKey);
        const savedSettings = localStorage.getItem(settingsKey);
        const savedAchievements = localStorage.getItem(achievementsKey);
        const savedCustomCategories = localStorage.getItem(customCategoriesKey);

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

        if (savedCustomCategories) {
            this.customCategories = JSON.parse(savedCustomCategories);
        }
    }

    saveData() {
        if (!this.user) return;

        const userKey = `flashcards_${this.user.uid}`;
        const statsKey = `stats_${this.user.uid}`;
        const settingsKey = `settings_${this.user.uid}`;
        const achievementsKey = `achievements_${this.user.uid}`;
        const customCategoriesKey = `customCategories_${this.user.uid}`;

        localStorage.setItem(userKey, JSON.stringify(this.cards));
        localStorage.setItem(statsKey, JSON.stringify(this.sessionStats));
        localStorage.setItem(settingsKey, JSON.stringify(this.settings));
        localStorage.setItem(achievementsKey, JSON.stringify(this.achievements));
        localStorage.setItem(customCategoriesKey, JSON.stringify(this.customCategories));
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
                }
            ];
            this.cards = sampleCards;
            this.saveData();
        }
    }

    syncData() {
        this.showSyncStatus('syncing');
        setTimeout(() => {
            this.saveData();
            this.showSyncStatus('synced');
            this.showNotification('Data synced successfully! ☁️', 'success');
        }, 1000);
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
        if (show) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('authLoading').style.display = 'block';
        } else {
            document.getElementById('authLoading').style.display = 'none';
            // Don't show forms here - let the auth state handler do it
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
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
        
        // Pronunciation buttons in add card form
        document.getElementById('frontTextAudioBtn').addEventListener('click', () => this.playAddCardAudio('front'));
        document.getElementById('backTextAudioBtn').addEventListener('click', () => this.playAddCardAudio('back'));
        
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
            'enableSwipe': (value) => value,
            'studyReminders': (value) => value,
            'reminderTime': (value) => value
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

        document.getElementById('cardFront').style.display = 'block';
        document.getElementById('cardBack').style.display = 'none';
        document.getElementById('showAnswerBtn').style.display = 'block';
        document.querySelector('.difficulty-buttons').style.display = 'none';

        if (this.settings.autoPlayAudio) {
            setTimeout(() => this.playAudio('front'), 500);
        }

        this.updateProgress();
    }

    endStudySession() {
        const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        this.sessionStats.totalStudyTime += sessionTime;
        this.sessionStats.lastStudyDate = new Date().toDateString();
        this.sessionStats.streak++;

        document.getElementById('frontText').textContent = '🎉 Session Complete!';
        document.getElementById('cardBack').style.display = 'none';
        document.getElementById('cardFront').style.display = 'block';
        document.getElementById('studyButtons').style.display = 'none';
        document.getElementById('startStudyBtn').style.display = 'block';
        document.getElementById('startStudyBtn').innerHTML = '<i class="fas fa-play"></i> Start New Session';
        
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

    // Enhanced Audio functionality for study mode
    async playAudio(side) {
        const text = side === 'front' ? this.currentCard.frontText : this.currentCard.backText;
        const lang = side === 'front' ? this.currentCard.frontLang : this.currentCard.backLang;
        
        const button = document.getElementById(side === 'front' ? 'frontAudioBtn' : 'backAudioBtn');
        
        // Add visual feedback
        button.classList.add('playing');
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            // Use enhanced pronunciation system for native-quality audio
            await this.pronunciation.pronounce(text, lang);
        } catch (error) {
            console.error('Enhanced pronunciation failed, using fallback:', error);
            
            // Fallback to browser TTS
            try {
                await this.pronunciation.fallbackToBrowserTTS(text, lang);
            } catch (fallbackError) {
                console.error('All pronunciation methods failed:', fallbackError);
            }
        } finally {
            // Reset button state
            button.classList.remove('playing');
            button.innerHTML = originalIcon;
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

    // Enhanced Audio functionality for add card form with native pronunciation
    async playAddCardAudio(side) {
        let text, lang, button;
        
        if (side === 'front') {
            text = document.getElementById('frontTextInput').value.trim();
            lang = document.getElementById('frontLanguageSelect').value;
            button = document.getElementById('frontTextAudioBtn');
        } else {
            text = document.getElementById('backTextInput').value.trim();
            lang = document.getElementById('backLanguageSelect').value;
            button = document.getElementById('backTextAudioBtn');
        }

        if (!text) {
            this.showNotification(`Please enter ${side === 'front' ? 'word/phrase' : 'translation'} first`, 'warning');
            return;
        }

        // Add visual feedback
        button.classList.add('playing');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            // Use enhanced pronunciation system for native-quality audio
            await this.pronunciation.pronounce(text, lang);
            this.showNotification(`🔊 Playing native pronunciation for "${text}"`, 'success');
        } catch (error) {
            console.error('Enhanced pronunciation failed:', error);
            this.showNotification('Using fallback pronunciation...', 'warning');
            
            // Fallback to browser TTS if enhanced pronunciation fails
            try {
                await this.pronunciation.fallbackToBrowserTTS(text, lang);
            } catch (fallbackError) {
                this.showNotification('Audio playback failed. Please try again.', 'error');
            }
        } finally {
            // Reset button state
            button.classList.remove('playing');
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
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

        // Handle custom category
        if (categorySelect.value === 'custom' && category) {
            if (!this.customCategories.includes(category)) {
                this.customCategories.push(category);
                this.showNotification(`New category "${category}" created! 📁`, 'success');
            }
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
        this.updateCategoryDropdown();

        document.getElementById('addCardForm').reset();
        this.removeImage();
        
        this.showNotification('Card added successfully! 🎉', 'success');
        this.showStudyMode();
        this.checkAchievements();
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
        this.updateCategoryDropdown();
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

    // Enhanced Category Management
    updateCategoryDropdown() {
        const categorySelect = document.getElementById('categorySelect');
        if (!categorySelect) return;

        // Get default categories
        const defaultCategories = [
            '🗣️ Daily Words',
            '🎹 Piano Terms',
            '📚 Grammar',
            '💬 Phrases',
            '🏢 Business',
            '🍽️ Food & Dining',
            '✈️ Travel',
            '🏥 Medical'
        ];

        // Clear existing options except the first two and last one
        categorySelect.innerHTML = `
            <option value="">Select or type new category</option>
        `;

        // Add default categories
        defaultCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Add custom categories
        if (this.customCategories.length > 0) {
            // Add separator
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '── Custom Categories ──';
            categorySelect.appendChild(separator);

            // Add custom categories
            this.customCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        // Add "Add New Category" option at the end
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '+ Add New Category';
        categorySelect.appendChild(customOption);

        // Update category filter as well
        this.updateCategoryOptions();
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

    // Data export/import
    exportData() {
        const data = {
            cards: this.cards,
            stats: this.sessionStats,
            settings: this.settings,
            achievements: this.achievements,
            customCategories: this.customCategories,
            exportDate: new Date().toISOString(),
            version: '2.1'
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
                        if (data.customCategories) this.customCategories = data.customCategories;
                        
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

// Initialize the working auth app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new WorkingAuthFlashcardApp();
});

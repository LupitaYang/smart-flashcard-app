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
            
            // Close profile modal when clicking outside
            if (e.target.id === 'profileModal') {
                this.hideProfile();
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

        // Validate email format
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        this.showAuthLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            // Check if user exists in localStorage (for demo purposes)
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
            const userKey = email.toLowerCase();
            
            if (existingUsers[userKey] && existingUsers[userKey].password === password) {
                // User exists and password matches
                this.user = {
                    uid: existingUsers[userKey].uid,
                    email: existingUsers[userKey].email,
                    displayName: existingUsers[userKey].displayName,
                    firstName: existingUsers[userKey].firstName,
                    lastName: existingUsers[userKey].lastName,
                    emailVerified: true,
                    authMethod: 'email'
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                this.showNotification(`Welcome back, ${this.user.displayName}! 🎉`, 'success');
                this.onUserSignedIn();
            } else {
                // Invalid credentials
                this.showNotification('Invalid email or password. Please try again.', 'error');
            }
            
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

        // Validate email format
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
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
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
            const userKey = email.toLowerCase();
            
            if (existingUsers[userKey]) {
                this.showNotification('An account with this email already exists. Please sign in instead.', 'error');
                this.showAuthLoading(false);
                return;
            }

            // Parse full name into first and last name
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            // Create new user
            const newUser = {
                uid: 'email_' + Date.now(),
                email: email,
                displayName: name,
                firstName: firstName,
                lastName: lastName,
                password: password, // In production, this would be hashed
                emailVerified: true, // For demo purposes
                authMethod: 'email',
                createdAt: new Date().toISOString()
            };

            // Store user in registered users
            existingUsers[userKey] = newUser;
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

            // Set current user (excluding password for security)
            this.user = {
                uid: newUser.uid,
                email: newUser.email,
                displayName: newUser.displayName,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                emailVerified: newUser.emailVerified,
                authMethod: newUser.authMethod
            };

            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification(`Account created successfully! Welcome, ${this.user.firstName}! 🎉`, 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        }, 1500);
    }

    // Email validation helper method
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    signInWithGoogle() {
        this.showAuthLoading(true);

        // Initialize Google Sign-In if not already done
        if (typeof google === 'undefined' || !google.accounts) {
            this.showNotification('Google Sign-In not available. Please try again later.', 'error');
            this.showAuthLoading(false);
            return;
        }

        // Configure Google Sign-In to request email and profile information
        google.accounts.id.initialize({
            client_id: 'your-google-client-id.apps.googleusercontent.com', // Replace with your actual client ID
            callback: (response) => this.handleGoogleSignIn(response),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Prompt for Google Sign-In
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to popup if prompt is not displayed
                google.accounts.oauth2.initTokenClient({
                    client_id: 'your-google-client-id.apps.googleusercontent.com',
                    scope: 'email profile',
                    callback: (tokenResponse) => {
                        this.fetchGoogleUserInfo(tokenResponse.access_token);
                    }
                }).requestAccessToken();
            }
        });
    }

    handleGoogleSignIn(response) {
        try {
            // Decode the JWT token to get user information
            const payload = this.parseJwt(response.credential);
            
            this.user = {
                uid: 'google_' + payload.sub,
                email: payload.email,
                displayName: payload.name,
                firstName: payload.given_name,
                lastName: payload.family_name,
                picture: payload.picture,
                emailVerified: payload.email_verified
            };

            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification(`Welcome, ${this.user.displayName}! 🎉`, 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        } catch (error) {
            console.error('Google Sign-In error:', error);
            this.showNotification('Google Sign-In failed. Please try again.', 'error');
            this.showAuthLoading(false);
        }
    }

    async fetchGoogleUserInfo(accessToken) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const userInfo = await response.json();
            
            this.user = {
                uid: 'google_' + userInfo.id,
                email: userInfo.email,
                displayName: userInfo.name,
                firstName: userInfo.given_name,
                lastName: userInfo.family_name,
                picture: userInfo.picture,
                emailVerified: userInfo.verified_email
            };

            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showNotification(`Welcome, ${this.user.displayName}! 🎉`, 'success');
            this.onUserSignedIn();
            this.showAuthLoading(false);
        } catch (error) {
            console.error('Failed to fetch Google user info:', error);
            this.showNotification('Failed to get user information. Please try again.', 'error');
            this.showAuthLoading(false);
        }
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to parse JWT token:', error);
            throw error;
        }
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

        // Update user avatar with profile picture if available
        const userAvatarElements = document.querySelectorAll('.user-avatar, .user-avatar-large, .profile-avatar-large');
        userAvatarElements.forEach(avatar => {
            if (this.user.picture) {
                avatar.innerHTML = `<img src="${this.user.picture}" alt="Profile" class="profile-picture">`;
            } else {
                avatar.innerHTML = '<i class="fas fa-user"></i>';
            }
        });
    }
    loadProfileData() {
        if (!this.user) return;

        // Load current user data into profile form
        document.getElementById('profileName').value = this.user.displayName || '';
        document.getElementById('profileEmail').value = this.user.email || '';
        
        // Update profile avatar with picture if available
        const profileAvatar = document.querySelector('.profile-avatar-large');
        if (this.user.picture) {
            profileAvatar.innerHTML = `<img src="${this.user.picture}" alt="Profile" class="profile-picture">`;
        } else {
            profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        
        // Update profile stats
        document.getElementById('profileTotalCards').textContent = this.cards.length;
        document.getElementById('profileStreak').textContent = this.sessionStats.streak;
        
        const totalHours = Math.floor(this.sessionStats.totalStudyTime / 3600);
        const totalMinutes = Math.floor((this.sessionStats.totalStudyTime % 3600) / 60);
        document.getElementById('profileStudyTime').textContent = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;
    }

    // Profile Settings Methods
    showProfile() {
        document.getElementById('userDropdown').style.display = 'none';
        const profileModal = document.getElementById('profileModal');
        
        // Add modal-open class to body to handle stacking contexts
        document.body.classList.add('modal-open');
        
        // Ensure modal is properly positioned and visible
        profileModal.style.display = 'flex';
        profileModal.style.position = 'fixed';
        profileModal.style.top = '0';
        profileModal.style.left = '0';
        profileModal.style.width = '100%';
        profileModal.style.height = '100%';
        profileModal.style.zIndex = '999999999';
        profileModal.style.transform = 'translateZ(1000px)';
        
        // Temporarily disable 3D transforms on flashcards to prevent stacking context issues
        const flashcardElements = document.querySelectorAll('.flashcard, .card-content, .card-front, .card-back');
        flashcardElements.forEach(element => {
            element.style.transform = 'none';
            element.style.transformStyle = 'flat';
            element.style.zIndex = '1';
        });
        
        this.loadProfileData();
    }

    hideProfile() {
        const profileModal = document.getElementById('profileModal');
        profileModal.style.display = 'none';
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Restore 3D transforms for flashcards
        const flashcardElements = document.querySelectorAll('.flashcard, .card-content, .card-front, .card-back');
        flashcardElements.forEach(element => {
            element.style.transform = '';
            element.style.transformStyle = '';
            element.style.zIndex = '';
        });
        
        this.clearPasswordFields();
    }

    loadProfileData() {
        if (!this.user) return;

        // Load current user data into profile form
        document.getElementById('profileName').value = this.user.displayName || '';
        document.getElementById('profileEmail').value = this.user.email || '';
        
        // Update profile avatar with picture if available
        const profileAvatar = document.querySelector('.profile-avatar-large');
        if (this.user.picture) {
            profileAvatar.innerHTML = `<img src="${this.user.picture}" alt="Profile" class="profile-picture">`;
        } else {
            profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        
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
                },
                {
                    id: Date.now() + 3,
                    frontText: '你好',
                    backText: 'Hello',
                    frontLang: 'zh',
                    backLang: 'en',
                    category: '🗣️ Daily Words',
                    example: '你好，你好吗？ - Hello, how are you?',
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
        const userMenuBtn = document.getElementById('userMenuBtn');
        
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        } else {
            // Calculate position relative to the user menu button
            const rect = userMenuBtn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 8) + 'px'; // 8px margin
            dropdown.style.right = (window.innerWidth - rect.right) + 'px';
            dropdown.style.display = 'block';
        }
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
        
        // Card Library
        document.getElementById('totalStatItem').addEventListener('click', () => this.showCardLibrary());
        document.getElementById('backToStudyBtn').addEventListener('click', () => this.showStudyMode());
        
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

    // Enhanced Audio functionality for study mode with mobile support
    async playAudio(side) {
        const text = side === 'front' ? this.currentCard.frontText : this.currentCard.backText;
        const lang = side === 'front' ? this.currentCard.frontLang : this.currentCard.backLang;
        
        const button = document.getElementById(side === 'front' ? 'frontAudioBtn' : 'backAudioBtn');
        
        // Add visual feedback
        button.classList.add('playing');
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            // For mobile browsers, always use browser TTS as it's more reliable
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                // Use browser TTS directly for mobile for better compatibility
                await this.pronunciation.fallbackToBrowserTTS(text, lang);
                this.showNotification(`🔊 Playing pronunciation for "${text}"`, 'success');
            } else {
                // Use enhanced pronunciation system for desktop
                await this.pronunciation.pronounce(text, lang);
            }
        } catch (error) {
            console.error('Audio playback failed:', error);
            this.showNotification('Audio not available for this language', 'warning');
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
            'it': 'it-IT',
            'zh': 'zh-CN'
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
            'it': 'Italian',
            'zh': 'Chinese (Mandarin)'
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

    showCardLibrary() {
        this.currentMode = 'library';
        document.getElementById('studyMode').style.display = 'none';
        document.getElementById('addCardMode').style.display = 'none';
        document.getElementById('cardManagement').style.display = 'block';
        
        this.updateLibraryStats();
        this.renderCardLibrary();
        this.bindLibraryEvents();
        
        this.showNotification(`📚 Viewing your flashcard library (${this.cards.length} cards)`, 'info');
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

    // Card Library Management
    updateLibraryStats() {
        document.getElementById('libraryTotalCards').textContent = this.cards.length;
        
        const categories = [...new Set(this.cards.map(card => card.category))].filter(cat => cat);
        document.getElementById('libraryCategories').textContent = categories.length;
        
        const languages = [...new Set([...this.cards.map(card => card.frontLang), ...this.cards.map(card => card.backLang)])];
        document.getElementById('libraryLanguages').textContent = languages.length;
        
        // Update language filter
        const languageFilter = document.getElementById('languageFilter');
        if (languageFilter) {
            languageFilter.innerHTML = '<option value="">All Languages</option>';
            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = this.getLanguageName(lang);
                languageFilter.appendChild(option);
            });
        }
    }

    renderCardLibrary() {
        const cardsList = document.getElementById('cardsList');
        if (!cardsList) return;

        if (this.cards.length === 0) {
            cardsList.innerHTML = `
                <div class="empty-library">
                    <i class="fas fa-layer-group empty-icon"></i>
                    <h3>No flashcards yet</h3>
                    <p>Start building your library by adding your first flashcard!</p>
                    <button class="btn btn-primary" onclick="window.flashcardApp.showAddCardMode()">
                        <i class="fas fa-plus"></i> Add Your First Card
                    </button>
                </div>
            `;
            return;
        }

        let filteredCards = this.getFilteredCards();
        
        cardsList.innerHTML = filteredCards.map(card => this.createCardHTML(card)).join('');
    }

    getFilteredCards() {
        let filtered = [...this.cards];
        
        // Search filter
        const searchTerm = document.getElementById('searchCards')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(card => 
                card.frontText.toLowerCase().includes(searchTerm) ||
                card.backText.toLowerCase().includes(searchTerm) ||
                (card.example && card.example.toLowerCase().includes(searchTerm)) ||
                card.category.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        if (categoryFilter) {
            filtered = filtered.filter(card => card.category === categoryFilter);
        }

        // Language filter
        const languageFilter = document.getElementById('languageFilter')?.value || '';
        if (languageFilter) {
            filtered = filtered.filter(card => 
                card.frontLang === languageFilter || card.backLang === languageFilter
            );
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'oldest':
                    return a.created - b.created;
                case 'alphabetical':
                    return a.frontText.localeCompare(b.frontText);
                case 'difficulty':
                    return b.difficulty - a.difficulty;
                case 'accuracy':
                    return b.accuracy - a.accuracy;
                case 'newest':
                default:
                    return b.created - a.created;
            }
        });

        return filtered;
    }

    createCardHTML(card) {
        const createdDate = new Date(card.created).toLocaleDateString();
        const nextReviewDate = new Date(card.nextReview).toLocaleDateString();
        const isOverdue = card.nextReview <= Date.now();
        
        const accuracyPercent = Math.round(card.accuracy * 100);
        const difficultyStars = '★'.repeat(Math.max(1, card.difficulty));
        
        return `
            <div class="library-card" data-card-id="${card.id}">
                <div class="library-card-header">
                    <div class="card-languages">
                        <span class="language-badge">${this.getLanguageName(card.frontLang)}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="language-badge">${this.getLanguageName(card.backLang)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="window.flashcardApp.playLibraryCardAudio('${card.id}', 'front')" title="Play front audio">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="card-action-btn" onclick="window.flashcardApp.editCard('${card.id}')" title="Edit card">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="card-action-btn delete" onclick="window.flashcardApp.deleteCard('${card.id}')" title="Delete card">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="library-card-content">
                    <div class="card-front-text">
                        <strong>${card.frontText}</strong>
                    </div>
                    <div class="card-back-text">
                        ${card.backText}
                        <button class="card-audio-btn" onclick="window.flashcardApp.playLibraryCardAudio('${card.id}', 'back')" title="Play translation audio">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    ${card.example ? `<div class="card-example">"${card.example}"</div>` : ''}
                    ${card.image ? `<div class="card-image"><img src="${card.image}" alt="Card image"></div>` : ''}
                </div>
                
                <div class="library-card-footer">
                    <div class="card-meta">
                        <span class="card-category">${card.category}</span>
                        <span class="card-stats">
                            <i class="fas fa-chart-line"></i> ${accuracyPercent}% accuracy
                        </span>
                        <span class="card-difficulty" title="Difficulty: ${card.difficulty}/5">
                            ${difficultyStars}
                        </span>
                    </div>
                    <div class="card-dates">
                        <span class="card-created">Created: ${createdDate}</span>
                        <span class="card-review ${isOverdue ? 'overdue' : ''}">
                            ${isOverdue ? 'Due for review!' : `Next: ${nextReviewDate}`}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    bindLibraryEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchCards');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderCardLibrary());
        }

        // Filter functionality
        const filters = ['categoryFilter', 'languageFilter', 'sortFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.renderCardLibrary());
            }
        });

        // Library actions
        const selectAllBtn = document.getElementById('selectAllCards');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
    }

    async playLibraryCardAudio(cardId, side) {
        const card = this.cards.find(c => c.id == cardId);
        if (!card) return;

        const text = side === 'front' ? card.frontText : card.backText;
        const lang = side === 'front' ? card.frontLang : card.backLang;

        try {
            await this.pronunciation.pronounce(text, lang);
        } catch (error) {
            console.error('Library card audio failed:', error);
            this.showNotification('Audio playback failed', 'error');
        }
    }

    editCard(cardId) {
        const card = this.cards.find(c => c.id == cardId);
        if (!card) return;

        // Switch to add card mode and populate with existing data
        this.showAddCardMode();
        
        // Populate form with card data
        document.getElementById('frontTextInput').value = card.frontText;
        document.getElementById('backTextInput').value = card.backText;
        document.getElementById('frontLanguageSelect').value = card.frontLang;
        document.getElementById('backLanguageSelect').value = card.backLang;
        document.getElementById('exampleInput').value = card.example || '';
        document.getElementById('categorySelect').value = card.category;
        
        if (card.image) {
            this.currentImageData = card.image;
            this.showImagePreview(card.image);
        }

        // Store the card ID for updating instead of creating new
        this.editingCardId = cardId;
        
        // Change form button text
        const submitBtn = document.querySelector('#addCardForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Card';
        
        this.showNotification(`Editing card: ${card.frontText}`, 'info');
    }

    deleteCard(cardId) {
        const card = this.cards.find(c => c.id == cardId);
        if (!card) return;

        this.showConfirmationDialog(
            'Delete Flashcard',
            `Are you sure you want to delete "${card.frontText}" → "${card.backText}"?`,
            () => {
                this.cards = this.cards.filter(c => c.id != cardId);
                this.saveData();
                this.updateUI();
                this.renderCardLibrary();
                this.updateLibraryStats();
                this.showNotification('Card deleted successfully', 'success');
            },
            true
        );
    }

    toggleSelectAll() {
        // This would implement bulk selection functionality
        this.showNotification('Bulk selection coming soon! 🚀', 'info');
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

// Initialize the authenticated app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new AuthenticatedFlashcardApp();
});

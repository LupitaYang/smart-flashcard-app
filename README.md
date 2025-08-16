# Smart Flashcard App 🧠

A modern, intelligent flashcard application designed to help you learn languages, vocabulary, and any subject matter efficiently using spaced repetition algorithms.

## Features ✨

### 🎯 Core Functionality
- **Spaced Repetition Learning**: Uses the SM-2 algorithm for optimal memory retention
- **Multi-language Support**: English, Swedish, German, French, Spanish, Italian
- **Audio Pronunciation**: Text-to-speech for proper pronunciation practice
- **Auto-translation**: Integrated translation service for quick card creation
- **Progress Tracking**: Monitor your daily progress and learning streaks

### 📱 User Experience
- **Modern UI**: Clean, responsive design that works on all devices
- **Offline Support**: Works without internet connection (PWA ready)
- **Data Export/Import**: Backup and restore your flashcard collection
- **Customizable Settings**: Adjust session length, audio settings, and more
- **Category Organization**: Organize cards by topics (Daily Words, Piano Terms, etc.)

### 🎨 Visual Design
- Beautiful gradient backgrounds
- Smooth card flip animations
- Intuitive button layouts
- Progress visualization
- Mobile-responsive design

## Getting Started 🚀

### Quick Start
1. Open `flashcard-app/frontend/index.html` in your web browser
2. The app comes with sample Swedish-English cards to get you started
3. Click "Start Study" to begin your first learning session

### Adding New Cards
1. Click the "Add Card" button in the header
2. Select your source and target languages
3. Enter the word/phrase you want to learn
4. Use "Auto Translate" for quick translations (requires internet)
5. Add example sentences and categorize your cards
6. Click "Add Card" to save

### Study Sessions
1. Click "Start Study" to begin a session
2. Read the word/phrase on the front of the card
3. Try to recall the translation
4. Click "Show Answer" to reveal the translation
5. Rate your performance:
   - **Hard** (Red): You didn't know it - card will appear sooner
   - **Good** (Green): You knew it with some effort - normal interval
   - **Easy** (Blue): You knew it easily - longer interval

## How It Works 🔬

### Spaced Repetition Algorithm
The app uses the SuperMemo 2 (SM-2) algorithm to optimize when you see each card:

- **New cards**: Appear after 1 day, then 6 days
- **Known cards**: Intervals increase based on how well you know them
- **Difficult cards**: Reset to shorter intervals for more practice
- **Easy cards**: Get longer intervals, appearing less frequently

### Audio Features
- **Text-to-Speech**: Click the speaker icon to hear pronunciations
- **Auto-play**: Enable in settings to automatically play audio
- **Multiple Languages**: Supports native pronunciation for all included languages

### Data Storage
- **Local Storage**: All data is stored locally in your browser
- **Privacy First**: No data is sent to external servers (except for translation)
- **Backup/Restore**: Export your data as JSON files for safekeeping

## Usage Tips 💡

### For Language Learning
1. **Start Small**: Add 5-10 new words daily rather than overwhelming yourself
2. **Use Examples**: Include example sentences to understand context
3. **Categories**: Organize by themes (food, travel, business, etc.)
4. **Daily Practice**: Consistency is key - study a little every day

### For Other Subjects
- **Piano Terms**: Learn musical terminology and techniques
- **Academic Subjects**: Create cards for definitions, formulas, concepts
- **Professional Skills**: Industry-specific vocabulary and concepts

### Best Practices
- **Be Honest**: Rate cards accurately for optimal scheduling
- **Review Regularly**: Don't skip days - the algorithm depends on consistency
- **Use Audio**: Pronunciation is crucial for language learning
- **Export Regularly**: Backup your progress to avoid data loss

## Settings ⚙️

### Available Options
- **Cards per Session**: Adjust how many cards you study at once (5-100)
- **Auto-play Audio**: Automatically play pronunciation when cards appear
- **Show Examples**: Display example sentences during study sessions
- **Export/Import**: Backup and restore your flashcard collection

### Recommended Settings
- **Beginners**: 10-15 cards per session, auto-play enabled
- **Intermediate**: 20-30 cards per session, examples enabled
- **Advanced**: 30+ cards per session, customize as needed

## Technical Details 🛠️

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage
- **Audio**: Web Speech API
- **Translation**: MyMemory Translation API
- **PWA**: Service Worker for offline functionality

### Browser Compatibility
- **Chrome/Edge**: Full support including audio
- **Firefox**: Full support including audio
- **Safari**: Full support including audio
- **Mobile Browsers**: Responsive design, touch-friendly

### File Structure
```
flashcard-app/
├── frontend/
│   ├── index.html      # Main application
│   ├── styles.css      # Styling and animations
│   ├── app.js          # Core functionality
│   └── sw.js           # Service worker for offline support
└── README.md           # This file
```

## Troubleshooting 🔧

### Common Issues

**Audio not working?**
- Check browser permissions for audio
- Ensure volume is turned up
- Try a different browser

**Translation not working?**
- Check internet connection
- Translation service may be temporarily unavailable
- Enter translations manually as fallback

**Cards not saving?**
- Check if browser allows local storage
- Try clearing browser cache and restarting
- Ensure you're not in private/incognito mode

**App not loading?**
- Check browser console for errors
- Ensure all files are in the correct directory
- Try refreshing the page

### Data Recovery
If you lose your cards:
1. Check if you have exported backup files
2. Look in browser's local storage (Developer Tools > Application > Local Storage)
3. Import from backup JSON files if available

## Future Enhancements 🚀

### Planned Features
- **Statistics Dashboard**: Detailed learning analytics
- **Card Management**: Edit and delete existing cards
- **Deck Sharing**: Share card collections with others
- **Advanced Scheduling**: More sophisticated algorithms
- **Image Support**: Add pictures to flashcards
- **Collaborative Learning**: Study with friends

### Contributing
This is a self-contained application. To modify:
1. Edit the HTML, CSS, or JavaScript files
2. Test in your browser
3. The app will automatically update

## Support 💬

### Getting Help
- Check this README for common solutions
- Review browser console for error messages
- Ensure you're using a modern browser

### Best Learning Resources
- **Language Learning**: Combine with apps like Duolingo, Babbel
- **Spaced Repetition**: Research shows 20-30 minutes daily is optimal
- **Memory Techniques**: Use mnemonics and associations with your cards

---

**Happy Learning!** 🎓

Remember: Consistency beats intensity. Study a little every day rather than cramming occasionally. The spaced repetition algorithm will help you retain information long-term with minimal effort.

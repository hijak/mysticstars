class MysticStarsApp {
    constructor() {
        this.selectedSign = null;
        this.selectedType = null;
        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.initMobileNavigation();
        this.initQuickAccess();
        this.checkURLParameters();
    }

    initTheme() {
        // Check for saved theme preference or default to dark
        const savedTheme = localStorage.getItem('mysticstars-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mysticstars-theme', theme);
        
        // Update theme toggle icon and accessibility labels
        const themeIcon = document.querySelector('.theme-icon');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (themeToggle) {
            const newLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.setAttribute('aria-label', newLabel);
            themeToggle.setAttribute('title', newLabel);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Zodiac card selection
        document.querySelectorAll('.zodiac-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectZodiacSign(e));
        });

        // Reading type selection
        document.querySelectorAll('.reading-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectReadingType(e));
        });

        // Back button
        document.querySelector('.back-btn').addEventListener('click', () => {
            this.showZodiacSelection();
        });

        // Breadcrumb navigation
        document.getElementById('breadcrumb-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.showZodiacSelection();
        });

        document.getElementById('breadcrumb-sign').addEventListener('click', (e) => {
            e.preventDefault();
            this.showReadingTypeSelection();
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initMobileNavigation() {
        const mobileNavToggle = document.getElementById('mobile-nav-toggle');
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        const mobileNavClose = document.getElementById('mobile-nav-close');

        // Open mobile navigation menu
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', () => {
                mobileNavToggle.classList.add('active');
                mobileNavOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Close mobile navigation menu
        const closeMobileNav = () => {
            if (mobileNavToggle) mobileNavToggle.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', closeMobileNav);
        }

        // Close on overlay click
        mobileNavOverlay.addEventListener('click', (e) => {
            if (e.target === mobileNavOverlay) {
                closeMobileNav();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNavOverlay.classList.contains('active')) {
                closeMobileNav();
            }
        });

        // Handle mobile navigation item clicks
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Close mobile menu when navigation item is clicked
                closeMobileNav();
                
                // Let the default anchor behavior handle the scroll
                // The existing smooth scroll code will take care of the rest
            });
        });
    }

    initQuickAccess() {
        const quickAccessToggle = document.getElementById('quick-access-toggle');
        const quickAccessPanel = document.getElementById('quick-access-panel');

        // Toggle quick access panel
        if (quickAccessToggle) {
            quickAccessToggle.addEventListener('click', () => {
                quickAccessPanel.classList.toggle('active');
            });
        }

        // Quick zodiac sign selection
        document.querySelectorAll('.quick-zodiac-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sign = e.currentTarget.dataset.sign;
                this.quickSelectSign(sign);
                quickAccessPanel.classList.remove('active');
            });
        });

        // Quick reading type selection
        document.querySelectorAll('.quick-reading-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (this.selectedSign) {
                    this.selectedType = type;
                    this.updateBreadcrumb('reading', `${this.capitalizeFirst(this.selectedSign)} ${this.capitalizeFirst(type)}`);
                    this.showReadingDisplay();
                    this.fetchReading();
                    quickAccessPanel.classList.remove('active');
                }
            });
        });

        // Close quick access when clicking outside
        document.addEventListener('click', (e) => {
            if (!quickAccessPanel.contains(e.target)) {
                quickAccessPanel.classList.remove('active');
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && quickAccessPanel.classList.contains('active')) {
                quickAccessPanel.classList.remove('active');
            }
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    selectZodiacSign(e) {
        const card = e.currentTarget;
        const sign = card.dataset.sign;

        // Remove previous selection
        document.querySelectorAll('.zodiac-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.selectedSign = sign;

        // Update breadcrumb navigation
        this.updateBreadcrumb('sign', this.capitalizeFirst(sign));

        // Show reading type selection after a brief delay
        setTimeout(() => {
            this.showReadingTypeSelection();
            this.scrollToTop();
        }, 500);
    }

    selectReadingType(e) {
        const btn = e.currentTarget;
        const type = btn.dataset.type;
        this.selectedType = type;

        // Update breadcrumb navigation
        this.updateBreadcrumb('reading', `${this.capitalizeFirst(this.selectedSign)} ${this.capitalizeFirst(type)}`);

        this.showReadingDisplay();
        this.scrollToTop();
        this.fetchReading();
    }

    showZodiacSelection() {
        document.querySelector('.zodiac-selection').style.display = 'block';
        document.querySelector('.reading-type-selection').style.display = 'none';
        document.querySelector('.reading-display').style.display = 'none';
        
        // Hide breadcrumb navigation
        this.updateBreadcrumb('home');
        
        // Reset selections
        this.selectedSign = null;
        this.selectedType = null;
        document.querySelectorAll('.zodiac-card').forEach(c => c.classList.remove('selected'));
        
        // Scroll to top
        this.scrollToTop();
    }

    showReadingTypeSelection() {
        document.querySelector('.zodiac-selection').style.display = 'none';
        document.querySelector('.reading-type-selection').style.display = 'block';
        document.querySelector('.reading-display').style.display = 'none';
        
        // Scroll to top when showing reading type selection
        this.scrollToTop();
    }

    showReadingDisplay() {
        document.querySelector('.zodiac-selection').style.display = 'none';
        document.querySelector('.reading-type-selection').style.display = 'none';
        document.querySelector('.reading-display').style.display = 'block';

        // Update title
        const title = document.getElementById('reading-title');
        const signName = this.capitalizeFirst(this.selectedSign);
        const typeName = this.capitalizeFirst(this.selectedType);
        title.textContent = `${signName} ${typeName} Enchantment`;

        // Show loading state
        document.getElementById('loading').style.display = 'block';
        document.getElementById('reading-text').style.display = 'none';
    }

    async fetchReading() {
        try {
            // Fetch reading from the API
            const reading = await this.fetchFromAPI();
            this.displayReading(reading);
        } catch (error) {
            console.error('Error fetching reading from API:', error);
            this.displayError(error.message);
        }
    }

    async fetchFromAPI() {
        const config = window.MYSTICSTARS_CONFIG || {};
        const apiBaseURL = config.API_BASE_URL || 'https://api.mysticstars.app';
        const timeout = config.REQUEST_TIMEOUT || 10000;
        const maxRetries = config.MAX_RETRIES || 3;
        const retryDelay = config.RETRY_DELAY || 1000;

        // Construct URL properly - if apiBaseURL already ends with /api, don't add it again
        const baseUrl = apiBaseURL.endsWith('/api') ? apiBaseURL : `${apiBaseURL}/api`;
        const url = `${baseUrl}/readings/${this.selectedSign}/${this.selectedType}`;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Fetching reading from API (attempt ${attempt}/${maxRetries}): ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...config.ADDITIONAL_HEADERS
                };

                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers,
                    mode: config.CORS_MODE || 'cors',
                    credentials: 'omit', // Don't send cookies for CORS requests
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.success || !data.data || !data.data.content) {
                    throw new Error('Invalid response format from API');
                }
                
                console.log('✅ Successfully fetched reading from API');
                return data.data.content;
                
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw new Error(`Failed to fetch reading after ${maxRetries} attempts: ${error.message}`);
                }
                
                // Wait before retrying (except on the last attempt)
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
    }


    displayReading(reading) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('reading-text').style.display = 'block';
        
        // Format the reading text for better readability
        const formattedReading = this.formatReadingText(reading);
        document.getElementById('reading-text').innerHTML = formattedReading;
    }

    // Simple markdown parser for basic formatting
    parseMarkdown(text) {
        if (!text) return text;
        
        return text
            // Bold text: **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic text: *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Remove extra markdown syntax that might appear
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/^\s*[-*+]\s*/gm, '') // Remove list bullets
            .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
            .replace(/`([^`]+)`/g, '$1') // Remove backticks
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .trim();
    }

    formatReadingText(text) {
        if (!text) return '<p class="error-text">Unable to retrieve your reading at this time.</p>';
        
        // Parse markdown first
        const parsedText = this.parseMarkdown(text);
        
        // Split text into sentences and create better paragraph structure
        const sentences = parsedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        
        if (sentences.length <= 3) {
            // Short reading - single paragraph with enhanced styling
            return `
                <div class="reading-container">
                    <div class="reading-intro">
                        <span class="cosmic-symbol">✨</span>
                        <p class="reading-greeting">The stars whisper their wisdom to you...</p>
                        <span class="cosmic-symbol">✨</span>
                    </div>
                    <div class="reading-main">
                        <p class="reading-paragraph main-reading">${parsedText}</p>
                    </div>
                    <div class="reading-blessing">
                        <p class="blessing-text">May the celestial energies guide and protect you. 🌟</p>
                    </div>
                </div>
            `;
        } else {
            // Longer reading - split into multiple paragraphs without dividers
            const midPoint = Math.ceil(sentences.length / 2);
            const firstHalf = sentences.slice(0, midPoint).join(' ');
            const secondHalf = sentences.slice(midPoint).join(' ');
            
            return `
                <div class="reading-container">
                    <div class="reading-intro">
                        <span class="cosmic-symbol">✨</span>
                        <p class="reading-greeting">The cosmic forces align to share this message with you...</p>
                        <span class="cosmic-symbol">✨</span>
                    </div>
                    <div class="reading-main">
                        <p class="reading-paragraph first-paragraph">${firstHalf}</p>
                        <p class="reading-paragraph second-paragraph">${secondHalf}</p>
                    </div>
                    <div class="reading-blessing">
                        <p class="blessing-text">Trust in the wisdom of the stars, dear soul. 🌟</p>
                    </div>
                </div>
            `;
        }
    }

    displayError(errorMessage = null) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('reading-text').style.display = 'block';
        
        let message = 'The celestial energies are taking a moment to align perfectly for you. Please try again when the stars are ready to share their magical wisdom.';
        
        if (errorMessage) {
            message = `The cosmic channels are currently being retuned. Please try again in a few moments as we restore the connection to the celestial realm.`;
        }
        
        document.getElementById('reading-text').innerHTML = `
            <p style="color: #6c5ce7; text-align: center;">
                ${message}
            </p>
        `;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    quickSelectSign(sign) {
        // Find and select the zodiac card
        const zodiacCard = document.querySelector(`.zodiac-card[data-sign="${sign}"]`);
        if (zodiacCard) {
            // Remove previous selection
            document.querySelectorAll('.zodiac-card').forEach(c => c.classList.remove('selected'));
            
            // Add selection to the card
            zodiacCard.classList.add('selected');
            this.selectedSign = sign;

            // Update breadcrumb navigation
            this.updateBreadcrumb('sign', this.capitalizeFirst(sign));

            // Show reading type selection
            setTimeout(() => {
                this.showReadingTypeSelection();
            }, 300);

            // Scroll to zodiac section if not visible
            const zodiacSection = document.getElementById('zodiac-signs');
            if (zodiacSection) {
                zodiacSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    updateBreadcrumb(step, text = '') {
        const breadcrumbNav = document.getElementById('breadcrumb-nav');
        const signItem = document.getElementById('breadcrumb-sign-item');
        const readingItem = document.getElementById('breadcrumb-reading-item');
        const signLink = document.getElementById('breadcrumb-sign');
        const readingSpan = document.getElementById('breadcrumb-reading');

        switch (step) {
            case 'home':
                breadcrumbNav.style.display = 'none';
                signItem.style.display = 'none';
                readingItem.style.display = 'none';
                break;
            
            case 'sign':
                breadcrumbNav.style.display = 'block';
                signItem.style.display = 'flex';
                readingItem.style.display = 'none';
                signLink.textContent = text;
                break;
            
            case 'reading':
                breadcrumbNav.style.display = 'block';
                signItem.style.display = 'flex';
                readingItem.style.display = 'flex';
                readingSpan.textContent = text;
                break;
        }
    }

    checkURLParameters() {
        // Check if there's a sign parameter in the URL (from discover page)
        const urlParams = new URLSearchParams(window.location.search);
        const signParam = urlParams.get('sign');
        
        if (signParam) {
            // Find the zodiac card for this sign and auto-select it
            const zodiacCard = document.querySelector(`.zodiac-card[data-sign="${signParam}"]`);
            if (zodiacCard) {
                // Scroll to the zodiac signs section first
                const zodiacSection = document.getElementById('zodiac-signs');
                if (zodiacSection) {
                    zodiacSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // Auto-select the sign after a brief delay for smooth scrolling
                setTimeout(() => {
                    zodiacCard.click();
                }, 800);
                
                // Clean up the URL parameter without refreshing the page
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MysticStarsApp();
});
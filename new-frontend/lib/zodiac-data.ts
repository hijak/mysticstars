export const zodiacSigns = [
  { sign: "Aries", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire", ruling: "Mars" },
  { sign: "Taurus", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth", ruling: "Venus" },
  { sign: "Gemini", symbol: "♊", dates: "May 21 - Jun 20", element: "Air", ruling: "Mercury" },
  { sign: "Cancer", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water", ruling: "Moon" },
  { sign: "Leo", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire", ruling: "Sun" },
  { sign: "Virgo", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth", ruling: "Mercury" },
  { sign: "Libra", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air", ruling: "Venus" },
  { sign: "Scorpio", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water", ruling: "Pluto" },
  { sign: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire", ruling: "Jupiter" },
  { sign: "Capricorn", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth", ruling: "Saturn" },
  { sign: "Aquarius", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air", ruling: "Uranus" },
  { sign: "Pisces", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water", ruling: "Neptune" },
]

export const horoscopes: Record<
  string,
  {
    daily: string
    love: string
    career: string
    health: string
    lucky: { number: number; color: string; time: string }
  }
> = {
  aries: {
    daily:
      "Today brings a surge of dynamic energy that propels you forward. The stars align to favor bold decisions and new beginnings. Trust your instincts and take that leap you've been contemplating. Your natural leadership qualities shine bright, attracting opportunities and admirers alike.",
    love: "Passion ignites in your romantic life. Single Aries may encounter someone intriguing who matches your fire. Couples should embrace spontaneity and plan an adventure together.",
    career:
      "Professional recognition is on the horizon. Your innovative ideas catch the attention of decision-makers. Don't hesitate to speak up in meetings—your voice carries weight today.",
    health:
      "Channel your abundant energy into physical activity. A morning workout sets a positive tone for the entire day. Stay hydrated and maintain balance between exertion and rest.",
    lucky: { number: 7, color: "Crimson Red", time: "2:00 PM" },
  },
  taurus: {
    daily:
      "Stability meets opportunity as Venus casts a favorable glow on your endeavors. Financial matters look promising, and your practical approach yields tangible results. Take time to appreciate life's simple pleasures—a good meal, nature's beauty, or quality time with loved ones.",
    love: "Romance blossoms through shared experiences. Plan a cozy evening that appeals to all senses. Your loyalty and devotion strengthen existing bonds while attracting potential partners.",
    career:
      "Your methodical work ethic pays dividends. A long-term project reaches a satisfying milestone. Colleagues appreciate your reliability and seek your counsel on important decisions.",
    health:
      "Focus on grounding activities that connect you to earth energy. Gardening, walking barefoot, or yoga promotes inner calm. Pay attention to your neck and throat area.",
    lucky: { number: 4, color: "Forest Green", time: "6:00 PM" },
  },
  gemini: {
    daily:
      "Your brilliant mind sparkles with ideas today. Communication flows effortlessly, making it ideal for important conversations, negotiations, or creative pursuits. Embrace your curiosity and explore new topics that intrigue you. Social connections bring unexpected opportunities.",
    love: "Words become your love language today. Express your feelings openly and listen deeply to your partner. Singles may find connection through intellectual conversation or shared interests.",
    career:
      "Networking proves especially fruitful. Your adaptability allows you to navigate complex situations with grace. Consider collaborations that bring together diverse perspectives.",
    health:
      "Mental stimulation is essential, but don't neglect physical movement. Short walks between tasks refresh your mind. Practice deep breathing to calm any nervous energy.",
    lucky: { number: 5, color: "Bright Yellow", time: "11:00 AM" },
  },
  cancer: {
    daily:
      "Emotional depth guides your path today. Trust your intuition—it rarely steers you wrong. Home and family matters take precedence, offering opportunities to strengthen bonds and create lasting memories. Your nurturing nature draws others seeking comfort and wisdom.",
    love: "Vulnerability creates deeper intimacy. Share your dreams and fears with your partner. Singles may feel drawn to someone who offers emotional security and understanding.",
    career:
      "Your ability to read people serves you well in professional settings. Creative projects benefit from your emotional intelligence. Consider roles that allow you to support and mentor others.",
    health:
      "Emotional well-being directly impacts physical health. Practice self-care rituals that soothe your soul. Water-based activities like swimming or a relaxing bath prove beneficial.",
    lucky: { number: 2, color: "Pearl White", time: "9:00 PM" },
  },
  leo: {
    daily:
      "The spotlight finds you naturally today. Your radiance attracts attention, admiration, and opportunities. Creative expression reaches new heights as you channel solar energy into your pursuits. Generosity of spirit returns to you tenfold.",
    love: "Romance takes center stage. Grand gestures and heartfelt expressions strengthen relationships. Singles shine brightest in social settings where their warmth draws potential partners.",
    career:
      "Leadership opportunities present themselves. Your confidence inspires others to follow your vision. Recognition for past efforts may arrive in unexpected ways.",
    health:
      "Your vitality is strong, but guard against overexertion. Heart-healthy activities and maintaining good posture support your well-being. Spend time in sunlight for energy boost.",
    lucky: { number: 1, color: "Golden Orange", time: "12:00 PM" },
  },
  virgo: {
    daily:
      "Precision and purpose guide your actions today. Your analytical mind finds solutions where others see only problems. Attention to detail brings rewards in unexpected areas. Service to others brings deep satisfaction and meaningful connections.",
    love: "Small acts of devotion speak louder than grand declarations. Show love through practical support and thoughtful gestures. Singles appreciate partners who value substance over flash.",
    career:
      "Your organizational skills are invaluable. Projects requiring meticulous attention are favored. Health and wellness fields may offer promising opportunities.",
    health:
      "Your natural inclination toward wellness serves you well. Focus on digestive health through mindful eating. Establish routines that support both body and mind.",
    lucky: { number: 6, color: "Navy Blue", time: "3:00 PM" },
  },
  libra: {
    daily:
      "Balance and beauty permeate your day. Artistic pursuits flourish under Venus's harmonious influence. Relationships require attention—seek compromise without sacrificing your values. Your diplomatic nature resolves conflicts and restores peace.",
    love: "Partnership energy is strong. Couples find renewed appreciation for each other. Singles may encounter someone who complements their nature beautifully. Fairness in love creates lasting bonds.",
    career:
      "Collaborative efforts yield impressive results. Your ability to see multiple perspectives makes you invaluable in negotiations. Consider creative fields or roles involving partnership.",
    health:
      "Seek equilibrium in all things. Balance activity with rest, socializing with solitude. Lower back care and kidney health deserve attention. Surround yourself with beauty.",
    lucky: { number: 9, color: "Soft Pink", time: "7:00 PM" },
  },
  scorpio: {
    daily:
      "Intensity marks this powerful day. Transformation beckons as you shed what no longer serves your growth. Your penetrating insight reveals hidden truths and opportunities. Trust your ability to navigate depths that others fear to explore.",
    love: "Passion runs deep in matters of the heart. Intimacy requires vulnerability—dare to reveal your authentic self. Singles attract those who appreciate their mysterious allure.",
    career:
      "Research and investigation yield valuable discoveries. Your determination overcomes obstacles that stop others. Roles involving crisis management or transformation are favored.",
    health:
      "Regenerative practices support your well-being. Consider detoxification and release of stored emotions. Reproductive health deserves attention. Embrace healing on all levels.",
    lucky: { number: 8, color: "Deep Burgundy", time: "10:00 PM" },
  },
  sagittarius: {
    daily:
      "Adventure calls your name today. Expand your horizons through travel, study, or philosophical exploration. Optimism opens doors that pessimism would keep shut. Your quest for truth leads to meaningful discoveries and connections.",
    love: "Freedom within relationships creates joy. Share adventures with your partner or seek someone who matches your wanderlust. Honesty and humor strengthen romantic bonds.",
    career:
      "International connections or higher education may play a role in your professional development. Your enthusiasm is contagious—use it to rally support for your vision.",
    health:
      "Movement and outdoor activities invigorate your spirit. Pay attention to hips and thighs. Avoid overindulgence while still enjoying life's pleasures. Laughter is medicine.",
    lucky: { number: 3, color: "Royal Purple", time: "4:00 PM" },
  },
  capricorn: {
    daily:
      "Ambition drives you toward achievement today. Your patient, persistent efforts begin to yield visible results. Authority figures recognize your value. Structure and discipline are your allies in building the future you envision.",
    love: "Commitment and reliability form the foundation of your romantic life. Express affection through dedication and support. Singles value potential partners who share their long-term vision.",
    career:
      "Professional advancement is strongly favored. Your reputation precedes you in positive ways. Take on responsibilities that demonstrate your capabilities. Success is built step by step.",
    health:
      "Skeletal health, particularly knees and joints, requires attention. Balance work with adequate rest. Establish sustainable routines that support longevity and well-being.",
    lucky: { number: 10, color: "Charcoal Gray", time: "8:00 AM" },
  },
  aquarius: {
    daily:
      "Innovation sparks brilliant ideas today. Your unique perspective offers solutions the world needs. Community involvement brings fulfillment and meaningful connections. Embrace your individuality while contributing to collective progress.",
    love: "Intellectual connection forms the basis of attraction. Seek partners who appreciate your unconventional nature. Friendship within romance creates lasting bonds. Give each other space to grow.",
    career:
      "Technology, humanitarian work, and future-oriented fields are highlighted. Your visionary thinking attracts like-minded collaborators. Group projects benefit from your innovative approach.",
    health:
      "Circulation and nervous system health deserve attention. Unconventional wellness approaches may appeal to you. Balance mental activity with grounding practices. Connect with community.",
    lucky: { number: 11, color: "Electric Blue", time: "5:00 PM" },
  },
  pisces: {
    daily:
      "Intuition guides you through mystical waters today. Creative and spiritual pursuits are deeply favored. Your compassion touches those in need of healing. Dreams carry important messages—pay attention to their symbolic language.",
    love: "Soul connections deepen today. Romance takes on a transcendent quality. Singles may feel a karmic pull toward someone significant. Express love through artistic or spiritual gestures.",
    career:
      "Artistic, healing, and spiritual vocations are highlighted. Your ability to tap into collective consciousness informs your work. Trust creative inspiration even when logic questions it.",
    health:
      "Feet and lymphatic system require care. Water-based healing and spiritual practices support your well-being. Protect your sensitive energy through boundaries and rest.",
    lucky: { number: 12, color: "Sea Green", time: "1:00 AM" },
  },
}

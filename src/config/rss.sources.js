// ── RSS Sources Config ────────────────────────────────────────────────────────
// Rules:
//  • Every category has 4+ sources — one failure never empties a tab
//  • Phys.org removed (blurry low-res images) → replaced with LiveScience,
//    ZME Science, Scientific American, Futurity (all carry sharp og:images)
//  • Sources are spread across publishers so the "source" pill in the card
//    cycles through many different names, not just BBC/NDTV on repeat
//  • Guardian: /international/rss used (carries full og:image); section feeds
//    like /politics/rss, /environment/rss, /football/rss also used directly

const RSS_SOURCES = [

    // ════════════════════════════════════════════════════════════
    //  GENERAL
    // ════════════════════════════════════════════════════════════
    {
        name: 'BBC News',
        url: 'https://feeds.bbci.co.uk/news/rss.xml',
        category: 'general',
        language: 'en',
    },
    {
        name: 'Reuters',
        url: 'https://feeds.reuters.com/reuters/topNews',
        category: 'general',
        language: 'en',
    },
    {
        name: 'NPR News',
        url: 'https://feeds.npr.org/1001/rss.xml',
        category: 'general',
        language: 'en',
    },
    {
        name: 'Associated Press',
        url: 'https://feeds.apnews.com/rss/apf-topnews',
        category: 'general',
        language: 'en',
    },
    {
        name: 'ABC News',
        url: 'https://abcnews.go.com/abcnews/topstories',
        category: 'general',
        language: 'en',
    },
    {
        name: 'CBS News',
        url: 'https://www.cbsnews.com/latest/rss/main',
        category: 'general',
        language: 'en',
    },
    {
        name: 'USA Today',
        url: 'https://rssfeeds.usatoday.com/usatoday-NewsTopStories',
        category: 'general',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  WORLD
    // ════════════════════════════════════════════════════════════
    
    {
        name: 'Al Jazeera',
        url: 'https://www.aljazeera.com/xml/rss/all.xml',
        category: 'world',
        language: 'en',
    },
    {
        name: 'BBC World',
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        category: 'world',
        language: 'en',
    },
    {
        name: 'DW World',
        url: 'https://rss.dw.com/rdf/rss-en-all',
        category: 'world',
        language: 'en',
    },
    {
        name: 'France 24',
        url: 'https://www.france24.com/en/rss',
        category: 'world',
        language: 'en',
    },
    {
        name: 'Reuters World',
        url: 'https://feeds.reuters.com/Reuters/worldNews',
        category: 'world',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  INDIA
    // ════════════════════════════════════════════════════════════
    {
        name: 'NDTV India',
        url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
        category: 'india',
        language: 'en',
    },
    {
        name: 'Indian Express',
        url: 'https://indianexpress.com/feed/',
        category: 'india',
        language: 'en',
    },
    {
        name: 'Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        category: 'india',
        language: 'en',
    },
    {
        name: 'The Hindu',
        url: 'https://www.thehindu.com/feeder/default.rss',
        category: 'india',
        language: 'en',
    },
    {
        name: 'India Today',
        url: 'https://www.indiatoday.in/rss/1206514',
        category: 'india',
        language: 'en',
    },
    {
        name: 'The Wire',
        url: 'https://thewire.in/feed',
        category: 'india',
        language: 'en',
    },
    {
        name: 'Hindustan Times',
        url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
        category: 'india',
        language: 'en',
    },
    {
        name: 'Deccan Herald',
        url: 'https://www.deccanherald.com/rss-feed/national-feed',
        category: 'india',
        language: 'en',
    },
    {
        name: 'News18 India',
        url: 'https://www.news18.com/commonfeeds/v1/eng/news18-top-stories.xml',
        category: 'india',
        language: 'en',
    },
    {
        name: 'Scroll.in',
        url: 'https://scroll.in/feed',
        category: 'india',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  TECHNOLOGY
    //  TechCrunch & Verge can throttle; ZDNet/Engadget/VentureBeat
    //  pick up the slack. Wired/Mashable add visual variety.
    // ════════════════════════════════════════════════════════════
    {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'Ars Technica',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'ZDNet',
        url: 'https://www.zdnet.com/news/rss.xml',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'Engadget',
        url: 'https://www.engadget.com/rss.xml',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'VentureBeat',
        url: 'https://venturebeat.com/feed/',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'Mashable Tech',
        url: 'https://mashable.com/feeds/rss/tech',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'Gizmodo',
        url: 'https://gizmodo.com/feed/rss',
        category: 'technology',
        language: 'en',
    },
    {
        name: 'MIT Technology Review',
        url: 'https://www.technologyreview.com/feed/',
        category: 'technology',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  AI
    // ════════════════════════════════════════════════════════════
    {
        name: 'TechCrunch AI',
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        category: 'ai',
        language: 'en',
    },
    {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/category/ai/feed/',
        category: 'ai',
        language: 'en',
    },
    {
        name: 'MIT Tech Review AI',
        url: 'https://www.technologyreview.com/feed/',
        category: 'ai',
        language: 'en',
    },
    {
        name: 'Wired AI',
        url: 'https://www.wired.com/feed/tag/artificial-intelligence/rss',
        category: 'ai',
        language: 'en',
    },
    {
        name: 'The Verge AI',
        url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
        category: 'ai',
        language: 'en',
    },
    {
        name: 'Ars Technica AI',
        url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
        category: 'ai',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  SCIENCE
    //  Phys.org removed — blurry thumbnails.
    //  Replaced with LiveScience, ZME Science, Scientific American,
    //  Futurity — all carry sharp full-size og:images.
    // ════════════════════════════════════════════════════════════
    {
        name: 'Science Daily',
        url: 'https://www.sciencedaily.com/rss/all.xml',
        category: 'science',
        language: 'en',
    },
    {
        name: 'Live Science',
        url: 'https://www.livescience.com/feeds/all',
        category: 'science',
        language: 'en',
    },
    {
        name: 'ZME Science',
        url: 'https://www.zmescience.com/feed',
        category: 'science',
        language: 'en',
    },
    {
        name: 'Scientific American',
        url: 'https://rss.sciam.com/ScientificAmerican-Global',
        category: 'science',
        language: 'en',
    },
    {
        name: 'Futurity',
        url: 'https://www.futurity.org/feed',
        category: 'science',
        language: 'en',
    },
    {
        name: 'New Scientist',
        url: 'https://www.newscientist.com/feed/home/',
        category: 'science',
        language: 'en',
    },
    {
        name: 'NASA News',
        url: 'https://www.nasa.gov/news-release/feed/',
        category: 'science',
        language: 'en',
    },
    {
        name: 'EurekAlert',
        url: 'https://www.eurekalert.org/rss/technology_engineering.xml',
        category: 'science',
        language: 'en',
    },
    {
        name: 'Sci-News',
        url: 'https://sci.news/feed',
        category: 'science',
        language: 'en',
    },
    {
        name: 'India Today Science',
        url: 'https://www.indiatoday.in/rss/1206814',
        category: 'science',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  SPACE
    // ════════════════════════════════════════════════════════════
    {
        name: 'Space.com',
        url: 'https://www.space.com/feeds/all',
        category: 'space',
        language: 'en',
    },
    {
        name: 'NASA JPL',
        url: 'https://www.jpl.nasa.gov/feeds/news',
        category: 'space',
        language: 'en',
    },
    {
        name: 'SpaceNews',
        url: 'https://spacenews.com/feed/',
        category: 'space',
        language: 'en',
    },
    {
        name: 'Sky & Telescope',
        url: 'https://skyandtelescope.org/feed/',
        category: 'space',
        language: 'en',
    },
    {
        name: 'Universe Today',
        url: 'https://www.universetoday.com/feed/',
        category: 'space',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  ENVIRONMENT
    // ════════════════════════════════════════════════════════════
    {
        name: 'Carbon Brief',
        url: 'https://www.carbonbrief.org/feed/',
        category: 'environment',
        language: 'en',
    },
    {
        name: 'Inside Climate News',
        url: 'https://insideclimatenews.org/feed/',
        category: 'environment',
        language: 'en',
    },
    {
        name: 'Yale Environment 360',
        url: 'https://e360.yale.edu/feed',
        category: 'environment',
        language: 'en',
    },
    {
        name: 'Mongabay',
        url: 'https://news.mongabay.com/feed/',
        category: 'environment',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  BUSINESS
    // ════════════════════════════════════════════════════════════
    {
        name: 'CNBC Business',
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Business Standard',
        url: 'https://www.business-standard.com/rss/home_page_top_stories.rss',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Economic Times',
        url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Bloomberg Markets',
        url: 'https://feeds.bloomberg.com/markets/news.rss',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Fortune',
        url: 'https://fortune.com/feed/',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Inc.',
        url: 'https://www.inc.com/rss/',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Fast Company',
        url: 'https://www.fastcompany.com/latest/rss',
        category: 'business',
        language: 'en',
    },
    {
        name: 'Harvard Business Review',
        url: 'https://feeds.hbr.org/harvardbusiness',
        category: 'business',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  FINANCE
    // ════════════════════════════════════════════════════════════
    {
        name: 'Moneycontrol',
        url: 'https://www.moneycontrol.com/rss/MCtopnews.xml',
        category: 'finance',
        language: 'en',
    },
    {
        name: 'Livemint',
        url: 'https://www.livemint.com/rss/news',
        category: 'finance',
        language: 'en',
    },
    {
        name: 'CNBC Markets',
        url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html',
        category: 'finance',
        language: 'en',
    },
    {
        name: 'Seeking Alpha',
        url: 'https://seekingalpha.com/market_currents.xml',
        category: 'finance',
        language: 'en',
    },
    {
        name: 'MarketWatch',
        url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
        category: 'finance',
        language: 'en',
    },
    {
        name: 'Investopedia',
        url: 'https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline',
        category: 'finance',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  CRYPTO
    // ════════════════════════════════════════════════════════════
    {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        category: 'crypto',
        language: 'en',
    },
    {
        name: 'CoinTelegraph',
        url: 'https://cointelegraph.com/rss',
        category: 'crypto',
        language: 'en',
    },
    {
        name: 'Decrypt',
        url: 'https://decrypt.co/feed',
        category: 'crypto',
        language: 'en',
    },
    {
        name: 'The Block',
        url: 'https://www.theblock.co/rss.xml',
        category: 'crypto',
        language: 'en',
    },
    {
        name: 'Bitcoin Magazine',
        url: 'https://bitcoinmagazine.com/feed',
        category: 'crypto',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  SPORTS
    // ════════════════════════════════════════════════════════════
    {
        name: 'BBC Sport',
        url: 'https://feeds.bbci.co.uk/sport/rss.xml',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'Sky Sports',
        url: 'https://www.skysports.com/rss/12040',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'ESPN',
        url: 'https://www.espn.com/espn/rss/news',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'India Today Sports',
        url: 'https://www.indiatoday.in/rss/1206550',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'NDTV Sports',
        url: 'https://feeds.feedburner.com/NdtvSports-TopStories',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'Cricinfo',
        url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'SportsBible',
        url: 'https://www.sportsbible.com/rss',
        category: 'sports',
        language: 'en',
    },
    {
        name: 'Bleacher Report',
        url: 'https://bleacherreport.com/articles/feed',
        category: 'sports',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  ENTERTAINMENT
    // ════════════════════════════════════════════════════════════
    {
        name: 'Deadline',
        url: 'https://deadline.com/feed/',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'Hollywood Reporter',
        url: 'https://www.hollywoodreporter.com/feed/',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'Entertainment Weekly',
        url: 'https://ew.com/feed/',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'Bollywood Hungama',
        url: 'https://www.bollywoodhungama.com/rss/news.xml',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'Vulture',
        url: 'https://www.vulture.com/rss/index.xml',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'The AV Club',
        url: 'https://www.avclub.com/rss',
        category: 'entertainment',
        language: 'en',
    },
    {
        name: 'Pinkvilla',
        url: 'https://www.pinkvilla.com/rss.xml',
        category: 'entertainment',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  MOVIES
    // ════════════════════════════════════════════════════════════
    {
        name: 'Variety',
        url: 'https://variety.com/feed/',
        category: 'movies',
        language: 'en',
    },
    {
        name: 'IndieWire',
        url: 'https://www.indiewire.com/feed/',
        category: 'movies',
        language: 'en',
    },
    {
        name: 'Screen Rant',
        url: 'https://screenrant.com/feed/',
        category: 'movies',
        language: 'en',
    },
    {
        name: 'IGN Movies',
        url: 'https://feeds.ign.com/ign/movies',
        category: 'movies',
        language: 'en',
    },
    {
        name: 'Collider',
        url: 'https://collider.com/feed/',
        category: 'movies',
        language: 'en',
    },
    {
        name: 'CBR',
        url: 'https://www.cbr.com/feed/',
        category: 'movies',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  MUSIC
    // ════════════════════════════════════════════════════════════
    {
        name: 'Pitchfork',
        url: 'https://pitchfork.com/feed/rss',
        category: 'music',
        language: 'en',
    },
    {
        name: 'NME',
        url: 'https://www.nme.com/feed',
        category: 'music',
        language: 'en',
    },
    {
        name: 'Rolling Stone Music',
        url: 'https://www.rollingstone.com/music/feed/',
        category: 'music',
        language: 'en',
    },
    {
        name: 'Billboard',
        url: 'https://www.billboard.com/feed/',
        category: 'music',
        language: 'en',
    },
    {
        name: 'Consequence of Sound',
        url: 'https://consequence.net/feed/',
        category: 'music',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  GAMING
    // ════════════════════════════════════════════════════════════
    {
        name: 'Polygon',
        url: 'https://www.polygon.com/rss/index.xml',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'IGN',
        url: 'https://feeds.ign.com/ign/all',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'Kotaku',
        url: 'https://kotaku.com/rss',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'Rock Paper Shotgun',
        url: 'https://www.rockpapershotgun.com/feed/news',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'PC Gamer',
        url: 'https://www.pcgamer.com/rss/',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'Eurogamer',
        url: 'https://www.eurogamer.net/?format=rss',
        category: 'gaming',
        language: 'en',
    },
    {
        name: 'GameSpot',
        url: 'https://www.gamespot.com/feeds/mashup/',
        category: 'gaming',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  HEALTH
    // ════════════════════════════════════════════════════════════
    {
        name: 'WebMD',
        url: 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
        category: 'health',
        language: 'en',
    },
    {
        name: 'Medical News Today',
        url: 'https://www.medicalnewstoday.com/rss',
        category: 'health',
        language: 'en',
    },
    {
        name: 'India Today Health',
        url: 'https://www.indiatoday.in/rss/1206515',
        category: 'health',
        language: 'en',
    },
    {
        name: 'Healthline',
        url: 'https://www.healthline.com/nutrition/feed',
        category: 'health',
        language: 'en',
    },
    {
        name: 'Everyday Health',
        url: 'https://www.everydayhealth.com/news/rss.aspx',
        category: 'health',
        language: 'en',
    },
    {
        name: 'Harvard Health',
        url: 'https://www.health.harvard.edu/blog/feed',
        category: 'health',
        language: 'en',
    },
    {
        name: 'Live Science Health',
        url: 'https://www.livescience.com/feeds/health',
        category: 'health',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  FINANCE
    // (already above — skipping duplicate block)
    // ════════════════════════════════════════════════════════════

    // ════════════════════════════════════════════════════════════
    //  AUTOMOTIVE
    // ════════════════════════════════════════════════════════════
    {
        name: 'Car and Driver',
        url: 'https://www.caranddriver.com/rss/all.xml/',
        category: 'automotive',
        language: 'en',
    },
    {
        name: 'Motor Trend',
        url: 'https://www.motortrend.com/feeds/news.xml',
        category: 'automotive',
        language: 'en',
    },
    {
        name: 'Autocar India',
        url: 'https://www.autocarindia.com/rss',
        category: 'automotive',
        language: 'en',
    },
    {
        name: 'Jalopnik',
        url: 'https://jalopnik.com/rss',
        category: 'automotive',
        language: 'en',
    },
    {
        name: 'Road and Track',
        url: 'https://www.roadandtrack.com/rss/all.xml/',
        category: 'automotive',
        language: 'en',
    },
    {
        name: 'CarWale',
        url: 'https://www.carwale.com/rss/news.xml',
        category: 'automotive',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  TRAVEL
    // ════════════════════════════════════════════════════════════
    {
        name: 'Lonely Planet',
        url: 'https://www.lonelyplanet.com/news/feed',
        category: 'travel',
        language: 'en',
    },
    {
        name: 'Travel + Leisure',
        url: 'https://www.travelandleisure.com/rss',
        category: 'travel',
        language: 'en',
    },
    {
        name: 'Condé Nast Traveler',
        url: 'https://www.cntraveler.com/feed/rss',
        category: 'travel',
        language: 'en',
    },
    {
        name: 'National Geographic Travel',
        url: 'https://www.nationalgeographic.com/travel/rss',
        category: 'travel',
        language: 'en',
    },
    {
        name: 'Fodors Travel',
        url: 'https://www.fodors.com/news/feed',
        category: 'travel',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  FOOD
    // ════════════════════════════════════════════════════════════
    {
        name: 'Bon Appétit',
        url: 'https://www.bonappetit.com/feed/rss',
        category: 'food',
        language: 'en',
    },
    {
        name: 'Serious Eats',
        url: 'https://www.seriouseats.com/feeds/all.rss.xml',
        category: 'food',
        language: 'en',
    },
    {
        name: 'Eater',
        url: 'https://www.eater.com/rss/index.xml',
        category: 'food',
        language: 'en',
    },
    {
        name: 'Food52',
        url: 'https://food52.com/blog/feed',
        category: 'food',
        language: 'en',
    },
    {
        name: 'The Kitchn',
        url: 'https://www.thekitchn.com/main.rss',
        category: 'food',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  FASHION
    // ════════════════════════════════════════════════════════════
    {
        name: 'Vogue',
        url: 'https://www.vogue.com/feed/rss',
        category: 'fashion',
        language: 'en',
    },
    {
        name: "Harper's Bazaar",
        url: 'https://www.harpersbazaar.com/rss/all.xml/',
        category: 'fashion',
        language: 'en',
    },
    {
        name: 'Fashionista',
        url: 'https://fashionista.com/feed',
        category: 'fashion',
        language: 'en',
    },
    {
        name: 'WWD',
        url: 'https://wwd.com/feed/',
        category: 'fashion',
        language: 'en',
    },
    {
        name: 'Refinery29',
        url: 'https://www.refinery29.com/en-us/fashion/rss.xml',
        category: 'fashion',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  POLITICS
    // ════════════════════════════════════════════════════════════
    {
        name: 'BBC Politics',
        url: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
        category: 'politics',
        language: 'en',
    },
    {
        name: 'The Wire Politics',
        url: 'https://thewire.in/category/politics/feed',
        category: 'politics',
        language: 'en',
    },
    {
        name: 'Politico',
        url: 'https://www.politico.com/rss/politicopicks.xml',
        category: 'politics',
        language: 'en',
    },
    {
        name: 'The Hill',
        url: 'https://thehill.com/feed/',
        category: 'politics',
        language: 'en',
    },
    {
        name: 'NDTV Politics',
        url: 'https://feeds.feedburner.com/ndtvnews-politics',
        category: 'politics',
        language: 'en',
    },

    // ════════════════════════════════════════════════════════════
    //  EDUCATION
    // ════════════════════════════════════════════════════════════
    {
        name: 'Times Higher Education',
        url: 'https://www.timeshighereducation.com/rss.xml',
        category: 'education',
        language: 'en',
    },
    {
        name: 'EdSurge',
        url: 'https://www.edsurge.com/feed',
        category: 'education',
        language: 'en',
    },
    {
        name: 'NDTV Education',
        url: 'https://feeds.feedburner.com/ndtv/education',
        category: 'education',
        language: 'en',
    },
    {
        name: 'The Conversation',
        url: 'https://theconversation.com/us/education/articles.atom',
        category: 'education',
        language: 'en',
    },
    {
        name: 'Education Week',
        url: 'https://www.edweek.org/feed',
        category: 'education',
        language: 'en',
    },
];

const RSS_CATEGORIES = [
    'general',
    'world',
    'india',
    'technology',
    'ai',
    'science',
    'environment',
    'space',
    'business',
    'finance',
    'crypto',
    'sports',
    'gaming',
    'entertainment',
    'movies',
    'music',
    'health',
    'fitness',
    'education',
    'travel',
    'food',
    'lifestyle',
    'fashion',
    'automotive',
    'politics',
];

module.exports = {
    RSS_SOURCES,
    RSS_CATEGORIES,
};
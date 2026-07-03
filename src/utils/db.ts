import {
  User,
  Seller,
  Store,
  Product,
  Order,
  Review,
  Coupon,
  Notification,
  Message,
  InventoryLog,
  CartItem,
  ChatThread,
  StoreCartGroup
} from '../types';

// Seed Initial Data Helper
const SEED_USERS: User[] = [
  {
    id: 'user_buyer_1',
    email: 'buyer@eurodorbar.com',
    name: 'Sarah Borg',
    role: 'buyer',
    phone: '+356 7912 3456',
    address: '15, Triq il-Repubblika',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'user_seller_tech',
    email: 'tech@eurodorbar.com',
    name: 'Joseph Camilleri',
    role: 'seller',
    phone: '+356 9945 6789',
    address: 'Tech Hub, Triq Dun Karm, Birkirkara',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-02-01T08:30:00Z'
  },
  {
    id: 'user_seller_fashion',
    email: 'fashion@eurodorbar.com',
    name: 'Elena Vella',
    role: 'seller',
    phone: '+356 9988 7766',
    address: 'The Boutique, Triq Bisazza, Sliema',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-02-10T09:15:00Z'
  },
  {
    id: 'user_seller_home',
    email: 'home@eurodorbar.com',
    name: 'Paul Agius',
    role: 'seller',
    phone: '+356 7954 1234',
    address: 'Lumina House, Triq l-Imdina, Qormi',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-02-22T14:20:00Z'
  },
  {
    id: 'user_admin',
    email: 'admin@eurodorbar.com',
    name: 'Marketplace Admin',
    role: 'admin',
    phone: '+356 2100 0000',
    address: 'EuroDorbar Headquarters, Valletta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

const SEED_SELLERS: Seller[] = [
  {
    id: 'seller_tech_id',
    userId: 'user_seller_tech',
    businessName: 'Camilleri Electronics Ltd',
    storeName: 'MaltaTech Store',
    email: 'tech@eurodorbar.com',
    phone: '+356 9945 6789',
    country: 'Malta',
    address: 'Tech Hub, Triq Dun Karm, Birkirkara',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80',
    description: 'Malta’s leading provider of modern smart wearables, sound systems, and tech accessories directly imported with the best prices.',
    termsAccepted: true,
    status: 'approved',
    createdAt: '2026-02-01T08:30:00Z'
  },
  {
    id: 'seller_fashion_id',
    userId: 'user_seller_fashion',
    businessName: 'Elena Vella Boutique',
    storeName: 'Aura Fashion',
    email: 'fashion@eurodorbar.com',
    phone: '+356 9988 7766',
    country: 'Malta',
    address: 'The Boutique, Triq Bisazza, Sliema',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1441984969893-c534e9749007?auto=format&fit=crop&w=1200&q=80',
    description: 'Curated premium fashion, bags, sunglasses, and contemporary apparel for the modern Mediterranean lifestyle.',
    termsAccepted: true,
    status: 'approved',
    createdAt: '2026-02-10T09:15:00Z'
  },
  {
    id: 'seller_home_id',
    userId: 'user_seller_home',
    businessName: 'Agius Lumina & Co',
    storeName: 'Lumina Home',
    email: 'home@eurodorbar.com',
    phone: '+356 7954 1234',
    country: 'Malta',
    address: 'Lumina House, Triq l-Imdina, Qormi',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    description: 'Transform your living spaces with premium lighting, automatic smart devices, and minimalist functional home decor.',
    termsAccepted: true,
    status: 'pending', // Pending to demonstrate administrative approval in-app!
    createdAt: '2026-02-22T14:20:00Z'
  }
];

const SEED_STORES: Store[] = [
  {
    id: 'store_tech',
    sellerId: 'seller_tech_id',
    name: 'MaltaTech Store',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80',
    description: 'Malta’s leading provider of modern smart wearables, sound systems, and tech accessories directly imported with the best prices.',
    categories: ['Consumer Electronics', 'Sports & Outdoors'],
    followersCount: 1420,
    rating: 4.8,
    reviewsCount: 382,
    contactEmail: 'tech@eurodorbar.com',
    contactPhone: '+356 9945 6789',
    policies: {
      shipping: 'Ships from Malta. Free next-day delivery on orders over €30. Standard shipping is 1-2 days.',
      returns: '15 days hassle-free return policy. Unopened products can be returned to Birkirkara service center.'
    }
  },
  {
    id: 'store_fashion',
    sellerId: 'seller_fashion_id',
    name: 'Aura Fashion',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1441984969893-c534e9749007?auto=format&fit=crop&w=1200&q=80',
    description: 'Curated premium fashion, bags, sunglasses, and contemporary apparel for the modern Mediterranean lifestyle.',
    categories: ['Fashion & Clothing', 'Beauty & Health'],
    followersCount: 890,
    rating: 4.6,
    reviewsCount: 147,
    contactEmail: 'fashion@eurodorbar.com',
    contactPhone: '+356 9988 7766',
    policies: {
      shipping: 'Quick dispatch from Sliema. Handled by MaltaPost. Same day delivery in Sliema area.',
      returns: 'Size exchanges are free. 30 days return window for tags-intact items.'
    }
  },
  {
    id: 'store_home',
    sellerId: 'seller_home_id',
    name: 'Lumina Home',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=120&q=80',
    banner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    description: 'Transform your living spaces with premium lighting, automatic smart devices, and minimalist functional home decor.',
    categories: ['Home & Garden'],
    followersCount: 310,
    rating: 4.5,
    reviewsCount: 22,
    contactEmail: 'home@eurodorbar.com',
    contactPhone: '+356 7954 1234',
    policies: {
      shipping: 'Heavy items delivered with custom delivery van. Flat rate €5 shipping across Malta and Gozo.',
      returns: '7 days inspection period. Manufacturer warranty applies to all electronic lamps and appliances.'
    }
  }
];

const SEED_PRODUCTS: Product[] = [
  // TECH STORE PRODUCTS (Approved)
  {
    id: 'prod_tech_1',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    title: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
    category: 'Consumer Electronics',
    brand: 'Aura',
    sku: 'TECH-AUR-W1',
    description: 'Experience next-level health tracking and style with AuraPulse Pro. Featuring a high-resolution 1.43" AMOLED display, always-on screen functionality, blood oxygen (SpO2) monitor, 24/7 heart rate monitor, 120+ fitness modes, and integrated dual-band GPS. The battery lasts up to 14 days under standard use.',
    specifications: [
      { key: 'Display Size', value: '1.43 inch AMOLED' },
      { key: 'Water Resistance', value: '5ATM (up to 50 meters)' },
      { key: 'Battery Life', value: 'Up to 14 days' },
      { key: 'Connectivity', value: 'Bluetooth 5.2, GPS' },
      { key: 'Sensors', value: 'Heart Rate, SpO2, Accelerometer, Gyroscope' }
    ],
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'
    ],
    price: 89.99,
    discount: 25, // €67.49 sale price
    stock: 120,
    minOrder: 1,
    weight: 0.15,
    shippingCost: 0, // Free shipping
    shippingTime: '1-3 days',
    variants: [
      { name: 'Color', options: ['Obsidian Black', 'Ocean Blue', 'Platinum Silver'] }
    ],
    colors: ['Black', 'Blue', 'Silver'],
    sizes: [],
    tags: ['smartwatch', 'wearables', 'fitness', 'gps'],
    status: 'active',
    createdAt: '2026-02-05T10:00:00Z',
    rating: 4.8,
    reviewsCount: 154,
    salesCount: 840
  },
  {
    id: 'prod_tech_2',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    title: 'SoundHelix Earbuds - Active Noise Cancelling High Fidelity Headset',
    category: 'Consumer Electronics',
    brand: 'SoundHelix',
    sku: 'TECH-HEL-E1',
    description: 'Immerse yourself completely in music with SoundHelix. Dynamic hybrid Active Noise Cancellation (ANC) block up to 40dB of ambient noises. Engineered with 11mm composite drivers for outstanding bass performance and crisp highs. Comes with an elegant leather charging case and custom dual microphone arrays for clear calls.',
    specifications: [
      { key: 'Noise Cancellation', value: 'Hybrid ANC up to 40dB' },
      { key: 'Driver Size', value: '11mm Dynamic Drivers' },
      { key: 'Battery Total', value: '32 Hours with Charging Case' },
      { key: 'Charging Type', value: 'USB-C and Qi Wireless' },
      { key: 'Latency', value: '50ms Ultra-low gaming mode' }
    ],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=600&q=80'
    ],
    price: 45.00,
    discount: 10, // €40.50 sale price
    stock: 250,
    minOrder: 1,
    weight: 0.08,
    shippingCost: 0,
    shippingTime: '1-3 days',
    variants: [
      { name: 'Color', options: ['Matte Black', 'Pearl White'] }
    ],
    colors: ['Black', 'White'],
    sizes: [],
    tags: ['earbuds', 'anc', 'bluetooth', 'audio'],
    status: 'active',
    createdAt: '2026-02-06T11:00:00Z',
    rating: 4.7,
    reviewsCount: 98,
    salesCount: 412
  },
  {
    id: 'prod_tech_3',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    title: 'RetroClick Mechanical Keyboard - RGB Gateron Brown Switches',
    category: 'Consumer Electronics',
    brand: 'RetroClick',
    sku: 'TECH-RET-K1',
    description: 'Unleash your typing precision and gaming dominance with our 75% compact hot-swappable mechanical keyboard. Outfitted with premium Gateron Brown Tactile switches and durable double-shot PBT keycaps. Features 18 stunning preset RGB lighting modes and connects seamlessly via wireless 2.4Ghz, Bluetooth 5.1, or USB-C.',
    specifications: [
      { key: 'Layout', value: '75% Compact (84 Keys)' },
      { key: 'Switch Type', value: 'Gateron Brown (Hot-swappable)' },
      { key: 'Keycaps', value: 'Double-shot PBT' },
      { key: 'Backlight', value: 'Custom RGB - 16.8 million colors' },
      { key: 'Battery Capacity', value: '4000mAh Lithium' }
    ],
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
    ],
    price: 110.00,
    discount: 20, // €88.00 sale
    stock: 45,
    minOrder: 1,
    weight: 1.1,
    shippingCost: 3.50,
    shippingTime: '1-2 days',
    variants: [
      { name: 'Layout', options: ['US ANSI', 'UK ISO'] }
    ],
    colors: [],
    sizes: [],
    tags: ['keyboard', 'rgb', 'mechanical', 'gamers'],
    status: 'active',
    createdAt: '2026-02-08T15:30:00Z',
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 110
  },
  {
    id: 'prod_tech_4',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    title: 'SuperCharge 65W GaN Charger - 3 Port Quick Charge Adapter',
    category: 'Consumer Electronics',
    brand: 'SuperCharge',
    sku: 'TECH-GAN-65',
    description: 'The only charger you will ever need. Empowered by the latest Gallium Nitride (GaN) technology, this super-compact charger outputs a maximum of 65W. Equipped with 2 USB-C Power Delivery (PD) ports and 1 USB-A Quick Charge port. Safeguards your devices against overcurrent, short circuits, and overheating.',
    specifications: [
      { key: 'Max Output', value: '65 Watts' },
      { key: 'Technology', value: 'GaN (Gallium Nitride) II' },
      { key: 'Ports', value: '2x USB-C, 1x USB-A' },
      { key: 'Input Voltages', value: 'AC 100-240V' },
      { key: 'Safety certifications', value: 'CE, RoHS, FCC' }
    ],
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80'
    ],
    price: 29.99,
    discount: 50, // €14.99 sale - Flash Deal!
    stock: 500,
    minOrder: 1,
    weight: 0.12,
    shippingCost: 1.50,
    shippingTime: '1-3 days',
    variants: [],
    colors: ['Black', 'White'],
    sizes: [],
    tags: ['charger', 'gan', 'quickcharge', 'travel'],
    status: 'active',
    createdAt: '2026-02-09T09:00:00Z',
    rating: 4.6,
    reviewsCount: 220,
    salesCount: 1560
  },

  // FASHION STORE PRODUCTS (Approved)
  {
    id: 'prod_fash_1',
    sellerId: 'seller_fashion_id',
    storeName: 'Aura Fashion',
    title: 'Vanguard Leather Biker Jacket - Handcrafted Top Grain Sheepskin',
    category: 'Fashion & Clothing',
    brand: 'Vanguard',
    sku: 'FASH-JK-M1',
    description: 'Elevate your wardrobe instantly with this classic biker silhouette. Hand-constructed from ultra-supple top-grain sheepskin leather that develops an elegant custom patina over time. Detailed with heavy-duty metal YKK zippers, lapel buttons, multiple pockets, and adjustable buckled side tabs.',
    specifications: [
      { key: 'Material', value: '100% Genuine Sheepskin Leather' },
      { key: 'Lining', value: 'Soft Breathable Polyester Inner' },
      { key: 'Closure', value: 'Assymetrical Front Zipper (YKK)' },
      { key: 'Origin', value: 'Handmade in Florence' }
    ],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80'
    ],
    price: 199.99,
    discount: 30, // €139.99 sale
    stock: 18,
    minOrder: 1,
    weight: 1.8,
    shippingCost: 0,
    shippingTime: '1-2 days',
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['Classic Black', 'Rich Mahogany'] }
    ],
    colors: ['Black', 'Brown'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['leather', 'jacket', 'biker', 'premium', 'mens'],
    status: 'active',
    createdAt: '2026-02-12T14:00:00Z',
    rating: 4.9,
    reviewsCount: 34,
    salesCount: 65
  },
  {
    id: 'prod_fash_2',
    sellerId: 'seller_fashion_id',
    storeName: 'Aura Fashion',
    title: 'AeroStride Breathable Sneakers - Lightweight Athletic Running Shoes',
    category: 'Fashion & Clothing',
    brand: 'AeroStride',
    sku: 'FASH-SN-U1',
    description: 'Designed for daily comfort, athletic runs, and city exploring. Our AeroStride knit sneakers are woven with durable elastic fibers offering unmatched ventilation. Includes a highly resilient nitrogen-infused foam midsole providing incredible cushion response, and slip-resistant rubber outsoles.',
    specifications: [
      { key: 'Upper Material', value: 'Eco-Knit Polyester mesh' },
      { key: 'Midsole Technology', value: 'NitroFoam high cushion' },
      { key: 'Weight', value: '230g per shoe' },
      { key: 'Style', value: 'Sport / Low-top' }
    ],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
    ],
    price: 65.00,
    discount: 40, // €39.00 sale - Super Deal!
    stock: 90,
    minOrder: 1,
    weight: 0.5,
    shippingCost: 2.00,
    shippingTime: '1-2 days',
    variants: [
      { name: 'Size', options: ['40', '41', '42', '43', '44'] },
      { name: 'Color', options: ['Neon Scarlet', 'Cool Grey', 'Volt Green'] }
    ],
    colors: ['Red', 'Grey', 'Green'],
    sizes: ['40', '41', '42', '43', '44'],
    tags: ['sneakers', 'running', 'shoes', 'athletic', 'comfort'],
    status: 'active',
    createdAt: '2026-02-14T10:00:00Z',
    rating: 4.5,
    reviewsCount: 78,
    salesCount: 290
  },
  {
    id: 'prod_fash_3',
    sellerId: 'seller_fashion_id',
    storeName: 'Aura Fashion',
    title: 'Classic Aviator Sunglasses - Polarized UV400 Protection',
    category: 'Fashion & Clothing',
    brand: 'AuraVision',
    sku: 'FASH-AV-S1',
    description: 'The absolute timeless classic. Equipped with premium multi-layered polarized lenses filtering 100% of UVA and UVB rays. Constructed with an ultra-lightweight but highly durable metal alloy frame featuring soft silicone adjustable nose pads and comfortable elastic temples.',
    specifications: [
      { key: 'Lens Protection', value: 'UV400 Polarized' },
      { key: 'Frame Material', value: 'High strength Magnesium-Alloy' },
      { key: 'Lens Width', value: '58mm' },
      { key: 'What is included', value: 'Hard shell case, Microfiber cloth' }
    ],
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
    ],
    price: 35.00,
    discount: 60, // €14.00 sale - Super Deal / Flash Deal!
    stock: 150,
    minOrder: 1,
    weight: 0.05,
    shippingCost: 0,
    shippingTime: '1-3 days',
    variants: [
      { name: 'Frame Color', options: ['Polished Gold', 'Gunmetal Grey', 'Classic Silver'] }
    ],
    colors: ['Gold', 'Grey', 'Silver'],
    sizes: [],
    tags: ['sunglasses', 'aviator', 'polarized', 'summer'],
    status: 'active',
    createdAt: '2026-02-15T09:30:00Z',
    rating: 4.7,
    reviewsCount: 52,
    salesCount: 310
  },

  // HOME STORE PRODUCTS (Pending Approval, but can show in admin or toggle to mock approval)
  {
    id: 'prod_home_1',
    sellerId: 'seller_home_id',
    storeName: 'Lumina Home',
    title: 'NeonStrip Smart LED Lights - RGBIC App & Voice Sync',
    category: 'Home & Garden',
    brand: 'Lumina',
    sku: 'HOME-LED-IC10',
    description: 'Transform your room atmosphere instantly with Lumina RGBIC. Unlike standard RGB, our advanced RGBIC technology features multiple independent control ICs along the strip to show a rainbow of shifting colors concurrently. Synces with your music beats and supports Amazon Alexa or Google Assistant control.',
    specifications: [
      { key: 'Length', value: '10 Meters (32.8ft)' },
      { key: 'LED Type', value: 'Premium 5050 RGBIC' },
      { key: 'Control Mode', value: 'Smart App, Voice Controller, Infrared Remote' },
      { key: 'Waterproof rating', value: 'IP65 (Splashproof)' }
    ],
    images: [
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
    ],
    price: 39.99,
    discount: 15, // €33.99 sale
    stock: 80,
    minOrder: 1,
    weight: 0.35,
    shippingCost: 1.99,
    shippingTime: '2-4 days',
    variants: [],
    colors: [],
    sizes: [],
    tags: ['led', 'smartlight', 'homecontrol', 'decor'],
    status: 'active',
    createdAt: '2026-02-23T11:00:00Z',
    rating: 4.4,
    reviewsCount: 18,
    salesCount: 45
  },
  {
    id: 'prod_home_2',
    sellerId: 'seller_home_id',
    storeName: 'Lumina Home',
    title: 'MochaExpress Smart Automatic Espresso Maker',
    category: 'Home & Garden',
    brand: 'MochaExpress',
    sku: 'HOME-COF-MX5',
    description: 'Your personal professional barista at home. One-touch brewing brews Espresso, Americano, Cappuccino, Latte, and hot milk effortlessly. Built-in adjustable stainless steel burr grinder grinds coffee beans fresh with 15 coarseness settings. Adjustable 19-bar heavy Italian pump guarantees flawless crema.',
    specifications: [
      { key: 'Pump Pressure', value: '19 Bar Italian Pump' },
      { key: 'Water Tank Capacity', value: '1.8 Liters' },
      { key: 'Bean Container', value: '250 grams with seal' },
      { key: 'Grinder settings', value: '15 Adjustable levels' },
      { key: 'Power rating', value: '1450 Watts' }
    ],
    images: [
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1579888944880-d98341148403?auto=format&fit=crop&w=600&q=80'
    ],
    price: 450.00,
    discount: 25, // €337.50 sale
    stock: 12,
    minOrder: 1,
    weight: 8.5,
    shippingCost: 15.00,
    shippingTime: '3-5 days',
    variants: [],
    colors: ['Brushed Steel', 'Onyx Black'],
    sizes: [],
    tags: ['coffee', 'espresso', 'barista', 'kitchen', 'automation'],
    status: 'draft', // Draft by default so we show draft filter in Seller Center!
    createdAt: '2026-02-24T15:00:00Z',
    rating: 4.8,
    reviewsCount: 5,
    salesCount: 12
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_tech_1',
    productTitle: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
    buyerId: 'user_buyer_1',
    buyerName: 'Sarah Borg',
    rating: 5,
    comment: 'The smartwatch exceeded my expectations! The AMOLED screen is bright even in full Malta sunlight. Heart rate and GPS are spot on. Highly recommended seller!',
    reply: 'Thank you for your fantastic review, Sarah! We appreciate your support and are glad you love the display quality.',
    createdAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'rev_2',
    productId: 'prod_tech_1',
    productTitle: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
    buyerId: 'user_buyer_anon',
    buyerName: 'Matthew V.',
    rating: 4,
    comment: 'Great watch, battery is lasting around 10 days for me. Sleek and comfortable. Shipping Birkirkara was very quick.',
    createdAt: '2026-02-18T16:45:00Z'
  },
  {
    id: 'rev_3',
    productId: 'prod_fash_2',
    productTitle: 'AeroStride Breathable Sneakers - Lightweight Athletic Running Shoes',
    buyerId: 'user_buyer_1',
    buyerName: 'Sarah Borg',
    rating: 5,
    comment: 'Extremely comfortable! It feels like running on clouds. Fits perfectly according to European sizing. The neon scarlet color is very vibrant!',
    reply: 'Thank you, Sarah! Great running with AeroStride! Safe strides ahead.',
    createdAt: '2026-02-20T11:30:00Z'
  }
];

const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup_tech_1',
    sellerId: 'seller_tech_id',
    code: 'TECHSAVE10',
    type: 'percentage',
    value: 10,
    minSpend: 40,
    expiryDate: '2026-12-31',
    maxUses: 100,
    usesCount: 12
  },
  {
    id: 'coup_tech_2',
    sellerId: 'seller_tech_id',
    code: 'FREEGIFT',
    type: 'free_shipping',
    value: 0,
    minSpend: 25,
    expiryDate: '2026-08-31',
    maxUses: 50,
    usesCount: 5
  },
  {
    id: 'coup_fash_1',
    sellerId: 'seller_fashion_id',
    code: 'AURASTYLE',
    type: 'fixed',
    value: 15,
    minSpend: 100,
    expiryDate: '2026-10-15',
    maxUses: 200,
    usesCount: 45
  },
  {
    id: 'coup_first',
    sellerId: 'seller_tech_id',
    code: 'EURODORBAR',
    type: 'percentage',
    value: 15,
    minSpend: 20,
    expiryDate: '2026-12-31',
    usesCount: 1,
    isFirstOrder: true
  }
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'not_1',
    recipientId: 'seller_tech_id',
    title: 'New Store Order placed',
    message: 'Buyer Sarah Borg placed Order #MM-29402 for AuraPulse Pro.',
    type: 'order',
    read: false,
    createdAt: '2026-03-01T10:15:00Z'
  },
  {
    id: 'not_2',
    recipientId: 'seller_tech_id',
    title: 'Low Stock Alert!',
    message: 'RetroClick Mechanical Keyboard has only 3 units left in inventory.',
    type: 'low_stock',
    read: false,
    createdAt: '2026-03-02T08:00:00Z'
  },
  {
    id: 'not_3',
    recipientId: 'user_buyer_1',
    title: 'Welcome to EuroDorbar',
    message: 'Welcome! Explore top local deals and multi-vendor AliExpress rates.',
    type: 'system',
    read: true,
    createdAt: '2026-01-15T10:05:00Z'
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'MM-29402',
    buyerId: 'user_buyer_1',
    buyerName: 'Sarah Borg',
    buyerEmail: 'buyer@eurodorbar.com',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    items: [
      {
        productId: 'prod_tech_1',
        title: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
        image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
        price: 89.99,
        discount: 25, // €67.49
        quantity: 1,
        color: 'Obsidian Black'
      },
      {
        productId: 'prod_tech_4',
        title: 'SuperCharge 65W GaN Charger - 3 Port Quick Charge Adapter',
        image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
        price: 29.99,
        discount: 50, // €14.99
        quantity: 1,
        color: 'Black'
      }
    ],
    subtotal: 82.48,
    shippingCost: 0,
    discountAmount: 8.25, // with TECHSAVE10 applied
    total: 74.23,
    status: 'paid', // paid means seller must accept/process!
    shippingAddress: {
      name: 'Sarah Borg',
      phone: '+356 7912 3456',
      address: '15, Triq il-Repubblika',
      city: 'Valletta',
      country: 'Malta',
      zipCode: 'VLT 1115'
    },
    invoiceNumber: 'INV-2026-001',
    createdAt: '2026-03-01T10:15:00Z',
    updatedAt: '2026-03-01T10:15:00Z'
  },
  {
    id: 'MM-28312',
    buyerId: 'user_buyer_1',
    buyerName: 'Sarah Borg',
    buyerEmail: 'buyer@eurodorbar.com',
    sellerId: 'seller_fashion_id',
    storeName: 'Aura Fashion',
    items: [
      {
        productId: 'prod_fash_2',
        title: 'AeroStride Breathable Sneakers - Lightweight Athletic Running Shoes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        price: 65.00,
        discount: 40, // €39.00
        quantity: 2,
        color: 'Neon Scarlet',
        size: '42'
      }
    ],
    subtotal: 78.00,
    shippingCost: 2.00,
    discountAmount: 0,
    total: 80.00,
    status: 'delivered', // already completed
    shippingAddress: {
      name: 'Sarah Borg',
      phone: '+356 7912 3456',
      address: '15, Triq il-Repubblika',
      city: 'Valletta',
      country: 'Malta',
      zipCode: 'VLT 1115'
    },
    trackingNumber: 'MP-9028471-MT',
    carrier: 'MaltaPost',
    invoiceNumber: 'INV-2026-002',
    createdAt: '2026-02-18T14:30:00Z',
    updatedAt: '2026-02-20T11:00:00Z'
  },
  {
    id: 'MM-21045',
    buyerId: 'user_buyer_anon_9',
    buyerName: 'Christian Muscat',
    buyerEmail: 'muscat.c@gmail.com',
    sellerId: 'seller_tech_id',
    storeName: 'MaltaTech Store',
    items: [
      {
        productId: 'prod_tech_2',
        title: 'SoundHelix Earbuds - Active Noise Cancelling High Fidelity Headset',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        price: 45.00,
        discount: 10, // €40.50
        quantity: 1,
        color: 'Matte Black'
      }
    ],
    subtotal: 40.50,
    shippingCost: 0,
    discountAmount: 0,
    total: 40.50,
    status: 'shipped', // currently transit
    shippingAddress: {
      name: 'Christian Muscat',
      phone: '+356 9912 0987',
      address: '88, Triq George Borg Olivier',
      city: 'St. Julians',
      country: 'Malta',
      zipCode: 'STJ 1081'
    },
    trackingNumber: 'MP-1104829-MT',
    carrier: 'MaltaPost',
    invoiceNumber: 'INV-2026-003',
    createdAt: '2026-02-28T09:12:00Z',
    updatedAt: '2026-02-28T16:00:00Z'
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'user_buyer_1',
    recipientId: 'user_seller_tech',
    chatId: 'user_buyer_1_seller_tech_id',
    message: 'Hello, are the AuraPulse Pro watches available for immediate pickup at Birkirkara?',
    read: true,
    createdAt: '2026-02-10T12:00:00Z'
  },
  {
    id: 'msg_2',
    senderId: 'user_seller_tech',
    recipientId: 'user_buyer_1',
    chatId: 'user_buyer_1_seller_tech_id',
    message: 'Hi Sarah! Yes, we have them in stock. You can pick it up today or purchase online for next-day delivery!',
    read: true,
    createdAt: '2026-02-10T12:15:00Z'
  },
  {
    id: 'msg_3',
    senderId: 'user_buyer_1',
    recipientId: 'user_seller_tech',
    chatId: 'user_buyer_1_seller_tech_id',
    message: 'Awesome, thanks! Buying it now.',
    read: false,
    createdAt: '2026-03-01T10:16:00Z'
  }
];

const SEED_LOGS: InventoryLog[] = [
  {
    id: 'log_1',
    productId: 'prod_tech_1',
    productTitle: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
    change: -1,
    reason: 'Purchase in Order #MM-29402',
    createdAt: '2026-03-01T10:15:00Z'
  },
  {
    id: 'log_2',
    productId: 'prod_tech_4',
    productTitle: 'SuperCharge 65W GaN Charger - 3 Port Quick Charge Adapter',
    change: -1,
    reason: 'Purchase in Order #MM-29402',
    createdAt: '2026-03-01T10:15:00Z'
  },
  {
    id: 'log_3',
    productId: 'prod_tech_1',
    productTitle: 'AuraPulse Pro Smart Watch - AMOLED Display, Blood Oxygen & GPS',
    change: 50,
    reason: 'Restock shipment approved',
    createdAt: '2026-02-25T08:00:00Z'
  }
];

// LocalStorage Database Class
class StorageDatabase {
  private getStorageItem<T>(key: string, fallback: T): T {
    const data = localStorage.getItem(`eurodorbar_${key}`);
    if (!data) {
      this.setStorageItem(key, fallback);
      return fallback;
    }
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    localStorage.setItem(`eurodorbar_${key}`, JSON.stringify(value));
  }

  constructor() {
    // Check and seed if completely empty
    if (!localStorage.getItem('eurodorbar_users')) this.resetDatabase();
  }

  public init() {
    // Already initialised by constructor, but kept for setup hooks
  }

  public resetDatabase() {
    this.setStorageItem('users', SEED_USERS);
    this.setStorageItem('sellers', SEED_SELLERS);
    this.setStorageItem('stores', SEED_STORES);
    this.setStorageItem('products', SEED_PRODUCTS);
    this.setStorageItem('reviews', SEED_REVIEWS);
    this.setStorageItem('coupons', SEED_COUPONS);
    this.setStorageItem('orders', SEED_ORDERS);
    this.setStorageItem('notifications', SEED_NOTIFICATIONS);
    this.setStorageItem('messages', SEED_MESSAGES);
    this.setStorageItem('inventory_logs', SEED_LOGS);
    this.setStorageItem('wishlist', []);
    this.setStorageItem('cart', []);
    this.setStorageItem('currentUser', SEED_USERS[0]); // default user is the Sarah Borg buyer
    this.setStorageItem('dark_mode', false);
  }

  // Auth Operations
  public getUsers(): User[] { return this.getStorageItem<User[]>('users', SEED_USERS); }
  public getSellers(): Seller[] { return this.getStorageItem<Seller[]>('sellers', SEED_SELLERS); }
  public getStores(): Store[] { return this.getStorageItem<Store[]>('stores', SEED_STORES); }
  public getProducts(): Product[] { return this.getStorageItem<Product[]>('products', SEED_PRODUCTS); }
  public getReviews(): Review[] { return this.getStorageItem<Review[]>('reviews', SEED_REVIEWS); }
  public getCoupons(): Coupon[] { return this.getStorageItem<Coupon[]>('coupons', SEED_COUPONS); }
  public getOrders(): Order[] { return this.getStorageItem<Order[]>('orders', SEED_ORDERS); }
  public getNotifications(): Notification[] { return this.getStorageItem<Notification[]>('notifications', SEED_NOTIFICATIONS); }
  public getMessages(): Message[] { return this.getStorageItem<Message[]>('messages', SEED_MESSAGES); }
  public getInventoryLogs(): InventoryLog[] { return this.getStorageItem<InventoryLog[]>('inventory_logs', SEED_LOGS); }
  public getWishlist(): string[] { return this.getStorageItem<string[]>('wishlist', []); }
  public getCart(): CartItem[] { return this.getStorageItem<CartItem[]>('cart', []); }
  public getCurrentUser(): User | null { return this.getStorageItem<User | null>('currentUser', SEED_USERS[0]); }
  public getDarkMode(): boolean { return this.getStorageItem<boolean>('dark_mode', false); }

  public setUsers(users: User[]) { this.setStorageItem('users', users); }
  public setSellers(sellers: Seller[]) { this.setStorageItem('sellers', sellers); }
  public setStores(stores: Store[]) { this.setStorageItem('stores', stores); }
  public setProducts(products: Product[]) { this.setStorageItem('products', products); }
  public setReviews(reviews: Review[]) { this.setStorageItem('reviews', reviews); }
  public setCoupons(coupons: Coupon[]) { this.setStorageItem('coupons', coupons); }
  public setOrders(orders: Order[]) { this.setStorageItem('orders', orders); }
  public setNotifications(notifs: Notification[]) { this.setStorageItem('notifications', notifs); }
  public setMessages(messages: Message[]) { this.setStorageItem('messages', messages); }
  public setInventoryLogs(logs: InventoryLog[]) { this.setStorageItem('inventory_logs', logs); }
  public setWishlist(wishlist: string[]) { this.setStorageItem('wishlist', wishlist); }
  public setCart(cart: CartItem[]) { this.setStorageItem('cart', cart); }
  public setCurrentUser(user: User | null) { this.setStorageItem('currentUser', user); }
  public setDarkMode(dark: boolean) { this.setStorageItem('dark_mode', dark); }

  // Auth helper: Login
  public login(email: string, password?: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Account not found with this email.' };
  }

  // Auth helper: Signup
  public signup(name: string, email: string, role: 'buyer' | 'seller', phone?: string, address?: string, password?: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered.' };
    }
    const newUser: User = {
      id: `user_${role}_${Date.now()}`,
      email,
      name,
      role,
      phone,
      address,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.setUsers(users);
    this.setCurrentUser(newUser);

    // Create system greeting notification
    this.addNotification(
      newUser.id,
      'Welcome to EuroDorbar',
      `Hello ${name}! Start exploring local deals, multi-vendor stores and discounts.`,
      'system'
    );

    return { success: true, user: newUser };
  }

  // Seller specific register
  public registerSeller(
    userId: string,
    businessName: string,
    storeName: string,
    email: string,
    phone: string,
    country: string,
    address: string,
    logo: string,
    banner: string,
    description: string
  ): { success: boolean; seller?: Seller; store?: Store; error?: string } {
    const sellers = this.getSellers();
    if (sellers.some(s => s.storeName.toLowerCase() === storeName.toLowerCase())) {
      return { success: false, error: 'Store name must be unique.' };
    }

    const sellerId = `seller_${Date.now()}`;
    const newSeller: Seller = {
      id: sellerId,
      userId,
      businessName,
      storeName,
      email,
      phone,
      country,
      address,
      logo: logo || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
      banner: banner || 'https://images.unsplash.com/photo-1441984969893-c534e9749007?auto=format&fit=crop&w=1200&q=80',
      description,
      termsAccepted: true,
      status: 'pending', // Pending initially
      createdAt: new Date().toISOString()
    };

    sellers.push(newSeller);
    this.setSellers(sellers);

    // Create Store
    const stores = this.getStores();
    const newStore: Store = {
      id: `store_${Date.now()}`,
      sellerId: newSeller.id,
      name: storeName,
      logo: newSeller.logo,
      banner: newSeller.banner,
      description: newSeller.description,
      categories: [],
      followersCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      contactEmail: email,
      contactPhone: phone,
      policies: {
        shipping: 'Standard multi-vendor marketplace shipping policy applies.',
        returns: 'Standard 15-day return policy for unused products.'
      }
    };
    stores.push(newStore);
    this.setStores(stores);

    // Update user role to seller
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx].role = 'seller';
      this.setUsers(users);
      this.setCurrentUser(users[userIdx]);
    }

    // Notify admins of new seller
    this.addNotification(
      'user_admin',
      'New Store Registration Pending',
      `Seller store "${storeName}" is pending admin approval.`,
      'system'
    );

    return { success: true, seller: newSeller, store: newStore };
  }

  // Notification helper
  public addNotification(recipientId: string, title: string, message: string, type: Notification['type']) {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      id: `not_${Date.now()}`,
      recipientId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    this.setNotifications(notifications);
  }

  // Inventory Helper
  public logInventory(productId: string, productTitle: string, change: number, reason: string) {
    const logs = this.getInventoryLogs();
    const newLog: InventoryLog = {
      id: `log_${Date.now()}`,
      productId,
      productTitle,
      change,
      reason,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.setInventoryLogs(logs);
  }

  // Checkout (places order, decrements stock, logs inventory, clears cart for items bought)
  public checkout(
    buyerId: string,
    buyerName: string,
    buyerEmail: string,
    storeCartGroups: StoreCartGroup[],
    shippingAddress: Order['shippingAddress']
  ): { success: boolean; orders?: Order[]; error?: string } {
    const products = this.getProducts();
    const orders = this.getOrders();
    const newOrders: Order[] = [];

    // Verify stock first
    for (const group of storeCartGroups) {
      for (const item of group.items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) return { success: false, error: `Product "${item.title}" no longer exists.` };
        if (prod.stock < item.quantity) return { success: false, error: `Insufficient stock for "${item.title}". Only ${prod.stock} units available.` };
      }
    }

    // Checkout each store as a separate sub-order
    for (const group of storeCartGroups) {
      const orderId = `MM-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderItems = group.items.map(item => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
        discount: item.discount,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }));

      // Calculate totals
      const subtotal = group.items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
      let discountAmount = 0;
      if (group.appliedCoupon) {
        if (group.appliedCoupon.type === 'percentage') {
          discountAmount = subtotal * (group.appliedCoupon.value / 100);
        } else if (group.appliedCoupon.type === 'fixed') {
          discountAmount = group.appliedCoupon.value;
        }
      }
      const shippingCost = (group.appliedCoupon?.type === 'free_shipping') ? 0 : group.shippingCost;
      const total = Math.max(0, subtotal - discountAmount + shippingCost);

      const newOrder: Order = {
        id: orderId,
        buyerId,
        buyerName,
        buyerEmail,
        sellerId: group.sellerId,
        storeName: group.storeName,
        items: orderItems,
        subtotal: Number(subtotal.toFixed(2)),
        shippingCost: Number(shippingCost.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        status: 'paid', // Instant paid mock
        shippingAddress,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Decrement stock and log inventory
      for (const item of group.items) {
        const pIdx = products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          products[pIdx].stock -= item.quantity;
          products[pIdx].salesCount += item.quantity;
          this.logInventory(
            item.productId,
            item.title,
            -item.quantity,
            `Purchase Order #${orderId}`
          );

          // Stock warning check
          if (products[pIdx].stock <= 5) {
            this.addNotification(
              group.sellerId,
              'Low Stock Warning!',
              `"${products[pIdx].title}" is low in stock (${products[pIdx].stock} items left).`,
              'low_stock'
            );
          }
        }
      }

      orders.unshift(newOrder);
      newOrders.push(newOrder);

      // Notify seller
      this.addNotification(
        group.sellerId,
        'New Order Received!',
        `Order ${orderId} was paid by ${buyerName} for €${total.toFixed(2)}.`,
        'order'
      );
    }

    // Save updated products and orders
    this.setProducts(products);
    this.setOrders(orders);
    
    // Clear cart entirely (since checkout is successful)
    this.setCart([]);

    return { success: true, orders: newOrders };
  }

  // Chat/Messaging Thread Getter
  public getChatThreads(currentUserId: string): ChatThread[] {
    const messages = this.getMessages();
    const threadsMap = new Map<string, { lastMsg: Message; msgs: Message[] }>();

    messages.forEach(msg => {
      if (msg.senderId === currentUserId || msg.recipientId === currentUserId) {
        const msgs = threadsMap.get(msg.chatId)?.msgs || [];
        msgs.push(msg);
        
        const lastMsg = threadsMap.get(msg.chatId)?.lastMsg;
        if (!lastMsg || new Date(msg.createdAt) > new Date(lastMsg.createdAt)) {
          threadsMap.set(msg.chatId, { lastMsg: msg, msgs });
        } else {
          threadsMap.set(msg.chatId, { lastMsg, msgs });
        }
      }
    });

    const threads: ChatThread[] = [];
    const sellers = this.getSellers();
    const users = this.getUsers();

    threadsMap.forEach((value, chatId) => {
      const parts = chatId.split('_');
      const buyerId = parts[1]; // structure user_buyer_1_seller_tech_id or buyerId_sellerId
      // Let's resolve safely
      let resolvedBuyerId = '';
      let resolvedSellerId = '';
      
      // Look up seller
      const seller = sellers.find(s => chatId.includes(s.id));
      if (seller) {
        resolvedSellerId = seller.id;
        resolvedBuyerId = chatId.replace(`_${seller.id}`, '').replace('chat_', '');
      } else {
        resolvedBuyerId = parts[0];
        resolvedSellerId = parts[1];
      }

      const buyerUser = users.find(u => u.id === resolvedBuyerId);
      const sellerInfo = sellers.find(s => s.id === resolvedSellerId);

      const unreadCount = value.msgs.filter(m => m.recipientId === currentUserId && !m.read).length;

      threads.push({
        chatId,
        buyerId: resolvedBuyerId,
        buyerName: buyerUser?.name || 'Anonymous Buyer',
        sellerId: resolvedSellerId,
        storeName: sellerInfo?.storeName || 'Seller Store',
        storeLogo: sellerInfo?.logo || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
        lastMessage: value.lastMsg.message,
        lastMessageAt: value.lastMsg.createdAt,
        unreadCount
      });
    });

    return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  // Get specific chat messages
  public getChatMessages(chatId: string): Message[] {
    const messages = this.getMessages();
    const threadMsgs = messages.filter(m => m.chatId === chatId);
    
    // Mark messages as read
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      let changed = false;
      messages.forEach(m => {
        if (m.chatId === chatId && m.recipientId === currentUser.id && !m.read) {
          m.read = true;
          changed = true;
        }
      });
      if (changed) {
        this.setMessages(messages);
      }
    }

    return threadMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Send message
  public sendMessage(senderId: string, recipientId: string, text: string): Message {
    const messages = this.getMessages();
    const sellers = this.getSellers();
    
    // Find store ids if needed to build chat id
    const isSenderSeller = sellers.some(s => s.userId === senderId);
    const isRecipientSeller = sellers.some(s => s.userId === recipientId);

    let buyerId = '';
    let sellerId = '';
    
    if (isSenderSeller) {
      sellerId = sellers.find(s => s.userId === senderId)?.id || '';
      buyerId = recipientId;
    } else if (isRecipientSeller) {
      sellerId = sellers.find(s => s.userId === recipientId)?.id || '';
      buyerId = senderId;
    } else {
      buyerId = senderId;
      sellerId = recipientId;
    }

    const chatId = `${buyerId}_${sellerId}`;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      recipientId,
      chatId,
      message: text,
      read: false,
      createdAt: new Date().toISOString()
    };

    messages.push(newMsg);
    this.setMessages(messages);

    // Notify recipient of message
    const notifyRecipientId = isRecipientSeller ? (sellers.find(s => s.id === sellerId)?.id || recipientId) : recipientId;
    this.addNotification(
      notifyRecipientId,
      'New message received',
      text.length > 40 ? `${text.substring(0, 40)}...` : text,
      'message'
    );

    return newMsg;
  }

  // Get Seller Analytics (dynamically computed from current orders to be 100% reactive!)
  public getSellerAnalytics(sellerId: string) {
    const orders = this.getOrders().filter(o => o.sellerId === sellerId);
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const products = this.getProducts().filter(p => p.sellerId === sellerId);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = orders.length;
    const completedOrdersCount = completedOrders.length;
    const pendingOrdersCount = orders.filter(o => o.status === 'paid' || o.status === 'processing').length;

    // Calculate today's sales
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Calculate monthly sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

    // Dynamic Daily Sales Growth Data for 7 days
    const dailySalesMap = new Map<string, { sales: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailySalesMap.set(dateKey, { sales: 0, orders: 0 });
    }

    orders.forEach(o => {
      const orderDate = o.createdAt.split('T')[0];
      if (dailySalesMap.has(orderDate)) {
        const current = dailySalesMap.get(orderDate)!;
        current.sales += o.total;
        current.orders += 1;
        dailySalesMap.set(orderDate, current);
      }
    });

    const dailySalesData: any[] = [];
    dailySalesMap.forEach((val, key) => {
      const dObj = new Date(key);
      const formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySalesData.push({
        date: formattedDate,
        sales: Number(val.sales.toFixed(2)),
        orders: val.orders,
        revenue: Number(val.sales.toFixed(2))
      });
    });

    // Top Selling Products
    const topProducts = [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        sales: p.salesCount,
        revenue: Number((p.salesCount * (p.price * (1 - p.discount / 100))).toFixed(2)),
        stock: p.stock
      }));

    // Mock constants for visitors
    const visitors = 428;
    const conversionRate = totalOrdersCount > 0 ? Number(((totalOrdersCount / visitors) * 100).toFixed(2)) : 0;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todaySales: Number(todaySales.toFixed(2)),
      monthlySales: Number(monthlySales.toFixed(2)),
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
      productsCount: products.length,
      visitors,
      conversionRate,
      dailySalesData,
      topProducts
    };
  }

  // ====================================================
  // GLOBALIZATION & SETTINGS HELPERS
  // ====================================================
  
  public getGlobalSettings() {
    return this.getStorageItem('global_settings', {
      country: 'Malta',
      language: 'en',
      currency: 'EUR',
      timezone: 'Europe/Malta'
    });
  }

  public setGlobalSettings(settings: { country: string; language: string; currency: string; timezone: string }) {
    this.setStorageItem('global_settings', settings);
  }

  public getExchangeRate(currency: string): number {
    const rates: Record<string, number> = {
      EUR: 1.0,
      USD: 1.09,
      GBP: 0.85,
      JPY: 165.0,
      AUD: 1.62
    };
    return rates[currency] || 1.0;
  }

  public getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$'
    };
    return symbols[currency] || '€';
  }

  public getCountryTaxRate(country: string): number {
    const vatRates: Record<string, number> = {
      Malta: 0.18,
      Italy: 0.22,
      'United Kingdom': 0.20,
      USA: 0.0,
      Germany: 0.19,
      China: 0.13
    };
    return vatRates[country] !== undefined ? vatRates[country] : 0.18;
  }

  public formatPrice(priceInEur: number): string {
    const settings = this.getGlobalSettings();
    const rate = this.getExchangeRate(settings.currency);
    const sym = this.getCurrencySymbol(settings.currency);
    const converted = priceInEur * rate;
    return `${sym}${converted.toFixed(2)}`;
  }

  public getConvertedPrice(priceInEur: number): number {
    const settings = this.getGlobalSettings();
    const rate = this.getExchangeRate(settings.currency);
    return Number((priceInEur * rate).toFixed(2));
  }

  // ====================================================
  // COINS, REWARDS, VIP & LOYALTY SYSTEM
  // ====================================================

  public getCoinsBalance(userId: string): number {
    return this.getStorageItem(`coins_${userId}`, 150); // Default 150 starting coins for Malta loyalty
  }

  public setCoinsBalance(userId: string, balance: number): void {
    this.setStorageItem(`coins_${userId}`, balance);
  }

  public getCheckinHistory(userId: string): string[] {
    return this.getStorageItem(`checkin_${userId}`, []);
  }

  public claimDailyCheckin(userId: string): { success: boolean; coinsEarned: number } {
    const history = this.getCheckinHistory(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    if (history.includes(todayStr)) {
      return { success: false, coinsEarned: 0 };
    }
    
    // Grant coins: 15 + streak bonus
    const newHistory = [...history, todayStr];
    this.setStorageItem(`checkin_${userId}`, newHistory);
    const baseCoins = 15;
    const currentBalance = this.getCoinsBalance(userId);
    this.setCoinsBalance(userId, currentBalance + baseCoins);
    
    this.addNotification(
      userId,
      'Daily Check-in Successful!',
      `You claimed your daily check-in reward of 15 Malta Coins. Keep it up!`,
      'system'
    );

    this.awardBadge(userId, 'Daily Loyalist');
    this.addVipPoints(userId, 10);
    this.logActivity(userId, 'Claimed daily check-in coins', 'Loyalty');

    return { success: true, coinsEarned: baseCoins };
  }

  public getVipInfo(userId: string) {
    const points = this.getStorageItem(`vip_points_${userId}`, 45); // Starter points
    let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' = 'Bronze';
    let cashbackPct = 0.01; // 1%
    
    if (points >= 1000) {
      tier = 'Diamond';
      cashbackPct = 0.10; // 10%
    } else if (points >= 500) {
      tier = 'Platinum';
      cashbackPct = 0.07; // 7%
    } else if (points >= 250) {
      tier = 'Gold';
      cashbackPct = 0.05; // 5%
    } else if (points >= 100) {
      tier = 'Silver';
      cashbackPct = 0.03; // 3%
    }

    return { tier, points, cashbackPct };
  }

  public addVipPoints(userId: string, pts: number): void {
    const current = this.getStorageItem(`vip_points_${userId}`, 45);
    const nextPoints = current + pts;
    this.setStorageItem(`vip_points_${userId}`, nextPoints);

    // Dynamic Level Up notification
    const getTierForPts = (p: number) => {
      if (p >= 1000) return 'Diamond';
      if (p >= 500) return 'Platinum';
      if (p >= 250) return 'Gold';
      if (p >= 100) return 'Silver';
      return 'Bronze';
    };

    const oldTier = getTierForPts(current);
    const newTier = getTierForPts(nextPoints);
    if (oldTier !== newTier) {
      this.addNotification(
        userId,
        'VIP Tier Leveled Up! 🚀',
        `Congratulations! You've reached VIP ${newTier} level. Unlock higher cashback & exclusive coupons.`,
        'system'
      );
      this.awardBadge(userId, `${newTier} Elite`);
    }
  }

  public getBadges(userId: string): string[] {
    const defaultBadges = ['Malta Explorer'];
    return this.getStorageItem(`badges_${userId}`, defaultBadges);
  }

  public awardBadge(userId: string, badge: string): void {
    const current = this.getBadges(userId);
    if (!current.includes(badge)) {
      const next = [...current, badge];
      this.setStorageItem(`badges_${userId}`, next);
      this.addNotification(
        userId,
        'New Achievement Unlocked! 🏆',
        `You have been awarded the "${badge}" badge for your activities.`,
        'system'
      );
    }
  }

  public getReferralInfo(userId: string) {
    const code = `MM-REF-${userId.substring(userId.length - 4).toUpperCase()}`;
    const referrals = this.getStorageItem<string[]>(`referrals_${userId}`, []);
    return { code, referrals };
  }

  public applyReferralCode(userId: string, refCode: string): { success: boolean; error?: string } {
    if (!refCode.startsWith('MM-REF-')) {
      return { success: false, error: 'Invalid referral code format. Must start with MM-REF-' };
    }
    
    const applied = this.getStorageItem<boolean>(`applied_ref_${userId}`, false);
    if (applied) {
      return { success: false, error: 'You have already applied a referral code.' };
    }

    this.setStorageItem(`applied_ref_${userId}`, true);
    // Reward applicant with 50 coins
    const myCoins = this.getCoinsBalance(userId);
    this.setCoinsBalance(userId, myCoins + 50);

    // Notify user
    this.addNotification(
      userId,
      'Referral Reward Claimed! 🎁',
      `You entered referral code ${refCode} and received 50 Malta Coins!`,
      'system'
    );

    this.awardBadge(userId, 'Social Shopper');
    this.logActivity(userId, `Applied referral code ${refCode}`, 'Loyalty');

    return { success: true };
  }

  // ====================================================
  // EXTRA ADVANCED COUPONS SYSTEM
  // ====================================================

  public getClaimedCoupons(userId: string): Coupon[] {
    return this.getStorageItem<Coupon[]>(`claimed_coupons_${userId}`, [
      {
        id: 'coup_platform_new',
        sellerId: 'platform',
        code: 'WELCOME_MM',
        type: 'percentage',
        value: 10,
        minSpend: 20,
        expiryDate: '2026-12-31',
        usesCount: 0,
        isFirstOrder: true
      },
      {
        id: 'coup_platform_shipping',
        sellerId: 'platform',
        code: 'FREE_SHIP_GLOBAL',
        type: 'free_shipping',
        value: 0,
        minSpend: 15,
        expiryDate: '2026-12-31',
        usesCount: 0
      }
    ]);
  }

  public setClaimedCoupons(userId: string, coupons: Coupon[]) {
    this.setStorageItem(`claimed_coupons_${userId}`, coupons);
  }

  public claimCoupon(userId: string, couponCode: string): { success: boolean; error?: string } {
    const allCoupons = this.getCoupons();
    const match = allCoupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!match) {
      return { success: false, error: 'Coupon code not found.' };
    }

    const claimed = this.getClaimedCoupons(userId);
    if (claimed.some(c => c.code === match.code)) {
      return { success: false, error: 'You have already claimed this coupon.' };
    }

    const nextClaimed = [...claimed, match];
    this.setClaimedCoupons(userId, nextClaimed);
    
    this.addNotification(
      userId,
      'Coupon Claimed! 🎟',
      `Coupon "${match.code}" was successfully saved to your account coupon wallet.`,
      'system'
    );

    this.logActivity(userId, `Claimed coupon: ${match.code}`, 'Coupons');

    return { success: true };
  }

  // ====================================================
  // SOCIAL FEED AND STORIES
  // ====================================================

  public getSocialPosts() {
    return this.getStorageItem('social_posts', [
      {
        id: 'post_1',
        userId: 'user_seller_tech',
        userName: 'Camilleri Electronics',
        avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
        content: 'Check out the new smart pulse wearable arriving this week! Includes dual-band GPS and up to 14 days battery life. Order now for exclusive VIP early-bird coupon.',
        image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
        likes: 42,
        shares: 8,
        productId: 'prod_tech_1',
        createdAt: '2026-07-02T12:00:00Z',
        likedBy: []
      },
      {
        id: 'post_2',
        userId: 'user_buyer_1',
        userName: 'Sarah Borg',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        content: 'In love with this Retro Mechanical Keyboard I bought from Camilleri Electronics on EuroDorbar. The clickiness of the brown tactile switches is perfect! 🎹🇲🇹',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
        likes: 19,
        shares: 1,
        productId: 'prod_tech_3',
        createdAt: '2026-07-01T15:30:00Z',
        likedBy: []
      },
      {
        id: 'post_3',
        userId: 'user_seller_fashion',
        userName: 'Aura Fashion Boutique',
        avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
        content: 'Unveiling our summer sunglasses collections! Hand-polished acetate frame, UV400 filters, perfectly crafted for Mediterranean sunny skies.',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
        likes: 31,
        shares: 4,
        productId: 'prod_fashion_2',
        createdAt: '2026-06-30T09:00:00Z',
        likedBy: []
      }
    ]);
  }

  public setSocialPosts(posts: any[]) {
    this.setStorageItem('social_posts', posts);
  }

  public toggleLikePost(postId: string, userId: string) {
    const posts = this.getSocialPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      const p = posts[idx];
      p.likedBy = p.likedBy || [];
      if (p.likedBy.includes(userId)) {
        p.likedBy = p.likedBy.filter((id: string) => id !== userId);
        p.likes = Math.max(0, p.likes - 1);
      } else {
        p.likedBy.push(userId);
        p.likes += 1;
      }
      this.setSocialPosts(posts);
    }
  }

  public createSocialPost(userId: string, userName: string, avatar: string, content: string, image?: string, productId?: string) {
    const posts = this.getSocialPosts();
    const newPost = {
      id: `post_${Date.now()}`,
      userId,
      userName,
      avatar,
      content,
      image,
      likes: 0,
      shares: 0,
      productId,
      createdAt: new Date().toISOString(),
      likedBy: []
    };
    posts.unshift(newPost);
    this.setSocialPosts(posts);
    this.logActivity(userId, `Created social feed post`, 'Social');
    return newPost;
  }

  // Follow states
  public followStore(userId: string, storeId: string): void {
    const followed = this.getStorageItem<string[]>(`followed_stores_${userId}`, []);
    const stores = this.getStores();
    
    let nextFollowed = [];
    if (followed.includes(storeId)) {
      nextFollowed = followed.filter(id => id !== storeId);
      const sIdx = stores.findIndex(s => s.id === storeId);
      if (sIdx !== -1) stores[sIdx].followersCount = Math.max(0, stores[sIdx].followersCount - 1);
    } else {
      nextFollowed = [...followed, storeId];
      const sIdx = stores.findIndex(s => s.id === storeId);
      if (sIdx !== -1) stores[sIdx].followersCount += 1;
    }
    
    this.setStorageItem(`followed_stores_${userId}`, nextFollowed);
    this.setStores(stores);
    this.logActivity(userId, `Toggled store following state: ${storeId}`, 'Social');
  }

  public getFollowedStores(userId: string): string[] {
    return this.getStorageItem<string[]>(`followed_stores_${userId}`, []);
  }

  // ====================================================
  // PROFESSIONAL HELPDESK & REFUNDS / DISPUTES
  // ====================================================

  public getSupportTickets(userId: string): any[] {
    return this.getStorageItem<any[]>(`tickets_${userId}`, [
      {
        id: 'TCK-8294',
        userId,
        subject: 'Customs Tax Question on Overseas Shipment',
        message: 'Is VAT handled during check out for shipments from Italy?',
        category: 'Shipping',
        status: 'resolved',
        reply: 'Yes, EuroDorbar automatically calculates VAT/tax settings based on your country selector. VAT is pre-cleared for shipments between EU countries!',
        createdAt: '2026-06-15T11:00:00Z',
        updatedAt: '2026-06-15T14:30:00Z'
      }
    ]);
  }

  public createSupportTicket(userId: string, subject: string, message: string, category: string) {
    const tickets = this.getSupportTickets(userId);
    const newT = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      subject,
      message,
      category,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tickets.unshift(newT);
    this.setStorageItem(`tickets_${userId}`, tickets);
    this.logActivity(userId, `Created support ticket: ${newT.id}`, 'Support');
    return newT;
  }

  public getDisputes(userId: string): any[] {
    return this.getStorageItem<any[]>(`disputes_${userId}`, []);
  }

  public createDispute(userId: string, orderId: string, reason: string, details: string) {
    const disputes = this.getDisputes(userId);
    const newDisp = {
      id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      orderId,
      reason,
      details,
      status: 'under_review',
      reply: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    disputes.unshift(newDisp);
    this.setStorageItem(`disputes_${userId}`, disputes);
    this.logActivity(userId, `Initiated dispute on Order #${orderId}`, 'Support');
    
    // Auto simulate refund team actions
    setTimeout(() => {
      const updated = this.getDisputes(userId);
      const match = updated.find(d => d.id === newDisp.id);
      if (match) {
        match.status = 'approved';
        match.reply = 'EuroDorbar dispute Resolution Team has reviewed and approved your refund request. The money (€) will credit back to your account within 3 business days.';
        match.updatedAt = new Date().toISOString();
        this.setStorageItem(`disputes_${userId}`, updated);
        
        // Add refund notification
        this.addNotification(
          userId,
          'Refund Dispute Approved! 💰',
          `Your refund dispute ${newDisp.id} was approved by EuroDorbar Resolution Team.`,
          'system'
        );
      }
    }, 10000);

    return newDisp;
  }

  // ====================================================
  // AUDIT LOGS FOR ACTIVITY TRACKING
  // ====================================================

  public getActivityLogs(userId: string): any[] {
    return this.getStorageItem<any[]>(`audit_logs_${userId}`, [
      { id: 'log_a1', action: 'Account Created', module: 'Auth', timestamp: '2026-01-15T10:00:00Z' },
      { id: 'log_a2', action: 'Daily coins check-in', module: 'Loyalty', timestamp: '2026-07-02T08:15:00Z' }
    ]);
  }

  public logActivity(userId: string, action: string, module: string) {
    const logs = this.getActivityLogs(userId);
    logs.unshift({
      id: `act_${Date.now()}`,
      action,
      module,
      timestamp: new Date().toISOString()
    });
    this.setStorageItem(`audit_logs_${userId}`, logs);
  }
}

export const db = new StorageDatabase();

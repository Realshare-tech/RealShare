import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Neutrals, GoldSystem, Typography, Radius } from '@/constants/design';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { getFullImageUrl, formatPrice } from '@/lib/formatters';
import { Ionicons } from '@expo/vector-icons';

interface Property {
  id: string | number;
  title: string;
  price_per_fraction?: number | string;
  total_fractions?: number;
  locality?: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  images: any[];
  [key: string]: any;
}

interface FeaturedPropertiesSliderProps {
  properties: Property[];
}

export function FeaturedPropertiesSlider({ properties }: FeaturedPropertiesSliderProps) {
  const { isDesktop } = useResponsive();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  // Use first 5 properties
  const slides = properties.slice(0, 5);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const handleNext = React.useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
      slideAnim.setValue(0);
      isAnimating.current = false;
    });
  }, [slides.length, slideAnim]);
  
  const handlePrev = React.useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
      slideAnim.setValue(0);
      isAnimating.current = false;
    });
  }, [slides.length, slideAnim]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [handleNext, slides.length]);

  const getImg = (prop: any) => {
    if (!prop) return '';
    const firstImg = prop.images?.[0];
    const rawImage = typeof firstImg === 'string' ? firstImg : (firstImg?.image_url || prop.image_url || '');
    return getFullImageUrl(rawImage);
  };

  const getPriceDisplay = (prop: any) => {
    if (!prop) return '';
    const amount = Number(prop.price_per_fraction || 0) * (prop.total_fractions || 1);
    return amount > 0 ? formatPrice(amount) : 'Price on Request';
  };

  if (slides.length === 0) {
    return null;
  }

  // --- DESKTOP LAYOUT ---
  if (isDesktop) {
    const activeSlide = slides[activeIndex];

    return (
      <View style={desktopStyles.container}>
        {/* Layer 1: Ambient Blurred Background */}
        <Image 
          source={{ uri: getImg(activeSlide) }} 
          style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.1 }] }]} 
          contentFit="cover" 
          blurRadius={Platform.OS === 'web' ? undefined : 40}
        />
        {Platform.OS === 'web' && (
          <View style={[StyleSheet.absoluteFill, { backdropFilter: 'blur(40px)' } as any]} />
        )}
        
        {/* Layer 2: Dark Overlay for contrast */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 15, 20, 0.65)' }]} />

        {/* Layer 3: Content Layout */}
        <View style={desktopStyles.layoutWrapper}>
          
          {/* LEFT COLUMN: Editorial Text & Glass Card */}
          <View style={desktopStyles.leftColumn}>
            
            <View style={desktopStyles.editorialHeader}>
              <View style={desktopStyles.headerTopRow}>
                <View style={desktopStyles.goldDot} />
                <Text style={desktopStyles.superTitle}>FEATURED PROPERTY</Text>
              </View>
              <Text style={desktopStyles.mainTitle}>
                Extraordinary Spaces,{'\n'}
                <Text style={{ color: GoldSystem.primaryGold }}>Real Possibilities.</Text>
              </Text>
            </View>

            {/* Glassmorphism Property Card */}
            <View style={desktopStyles.glassCard}>
              <View style={desktopStyles.glassCardTop}>
                <View style={desktopStyles.mainBadge}>
                  <Ionicons name="star" size={12} color={GoldSystem.primaryGold} style={{ marginRight: 6 }} />
                  <Text style={desktopStyles.mainBadgeText}>PREMIUM COLLECTION</Text>
                </View>
                <View style={desktopStyles.locationRow}>
                  <Ionicons name="location-outline" size={16} color={Neutrals.gray200} />
                  <Text style={desktopStyles.locationText}>{activeSlide.locality}, {activeSlide.district}</Text>
                </View>
                <Text style={desktopStyles.cardTitle}>{activeSlide.title}</Text>
                
                <View style={desktopStyles.amenitiesRow}>
                  {!!activeSlide.bedrooms && <View style={desktopStyles.amenityItem}><Ionicons name="bed-outline" size={18} color={Neutrals.gray200}/><Text style={desktopStyles.amenityText}>{activeSlide.bedrooms} Beds</Text></View>}
                  {!!activeSlide.bathrooms && <View style={desktopStyles.amenityItem}><Ionicons name="water-outline" size={18} color={Neutrals.gray200}/><Text style={desktopStyles.amenityText}>{activeSlide.bathrooms} Baths</Text></View>}
                  {!!activeSlide.area_sqft && <View style={desktopStyles.amenityItem}><Ionicons name="expand-outline" size={18} color={Neutrals.gray200}/><Text style={desktopStyles.amenityText}>{activeSlide.area_sqft} Sq.Ft</Text></View>}
                </View>
              </View>
              
              <View style={desktopStyles.glassCardBottom}>
                <View>
                  <Text style={desktopStyles.priceLabel}>Offered At</Text>
                  <Text style={desktopStyles.priceText}>{getPriceDisplay(activeSlide)}</Text>
                </View>
                <TouchableOpacity style={desktopStyles.viewBtn} onPress={() => router.push(`/property/${activeSlide.id}` as any)}>
                  <Text style={desktopStyles.viewBtnText}>Explore Details</Text>
                  <Ionicons name="arrow-forward" size={18} color={Neutrals.obsidian} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modern Controls */}
            <View style={desktopStyles.controlsRow}>
              <TouchableOpacity onPress={handlePrev} style={desktopStyles.controlBtn}>
                <Ionicons name="arrow-back" size={24} color={Neutrals.white} />
              </TouchableOpacity>
              <Text style={desktopStyles.paginationText}>
                <Text style={{ color: Neutrals.white, fontWeight: '700' }}>
                  {String(activeIndex + 1).padStart(2, '0')}
                </Text>
                <Text style={{ color: Neutrals.gray400 }}>
                  {' '}/ {String(slides.length).padStart(2, '0')}
                </Text>
              </Text>
              <TouchableOpacity onPress={handleNext} style={desktopStyles.controlBtn}>
                <Ionicons name="arrow-forward" size={24} color={Neutrals.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* RIGHT COLUMN: Pristine Image */}
          <View style={desktopStyles.rightColumn}>
            <View style={desktopStyles.heroImageWrapper}>
              <Image source={{ uri: getImg(activeSlide) }} style={desktopStyles.heroImage} contentFit="cover" />
              
              {/* Optional secondary thumbnails overlaid */}
              {activeSlide.images?.length > 1 && (
                <View style={desktopStyles.thumbnailStack}>
                  {activeSlide.images.slice(1, 4).map((img: any, i: number) => {
                    const raw = typeof img === 'string' ? img : (img?.image_url || '');
                    return (
                      <View key={i} style={desktopStyles.smallThumbnail}>
                        <Image source={{ uri: getFullImageUrl(raw) }} style={StyleSheet.absoluteFill} contentFit="cover" />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

        </View>
      </View>
    );
  }

  // --- MOBILE LAYOUT (Fallback) ---
  const activeMobileSlide = slides[activeIndex];

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
        <Text style={styles.mobileSuperTitle}>FEATURED PROPERTIES</Text>
        <Text style={styles.mobileMainTitle}>
          Extraordinary Spaces,{'\n'}
          <Text style={{ color: GoldSystem.primaryGold }}>Real Possibilities.</Text>
        </Text>
      </View>

      <View style={[styles.slide, { marginHorizontal: 16, borderRadius: Radius.lg, overflow: 'hidden' }]}>
        <Image source={{ uri: getImg(activeMobileSlide) }} style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.9)']} style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]} />
        


        <View style={styles.content}>
          <Text style={styles.title}>{activeMobileSlide.title}</Text>
          <Text style={styles.subtitle}>
            {activeMobileSlide.locality}, {activeMobileSlide.district}
          </Text>
          <Text style={styles.priceTextMobile}>{getPriceDisplay(activeMobileSlide)}</Text>
          <TouchableOpacity 
            style={styles.mobileViewBtn} 
            onPress={() => router.push(`/property/${activeMobileSlide.id}` as any)}>
            <Text style={styles.mobileViewBtnText}>View Property</Text>
            <Ionicons name="arrow-forward" size={14} color={Neutrals.obsidian} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[desktopStyles.controlsRow, { justifyContent: 'center', marginTop: 24 }]}>
        <TouchableOpacity onPress={handlePrev} style={desktopStyles.controlBtn}>
          <Ionicons name="chevron-back" size={20} color={Neutrals.white} />
        </TouchableOpacity>
        <Text style={[desktopStyles.paginationText, { marginHorizontal: 16 }]}>
          <Text style={{ color: GoldSystem.primaryGold, fontWeight: '700' }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </Text>
          {' '}/ {String(slides.length).padStart(2, '0')}
        </Text>
        <TouchableOpacity onPress={handleNext} style={[desktopStyles.controlBtn, { backgroundColor: Neutrals.gray200 }]}>
          <Ionicons name="chevron-forward" size={20} color={Neutrals.obsidian} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 0,
    marginTop: 24,
  },
  slide: {
    height: 260,
    position: 'relative',
    ...(Platform.OS === 'web' ? { boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } as any : { elevation: 5 }),
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: GoldSystem.primaryGold,
    letterSpacing: 1,
  },
  content: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  title: {
    ...Typography.titleLarge,
    color: Neutrals.white,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Neutrals.gray300,
    marginBottom: 8,
  },
  priceTextMobile: {
    fontSize: 14,
    fontWeight: '700',
    color: Neutrals.white,
    marginBottom: 12,
  },
  mobileSuperTitle: {
    ...Typography.labelMedium,
    color: GoldSystem.primaryGold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  mobileMainTitle: {
    ...Typography.displayMedium,
    color: Neutrals.obsidian,
  },
  mobileStatsBar: {
    flexDirection: 'row',
    backgroundColor: Neutrals.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    justifyContent: 'space-around',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 20px rgba(0,0,0,0.05)' } as any : { elevation: 3 }),
  },
  mobileStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileViewBtn: {
    backgroundColor: GoldSystem.primaryGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  mobileViewBtnText: {
    ...Typography.labelMedium,
    color: Neutrals.obsidian,
    fontWeight: '700',
  },
});

const desktopStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: '4%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
  },
  bgShape: {
    position: 'absolute',
    top: 24,
    bottom: 24,
    left: -200,
    right: '40%',
    backgroundColor: Neutrals.white,
    borderTopRightRadius: 400,
    borderBottomRightRadius: 500,
    zIndex: 0,
    ...(Platform.OS === 'web' ? { boxShadow: '20px 20px 60px rgba(0,0,0,0.03)' } as any : { elevation: 1 }),
  },
  scriptFloatingText: {
    position: 'absolute',
    top: 40,
    right: '28%',
    fontFamily: Platform.OS === 'web' ? 'cursive, "Brush Script MT", "Comic Sans MS"' : undefined,
    fontStyle: 'italic',
    fontSize: 36,
    color: GoldSystem.darkGold,
    transform: [{ rotate: '-5deg' }],
    zIndex: 1,
  },
  bannerWrapper: {
    width: '100%',
    height: 480,
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 48px rgba(0,0,0,0.25)' } as any : { elevation: 10 }),
  },
  layoutWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '8%',
    paddingVertical: 64,
  },
  leftColumn: {
    width: '42%',
    justifyContent: 'center',
  },
  rightColumn: {
    width: '52%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editorialHeader: {
    marginBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GoldSystem.primaryGold,
    marginRight: 12,
  },
  superTitle: {
    ...Typography.labelMedium,
    color: GoldSystem.primaryGold,
    letterSpacing: 3,
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    color: Neutrals.white,
    fontFamily: Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : undefined,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px)' } as any : {}),
  },
  glassCardTop: {
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  glassCardBottom: {
    padding: 24,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  mainBadgeText: {
    ...Typography.caption,
    color: GoldSystem.primaryGold,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    ...Typography.labelMedium,
    color: Neutrals.gray200,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Neutrals.white,
    marginBottom: 20,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    ...Typography.labelMedium,
    color: Neutrals.gray100,
  },
  priceLabel: {
    ...Typography.caption,
    color: Neutrals.gray400,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '700',
    color: Neutrals.white,
  },
  viewBtn: {
    backgroundColor: GoldSystem.primaryGold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewBtnText: {
    ...Typography.labelMedium,
    color: Neutrals.obsidian,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 24,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  paginationText: {
    ...Typography.labelLarge,
    letterSpacing: 2,
  },
  heroImageWrapper: {
    width: '100%',
    height: 520,
    borderRadius: 32,
    position: 'relative',
    ...(Platform.OS === 'web' ? { boxShadow: '0 32px 64px rgba(0,0,0,0.4)' } as any : { elevation: 12 }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  thumbnailStack: {
    position: 'absolute',
    bottom: -24,
    left: -24,
    flexDirection: 'row',
    gap: 16,
  },
  smallThumbnail: {
    width: 100,
    height: 80,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#1E1E24',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 24px rgba(0,0,0,0.3)' } as any : { elevation: 8 }),
  },
  playBtnCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(4px)' } as any : {}),
  },
  playText: {
    ...Typography.caption,
    color: Neutrals.white,
    marginTop: 8,
    fontWeight: '600',
  },
  mainCardBottom: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  rightCol: {
    width: '23%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cascadeCard: {
    width: '30%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 24px rgba(0,0,0,0.2)' } as any : { elevation: 6 }),
  },
  cascadeContent: {
    position: 'absolute',
    top: 24,
    left: 12,
    right: 12,
  },
  cascadeTitle: {
    ...Typography.labelMedium,
    color: Neutrals.white,
    marginBottom: 4,
  },
  cascadeLocation: {
    ...Typography.caption,
    color: Neutrals.gray300,
  },
  cascadeArrowBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: Neutrals.white,
    borderRadius: 24,
    padding: 32,
    marginTop: 64,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 30px rgba(0,0,0,0.05)' } as any : { elevation: 4 }),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Neutrals.gray200,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '700',
    color: Neutrals.obsidian,
  },
  statLabel: {
    ...Typography.caption,
    color: Neutrals.gray500,
    marginTop: 2,
  },
  statFooterDesc: {
    ...Typography.labelMedium,
    color: Neutrals.gray600,
    lineHeight: 20,
  },
});

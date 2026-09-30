import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity, useWindowDimensions, Animated, TouchableWithoutFeedback } from 'react-native';
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
    return (
      <View style={[desktopStyles.container, { height: 680, paddingHorizontal: 0, paddingVertical: 0, backgroundColor: '#FAF8F5', overflow: 'hidden' }]}>
        
        {/* Top Header / Title */}
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 16, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GoldSystem.primaryGold, marginRight: 12 }} />
            <Text style={{ ...Typography.labelMedium, color: GoldSystem.darkGold, letterSpacing: 3, fontWeight: '700' }}>PREMIUM COLLECTION</Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GoldSystem.primaryGold, marginLeft: 12 }} />
          </View>
          <Text style={{ fontSize: 40, fontWeight: '800', color: Neutrals.obsidian, fontFamily: Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : undefined }}>
            Extraordinary Spaces
          </Text>
        </View>

        {/* 3D Coverflow Container */}
        <View style={{ flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          {slides.map((prop, idx) => {
            // Compute shortest path offset taking into account wrap-around
            const total = slides.length;
            let offset = (idx - activeIndex) % total;
            if (offset > Math.floor(total / 2)) offset -= total;
            if (offset < -Math.floor(total / 2)) offset += total;

            // We only care about rendering offsets -2, -1, 0, 1, 2
            if (Math.abs(offset) > 2) return null;

            // Animation mapping:
            let translateX, scale, opacity, zIndex;
            
            if (offset === 0) {
              translateX = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [350, 0, -350] });
              scale = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.85, 1, 0.85] });
              opacity = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.6, 1, 0.6] });
              zIndex = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [2, 5, 2] });
            } else if (offset === 1) {
              translateX = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [650, 350, 0] });
              scale = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.75, 0.85, 1] });
              opacity = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0.6, 1] });
              zIndex = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [1, 2, 4] });
            } else if (offset === -1) {
              translateX = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, -350, -650] });
              scale = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [1, 0.85, 0.75] });
              opacity = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [1, 0.6, 0] });
              zIndex = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [4, 2, 1] });
            } else if (offset === 2) {
              translateX = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [1000, 650, 350] });
              scale = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.7, 0.75, 0.85] });
              opacity = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0, 0.6] });
              zIndex = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 2] });
            } else if (offset === -2) {
              translateX = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-350, -650, -1000] });
              scale = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.85, 0.75, 0.7] });
              opacity = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.6, 0, 0] });
              zIndex = slideAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [2, 1, 0] });
            } else {
              translateX = 0; scale = 0; opacity = 0; zIndex = 0;
            }

            // We only show text on the active card
            const textOpacity = offset === 0 
              ? slideAnim.interpolate({ inputRange: [-1, -0.5, 0, 0.5, 1], outputRange: [0, 0, 1, 0, 0] })
              : slideAnim.interpolate({ inputRange: [-1, -0.5, 0, 0.5, 1], outputRange: [offset === -1 ? 1 : 0, 0, 0, 0, offset === 1 ? 1 : 0] });

            const priceDisplayStr = getPriceDisplay(prop);
            const isPriceRequest = priceDisplayStr === 'Price on Request';

            return (
              <TouchableWithoutFeedback 
                key={prop.id}
                onPress={() => {
                  if (offset > 0) handleNext();
                  else if (offset < 0) handlePrev();
                }}
              >
                <Animated.View 
                  style={[
                    {
                      position: 'absolute',
                      width: 700,
                      height: 440,
                      borderRadius: 32,
                      backgroundColor: Neutrals.white,
                      overflow: 'hidden',
                      transform: [{ translateX }, { scale }],
                      opacity,
                      zIndex,
                      ...(Platform.OS === 'web' ? { boxShadow: '0 24px 48px rgba(0,0,0,0.15)' } as any : { elevation: 8 })
                    }
                  ]}
                >
                  <Image source={{ uri: getImg(prop) }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  
                  {/* Gradient and Text overlay */}
                  <Animated.View style={[StyleSheet.absoluteFill, { opacity: textOpacity, pointerEvents: offset === 0 ? 'auto' : 'none' }]}>
                    <LinearGradient 
                      colors={['transparent', 'rgba(0,0,0,0.85)']} 
                      style={StyleSheet.absoluteFill} 
                      start={{ x: 0, y: 0.3 }}
                      end={{ x: 0, y: 1 }}
                    />
                    
                    <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View style={{ flex: 1, paddingRight: 32 }}>
                          <Text style={{ ...Typography.labelMedium, color: GoldSystem.primaryGold, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{prop.locality}, {prop.district}</Text>
                          <Text style={{ fontSize: 36, fontWeight: '700', color: Neutrals.white, marginBottom: 16 }}>{prop.title}</Text>
                          <View style={{ flexDirection: 'row', gap: 24 }}>
                            {!!prop.bedrooms && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="bed-outline" size={20} color={Neutrals.gray200}/><Text style={{ ...Typography.labelLarge, color: Neutrals.white }}>{prop.bedrooms} Beds</Text></View>}
                            {!!prop.bathrooms && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="water-outline" size={20} color={Neutrals.gray200}/><Text style={{ ...Typography.labelLarge, color: Neutrals.white }}>{prop.bathrooms} Baths</Text></View>}
                            {!!prop.area_sqft && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="scan-outline" size={20} color={Neutrals.gray200}/><Text style={{ ...Typography.labelLarge, color: Neutrals.white }}>{prop.area_sqft} Sq.Ft</Text></View>}
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: isPriceRequest ? 22 : 32, fontWeight: '700', color: Neutrals.white, marginBottom: 24 }}>{priceDisplayStr}</Text>
                          <TouchableOpacity 
                            style={{ backgroundColor: GoldSystem.primaryGold, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 32, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                            onPress={() => router.push(`/property/${prop.id}` as any)}
                          >
                            <Text style={{ ...Typography.labelLarge, color: Neutrals.obsidian, fontWeight: '700' }}>View Details</Text>
                            <Ionicons name="arrow-forward" size={18} color={Neutrals.obsidian} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>

        {/* Controls sitting below the 3D container */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32, paddingBottom: 32, zIndex: 10 }}>
           <TouchableOpacity onPress={handlePrev} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Neutrals.white, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } as any : { elevation: 4 }) }}>
             <Ionicons name="arrow-back" size={24} color={Neutrals.obsidian} />
           </TouchableOpacity>
           
           <View style={{ flexDirection: 'row', gap: 8 }}>
             {slides.map((_, i) => (
               <View key={i} style={{ width: i === activeIndex ? 32 : 8, height: 8, borderRadius: 4, backgroundColor: i === activeIndex ? GoldSystem.primaryGold : Neutrals.gray300 }} />
             ))}
           </View>
           
           <TouchableOpacity onPress={handleNext} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Neutrals.white, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } as any : { elevation: 4 }) }}>
             <Ionicons name="arrow-forward" size={24} color={Neutrals.obsidian} />
           </TouchableOpacity>
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
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: '8%',
    paddingTop: '8%',
  },
  leftPanel: {
    flex: 1,
    paddingRight: 64,
    justifyContent: 'center',
  },
  rightPanel: {
    width: '15%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Neutrals.white,
    marginRight: 8,
  },
  pillText: {
    ...Typography.caption,
    color: Neutrals.white,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 64,
    lineHeight: 76,
    color: Neutrals.white,
    fontFamily: Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : undefined,
    fontWeight: '600',
    marginBottom: 24,
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 48,
    maxWidth: '80%',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    marginBottom: 48,
  },
  amenityBox: {
    alignItems: 'flex-start',
  },
  amenityBoxValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Neutrals.white,
    marginBottom: 4,
  },
  amenityBoxLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  priceTextLarge: {
    fontSize: 36,
    fontWeight: '700',
    color: Neutrals.white,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  priceSubTop: {
    ...Typography.labelMedium,
    color: Neutrals.white,
    fontWeight: '600',
  },
  priceSubBottom: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#DEB887', // Gold/Sand color from mockup
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    ...Typography.labelLarge,
    color: Neutrals.obsidian,
    fontWeight: '700',
  },
  nextArrowFloat: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Neutrals.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(0,0,0,0.3)' } as any : { elevation: 10 }),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '8%',
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  paginationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16, // Align it visually with the thumbnails bottom
  },
  pageNumberActive: {
    ...Typography.labelLarge,
    color: Neutrals.white,
    fontWeight: '700',
  },
  pageTrack: {
    width: 64,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pageFill: {
    height: '100%',
    backgroundColor: Neutrals.white,
  },
  pageNumberTotal: {
    ...Typography.labelLarge,
    color: 'rgba(255,255,255,0.5)',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomThumbnail: {
    width: 100,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.5)' } as any : { elevation: 8 }),
  },
  bottomThumbnailActive: {
    borderColor: '#DEB887', // Gold/Sand border for active
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

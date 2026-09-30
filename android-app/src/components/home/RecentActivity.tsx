import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Neutrals, GoldSystem, Radius, Typography, Shadows } from '@/constants/design';
import { SectionHeader } from '../ui/SectionHeader';
import { Ionicons } from '@expo/vector-icons';
import { useActivityHistory } from '@/hooks/useActivityHistory';
import { getApiUrl } from '@/lib/api';
import { useResponsive } from '@/hooks/useResponsive';

export function RecentActivity() {
  const router = useRouter();
  const { recentSearches, recentViews } = useActivityHistory();
  const [showViews, setShowViews] = useState(false);
  const { isDesktop } = useResponsive();

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <SectionHeader title="Recent Activity" />

      {/* Action Buttons */}
      <View style={isDesktop ? styles.buttonContainerDesktop : styles.buttonContainerMobile}>
        
        {/* 1. Recently Viewed Button */}
        {isDesktop ? (
          <View style={styles.expandableCardDesktop}>
            <TouchableOpacity 
              style={styles.actionButtonDesktop} 
              onPress={() => setShowViews(!showViews)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBgDesktop, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="eye-outline" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.buttonTextContentDesktop}>
                <Text style={styles.buttonTitleDesktop}>Recently Viewed</Text>
                <Text style={styles.buttonSubtitleDesktop}>
                  {recentViews.length > 0 ? `View your ${recentViews.length} past properties` : 'No recent properties'}
                </Text>
              </View>
              <Ionicons name={showViews ? "chevron-down" : "chevron-forward"} size={20} color={Neutrals.gray400} />
            </TouchableOpacity>
            
            {showViews && recentViews.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailSequence}>
                {recentViews.map((p) => {
                  const imageUrl = p.image_url 
                    ? (p.image_url.startsWith('/') ? `${getApiUrl()}${p.image_url}` : p.image_url) 
                    : null;

                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={styles.thumbnailCard}
                      onPress={() => router.push(`/property/${p.id}` as any)}
                    >
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
                      ) : (
                        <View style={[styles.thumbnailImage, { backgroundColor: Neutrals.gray100, justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="image-outline" size={16} color={Neutrals.gray400} />
                        </View>
                      )}
                      <Text style={styles.thumbnailTitle} numberOfLines={1}>{p.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.actionCardMobile} 
            onPress={() => setShowViews(!showViews)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBgMobile, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="eye-outline" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.actionTextMobile}>Recently Viewed</Text>
            <Ionicons name={showViews ? "chevron-down" : "chevron-forward"} size={14} color={Neutrals.gray400} />
          </TouchableOpacity>
        )}

        {/* 2. Continue Search Button */}
        {isDesktop ? (
          <TouchableOpacity 
            style={[styles.actionButtonDesktop, styles.expandableCardDesktop]} 
            onPress={() => {
              if (recentSearches.length > 0) {
                router.push(`/(tabs)/search?q=${recentSearches[0].query}` as any);
              } else {
                router.push('/(tabs)/search');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBgDesktop, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="search-outline" size={24} color="#3B82F6" />
            </View>
            <View style={styles.buttonTextContentDesktop}>
              <Text style={styles.buttonTitleDesktop}>Continue with last search</Text>
              <Text style={styles.buttonSubtitleDesktop}>
                {recentSearches.length > 0 ? `Search for "${recentSearches[0].query}"` : 'Start a new search'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Neutrals.gray400} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.actionCardMobile} 
            onPress={() => {
              if (recentSearches.length > 0) {
                router.push(`/(tabs)/search?q=${recentSearches[0].query}` as any);
              } else {
                router.push('/(tabs)/search');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBgMobile, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="search-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.actionTextMobile}>Last Search</Text>
            <Ionicons name="chevron-forward" size={14} color={Neutrals.gray400} />
          </TouchableOpacity>
        )}

      </View>

      {/* Expandable Views for Mobile */}
      {!isDesktop && showViews && recentViews.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailSequence}>
          {recentViews.map((p) => {
            const imageUrl = p.image_url 
              ? (p.image_url.startsWith('/') ? `${getApiUrl()}${p.image_url}` : p.image_url) 
              : null;

            return (
              <TouchableOpacity 
                key={p.id} 
                style={styles.thumbnailCard}
                onPress={() => router.push(`/property/${p.id}` as any)}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
                ) : (
                  <View style={[styles.thumbnailImage, { backgroundColor: Neutrals.gray100, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={16} color={Neutrals.gray400} />
                  </View>
                )}
                <Text style={styles.thumbnailTitle} numberOfLines={1}>{p.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 8,
  },
  buttonContainerDesktop: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    maxWidth: 700,
  },
  buttonContainerMobile: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  expandableCardDesktop: {
    flex: 1,
    backgroundColor: Neutrals.white,
    borderRadius: Radius.lg,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Neutrals.gray100,
    overflow: 'hidden',
  },
  actionButtonDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBgDesktop: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContentDesktop: {
    flex: 1,
  },
  buttonTitleDesktop: {
    ...Typography.titleMedium,
    color: Neutrals.obsidian,
    marginBottom: 2,
  },
  buttonSubtitleDesktop: {
    ...Typography.caption,
    color: Neutrals.gray500,
  },
  actionCardMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Neutrals.white,
    borderRadius: Radius.md,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: Neutrals.gray100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  iconBgMobile: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionTextMobile: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Neutrals.obsidian,
  },
  thumbnailSequence: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 12,
  },
  thumbnailCard: {
    width: 80,
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 80,
    height: 60,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  thumbnailTitle: {
    ...Typography.caption,
    fontSize: 10,
    color: Neutrals.obsidian,
    textAlign: 'center',
  },
});

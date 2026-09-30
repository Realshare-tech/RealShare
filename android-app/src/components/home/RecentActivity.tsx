import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Neutrals, GoldSystem, Radius, Typography, Shadows } from '@/constants/design';
import { SectionHeader } from '../ui/SectionHeader';
import { Ionicons } from '@expo/vector-icons';
import { useActivityHistory } from '@/hooks/useActivityHistory';
import { getApiUrl } from '@/lib/api';

export function RecentActivity() {
  const router = useRouter();
  const { recentSearches, recentViews } = useActivityHistory();
  const [showViews, setShowViews] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Main Header */}
      <SectionHeader title="Recent Activity" />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        
        {/* 1. Recently Viewed Button */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => setShowViews(!showViews)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBg, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="eye-outline" size={16} color="#8B5CF6" />
          </View>
          <Text style={styles.actionText}>Recently Viewed</Text>
          <Ionicons name={showViews ? "chevron-down" : "chevron-forward"} size={14} color={Neutrals.gray400} />
        </TouchableOpacity>

        {/* 2. Continue Search Button */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => {
            if (recentSearches.length > 0) {
              router.push(`/(tabs)/search?q=${recentSearches[0].query}` as any);
            } else {
              router.push('/(tabs)/search');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBg, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="search-outline" size={16} color="#3B82F6" />
          </View>
          <Text style={styles.actionText}>Last Search</Text>
          <Ionicons name="chevron-forward" size={14} color={Neutrals.gray400} />
        </TouchableOpacity>

      </View>

      {/* Expandable Views */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Neutrals.white,
    borderRadius: Radius.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Neutrals.gray100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionText: {
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

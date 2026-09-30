import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Neutrals, GoldSystem, Radius, Typography, Shadows } from '@/constants/design';
import { PremiumCard } from './PremiumCard';
import { useRouter } from 'expo-router';

interface LocalityCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  rank: number;
  avgRent: string;
  avgSale: string;
  propertyCount: number;
}

export function LocalityCard({
  id,
  name,
  image,
  rating,
  rank,
  avgRent,
  avgSale,
  propertyCount,
}: LocalityCardProps) {
  const router = useRouter();

  return (
    <PremiumCard style={styles.card} onPress={() => router.push(`/locality/${id}` as any)}>
      <Image source={{ uri: image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{rating}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg. Price</Text>
            <Text style={styles.statValue}>{avgSale}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Yield</Text>
            <Text style={styles.statValue}>{avgRent}</Text>
          </View>
          <View style={[styles.statBox, { alignItems: 'flex-end' }]}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={[styles.statValue, { color: GoldSystem.primaryGold }]}>{propertyCount}</Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  name: {
    ...Typography.headlineMedium,
    color: Neutrals.obsidian,
    flexShrink: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Neutrals.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  star: {
    color: GoldSystem.metallicGold,
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    ...Typography.labelMedium,
    color: Neutrals.obsidian,
  },
  rankBadge: {
    backgroundColor: GoldSystem.paleGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  rankText: {
    ...Typography.caption,
    color: GoldSystem.darkGold,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Neutrals.gray100,
    borderRadius: Radius.md,
    padding: 8,
    marginTop: 2,
  },
  statBox: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Neutrals.gray300,
    marginHorizontal: 12,
  },
  statLabel: {
    ...Typography.caption,
    color: Neutrals.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    ...Typography.labelMedium,
    color: Neutrals.obsidian,
  },
  propertyCount: {
    ...Typography.bodyMedium,
    color: GoldSystem.primaryGold,
    fontWeight: '600',
  },
});

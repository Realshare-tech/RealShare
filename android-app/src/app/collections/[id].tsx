import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Neutrals, Typography, GoldSystem, Radius } from '@/constants/design';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { propertyToCardProps } from '@/lib/formatters';
import { getApiUrl } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { useLocation } from '@/contexts/LocationContext';

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { city } = useLocation();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionTitles: Record<string, string> = {
    'hot-selling': 'Hot Selling Projects',
    'resale': 'Resale Properties',
    'rent': 'Properties for Rent',
    'hyderabad-projects': 'Projects in Hyderabad'
  };

  const title = collectionTitles[id || ''] || 'Property Collection';

  useEffect(() => {
    setLoading(true);
    const query = city === 'All India' ? '' : `?district=${encodeURIComponent(city)}`;
    fetch(`${getApiUrl()}/api/properties${query}`)
      .then(res => res.json())
      .then(data => {
        let list = Array.isArray(data) ? data : (data.properties || []);
        
        if (id === 'resale') {
          list = list.filter((p: any) => p.listing_type === 'resale');
        } else if (id === 'rent') {
          list = list.filter((p: any) => p.listing_type === 'rental');
        } else if (id === 'hot-selling') {
          list = list.filter((p: any) => p.listing_type !== 'rental' && p.listing_type !== 'resale');
          list.sort((a: any, b: any) => (b.sold_fractions ?? 0) - (a.sold_fractions ?? 0));
        } else if (id === 'hyderabad-projects') {
          list = list.filter((p: any) => (p.district?.toLowerCase() === 'hyderabad' || p.city?.toLowerCase() === 'hyderabad') && p.property_type?.toLowerCase() === 'residential');
        }
        
        setProperties(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, city]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top || 16 : 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Neutrals.obsidian} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          {loading ? 'Loading properties...' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} available`}
        </Text>

        {loading ? (
          <ActivityIndicator color={GoldSystem.primaryGold} style={{ marginTop: 40 }} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={48} color={Neutrals.gray400} />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptyDesc}>Check back later for new listings in this category.</Text>
          </View>
        ) : (
          <ResponsiveGrid>
            {properties.map((prop) => (
              <PropertyCard key={prop.id} {...propertyToCardProps(prop)} />
            ))}
          </ResponsiveGrid>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Neutrals.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 16,
    backgroundColor: Neutrals.surface,
    borderBottomWidth: 1,
    borderBottomColor: Neutrals.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Neutrals.gray100,
  },
  title: {
    ...Typography.h4,
    color: Neutrals.obsidian,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Neutrals.textSecondary,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Neutrals.obsidian,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    ...Typography.bodyMedium,
    color: Neutrals.textSecondary,
    textAlign: 'center',
  },
});

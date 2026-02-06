import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { findOpportunities } from '../services/api';

const DashboardScreen = ({ route, navigation }) => {
  const { address, creditScore } = route.params || {};

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', address],
    queryFn: () => findOpportunities('momentum', address),
  });

  const getTierName = (tier) => {
    const tiers = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum' };
    return tiers[tier] || 'Unknown';
  };

  const getSignalColor = (signal) => {
    return signal === 'BUY' ? '#4CAF50' : signal === 'SELL' ? '#f44336' : '#FFC107';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.creditCard}>
          <Text style={styles.creditLabel}>Credit Score</Text>
          <Text style={styles.creditScore}>{creditScore?.score || '---'}</Text>
          <Text style={styles.creditTier}>{getTierName(creditScore?.tier)}</Text>
          <Text style={styles.creditLeverage}>
            Max Leverage: {creditScore?.maxLeverage || 0}x
          </Text>
        </View>
      </View>

      <View style={styles.opportunities}>
        <Text style={styles.sectionTitle}>Trading Opportunities</Text>
        
        {isLoading ? (
          <Text style={styles.loading}>Loading opportunities...</Text>
        ) : (
          opportunities?.opportunities?.map((opp) => (
            <TouchableOpacity
              key={opp.id}
              style={styles.opportunityCard}
              onPress={() => navigation.navigate('Strategy', { opportunity: opp })}
            >
              <View style={styles.oppHeader}>
                <Text style={styles.oppSymbol}>{opp.symbol}</Text>
                <View style={[styles.signalBadge, { backgroundColor: getSignalColor(opp.signal) }]}>
                  <Text style={styles.signalText}>{opp.signal}</Text>
                </View>
              </View>

              <View style={styles.oppDetails}>
                <Text style={styles.oppPrice}>${opp.currentPrice.toFixed(2)}</Text>
                <Text style={styles.oppConfidence}>
                  Confidence: {(opp.confidence * 100).toFixed(0)}%
                </Text>
              </View>

              <View style={styles.oppTargets}>
                <Text style={styles.oppTarget}>Target: ${opp.targetPrice.toFixed(2)}</Text>
                <Text style={styles.oppReturn}>Est. Return: {opp.estimatedReturn}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by iExec TEE • Arbitrum Sepolia</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    padding: 20,
  },
  creditCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  creditLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  creditScore: {
    color: '#4CAF50',
    fontSize: 48,
    fontWeight: 'bold',
  },
  creditTier: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 5,
  },
  creditLeverage: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  opportunities: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  opportunityCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  oppSymbol: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  signalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  oppDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  oppPrice: {
    color: '#fff',
    fontSize: 18,
  },
  oppConfidence: {
    color: '#888',
    fontSize: 14,
  },
  oppTargets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  oppTarget: {
    color: '#4CAF50',
    fontSize: 14,
  },
  oppReturn: {
    color: '#FFD700',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});

export default DashboardScreen;

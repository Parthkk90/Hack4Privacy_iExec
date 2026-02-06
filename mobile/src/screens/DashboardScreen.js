import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { findOpportunities } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';

export default function DashboardScreen({ route, navigation }) {
  const { scoreData, walletAddress } = route.params;
  const [opportunities, setOpportunities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');
  
  useEffect(() => {
    loadOpportunities();
  }, [selectedStrategy]);
  
  const loadOpportunities = async () => {
    setRefreshing(true);
    try {
      const assets = ['ETH', 'BTC', 'SOL', 'ARB'];
      const ops = await findOpportunities(selectedStrategy, assets);
      setOpportunities(ops);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    }
    setRefreshing(false);
  };
  
  const handleExecute = (opportunity) => {
    navigation.navigate('Execution', { opportunity, scoreData });
  };
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={loadOpportunities}
          tintColor="#00d4aa"
        />
      }
    >
      {/* Portfolio Header */}
      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>$45,230.00</Text>
        <View style={styles.portfolioStats}>
          <StatItem label="24h Change" value="+2.4%" positive />
          <StatItem label="30d Return" value="+8.2%" positive />
        </View>
      </View>
      
      {/* Credit Score Card */}
      <TouchableOpacity 
        style={styles.creditCard}
        onPress={() => navigation.navigate('CreditScore', { walletAddress })}
      >
        <View style={styles.creditCardHeader}>
          <Text style={styles.creditCardTitle}>Credit Score</Text>
          <Text style={styles.creditTier}>{getTierEmoji(scoreData.tier)}</Text>
        </View>
        <Text style={styles.creditScore}>{scoreData.score}</Text>
        <Text style={styles.creditSubtext}>
          {scoreData.max_leverage}x leverage • {getTierName(scoreData.tier)} tier
        </Text>
      </TouchableOpacity>
      
      {/* Strategy Selector */}
      <View style={styles.strategySelector}>
        <StrategyButton 
          title="Momentum"
          active={selectedStrategy === 'momentum'}
          onPress={() => setSelectedStrategy('momentum')}
        />
        <StrategyButton 
          title="Arbitrage"
          active={selectedStrategy === 'arbitrage'}
          onPress={() => setSelectedStrategy('arbitrage')}
        />
        <StrategyButton 
          title="Mean Reversion"
          active={selectedStrategy === 'mean-reversion'}
          onPress={() => setSelectedStrategy('mean-reversion')}
        />
      </View>
      
      {/* Opportunities */}
      <View style={styles.opportunitiesSection}>
        <View style={styles.opportunitiesHeader}>
          <Text style={styles.sectionTitle}>
            🎯 Active Opportunities
          </Text>
          <Text style={styles.opportunityCount}>
            {opportunities.length} found
          </Text>
        </View>
        
        {opportunities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No opportunities available{'\n'}
              Pull down to refresh
            </Text>
          </View>
        ) : (
          opportunities.map((opp, index) => (
            <OpportunityCard 
              key={index}
              opportunity={opp}
              onExecute={() => handleExecute(opp)}
              onDetails={() => navigation.navigate('Strategy', { opportunity: opp })}
            />
          ))
        )}
      </View>
      
      {/* Stats Footer */}
      <View style={styles.statsFooter}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MEV Saved (30d)</Text>
          <Text style={styles.statValue}>$1,247</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Computations</Text>
          <Text style={styles.statValue}>847</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Success Rate</Text>
          <Text style={styles.statValue}>94%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value, positive }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statItemLabel}>{label}</Text>
      <Text style={[styles.statItemValue, positive && styles.positiveValue]}>
        {value}
      </Text>
    </View>
  );
}

function StrategyButton({ title, active, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.strategyButton, active && styles.strategyButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.strategyButtonText, active && styles.strategyButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function getTierName(tier) {
  const tiers = ['', 'Bronze', 'Silver', 'Gold', 'Platinum'];
  return tiers[tier] || 'Unknown';
}

function getTierEmoji(tier) {
  const emojis = ['', '🥉', '🥈', '🥇', '💎'];
  return emojis[tier] || '⭐';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  portfolioCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statItemLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  positiveValue: {
    color: '#00d4aa',
  },
  creditCard: {
    backgroundColor: '#00d4aa',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  creditTier: {
    fontSize: 24,
  },
  creditScore: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  creditSubtext: {
    fontSize: 14,
    color: '#333',
  },
  strategySelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
  },
  strategyButtonActive: {
    backgroundColor: '#00d4aa',
  },
  strategyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  strategyButtonTextActive: {
    color: '#000',
  },
  opportunitiesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  opportunitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  opportunityCount: {
    fontSize: 14,
    color: '#8e8e93',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

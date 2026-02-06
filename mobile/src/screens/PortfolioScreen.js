import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function PortfolioScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('assets');
  
  // Mock portfolio data
  const assets = [
    { symbol: 'ETH', amount: 5.234, value: 10712.45, change: +2.4, price: 2045.32 },
    { symbol: 'BTC', amount: 0.523, value: 22042.45, change: +1.8, price: 42150.00 },
    { symbol: 'SOL', amount: 45.67, value: 4496.42, change: -3.2, price: 98.45 },
    { symbol: 'ARB', amount: 2340.12, value: 3510.18, change: +5.1, price: 1.50 },
  ];
  
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = ((assets.reduce((sum, asset) => sum + (asset.value * asset.change / 100), 0) / totalValue) * 100);
  
  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Total Portfolio Value</Text>
        <Text style={styles.totalValue}>${totalValue.toFixed(2)}</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeValue, totalChange >= 0 ? styles.positive : styles.negative]}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
          </Text>
          <Text style={styles.changeLabel}>24h Change</Text>
        </View>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TabButton 
          title="Assets" 
          active={selectedTab === 'assets'}
          onPress={() => setSelectedTab('assets')}
        />
        <TabButton 
          title="Activity" 
          active={selectedTab === 'activity'}
          onPress={() => setSelectedTab('activity')}
        />
        <TabButton 
          title="Analytics" 
          active={selectedTab === 'analytics'}
          onPress={() => setSelectedTab('analytics')}
        />
      </View>
      
      {/* Assets List */}
      {selectedTab === 'assets' && (
        <View style={styles.assetsList}>
          <Text style={styles.sectionTitle}>Your Assets</Text>
          {assets.map((asset, index) => (
            <AssetCard key={index} asset={asset} />
          ))}
        </View>
      )}
      
      {/* Activity Tab */}
      {selectedTab === 'activity' && (
        <View style={styles.activityList}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ActivityItem 
            type="BUY"
            asset="ETH"
            amount="1.234"
            price="$2,045.32"
            timestamp="2 hours ago"
          />
          <ActivityItem 
            type="SELL"
            asset="SOL"
            amount="12.5"
            price="$98.45"
            timestamp="5 hours ago"
          />
          <ActivityItem 
            type="BUY"
            asset="BTC"
            amount="0.123"
            price="$42,150.00"
            timestamp="1 day ago"
          />
        </View>
      )}
      
      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <View style={styles.analyticsContainer}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard label="Total Trades" value="156" />
            <StatCard label="Win Rate" value="68%" />
            <StatCard label="Avg Gain" value="+12.4%" />
            <StatCard label="Best Trade" value="+$847" />
          </View>
          
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>📊</Text>
            <Text style={styles.chartLabel}>Portfolio Performance Chart</Text>
            <Text style={styles.chartSubtext}>Last 30 days</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function TabButton({ title, active, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function AssetCard({ asset }) {
  const isPositive = asset.change >= 0;
  
  return (
    <TouchableOpacity style={styles.assetCard}>
      <View style={styles.assetIcon}>
        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{asset.symbol}</Text>
        <Text style={styles.assetAmount}>{asset.amount.toFixed(4)}</Text>
      </View>
      <View style={styles.assetValue}>
        <Text style={styles.assetPrice}>${asset.value.toFixed(2)}</Text>
        <Text style={[styles.assetChange, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ActivityItem({ type, asset, amount, price, timestamp }) {
  const isBuy = type === 'BUY';
  
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, isBuy ? styles.buyIcon : styles.sellIcon]}>
        <Text style={styles.activityIconText}>{isBuy ? '↑' : '↓'}</Text>
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityType}>{type} {asset}</Text>
        <Text style={styles.activityTime}>{timestamp}</Text>
      </View>
      <View style={styles.activityValues}>
        <Text style={styles.activityAmount}>{amount} {asset}</Text>
        <Text style={styles.activityPrice}>{price}</Text>
      </View>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingBottom: 80,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  positive: {
    color: '#00d4aa',
  },
  negative: {
    color: '#ff3b30',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#00d4aa',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  tabButtonTextActive: {
    color: '#000',
  },
  assetsList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#252545',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  assetAmount: {
    fontSize: 14,
    color: '#8e8e93',
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buyIcon: {
    backgroundColor: '#00d4aa',
  },
  sellIcon: {
    backgroundColor: '#ff3b30',
  },
  activityIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#8e8e93',
  },
  activityValues: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityPrice: {
    fontSize: 12,
    color: '#8e8e93',
  },
  analyticsContainer: {
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  chartPlaceholder: {
    backgroundColor: '#1a1a2e',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  chartText: {
    fontSize: 64,
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#8e8e93',
  },
});

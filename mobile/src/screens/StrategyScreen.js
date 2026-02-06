import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function StrategyScreen({ route, navigation }) {
  const { opportunity } = route.params;
  const isPositive = opportunity.signal === 'BUY';
  
  // Calculate profit percentage
  const profitPercent = ((opportunity.target_price - opportunity.entry_price) / opportunity.entry_price * 100);
  
  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.assetHeader}>
          <Text style={styles.asset}>{opportunity.asset}</Text>
          <View style={[styles.signalBadge, isPositive ? styles.buyBadge : styles.sellBadge]}>
            <Text style={styles.signalText}>{opportunity.signal}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>${opportunity.entry_price.toFixed(2)}</Text>
          <Text style={styles.priceLabel}>Current Price</Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricBox 
            label="Entry Price" 
            value={`$${opportunity.entry_price.toFixed(2)}`}
            color="#fff"
          />
          <MetricBox 
            label="Target Price" 
            value={`$${opportunity.target_price.toFixed(2)}`}
            color="#00d4aa"
          />
          <MetricBox 
            label="Confidence" 
            value={`${(opportunity.confidence * 100).toFixed(0)}%`}
            color="#fff"
          />
          <MetricBox 
            label="Expected Gain" 
            value={`${profitPercent.toFixed(1)}%`}
            color="#00d4aa"
          />
        </View>
      </View>

      {/* Technical Analysis */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📈 Technical Indicators</Text>
        <IndicatorRow label="RSI" value={72.3} status="Overbought" isGood={false} />
        <IndicatorRow label="MACD" value="Bullish" status="Crossover" isGood={true} />
        <IndicatorRow label="Volume" value="+145%" status="Above Average" isGood={true} />
        <IndicatorRow label="Momentum" value="Strong" status={isPositive ? "Uptrend" : "Downtrend"} isGood={true} />
      </View>

      {/* Strategy Reasoning */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💡 Strategy Analysis</Text>
        <Text style={styles.reasoning}>{opportunity.reasoning}</Text>
        <View style={styles.timeframe}>
          <Text style={styles.timeframeLabel}>Timeframe:</Text>
          <Text style={styles.timeframeValue}>4h-1d</Text>
        </View>
      </View>

      {/* Risk Assessment */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚠️ Risk Assessment</Text>
        <RiskBar level="medium" />
        <Text style={styles.riskText}>
          Medium risk position. Recommended size: {(opportunity.recommended_size * 100).toFixed(1)}% of portfolio.
        </Text>
        <View style={styles.riskMetrics}>
          <RiskMetric label="Stop Loss" value="-5%" />
          <RiskMetric label="Take Profit" value="+{profitPercent.toFixed(1)}%" />
          <RiskMetric label="R:R Ratio" value="1:3" />
        </View>
      </View>

      {/* Historical Performance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Similar Signals History</Text>
        <View style={styles.historyStats}>
          <HistoryStat label="Win Rate" value="68%" />
          <HistoryStat label="Avg Gain" value="+12.4%" />
          <HistoryStat label="Total Signals" value="124" />
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.executeButton}
        onPress={() => navigation.navigate('Execution', { 
          opportunity, 
          scoreData: route.params.scoreData 
        })}
      >
        <Text style={styles.executeButtonText}>Execute Trade</Text>
        <Text style={styles.executeButtonSubtext}>Est. Profit: ${opportunity.expectedProfit}</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function MetricBox({ label, value, color }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

function IndicatorRow({ label, value, status, isGood }) {
  return (
    <View style={styles.indicatorRow}>
      <View style={styles.indicatorLeft}>
        <Text style={styles.indicatorLabel}>{label}</Text>
        <Text style={styles.indicatorValue}>{value}</Text>
      </View>
      <View style={[styles.statusBadge, isGood ? styles.goodStatus : styles.neutralStatus]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

function RiskBar({ level }) {
  const colors = {
    low: '#00d4aa',
    medium: '#FFD700',
    high: '#ff3b30',
  };
  
  const widths = {
    low: '33%',
    medium: '66%',
    high: '100%',
  };
  
  return (
    <View style={styles.riskBarContainer}>
      <View style={[styles.riskBarFill, { width: widths[level], backgroundColor: colors[level] }]} />
    </View>
  );
}

function RiskMetric({ label, value }) {
  return (
    <View style={styles.riskMetric}>
      <Text style={styles.riskMetricLabel}>{label}</Text>
      <Text style={styles.riskMetricValue}>{value}</Text>
    </View>
  );
}

function HistoryStat({ label, value }) {
  return (
    <View style={styles.historyStat}>
      <Text style={styles.historyStatValue}>{value}</Text>
      <Text style={styles.historyStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  headerCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  asset: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  signalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyBadge: {
    backgroundColor: '#00d4aa',
  },
  sellBadge: {
    backgroundColor: '#ff3b30',
  },
  signalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  priceRow: {
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  metricsCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  card: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#252545',
    padding: 16,
    borderRadius: 12,
    margin: '1%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252545',
  },
  indicatorLeft: {
    flex: 1,
  },
  indicatorLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  goodStatus: {
    backgroundColor: '#00d4aa',
  },
  neutralStatus: {
    backgroundColor: '#8e8e93',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  reasoning: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 16,
  },
  timeframe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252545',
    padding: 12,
    borderRadius: 8,
  },
  timeframeLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginRight: 8,
  },
  timeframeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4aa',
  },
  riskBarContainer: {
    height: 8,
    backgroundColor: '#252545',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskText: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
    marginBottom: 16,
  },
  riskMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskMetric: {
    flex: 1,
    alignItems: 'center',
  },
  riskMetricLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  riskMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#252545',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  historyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  executeButton: {
    backgroundColor: '#00d4aa',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  executeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  executeButtonSubtext: {
    fontSize: 14,
    color: '#333',
  },
  bottomPadding: {
    height: 32,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OpportunityCard({ opportunity, onExecute, onDetails }) {
  const isPositive = opportunity.signal === 'BUY';
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.asset}>{opportunity.asset}</Text>
        <View style={[styles.signalBadge, isPositive ? styles.buyBadge : styles.sellBadge]}>
          <Text style={styles.signalText}>{opportunity.signal}</Text>
        </View>
      </View>
      
      <View style={styles.metrics}>
        <MetricItem 
          label="Entry" 
          value={`$${opportunity.entry_price.toFixed(2)}`} 
        />
        <MetricItem 
          label="Target" 
          value={`$${opportunity.target_price.toFixed(2)}`} 
        />
        <MetricItem 
          label="Confidence" 
          value={`${(opportunity.confidence * 100).toFixed(0)}%`} 
        />
      </View>
      
      <Text style={styles.reasoning} numberOfLines={2}>
        {opportunity.reasoning}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.sizeText}>
          Size: {(opportunity.recommended_size * 100).toFixed(1)}%
        </Text>
        <Text style={styles.profitText}>
          Est. Profit: ${opportunity.expectedProfit}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={onDetails}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.executeButton}
          onPress={onExecute}
        >
          <Text style={styles.executeButtonText}>Execute</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetricItem({ label, value }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  asset: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyBadge: {
    backgroundColor: '#00d4aa',
  },
  sellBadge: {
    backgroundColor: '#ff3b30',
  },
  signalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#8e8e93',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reasoning: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sizeText: {
    fontSize: 12,
    color: '#8e8e93',
  },
  profitText: {
    fontSize: 12,
    color: '#00d4aa',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  executeButton: {
    flex: 1,
    backgroundColor: '#00d4aa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

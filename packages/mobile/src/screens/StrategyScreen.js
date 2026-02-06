import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const StrategyScreen = ({ route, navigation }) => {
  const { opportunity } = route.params;

  const handleExecute = () => {
    navigation.navigate('Execution', { opportunity });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{opportunity.symbol}</Text>
        <View style={[styles.signalBadge, { 
          backgroundColor: opportunity.signal === 'BUY' ? '#4CAF50' : '#f44336' 
        }]}>
          <Text style={styles.signalText}>{opportunity.signal}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Price</Text>
        <Text style={styles.price}>${opportunity.currentPrice.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Targets</Text>
        <View style={styles.targets}>
          <View style={styles.target}>
            <Text style={styles.targetLabel}>Target</Text>
            <Text style={[styles.targetValue, { color: '#4CAF50' }]}>
              ${opportunity.targetPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.target}>
            <Text style={styles.targetLabel}>Stop Loss</Text>
            <Text style={[styles.targetValue, { color: '#f44336' }]}>
              ${opportunity.stopLoss.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={styles.metricValue}>
              {(opportunity.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Position Size</Text>
            <Text style={styles.metricValue}>
              {(opportunity.positionSize * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Leverage</Text>
            <Text style={styles.metricValue}>{opportunity.leverage}x</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reasoning</Text>
        {opportunity.reasoning.map((reason, index) => (
          <Text key={index} style={styles.reason}>• {reason}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.executeButton} onPress={handleExecute}>
        <Text style={styles.executeButtonText}>Execute Trade</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  symbol: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  signalBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  signalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  price: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  targets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  target: {
    alignItems: 'center',
  },
  targetLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  targetValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  metricValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reason: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 5,
  },
  executeButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StrategyScreen;

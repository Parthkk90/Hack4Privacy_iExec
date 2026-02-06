import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StrategyScreen({ route }) {
  const { opportunity } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strategy Details</Text>
      <Text style={styles.asset}>{opportunity.asset}</Text>
      <Text style={styles.reasoning}>{opportunity.reasoning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  asset: {
    fontSize: 32,
    color: '#00d4aa',
    marginBottom: 16,
  },
  reasoning: {
    fontSize: 16,
    color: '#8e8e93',
    lineHeight: 24,
  },
});

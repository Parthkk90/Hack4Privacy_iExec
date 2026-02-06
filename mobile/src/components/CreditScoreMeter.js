import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export default function CreditScoreMeter({ score, tier }) {
  // Calculate percentage (300-850 range)
  const percentage = ((score - 300) / 550) * 100;
  
  // Determine color based on tier
  const getColor = () => {
    switch (tier) {
      case 4: return '#FFD700'; // Platinum
      case 3: return '#00d4aa'; // Gold
      case 2: return '#C0C0C0'; // Silver
      default: return '#CD7F32'; // Bronze
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        <Svg width="200" height="200" viewBox="0 0 200 200">
          <G rotation="-90" origin="100, 100">
            {/* Background circle */}
            <Circle
              cx="100"
              cy="100"
              r="80"
              stroke="#1a1a2e"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx="100"
              cy="100"
              r="80"
              stroke={getColor()}
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 502.4} 502.4`}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        <View style={styles.scoreTextContainer}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>FICO Score</Text>
        </View>
      </View>
      
      <View style={styles.rangeIndicator}>
        <RangeMarker value="300" color="#CD7F32" />
        <RangeMarker value="550" color="#C0C0C0" />
        <RangeMarker value="650" color="#00d4aa" />
        <RangeMarker value="750" color="#FFD700" />
        <RangeMarker value="850" color="#FFD700" />
      </View>
    </View>
  );
}

function RangeMarker({ value, color }) {
  return (
    <View style={styles.rangeMarker}>
      <View style={[styles.markerDot, { backgroundColor: color }]} />
      <Text style={styles.markerValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  meterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
  rangeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  rangeMarker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  markerValue: {
    fontSize: 10,
    color: '#8e8e93',
  },
});

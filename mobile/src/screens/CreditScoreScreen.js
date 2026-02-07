import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import blockchainService from '../services/blockchainService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreditScoreScreen({ route, navigation }) {
  const [creditScore, setCreditScore] = useState(720);
  const [tier, setTier] = useState('GOLD');
  const [tierName, setTierName] = useState('EXCELLENT');
  const [loading, setLoading] = useState(true);
  
  const breakdownData = [
    { label: 'Repayment History', percentage: 92, color: '#3B82F6' },
    { label: 'Liquidity Depth', percentage: 68, color: '#3B82F6' },
    { label: 'On-chain Longevity', percentage: 85, color: '#3B82F6' },
  ];
  
  useEffect(() => {
    loadCreditScore();
  }, []);
  
  const loadCreditScore = async () => {
    try {
      const walletAddress = route.params?.walletAddress || '0xBf8E022195f387dB0C28C741d1A7b1BeD1144B3C';
      await blockchainService.initialize(walletAddress);
      const scoreData = await blockchainService.getCreditScore(walletAddress);
      
      if (scoreData) {
        setCreditScore(scoreData.score);
        setTier(scoreData.tierName);
        setTierName(getTierDescription(scoreData.score));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading credit score:', error);
      setLoading(false);
    }
  };
  
  const getTierDescription = (score) => {
    if (score >= 750) return 'EXCELLENT';
    if (score >= 650) return 'GOOD';
    if (score >= 550) return 'FAIR';
    return 'BUILDING';
  };
  
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (creditScore / 850) * circumference;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credit Report</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Credit Score Circle */}
        <View style={styles.scoreSection}>
          <View style={styles.circularProgress}>
            <Svg width={240} height={240}>
              <G rotation="-90" origin="120, 120">
                {/* Background circle */}
                <Circle
                  cx={120}
                  cy={120}
                  r={90}
                  stroke="#2A2A2A"
                  strokeWidth={20}
                  fill="none"
                />
                {/* Top arc (good score) */}
                <Circle
                  cx={120}
                  cy={120}
                  r={90}
                  stroke="#22C55E"
                  strokeWidth={20}
                  fill="none"
                  strokeDasharray={`${(creditScore / 850) * circumference * 0.6}, ${circumference}`}
                  strokeLinecap="round"
                />
                {/* Bottom arc (remaining) */}
                <Circle
                  cx={120}
                  cy={120}
                  r={90}
                  stroke="#3B82F6"
                  strokeWidth={20}
                  fill="none"
                  strokeDasharray={`${(creditScore / 850) * circumference * 0.4}, ${circumference}`}
                  strokeDashoffset={-(creditScore / 850) * circumference * 0.6}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreValue}>{creditScore}</Text>
              <Text style={styles.scoreTierName}>{tierName}</Text>
            </View>
          </View>
          
          {/* Tier Badge */}
          <View style={styles.tierBadge}>
            <Ionicons name="shield" size={16} color="#F59E0B" />
            <Text style={styles.tierText}>{tier} TIER</Text>
          </View>
        </View>
        
        {/* Verified Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VERIFIED FACTORS</Text>
          
          <View style={styles.factorCard}>
            <View style={styles.factorIcon}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#3B82F6" />
            </View>
            <View style={styles.factorContent}>
              <Text style={styles.factorTitle}>47 trades analyzed</Text>
              <Text style={styles.factorSubtitle}>Arbitrum L2 Network</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          
          <View style={styles.factorCard}>
            <View style={[styles.factorIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.factorContent}>
              <Text style={styles.factorTitle}>TEE Verified</Text>
              <Text style={styles.factorSubtitle}>Secured by iExec Enclave</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
        </View>
        
        {/* Score Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCORE BREAKDOWN</Text>
          
          {breakdownData.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownValue}>{item.percentage}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
        
        {/* Footer Note */}
        <View style={styles.footerNote}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={16} color="#6B7280" />
          </View>
          <Text style={styles.footerNoteText}>
            This score was generated inside a Private Trusted Execution Environment (TEE). Your underlying trade history is not revealed or exposed to any centralized servers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  circularProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scoreContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreTierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    letterSpacing: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 16,
  },
  factorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  factorIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factorContent: {
    flex: 1,
  },
  factorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  factorSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  infoIcon: {
    marginTop: 2,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});

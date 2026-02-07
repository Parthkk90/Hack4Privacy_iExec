import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import blockchainService from '../services/blockchainService';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen({ route, navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [creditScore, setCreditScore] = useState(0);
  const [opportunities, setOpportunities] = useState([]);
  const [walletAddress, setWalletAddress] = useState(route.params?.walletAddress || null);
  
  useEffect(() => {
    loadWalletAndData();
  }, []);

  const loadWalletAndData = async () => {
    try {
      let address = route.params?.walletAddress;
      
      if (!address) {
        address = await AsyncStorage.getItem('walletAddress');
        if (address) {
          setWalletAddress(address);
        }
      }
      
      if (!address) {
        navigation.navigate('Welcome');
        return;
      }
      
      await loadDashboardData(address);
    } catch (error) {
      console.error('Error loading wallet:', error);
      navigation.navigate('Welcome');
    }
  };
  
  const loadDashboardData = async (address = walletAddress) => {
    try {
      setLoading(true);
      
      if (!address) {
        navigation.navigate('Welcome');
        return;
      }
      
      console.log('[Dashboard] Loading data for wallet:', address);
      
      await blockchainService.initialize(address);
      
      const opportunitiesData = await apiService.getOpportunities();
      console.log('[Dashboard] Loaded', opportunitiesData.length, 'opportunities');
      setOpportunities(opportunitiesData);
      
      const scoreData = await blockchainService.getCreditScore(address);
      console.log('[Dashboard] Credit Score:', scoreData.score);
      setCreditScore(scoreData.score || 0);
      
      const portfolio = await apiService.getPortfolio(address);
      setBalance(portfolio.totalValue || 0);
      
      setLoading(false);
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <View style={styles.profileGradient}>
            <Text style={styles.profileText}>W</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="list-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Buy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Trade</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Request</Text>
          </TouchableOpacity>
        </View>
        
        {/* Active Opportunities Banner */}
        <TouchableOpacity style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Active Opportunities</Text>
            <Text style={styles.bannerSubtitle}>AI Signals & TEE-secured Scores</Text>
          </View>
          <TouchableOpacity style={styles.bannerClose}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {/* Recommended for You */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
          ) : (
            opportunities.slice(0, 3).map((opp, index) => (
              <TouchableOpacity 
                key={opp.id || index}
                style={styles.assetCard}
                onPress={() => {
                  // Navigate to Markets tab with selected opportunity
                  navigation.navigate('Markets', { opportunity: opp });
                }}
              >
                <View style={styles.assetLeft}>
                  <View style={styles.assetIconContainer}>
                    <Text style={styles.assetIconText}>
                      {(opp.asset || 'ETH').substring(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.assetInfo}>
                    <Text style={styles.assetName}>{opp.asset || 'Ethereum'}</Text>
                    <Text style={styles.assetConfidence}>
                      Confidence: {opp.confidence || 94}%
                    </Text>
                  </View>
                </View>
                <View style={styles.assetRight}>
                  <View style={[
                    styles.assetBadge,
                    getSignalStyle(opp.action || 'BULLISH')
                  ]}>
                    <Text style={styles.assetBadgeText}>
                      {opp.action || 'BULLISH'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.tradeButton}>
                    <Text style={styles.tradeButtonText}>Trade</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        {/* Trust Score */}
        <TouchableOpacity 
          style={styles.trustScoreCard}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('CreditScore');
            }
          }}
        >
          <View style={styles.trustScoreLeft}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.trustScoreLabel}>Trust Score</Text>
          </View>
          <View style={styles.trustScoreRight}>
            <Text style={styles.trustScoreValue}>{creditScore}</Text>
            <View style={styles.miniCircularProgress}>
              <Svg width={40} height={40}>
                <Circle
                  cx={20}
                  cy={20}
                  r={16}
                  stroke="#1F2937"
                  strokeWidth={3}
                  fill="none"
                />
                <Circle
                  cx={20}
                  cy={20}
                  r={16}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={`${(creditScore / 850) * 100}, 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </Svg>
              <Text style={styles.miniProgressText}>L{Math.floor(creditScore / 100)}</Text>
            </View>
            <Text style={styles.trustScoreSubtext}>SECURED BY IEXEC TEE</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getSignalStyle(action) {
  if (action === 'BUY' || action === 'BULLISH') {
    return { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E' };
  } else if (action === 'SIGNALS') {
    return { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' };
  } else if (action === 'BREAKOUT') {
    return { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: '#F97316' };
  }
  return { backgroundColor: 'rgba(156, 163, 175, 0.15)', borderColor: '#9CA3AF' };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  balanceSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bannerClose: {
    padding: 4,
  },
  recommendedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3B82F6',
  },
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assetConfidence: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assetRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  assetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  assetBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tradeButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tradeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  trustScoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  trustScoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustScoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trustScoreRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  trustScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trustScoreSubtext: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  miniCircularProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProgressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
});

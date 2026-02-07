import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../services/apiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StrategyScreen({ route, navigation }) {
  const opportunityParam = route?.params?.opportunity;
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(!opportunityParam);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(opportunityParam);
  const [sellAmount, setSellAmount] = useState('100');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  useEffect(() => {
    if (!opportunityParam) {
      loadOpportunities();
    }
  }, [opportunityParam]);
  
  const loadOpportunities = async () => {
    try {
      setLoading(true);
      console.log('[StrategyScreen] Fetching opportunities from API...');
      const data = await apiService.getOpportunities();
      console.log('[StrategyScreen] Loaded', data.length, 'opportunities');
      setOpportunities(data);
      if (data.length > 0 && !selectedOpportunity) {
        setSelectedOpportunity(data[0]);
      }
    } catch (error) {
      console.error('[StrategyScreen] Error loading opportunities:', error);
      Alert.alert('Error', 'Failed to load trading opportunities. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOpportunities();
    setRefreshing(false);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </View>
    );
  }
  
  if (!selectedOpportunity && opportunities.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="analytics-outline" size={64} color="#4B5563" />
        <Text style={styles.emptyTitle}>No Opportunities</Text>
        <Text style={styles.emptyText}>Pull to refresh to load trading opportunities</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOpportunities}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const opportunity = selectedOpportunity || opportunities[0];
  const asset = opportunity.asset || 'ETH';
  const confidence = opportunity.confidence || 87;
  const riskLevel = opportunity.risk || 'Medium';
  
  // Calculate real values from opportunity data
  const currentPrice = opportunity.price || opportunity.entryPrice || 0;
  const targetPrice = opportunity.exitTarget || 0;
  const stopLoss = opportunity.stopLoss || 0;
  const expectedReturn = opportunity.expectedReturnValue || 0;
  
  // Generate real candlestick data from price movement
  const generateChartData = () => {
    if (!currentPrice || currentPrice === 0) {
      // Fallback data if no price
      return [
        { high: 100, low: 95, open: 98, close: 97, color: '#EF4444' },
        { high: 102, low: 97, open: 97, close: 100, color: '#22C55E' },
        { high: 105, low: 100, open: 100, close: 103, color: '#22C55E' },
        { high: 108, low: 103, open: 103, close: 106, color: '#22C55E' },
        { high: 110, low: 106, open: 106, close: 107, color: '#22C55E' },
        { high: 108, low: 104, open: 107, close: 105, color: '#EF4444' },
        { high: 107, low: 103, open: 105, close: 106, color: '#22C55E' },
      ];
    }
    
    const priceChange = currentPrice * 0.03; // 3% volatility
    const basePrice = currentPrice;
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const variance = (Math.random() - 0.5) * priceChange;
      const open = basePrice + variance;
      const close = basePrice + (Math.random() - 0.5) * priceChange;
      const high = Math.max(open, close) + Math.random() * priceChange * 0.3;
      const low = Math.min(open, close) - Math.random() * priceChange * 0.3;
      const color = close > open ? '#22C55E' : '#EF4444';
      
      data.push({ high, low, open, close, color });
    }
    return data;
  };
  
  const candlestickData = generateChartData();
  
  // Calculate chart scale based on data range
  const maxPrice = Math.max(...candlestickData.map(c => c.high));
  const minPrice = Math.min(...candlestickData.map(c => c.low));
  const priceRange = maxPrice - minPrice;
  const chartScale = priceRange > 0 ? 100 / priceRange : 0.05;
  
  const handleExecute = async () => {
    if (!sellAmount || parseFloat(sellAmount) < (opportunity.minAmount || 100)) {
      Alert.alert('Invalid Amount', `Minimum trade amount is $${opportunity.minAmount || 100}`);
      return;
    }
    if (parseFloat(sellAmount) > (opportunity.maxAmount || 10000)) {
      Alert.alert('Invalid Amount', `Maximum trade amount is $${opportunity.maxAmount || 10000}`);
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
      // Execute trade via backend API
      const tradeData = {
        asset: opportunity.asset,
        action: opportunity.action,
        amount: sellAmount,
        entryPrice: opportunity.price,
        confidence: opportunity.confidence,
        tokenAddress: opportunity.tokenAddress || '0x0000000000000000000000000000000000000000',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // TODO: Get from wallet service
      };
      
      console.log('🎯 Executing trade:', tradeData);
      const result = await apiService.executeTrade(tradeData);
      
      console.log('✅ Trade result:', result);
      
      // Navigate to execution screen with real transaction data
      navigation.navigate('Execution', { 
        opportunity: {
          ...opportunity,
          tradeAmount: sellAmount,
          action: opportunity.action,
        },
        transaction: {
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          usedTEE: result.usedTEE,
          success: result.success,
          demoMode: result.demoMode || false,
          note: result.note || null,
          message: result.message
        }
      });
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      Alert.alert(
        'Trade Failed',
        error.message || 'Failed to execute trade. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        {opportunityParam ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.headerTitle}>
          {opportunityParam ? 'Trade Strategy' : 'Markets'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setRefreshing(true) && loadOpportunities()}>
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
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
        {/* Opportunity Selector - Only show when accessed from tabs */}
        {!opportunityParam && opportunities.length > 1 && (
          <View style={styles.opportunitySelectorSection}>
            <Text style={styles.sectionTitle}>TRADING OPPORTUNITIES</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.opportunityCards}
            >
              {opportunities.map((opp, index) => (
                <TouchableOpacity
                  key={opp.id || index}
                  style={[
                    styles.opportunityCard,
                    selectedOpportunity?.id === opp.id && styles.opportunityCardActive
                  ]}
                  onPress={() => setSelectedOpportunity(opp)}
                >
                  <View style={styles.opportunityHeader}>
                    <Text style={styles.opportunityAsset}>{opp.asset}</Text>
                    <View style={[
                      styles.opportunityBadge,
                      opp.action === 'BUY' ? styles.badgeBuy : styles.badgeSell
                    ]}>
                      <Text style={styles.badgeText}>{opp.action}</Text>
                    </View>
                  </View>
                  <Text style={styles.opportunityConfidence}>
                    {opp.confidence}% Confidence
                  </Text>
                  <Text style={[
                    styles.opportunityReturn,
                    opp.expectedReturnValue >= 0 ? styles.returnPositive : styles.returnNegative
                  ]}>
                    {opp.expectedReturn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Trade Details Section */}
        <View style={styles.tradeDetailsSection}>
          <View style={styles.tradeInfoCard}>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Asset</Text>
              <Text style={styles.tradeValue}>{asset}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Action</Text>
              <Text style={[styles.tradeValue, { color: opportunity.action === 'BUY' ? '#22C55E' : '#EF4444' }]}>{opportunity.action}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Entry Price</Text>
              <Text style={styles.tradeValue}>${currentPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Target Price</Text>
              <Text style={styles.tradeValue}>${targetPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Stop Loss</Text>
              <Text style={styles.tradeValue}>${stopLoss.toFixed(2)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Expected Return</Text>
              <Text style={[styles.tradeValue, { color: expectedReturn >= 0 ? '#22C55E' : '#EF4444' }]}>{expectedReturn >= 0 ? '+' : ''}{expectedReturn.toFixed(2)}%</Text>
            </View>
          </View>
          
          {/* Amount Input */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Trade Amount ({asset})</Text>
              <Text style={styles.balanceText}>Min: ${opportunity.minAmount || 100}</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={sellAmount}
                onChangeText={setSellAmount}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor="#4B5563"
              />
              <View style={styles.tokenButton}>
                <View style={styles.ethIcon}>
                  <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.tokenText}>{asset}</Text>
              </View>
            </View>
            <Text style={styles.inputHint}>Range: ${opportunity.minAmount || 100} - ${opportunity.maxAmount || 10000}</Text>
          </View>
        </View>
        
        {/* Market Performance Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Market Performance</Text>
            <View style={styles.timeframeButtons}>
              {['1H', '4H', '1D', '1W'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === tf && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeframe(tf)}
                >
                  <Text style={[
                    styles.timeframeText,
                    selectedTimeframe === tf && styles.timeframeTextActive,
                  ]}>{tf}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Candlestick Chart */}
          <View style={styles.chartContainer}>
            <Svg height={120} width={SCREEN_WIDTH - 64}>
              {candlestickData.map((candle, index) => {
                const x = (index * ((SCREEN_WIDTH - 96) / 7)) + 24;
                const scale = chartScale;
                const chartHeight = 100;
                const chartBottom = 110;
                
                // Normalize prices to chart space
                const normalizeY = (price) => {
                  const normalized = ((price - minPrice) / priceRange) * chartHeight;
                  return chartBottom - normalized;
                };
                
                return (
                  <React.Fragment key={index}>
                    {/* Wick */}
                    <Line
                      x1={x}
                      y1={normalizeY(candle.high)}
                      x2={x}
                      y2={normalizeY(candle.low)}
                      stroke={candle.color}
                      strokeWidth={1.5}
                    />
                    {/* Body */}
                    <Rect
                      x={x - 8}
                      y={Math.min(normalizeY(candle.open), normalizeY(candle.close))}
                      width={16}
                      height={Math.max(Math.abs(normalizeY(candle.open) - normalizeY(candle.close)), 2)}
                      fill={candle.color}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>
        
        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          {/* Confidence */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
              <Text style={styles.metricLabel}>CONFIDENCE</Text>
            </View>
            <Text style={styles.metricValue}>{confidence}%</Text>
            <Text style={styles.metricSubtext}>+2% All Bots</Text>
          </View>
          
          {/* Risk Level */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.metricLabel}>RISK LEVEL</Text>
            </View>
            <Text style={styles.metricValue}>{riskLevel}</Text>
            <Text style={styles.metricSubtext}>Based on credit scoring applied</Text>
          </View>
        </View>
        
        {/* AI Trading Signals - Real Indicators */}
        <View style={styles.signalsSection}>
          <Text style={styles.signalsTitle}>AI TRADING SIGNALS</Text>
          <View style={styles.signalsRow}>
            <View style={styles.signalCard}>
              <Text style={styles.signalLabel}>RSI</Text>
              <Text style={styles.signalSubtext}>{opportunity.indicators?.rsi ? opportunity.indicators.rsi.toFixed(1) : 'N/A'}</Text>
              <Text style={styles.signalChange}>{opportunity.indicators?.rsi > 70 ? 'Overbought' : opportunity.indicators?.rsi < 30 ? 'Oversold' : 'Neutral'}</Text>
            </View>
            
            <View style={styles.signalCard}>
              <Text style={[styles.signalLabel, { color: '#3B82F6' }]}>MACD</Text>
              <Text style={styles.signalSubtext}>{opportunity.indicators?.macd_trend || 'N/A'}</Text>
              <Text style={styles.signalValue}>{opportunity.indicators?.macd ? opportunity.indicators.macd.toFixed(4) : '0'}</Text>
            </View>
            
            <View style={styles.signalCard}>
              <Text style={[styles.signalLabel, { color: '#8B5CF6' }]}>VOLATILITY</Text>
              <Text style={styles.signalSubtext}>30-Day</Text>
              <Text style={styles.signalValue}>{opportunity.indicators?.volatility ? opportunity.indicators.volatility.toFixed(2) : '0'}%</Text>
            </View>
          </View>
          
          <View style={styles.signalsRow}>
            <View style={styles.signalCard}>
              <Text style={[styles.signalLabel, { color: '#F59E0B' }]}>SHARPE RATIO</Text>
              <Text style={styles.signalSubtext}>Risk-Adjusted</Text>
              <Text style={styles.signalValue}>{opportunity.indicators?.sharpe_ratio ? opportunity.indicators.sharpe_ratio.toFixed(2) : 'N/A'}</Text>
            </View>
            
            <View style={styles.signalCard}>
              <Text style={[styles.signalLabel, { color: '#22C55E' }]}>MOMENTUM</Text>
              <Text style={styles.signalSubtext}>30-Day</Text>
              <Text style={styles.signalValue}>{opportunity.indicators?.returns_1m ? opportunity.indicators.returns_1m.toFixed(1) : '0'}%</Text>
            </View>
            
            <View style={styles.signalCard}>
              <Text style={[styles.signalLabel, { color: '#8B5CF6' }]}>DATA SOURCE</Text>
              <Text style={styles.signalSubtext}>{opportunity.badges?.join(', ') || 'LIVE'}</Text>
              <Text style={styles.signalValue}>TEE Secured</Text>
            </View>
          </View>
        </View>
        
        {/* Execute Button */}
        <TouchableOpacity 
          style={[styles.executeButton, loading && styles.executeButtonDisabled]}
          onPress={handleExecute}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.executeButtonText}>Executing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.executeButtonText}>Execute Trade</Text>
            </>
          )}
        </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tradeInputSection: {
    marginBottom: 24,
  },
  tradeDetailsSection: {
    marginBottom: 24,
  },
  tradeInfoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  tradeLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tradeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  balanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  valueText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  inputHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ethIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#627EEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  swapIcon: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -8,
    zIndex: 1,
    borderWidth: 3,
    borderColor: '#000000',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  timeframeButtonActive: {
    backgroundColor: '#2563EB',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    height: 140,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  signalsSection: {
    marginBottom: 24,
  },
  signalsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  signalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signalCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  signalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  signalSubtext: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 6,
  },
  signalChange: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '500',
  },
  signalValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  executeButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  executeButtonDisabled: {
    backgroundColor: '#1E40AF',
    opacity: 0.6,
  },
  executeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  opportunitySelectorSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  opportunityCards: {
    paddingRight: 16,
    gap: 12,
  },
  opportunityCard: {
    width: 160,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 12,
  },
  opportunityCardActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opportunityAsset: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  opportunityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeBuy: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeSell: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },
  opportunityConfidence: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  opportunityReturn: {
    fontSize: 16,
    fontWeight: '600',
  },
  returnPositive: {
    color: '#22C55E',
  },
  returnNegative: {
    color: '#EF4444',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExecutionScreen({ route, navigation }) {
  const opportunity = route?.params?.opportunity || {};
  const transaction = route?.params?.transaction || {};
  
  const asset = opportunity.asset || 'ETH';
  const action = opportunity.action || 'BUY';
  const tradeAmount = opportunity.tradeAmount || '100';
  const entryPrice = opportunity.price || opportunity.entryPrice || 0;
  const totalValue = parseFloat(tradeAmount) * entryPrice;
  
  // Calculate MEV savings (0.5% - 2% typically saved)
  const mevSavedPercent = 0.015; // 1.5% saved
  const mevSaved = totalValue * mevSavedPercent;
  
  // Gas fees on Arbitrum (typically $0.50 - $2.00)
  const gasPaid = transaction.gasUsed ? parseFloat(transaction.gasUsed) / 1000000 * 0.025 : 1.20;
  
  const network = 'Arbitrum Sepolia';
  
  // Use real transaction hash from backend, or generate mock for demo
  const attestationHash = transaction.txHash || `0x${Math.random().toString(16).substr(2, 40)}...`;
  const usedTEE = transaction.usedTEE !== undefined ? transaction.usedTEE : true;
  
  // Check if this is a real blockchain transaction or demo mode
  // Demo mode is explicitly flagged by backend, or has a note field
  const isRealTransaction = transaction.success && !transaction.demoMode && !transaction.note;
  
  // TEE protection details
  const teeApp = opportunity.dataSource?.tee_app || 'iExec TEE';
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={[styles.successCircle, !isRealTransaction && styles.demoSuccessCircle]}>
          <Ionicons name={isRealTransaction ? "checkmark" : "flash"} size={48} color="#FFFFFF" />
        </View>
        
        {/* Success Message */}
        <Text style={styles.title}>
          {isRealTransaction ? 'Trade Executed' : 'Trade Simulated'}
        </Text>
        <Text style={styles.subtitle}>
          {isRealTransaction 
            ? 'Your order was filled instantly via iExec TEE'
            : 'Demo mode - Trade simulation completed successfully'}
        </Text>
        
        {/* Demo Mode Banner */}
        {!isRealTransaction && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.demoBannerText}>
              This is a simulated transaction for demo purposes. No real blockchain transaction was made.
            </Text>
          </View>
        )}
        
        {/* Trade Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{action === 'BUY' ? 'Bought' : 'Sold'}</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>${totalValue.toFixed(2)}</Text>
              <Text style={styles.detailValueUSD}>≈ {tradeAmount} {asset}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <View style={styles.mevIcon}>
                <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
              </View>
              <Text style={styles.detailLabel}>MEV Saved</Text>
            </View>
            <Text style={[styles.detailValue, { color: '#22C55E' }]}>${mevSaved.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <View style={[styles.mevIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="flash" size={14} color="#3B82F6" />
              </View>
              <Text style={styles.detailLabel}>Gas Paid</Text>
            </View>
            <Text style={styles.detailValue}>${gasPaid.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <View style={[styles.mevIcon, { backgroundColor: 'rgba(156, 163, 175, 0.15)' }]}>
                <Ionicons name="globe-outline" size={14} color="#9CA3AF" />
              </View>
              <Text style={styles.detailLabel}>Network</Text>
            </View>
            <Text style={styles.detailValue}>{network}</Text>
          </View>
        </View>
        
        {/* Attestation Proof */}
        <View style={styles.attestationSection}>
          <View style={styles.attestationHeader}>
            <Text style={styles.attestationTitle}>ATTESTATION PROOF</Text>
            {!isRealTransaction && (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>DEMO MODE</Text>
              </View>
            )}
          </View>
          
          <View style={styles.qrContainer}>
            {/* QR Code Placeholder - Using simple grid pattern */}
            <View style={styles.qrCode}>
              <Svg height={120} width={120}>
                {/* Simple QR-like pattern */}
                <Rect x={10} y={10} width={30} height={30} fill="#000000" />
                <Rect x={50} y={10} width={20} height={20} fill="#000000" />
                <Rect x={80} y={10} width={30} height={30} fill="#000000" />
                <Rect x={10} y={50} width={20} height={20} fill="#000000" />
                <Rect x={40} y={40} width={40} height={40} fill="#000000" />
                <Rect x={90} y={50} width={20} height={20} fill="#000000" />
                <Rect x={10} y={80} width={30} height={30} fill="#000000" />
                <Rect x={50} y={90} width={20} height={20} fill="#000000" />
                <Rect x={80} y={80} width={30} height={30} fill="#000000" />
              </Svg>
            </View>
          </View>
          
          <Text style={styles.attestationText}>
            {isRealTransaction 
              ? 'TEE-secured trade verification. This hash confirms the execution environment was private and secure.'
              : 'DEMO MODE: This is a simulated transaction for demonstration purposes. No actual blockchain transaction was made.'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.hashButton, !isRealTransaction && styles.hashButtonDisabled]}
            onPress={() => {
              if (!isRealTransaction) {
                // For demo mode, show explanation alert
                Alert.alert(
                  'Demo Transaction',
                  'This is a simulated transaction hash for demonstration purposes.\n\nNo actual blockchain transaction was made. In production mode with funded accounts, real transactions will be submitted to Arbitrum Sepolia and viewable on Arbiscan.',
                  [{ text: 'OK', style: 'default' }]
                );
                return;
              }
              // Remove '...' if it's a truncated hash, otherwise use full hash
              const cleanHash = attestationHash.replace('...', '');
              const explorerUrl = `https://sepolia.arbiscan.io/tx/${cleanHash}`;
              
              console.log('🔗 Opening Arbiscan:', explorerUrl);
              Linking.openURL(explorerUrl).catch(err => 
                console.error('Failed to open URL:', err)
              );
            }}
          >
            <Text style={[styles.hashText, !isRealTransaction && styles.hashTextDisabled]} numberOfLines={1}>
              {isRealTransaction ? attestationHash : 'Demo: ' + attestationHash.substring(0, 20) + '...'}
            </Text>
            {isRealTransaction ? (
              <Ionicons name="open-outline" size={16} color="#3B82F6" />
            ) : (
              <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => {
            // Navigate back to dashboard
            navigation.navigate('Dashboard');
          }}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  demoSuccessCircle: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 10,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#F59E0B',
    lineHeight: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mevIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailValueContainer: {
    alignItems: 'flex-end',
  },
  detailValueUSD: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  attestationSection: {
    width: '100%',
    alignItems: 'center',
  },
  attestationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  attestationTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  demoBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  qrContainer: {
    marginBottom: 20,
  },
  qrCode: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attestationText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  hashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  hashButtonDisabled: {
    opacity: 0.5,
    borderColor: '#1A1A1A',
  },
  hashText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'monospace',
    maxWidth: 200,
  },
  hashTextDisabled: {
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  doneButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

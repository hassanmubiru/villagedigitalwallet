/**
 * Enhanced Security Features Component
 * Implements biometric authentication, hardware wallet support, and MFA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Fingerprint, Smartphone, Key, 
  AlertTriangle, CheckCircle, Lock, Unlock,
  Eye, EyeOff, QrCode, Usb, Wifi
} from 'lucide-react';

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  securityLevel: 'basic' | 'medium' | 'high';
  icon: React.ReactNode;
}

interface AuthenticationMethod {
  id: string;
  type: 'password' | 'biometric' | 'hardware' | 'sms' | 'totp';
  name: string;
  enabled: boolean;
  lastUsed?: Date;
  trustScore: number;
}

interface SecurityScore {
  overall: number;
  factors: {
    authentication: number;
    deviceSecurity: number;
    transactionSecurity: number;
    privacySettings: number;
  };
  recommendations: string[];
}

interface HardwareWallet {
  id: string;
  name: string;
  type: 'ledger' | 'trezor' | 'coldcard';
  connected: boolean;
  address?: string;
  balance?: number;
}

export default function EnhancedSecurity() {
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([]);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null);
  const [hardwareWallets, setHardwareWallets] = useState<HardwareWallet[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'authentication' | 'hardware' | 'privacy'>('overview');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);

  useEffect(() => {
    initializeSecurityFeatures();
    checkBiometricSupport();
    checkWebAuthnSupport();
    loadSecurityScore();
  }, []);

  const initializeSecurityFeatures = () => {
    const features: SecurityFeature[] = [
      {
        id: 'biometric',
        name: 'Biometric Authentication',
        description: 'Use fingerprint or face recognition for secure access',
        enabled: false,
        configured: false,
        securityLevel: 'high',
        icon: <Fingerprint className="h-5 w-5" />
      },
      {
        id: 'hardware-wallet',
        name: 'Hardware Wallet Support',
        description: 'Connect Ledger, Trezor, or other hardware wallets',
        enabled: false,
        configured: false,
        securityLevel: 'high',
        icon: <Usb className="h-5 w-5" />
      },
      {
        id: 'mfa',
        name: 'Multi-Factor Authentication',
        description: 'Add an extra layer of security with TOTP or SMS',
        enabled: true,
        configured: true,
        securityLevel: 'high',
        icon: <Shield className="h-5 w-5" />
      },
      {
        id: 'transaction-signing',
        name: 'Transaction Signing',
        description: 'Cryptographically sign all transactions',
        enabled: true,
        configured: true,
        securityLevel: 'medium',
        icon: <Key className="h-5 w-5" />
      },
      {
        id: 'device-binding',
        name: 'Device Binding',
        description: 'Bind your account to trusted devices',
        enabled: false,
        configured: false,
        securityLevel: 'medium',
        icon: <Smartphone className="h-5 w-5" />
      }
    ];

    setSecurityFeatures(features);
  };

  const checkBiometricSupport = async () => {
    if ('PublicKeyCredential' in window) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricSupported(available);
      } catch (error) {
        console.error('Error checking biometric support:', error);
        setBiometricSupported(false);
      }
    }
  };

  const checkWebAuthnSupport = () => {
    setWebAuthnSupported('credentials' in navigator && 'PublicKeyCredential' in window);
  };

  const loadSecurityScore = () => {
    // Mock security score calculation
    const score: SecurityScore = {
      overall: 78,
      factors: {
        authentication: 85,
        deviceSecurity: 70,
        transactionSecurity: 90,
        privacySettings: 65
      },
      recommendations: [
        'Enable biometric authentication for faster and more secure access',
        'Consider using a hardware wallet for maximum security',
        'Review and update your privacy settings',
        'Enable device binding to prevent unauthorized access'
      ]
    };

    setSecurityScore(score);
  };

  const enableBiometricAuth = async () => {
    if (!biometricSupported) {
      alert('Biometric authentication is not supported on this device');
      return;
    }

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "Village Digital Wallet",
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      }) as PublicKeyCredential;

      if (credential) {
        // Update security feature
        setSecurityFeatures(prev => prev.map(feature => 
          feature.id === 'biometric' 
            ? { ...feature, enabled: true, configured: true }
            : feature
        ));
        
        alert('Biometric authentication enabled successfully!');
      }
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      alert('Failed to enable biometric authentication. Please try again.');
    }
  };

  const connectHardwareWallet = async (type: 'ledger' | 'trezor') => {
    try {
      if (type === 'ledger') {
        // Simulate Ledger connection
        const wallet: HardwareWallet = {
          id: 'ledger-1',
          name: 'Ledger Nano S',
          type: 'ledger',
          connected: true,
          address: '0x742d35Cc6634C0532925a3b8D93e7DC6d9E8b',
          balance: 2.5
        };
        
        setHardwareWallets(prev => [...prev, wallet]);
        
        // Update security feature
        setSecurityFeatures(prev => prev.map(feature => 
          feature.id === 'hardware-wallet' 
            ? { ...feature, enabled: true, configured: true }
            : feature
        ));
        
        alert('Hardware wallet connected successfully!');
      }
    } catch (error) {
      console.error('Failed to connect hardware wallet:', error);
      alert('Failed to connect hardware wallet. Please ensure it\'s connected and unlocked.');
    }
  };

  const toggleSecurityFeature = (featureId: string) => {
    setSecurityFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const getSecurityLevelColor = (level: 'basic' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'basic':
        return 'text-red-600 bg-red-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
        <p className="text-gray-600">Manage your account security and authentication methods</p>
      </div>

      {/* Security Score Overview */}
      {securityScore && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security Score</h2>
              <p className="text-sm text-gray-600">Overall security rating for your account</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(securityScore.overall)}`}>
                {securityScore.overall}/100
              </div>
              <p className="text-sm text-gray-500">
                {securityScore.overall >= 80 ? 'Excellent' : 
                 securityScore.overall >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(securityScore.factors).map(([key, score]) => (
              <div key={key} className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
            <ul className="space-y-1">
              {securityScore.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['overview', 'authentication', 'hardware', 'privacy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                selectedTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.name}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSecurityLevelColor(feature.securityLevel)}`}>
                  {feature.securityLevel.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feature.enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={`text-sm ${feature.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (feature.id === 'biometric' && !feature.enabled) {
                      enableBiometricAuth();
                    } else {
                      toggleSecurityFeature(feature.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    feature.enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {feature.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'authentication' && (
        <div className="space-y-6">
          {/* Biometric Authentication */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biometric Authentication</h3>
            
            {biometricSupported ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Biometric authentication available</p>
                      <p className="text-sm text-green-700">Use your fingerprint or face to authenticate</p>
                    </div>
                  </div>
                  <button
                    onClick={enableBiometricAuth}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Setup Biometrics
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">Biometric authentication not available</p>
                    <p className="text-sm text-gray-600">Your device doesn&apos;t support biometric authentication</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <QrCode className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Authenticator App</h4>
                    <p className="text-sm text-gray-600">Use Google Authenticator or similar</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Setup Authenticator
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Smartphone className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Authentication</h4>
                    <p className="text-sm text-gray-600">Receive codes via text message</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Setup SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'hardware' && (
        <div className="space-y-6">
          {/* Hardware Wallet Connection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hardware Wallets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Usb className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Ledger</h4>
                <p className="text-sm text-gray-600 mb-3">Nano S, Nano X</p>
                <button
                  onClick={() => connectHardwareWallet('ledger')}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Connect Ledger
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Usb className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Trezor</h4>
                <p className="text-sm text-gray-600 mb-3">Model T, Model One</p>
                <button
                  onClick={() => connectHardwareWallet('trezor')}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Connect Trezor
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Usb className="h-6 w-6 text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Other</h4>
                <p className="text-sm text-gray-600 mb-3">WalletConnect</p>
                <button className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Connect Wallet
                </button>
              </div>
            </div>

            {/* Connected Hardware Wallets */}
            {hardwareWallets.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Connected Wallets</h4>
                <div className="space-y-3">
                  {hardwareWallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Usb className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{wallet.name}</p>
                          <p className="text-sm text-green-700">{wallet.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-900">{wallet.balance} CELO</p>
                        <div className="flex items-center space-x-1 text-sm text-green-700">
                          <Wifi className="h-4 w-4" />
                          <span>Connected</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'privacy' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Data Encryption</h4>
                <p className="text-sm text-gray-600">Encrypt sensitive data on device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Anonymous Analytics</h4>
                <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Transaction Privacy</h4>
                <p className="text-sm text-gray-600">Use privacy-preserving transaction methods</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

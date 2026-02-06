# Mobile App Package

React Native mobile application for PrivateAlpha trading platform.

## Features

- **Wallet Connection**: Connect with MetaMask/WalletConnect
- **Credit Score**: View and compute private credit scores
- **Trading Dashboard**: Browse AI-powered opportunities
- **Strategy Details**: Analyze signals before trading
- **Trade Execution**: Execute MEV-protected trades

## Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on web
npm run web

# Run on iOS (requires macOS)
npm run ios

# Run on Android
npm run android
```

## Configuration

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Screens

1. **WelcomeScreen**: Wallet connection
2. **CreditScoreScreen**: Compute credit score with animation
3. **DashboardScreen**: Trading opportunities list
4. **StrategyScreen**: Detailed strategy analysis
5. **ExecutionScreen**: MEV-protected trade execution

## Navigation Flow

```
Welcome → CreditScore → Dashboard → Strategy → Execution
```

## Development

```bash
# Run with hot reload
npm start

# Clear cache
expo start -c

# Run tests
npm test
```

## Build

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## License

MIT

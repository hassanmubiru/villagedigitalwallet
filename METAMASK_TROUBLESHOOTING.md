# MetaMask Connection Troubleshooting

## Common Issues and Solutions

### 1. MetaMask Not Detected
- **Problem**: App doesn't recognize MetaMask
- **Solution**: 
  - Ensure MetaMask extension is installed and enabled
  - Refresh the page after installing MetaMask
  - Try disabling and re-enabling the MetaMask extension

### 2. Wrong Network
- **Problem**: MetaMask is on wrong network
- **Solution**: 
  - Switch MetaMask to Celo Mainnet or Celo Alfajores Testnet
  - Add Celo networks to MetaMask if not present:
    
    **Celo Mainnet:**
    - Network Name: Celo
    - RPC URL: https://forno.celo.org
    - Chain ID: 42220
    - Currency Symbol: CELO
    - Block Explorer: https://explorer.celo.org

    **Celo Alfajores Testnet:**
    - Network Name: Celo Alfajores
    - RPC URL: https://alfajores-forno.celo-testnet.org
    - Chain ID: 44787
    - Currency Symbol: CELO
    - Block Explorer: https://alfajores-blockscout.celo-testnet.org

### 3. Browser Issues
- **Problem**: Connection fails in browser
- **Solution**:
  - Try different browser (Chrome, Firefox, Brave)
  - Disable other wallet extensions temporarily
  - Clear browser cache and cookies
  - Disable ad blockers

### 4. HTTPS Issues
- **Problem**: MetaMask requires HTTPS in production
- **Solution**:
  - For localhost development, this should work fine
  - For production, ensure your site uses HTTPS

### 5. Popup Blocked
- **Problem**: MetaMask popup is blocked
- **Solution**:
  - Allow popups for localhost:3001
  - Check browser popup settings
  - Try clicking the MetaMask extension directly

### 6. Account Locked
- **Problem**: MetaMask account is locked
- **Solution**:
  - Unlock MetaMask by entering your password
  - Ensure you have at least one account in MetaMask

## Manual Connection Steps

1. Open MetaMask extension
2. Unlock with your password
3. Go to http://localhost:3001
4. Click "Connect Wallet"
5. Select MetaMask from the list
6. Approve the connection in MetaMask popup
7. Select which account to connect

## Debug Information

Check the debug info panel on the connection page to see:
- Whether MetaMask is detected
- Current network/chain ID
- Connection status
- Any error messages

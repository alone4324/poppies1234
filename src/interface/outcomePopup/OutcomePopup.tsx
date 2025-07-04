/*
 *  Copyright (c) Michael Kolesidis <michael.kolesidis@gmail.com>
 *  GNU Affero General Public License v3.0
 *
 *  ATTENTION! FREE SOFTWARE
 *  This website is free software (free as in freedom).
 *  If you use any part of this code, you must make your entire project's source code
 *  publicly available under the same license. This applies whether you modify the code
 *  or use it as it is in your own project. This ensures that all modifications and
 *  derivative works remain free software, so that everyone can benefit.
 *  If you are not willing to comply with these terms, you must refrain from using any part of this code.
 *
 *  For full license terms and conditions, you can read the AGPL-3.0 here:
 *  https://www.gnu.org/licenses/agpl-3.0.html
 */

import { useEffect, useState } from 'react';
import useGame from '../../stores/store';
import { MONAD_TESTNET } from '../../hooks/useBlockchainGame';
import { useSoundManager } from '../../hooks/useSoundManager';
import './style.css';

interface OutcomePopupProps {
  combination: string[];
  monReward: string;
  extraSpins: number;
  poppiesNftWon: boolean;
  rarestPending: boolean;
  txHash: string;
}

const OutcomePopup = ({ combination, monReward, extraSpins, poppiesNftWon, rarestPending, txHash }: OutcomePopupProps) => {
  const { setOutcomePopup } = useGame();
  const { playClick } = useSoundManager();
  const [wallet, setWallet] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const explorerUrl = `${MONAD_TESTNET.blockExplorers.default.url}/tx/${txHash}`;

  // ✅ Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ✅ Handle ESC key to close popup
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOutcomePopup(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [setOutcomePopup]);

  const getFruitImage = (fruit: string) => {
    const fruitMap: { [key: string]: string } = {
      'cherry': './images/cherry.png',
      'apple': './images/apple.png',
      'banana': './images/banana.png',
      'lemon': './images/lemon.png'
    };
    return fruitMap[fruit.toLowerCase()] || './images/cherry.png';
  };

  const getRewardText = () => {
    const rewards = [];
    
    if (poppiesNftWon) {
      rewards.push('🎉 RARE POPPIES NFT WON! 🌸');
    }
    
    if (rarestPending) {
      rewards.push('🏆 POPPIES MAINNET WL PENDING! 🎫');
    }
    
    if (parseFloat(monReward) > 0) {
      rewards.push(`💰 Won: ${monReward} MON`);
    }
    
    if (extraSpins > 0) {
      rewards.push(`🎁 Won: ${extraSpins} Free Spins`);
    }
    
    if (rewards.length === 0) {
      rewards.push('😔 No reward this time');
    }
    
    return rewards;
  };

  const closePopup = () => {
    console.log('🎰 Closing popup manually');
    playClick();
    setOutcomePopup(null);
  };

  // Handle wallet submission
  const handleWalletSubmit = async (rewardType: 'genesis-nft' | 'mainnet-wl') => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/submit-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, rewardType }),
      });
      if (!res.ok) throw new Error('Failed to submit wallet');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="outcome-popup" onClick={closePopup}>
      <div className="outcome-popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="outcome-popup-main">
          {/* Close button */}
          <button 
            className="outcome-close-btn" 
            onClick={closePopup}
          >
            ✕
          </button>
          
          {/* Title */}
          <div className="outcome-title">🎰 Spin Result</div>
          
          {/* Fruit combination - EXACT match with reel display */}
          <div className="outcome-fruits">
            {combination.map((fruit, index) => (
              <img 
                key={index}
                className="outcome-fruit-image" 
                src={getFruitImage(fruit)} 
                alt={fruit}
                title={`Reel ${index + 1}: ${fruit.toUpperCase()}`}
              />
            ))}
          </div>
          
          {/* Combination text for verification */}
          <div className="outcome-combination-text">
            {combination.map(fruit => fruit.toUpperCase()).join(' | ')}
          </div>
          
          {/* Rewards */}
          <div className="outcome-rewards">
            {getRewardText().map((reward, index) => (
              <div 
                key={index} 
                className={`outcome-reward ${
                  reward.includes('RARE POPPIES NFT') ? 'poppies-nft' :
                  reward.includes('MAINNET WL') ? 'mainnet-wl' :
                  reward.includes('Won:') && reward.includes('MON') ? 'mon-reward' :
                  reward.includes('Free Spins') ? 'free-spins' :
                  'no-reward'
                }`}
              >
                {reward}
              </div>
            ))}
          </div>
          
          {/* Wallet submission for rare rewards */}
          {(poppiesNftWon || rarestPending) && (
            <div style={{ margin: '32px 0 16px 0', textAlign: 'center' }}>
              {poppiesNftWon && (
                <>
                  <img src="/images/poppies-nft.gif" alt="Poppies Genesis NFT" style={{ width: '100%', maxWidth: 480, borderRadius: 16, marginBottom: 16 }} />
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 20, color: '#3b0873', marginBottom: 12 }}>
                    Submit your wallet to receive Poppies Genesis NFT - NFT will be sent to your wallet
                  </div>
                </>
              )}
              {rarestPending && !poppiesNftWon && (
                <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 20, color: '#3b0873', marginBottom: 12 }}>
                  Submit your wallet to receive Poppies Mainnet Whitelist
                </div>
              )}
              {!submitted ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleWalletSubmit(poppiesNftWon ? 'genesis-nft' : 'mainnet-wl');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                >
                  <input
                    type="text"
                    value={wallet}
                    onChange={e => setWallet(e.target.value)}
                    placeholder="Enter your wallet address"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 16,
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '2px solid #3b0873',
                      width: 280,
                      marginBottom: 8,
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting || !wallet}
                    style={{
                      fontFamily: 'Paytone One, sans-serif',
                      fontSize: 16,
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 24px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(59, 8, 115, 0.15)',
                      marginBottom: 4,
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Wallet'}
                  </button>
                  {error && <div style={{ color: '#e91e63', fontSize: 14 }}>{error}</div>}
                </form>
              ) : (
                <div style={{ color: '#28a745', fontFamily: 'Paytone One, sans-serif', fontSize: 18, marginTop: 8 }}>
                  Wallet submitted! We will contact you soon.
                </div>
              )}
            </div>
          )}
          
          {/* Explorer link */}
          <div className="outcome-explorer">
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="outcome-explorer-link"
            >
              🔗 View Transaction on Monad Explorer
            </a>
          </div>
          
          {/* Instructions */}
          <div className="outcome-instructions">
            <i>Click anywhere outside or press ESC to close and continue spinning</i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutcomePopup;
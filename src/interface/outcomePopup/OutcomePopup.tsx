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
import { usePrivy } from '@privy-io/react-auth';
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
  const [showShareTwitter, setShowShareTwitter] = useState(true);
  const [showTweetLinkForm, setShowTweetLinkForm] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [tweetSubmitted, setTweetSubmitted] = useState(false);
  const { user } = usePrivy();

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
    
    // Prioritize rare rewards - only show these if they exist
    if (poppiesNftWon) {
      rewards.push('🎉 RARE POPPIES NFT WON! 🌸');
    } else if (rarestPending) {
      rewards.push('🏆 POPPIES MAINNET WL PENDING! 🎫');
    } else {
      // Only show other rewards if no rare rewards were won
      if (parseFloat(monReward) > 0) {
        rewards.push(`💰 Won: ${monReward} MON`);
      }
      
      if (extraSpins > 0) {
        rewards.push(`🎁 Won: ${extraSpins} Free Spins`);
      }
      
      if (rewards.length === 0) {
        rewards.push('😔 No reward this time');
      }
    }
    
    return rewards;
  };

  const closePopup = () => {
    console.log('🎰 Closing popup manually');
    playClick();
    setOutcomePopup(null);
  };

  // Twitter share functions
  const shareOnTwitter = () => {
    const tweetText = poppiesNftWon 
      ? "life's good, god is great 🙌\n\njust won a rare @poppies_xyz NFT by spinning a slot machine with monad testnet tokens\n\nnever thought it'd be this easy lol\n\nyou gotta try it here: https://gamble.poppiesnft.xyz/\n\nIPY"
      : "life's good, god is great 🙌\n\njust won @poppies_xyz Mainnet WL by spinning a slot machine with monad testnet tokens\n\nnever thought it'd be this easy lol\n\nyou gotta try it here: https://gamble.poppiesnft.xyz/\n\nIPY";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
    
    // Hide share button and show tweet link form
    setShowShareTwitter(false);
    setShowTweetLinkForm(true);
  };

  const validateTweetLink = (link: string) => {
    const twitterDomains = [
      'twitter.com',
      'x.com',
      'mobile.twitter.com',
      'm.twitter.com'
    ];
    
    try {
      const url = new URL(link);
      return twitterDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleTweetLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tweetLink.trim()) {
      setError('Please enter a tweet link');
      return;
    }
    
    if (!validateTweetLink(tweetLink)) {
      setError('Please enter a valid Twitter/X tweet link');
      return;
    }
    
    setTweetSubmitted(true);
    setShowTweetLinkForm(false);
    setError('');
  };



  // Handle wallet submission
  const handleWalletSubmit = async (rewardType: 'genesis-nft' | 'mainnet-wl') => {
    setSubmitting(true);
    setError('');
    
    // Debug: Log what we're sending
    const requestBody = { 
      wallet, 
      rewardType, 
      userId: user?.id 
    };
    console.log('🧪 Submitting wallet with data:', requestBody);
    
    try {
      // Use relative path for API endpoint
      const res = await fetch('/api/submit-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('🧪 API Response status:', res.status);
      
      if (!res.ok) {
        // Try to parse error message from backend
        let msg = 'Failed to submit wallet';
        try {
          const data = await res.json();
          console.log('🧪 API Error response:', data);
          if (data && data.error) msg = data.error;
        } catch {}
        throw new Error(msg);
      }
      
      const responseData = await res.json();
      console.log('🧪 API Success response:', responseData);
      setSubmitted(true);
    } catch (e: any) {
      console.error('🧪 Wallet submission error:', e);
      setError(e.message || 'Submission failed. Please try again.');
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
          <div className="outcome-title">
            {poppiesNftWon ? '🎉 RARE NFT WIN!' : 
             rarestPending ? '🏆 MAINNET WL WIN!' : 
             '🎰 Spin Result'}
          </div>
          
          {/* Fruit combination - EXACT match with reel display */}
          {/* Hide fruits for Poppies NFT wins to focus on the rare reward */}
          {!poppiesNftWon && (
            <>
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
            </>
          )}
          
          {/* Rewards */}
          {/* Hide reward text for Poppies NFT wins to focus on the NFT itself */}
          {!poppiesNftWon && (
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
          )}
          
          {/* Rare rewards flow - Twitter share first, then wallet submission */}
          {(poppiesNftWon || rarestPending) && (
            <div style={{ 
              margin: '32px 0 16px 0', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1))',
              borderRadius: 16,
              padding: '24px',
              border: '2px solid rgba(233, 30, 99, 0.3)',
              animation: 'rareRewardGlow 2s ease-in-out infinite alternate'
            }}>
              {poppiesNftWon && (
                <>
                  <img src="/images/poppies-nft.gif" alt="Poppies Lottery Ticket NFT" style={{ width: '100%', maxWidth: 480, borderRadius: 16, marginBottom: 16 }} />
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 20, color: '#3b0873', marginBottom: 12, fontWeight: 'bold' }}>
                    🎉 CONGRATULATIONS! 🎉
                  </div>
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 18, color: '#3b0873', marginBottom: 12 }}>
                    You won a rare Poppies Lottery Ticket NFT!
                  </div>
                </>
              )}
              {rarestPending && !poppiesNftWon && (
                <>
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 20, color: '#3b0873', marginBottom: 12, fontWeight: 'bold' }}>
                    🏆 CONGRATULATIONS! 🏆
                  </div>
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 18, color: '#3b0873', marginBottom: 12 }}>
                    You won Poppies Mainnet Whitelist!
                  </div>
                </>
              )}

              {/* Step 1: Share on Twitter */}
              {showShareTwitter && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#3b0873', marginBottom: 16 }}>
                    Share your achievement on Twitter to claim your reward!
                  </div>
                  <button
                    onClick={shareOnTwitter}
                    style={{
                      background: '#1DA1F2',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    𝕏 Share on Twitter
                  </button>
                </div>
              )}

              {/* Step 2: Submit Tweet Link */}
              {showTweetLinkForm && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#3b0873', marginBottom: 16 }}>
                    Paste your tweet link below to verify your share:
                  </div>
                  <form onSubmit={handleTweetLinkSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <input
                      type="text"
                      value={tweetLink}
                      onChange={e => setTweetLink(e.target.value)}
                      placeholder="https://twitter.com/username/status/123456789"
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
                      style={{
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Submit Tweet Link
                    </button>
                    {error && (
                      <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              )}

                            {/* Step 3: Wallet Submission (after tweet verification) */}
              {tweetSubmitted && !submitted && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'Paytone One, sans-serif', fontSize: 16, color: '#3b0873', marginBottom: 12 }}>
                    {poppiesNftWon 
                      ? 'Submit your wallet to receive Poppies Lottery Ticket NFT - NFT will be sent to your wallet'
                      : 'Submit your wallet to receive Poppies Mainnet Whitelist'
                    }
                  </div>
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
                      disabled={submitting}
                      style={{
                        background: submitting ? '#6c757d' : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Wallet'}
                    </button>
                  </form>
                </div>
              )}

              {/* Success message after wallet submission */}
              {submitted && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#28a745', fontWeight: 'bold' }}>
                    ✅ Wallet submitted successfully!
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6c757d', marginTop: 8 }}>
                    {poppiesNftWon 
                      ? 'Your Poppies Lottery Ticket NFT will be sent to your wallet soon!'
                      : 'Your Poppies Mainnet Whitelist will be processed soon!'
                    }
                  </div>
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

<style>
{`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}
</style>
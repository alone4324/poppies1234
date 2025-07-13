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

import useGame from '../stores/store';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import Modal from './modal/Modal';
// import HelpButton from './helpButton/HelpButton';
import OutcomePopup from './outcomePopup/OutcomePopup';
// import WalletWidget from '../components/WalletWidget';
import InsufficientFundsPopup from './insufficientFundsPopup/InsufficientFundsPopup';
import OnboardingNavigation from './onboardingNavigation/OnboardingNavigation';
import './style.css';

const Interface = () => {
  const modal = useGame((state) => state.modal);
  const outcomePopup = useGame((state) => state.outcomePopup);
  const insufficientFundsPopup = useGame((state) => state.insufficientFundsPopup);
  const coins = useGame((state) => state.coins);
  const spins = useGame((state) => state.spins);
  
  // Get blockchain state for display
  const { monBalance, authenticated } = useBlockchainGame();

  return (
    <>
      {/* Onboarding Navigation */}
      <OnboardingNavigation />

      {/* Wallet Widget - Top Right */}
      {/* <WalletWidget /> */}

      {/* Help Button */}
      {/* <HelpButton /> */}

      {/* Modal */}
      {modal && <Modal />}

      {/* Outcome Popup */}
      {outcomePopup && (
        <OutcomePopup
          combination={outcomePopup.combination}
          monReward={outcomePopup.monReward}
          extraSpins={outcomePopup.extraSpins}
          poppiesNftWon={outcomePopup.poppiesNftWon}
          rarestPending={outcomePopup.rarestPending}
          txHash={outcomePopup.txHash}
        />
      )}

      {/* Insufficient Funds Popup */}
      {insufficientFundsPopup && <InsufficientFundsPopup />}

      {/* Logo */}
      <img className="logo" src="/images/logo.png" alt="" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)', position: 'fixed' }} />

      <div className="interface">
        {/* Coins - Show blockchain balance if authenticated, otherwise local coins */}
        <div className="coins-section">
          <div className="coins-number">
            {authenticated ? parseFloat(monBalance).toFixed(2) : coins}
          </div>
          <img className="coins-image" src="/images/coin.png" />
        </div>

        {/* Spins */}
        <div className="spins-section">
          <div className="spins-number">{spins}</div>
        </div>
      </div>
    </>
  );
};

export default Interface;
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

import useGame from '../../stores/store';
import { useSoundManager } from '../../hooks/useSoundManager';
import './style.css';

const Modal = () => {
  const { setModal } = useGame();
  const { playClick } = useSoundManager();

  const handleClose = () => {
    playClick();
    setModal(false);
  };

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-main">
          <button className="modal-close-btn" onClick={handleClose}>&times;</button>
          <div className="modal-title">🎰 Poppies Slot Machine</div>
          
          <div className="modal-section">
            <div className="modal-subtitle">How to Play</div>
            <div className="modal-text">
              Click on the SPIN button or press SPACE to spin.
            </div>
            <div className="modal-text">
              Matches are counted from left to right consecutively.
            </div>
            <div className="modal-text">Click and drag to rotate the 3D view</div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">Spin Costs</div>
            <div className="modal-text">
              Regular Spin: <span className="highlight">0.1 MON</span>
            </div>
            <div className="modal-text">
              Discounted Spin: <span className="highlight">0.01 MON</span> (when available)
            </div>
            <div className="modal-text">
              Free Spins: <span className="highlight">0 MON</span> (when won)
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">🎁 Rare Prizes</div>
            <div className="modal-text nft-reward">
              🌸 <span className="highlight">Rare Poppies NFT</span> - Awarded for rare spins
            </div>
            <div className="modal-text nft-reward">
              🎫 <span className="highlight">Poppies Mainnet WL</span> - Awarded for rare spins
            </div>
            <div className="modal-text" style={{ fontSize: '13px', color: '#888', marginTop: 8 }}>
              (Exact odds and outcomes are not disclosed. Keep spinning for a chance at rare prizes!)
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">💰 MON Rewards</div>
            <div className="modal-text">
              Match fruits to win MON and free spins. Triple and double matches give bigger rewards!
            </div>
            <div className="modal-text">
              Some spins may also grant discounted or free spins as bonuses.
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">Good Luck!</div>
            <div className="modal-text">
              Most spins win something, but not every spin is a winner. Keep spinning and have fun!
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">📊 Statistics</div>
            <div className="modal-text">
              • <span className="highlight">80%</span> of spins give rewards
            </div>
            <div className="modal-text">
              • <span className="highlight">20%</span> of spins give nothing
            </div>
            <div className="modal-text">
              • <span className="highlight">15%</span> total NFT chance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

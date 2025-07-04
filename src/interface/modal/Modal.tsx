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
    <div className="modal" onClick={handleClose} tabIndex={0} onKeyDown={e => { if (e.key === 'Escape') handleClose(); }}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-main">
          <div className="modal-title">🎰 Poppies Slot Machine</div>

          {/* 80% Stat Section */}
          <div className="modal-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0 20px 0' }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: '#e91e63', marginBottom: 8, fontFamily: 'Paytone One, sans-serif', letterSpacing: 1, textShadow: '0 2px 12px #f8e1f2' }}>
              80%
            </div>
            <div style={{ width: 160, height: 20, background: '#f0e6fa', borderRadius: 12, marginBottom: 14, overflow: 'hidden', boxShadow: '0 2px 8px #e91e6322' }}>
              <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #e91e63 0%, #9c27b0 100%)', borderRadius: 12, transition: 'width 0.7s cubic-bezier(.4,2,.6,1)' }}></div>
            </div>
            <div style={{ fontSize: 20, color: '#3b0873', fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: 8, textShadow: '0 1px 6px #f8e1f2' }}>
              of spins get a reward!
            </div>
            <div style={{ fontSize: 16, color: '#6913c5', fontFamily: 'Inter, sans-serif', marginBottom: 0, marginTop: 4, maxWidth: 320, textAlign: 'center' }}>
              Keep spinning for your chance to win <span style={{ color: '#e91e63', fontWeight: 600 }}>rare prizes</span> like a
              <img src="/images/poppies-nft.gif" alt="Poppies Lottery Ticket NFT" style={{ width: '1.7em', height: '1em', verticalAlign: 'middle', margin: '0 4px', borderRadius: '0.3em', display: 'inline-block', objectFit: 'cover' }} />
              Poppies Lottery Ticket NFT or <span style={{ fontSize: '1em', verticalAlign: 'middle', margin: '0 2px' }}>🎫</span> Mainnet Whitelist!
            </div>
          </div>

          {/* How to Play Section */}
          <div className="modal-section" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
            <div className="modal-subtitle" style={{ marginBottom: 8 }}>How to Play</div>
            <div className="modal-text">
              Click the <span style={{ color: '#e91e63', fontWeight: 600 }}>SPIN</span> button or press <span style={{ color: '#9c27b0', fontWeight: 600 }}>SPACE</span> to spin.
            </div>
            <div className="modal-text">
              Match fruits to win MON and free spins.
            </div>
            <div className="modal-text">
              Some spins may grant rare prizes or bonuses.
            </div>
            <div className="modal-text" style={{ color: '#888', fontSize: 14, marginTop: 12 }}>
              <i>Click anywhere outside this window or press ESC to close.</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

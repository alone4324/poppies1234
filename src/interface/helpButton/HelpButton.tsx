import useGame from '../../stores/store';
import { useSoundManager } from '../../hooks/useSoundManager';
import './style.css';

const HelpButton = () => {
  const { setModal } = useGame();
  const { playClick } = useSoundManager();

  return (
    <div onClick={() => { playClick(); setModal(true); }} className="help-button" />
  );
};

export default HelpButton;

import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

// Roulette numbers in European order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export interface RouletteBet {
  type: string;
  amount: number;
}

export interface RouletteResult {
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
  totalWinnings: number;
  winningBets: string[];
}

export function useRouletteGame() {
  const { authenticated } = usePrivy();
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<RouletteResult | null>(null);

  const getNumberColor = useCallback((num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  }, []);

  const calculateWinnings = useCallback((winningNumber: number, bets: { [key: string]: number }): RouletteResult => {
    let totalWinnings = 0;
    const winningBets: string[] = [];
    const winningColor = getNumberColor(winningNumber);

    Object.entries(bets).forEach(([betType, amount]) => {
      let isWinning = false;
      let payout = 0;

      // Straight up number bet (35:1)
      if (betType === winningNumber.toString()) {
        isWinning = true;
        payout = 35;
        winningBets.push(`Number ${winningNumber}`);
      }
      // Color bets (1:1)
      else if (betType === 'red' && winningColor === 'red') {
        isWinning = true;
        payout = 1;
        winningBets.push('Red');
      }
      else if (betType === 'black' && winningColor === 'black') {
        isWinning = true;
        payout = 1;
        winningBets.push('Black');
      }
      // Odd/Even bets (1:1)
      else if (betType === 'odd' && winningNumber % 2 === 1 && winningNumber !== 0) {
        isWinning = true;
        payout = 1;
        winningBets.push('Odd');
      }
      else if (betType === 'even' && winningNumber % 2 === 0 && winningNumber !== 0) {
        isWinning = true;
        payout = 1;
        winningBets.push('Even');
      }
      // High/Low bets (1:1)
      else if (betType === 'low' && winningNumber >= 1 && winningNumber <= 18) {
        isWinning = true;
        payout = 1;
        winningBets.push('Low (1-18)');
      }
      else if (betType === 'high' && winningNumber >= 19 && winningNumber <= 36) {
        isWinning = true;
        payout = 1;
        winningBets.push('High (19-36)');
      }

      if (isWinning) {
        totalWinnings += amount * (payout + 1); // Include original bet
      }
    });

    return {
      winningNumber,
      winningColor,
      totalWinnings,
      winningBets
    };
  }, [getNumberColor]);

  const spinRoulette = useCallback(async (bets: { [key: string]: number }): Promise<RouletteResult | null> => {
    if (!authenticated || isSpinning) {
      return null;
    }

    setIsSpinning(true);

    try {
      // Simulate spin delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate random winning number
      const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
      const winningNumber = ROULETTE_NUMBERS[randomIndex];

      // Calculate results
      const result = calculateWinnings(winningNumber, bets);
      setLastResult(result);

      return result;
    } catch (error) {
      console.error('Roulette spin failed:', error);
      return null;
    } finally {
      setIsSpinning(false);
    }
  }, [authenticated, isSpinning, calculateWinnings]);

  const getSpinCost = useCallback((totalBetAmount: number): string => {
    return `${totalBetAmount.toFixed(3)} MON`;
  }, []);

  return {
    authenticated,
    isSpinning,
    lastResult,
    spinRoulette,
    getSpinCost,
    getNumberColor
  };
}
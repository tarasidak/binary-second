import { showModal } from "./modal";

export function showWinnerModal(fighter) {
  const infoWinner = {
    bodyElement: fighter.name,
    title: 'The WINNER IS!'
  }
  showModal(infoWinner);
}

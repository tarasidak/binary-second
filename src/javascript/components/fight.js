import { controls } from '../../constants/controls';
import { createElement } from '../helpers/domHelper';

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {

    const healthContainer = document.getElementsByClassName('arena___health-bar');
    const healthPoints = [ ...healthContainer ];
    const viewContainer = document.getElementsByClassName('arena___health-indicator');
    const statusViews = [ ...viewContainer ];
    const infoStatus = {
      currentHealth: 100,
      critTime: Date.now(),
      block: false,  
      crit: []
    }

    const firstPlayer = { 
      ...firstFighter,
      healthBar: healthPoints[0], 
      statusView: statusViews[0], 
      ...infoStatus, 
      position: 'left'
    }

    const secondPlayer = { 
      ...secondFighter,
      healthBar: healthPoints[1], 
      statusView: statusViews[1], 
      ...infoStatus, 
      position: 'right'
    }

    function showStatus(fighter, text) {
      if(document.getElementById(`${fighter.position}-status-marker`)) {
        document.getElementById(`${fighter.position}-status-marker`).remove();
      }

    const markerOfStatus = createElement({ tagName: 'div', className: 'arena___status-marker', attributes: {id: `${fighter.position}-status-marker`} });
      markerOfStatus.innerText = text;
      markerOfStatus.style.opacity = '1';
      fighter.statusView.append(markerOfStatus);
      setInterval(() => {
        if(markerOfStatus.style.opacity > 0) {
          markerOfStatus.style.opacity = markerOfStatus.style.opacity - 0.01;
        } else {
          markerOfStatus.remove();
        }
      }, 50);
    }

    function attackRelease(attack, defend) {
      if(attack.block) {
        showStatus(attack, 'How can you block`?');
        return void 0;
      }

      if(defend.block) {
        showStatus(defend, ' I am Blocked!');
        return void 0;
      }

      const totalDamage = getDamage(attack, defend);

      if(!totalDamage) {
        showStatus(attack, 'You Missed!');
        return void 0;
      }

      if(attack.crit.length === 3) {
        showStatus(attack, 'Critical hit!');
      }

      showStatus(defend, `-${totalDamage.toFixed(1)}`);
      defend.currentHealth = defend.currentHealth - totalDamage / defend.health * 100;
      if(defend.currentHealth < 0) {
        document.removeEventListener('keydown', onDown);
        document.removeEventListener('keyup', onUp);
        resolve(attack);
      }

      defend.healthBar.style.width = `${defend.currentHealth}%`;
    }

    function critHandler(fighter) {
      const currentTime = Date.now();

      if(currentTime - fighter.critTime < 10000) {
        return false;
      }

      if(!fighter.crit.includes(event.code)) {
        fighter.crit.push(event.code);
      }

      if(fighter.crit.length === 3) {
        fighter.critTime = currentTime;
        return true;
      }
    }

    function onDown(event) {
      if(!event.repeat) {
        switch(event.code) {
          case controls.PlayerOneAttack: {
            attackRelease(firstPlayer, secondPlayer);
            break;
          }

          case controls.PlayerTwoAttack: {
            attackRelease(secondPlayer, firstPlayer);
            break;
          }

          case controls.PlayerOneBlock: {
            firstPlayer.block = true;
            break;
          }

          case controls.PlayerTwoBlock: {
            secondPlayer.block = true;
            break;
          }
        }

        if(controls.PlayerOneCriticalHitCombination.includes(event.code)) {
          critHandler(firstPlayer) ? attackRelease(firstPlayer, secondPlayer) : null;
        }

        if(controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
          critHandler(secondPlayer) ? attackRelease(secondPlayer, firstPlayer) : null;
        }
      }
    }

    function onUp(event) {
      switch(event.code) {
        case controls.PlayerOneBlock: firstPlayer.block = false; break;
        case controls.PlayerTwoBlock: secondPlayer.block = false; break;
      }

      if(firstPlayer.crit.includes(event.code)) {
        firstPlayer.crit.splice(firstPlayer.crit.indexOf(event.code), 1);
      }

      if(secondPlayer.crit.includes(event.code)) {
        secondPlayer.crit.splice(secondPlayer.crit.indexOf(event.code), 1);
      }
    }

    document.addEventListener('keydown', onDown);
    document.addEventListener('keyup', onUp);
  });
}

export function getDamage(attack, defend) {
  const damage = getHitPower(attack) - getBlockPower(defend);
  return damage > 0 ? damage : 0;
}

export function getHitPower(fighter) {
  const criticalChance = fighter.crit === 3 ? 2 : Math.random() + 1;
  return fighter.attack * criticalChance;
}

export function getBlockPower(fighter) {
  const blockChance = Math.random() + 1;
  return fighter.defense * blockChance;
}

import type { PDA, PDAConfiguration, Symbol } from './types';

export function computePDANextConfigs(
  pda: PDA,
  currentConfigs: PDAConfiguration[],
  symbol: Symbol
): PDAConfiguration[] {
  const nextConfigs: PDAConfiguration[] = [];

  for (const config of currentConfigs) {
    for (const transitionId in pda.transitions) {
      const t = pda.transitions[transitionId];
      
      // Check if transition source matches current state
      // and symbol matches (allow epsilon transitions with symbol === "")
      if (t.source === config.stateId && t.symbol === symbol) {
        
        // Check stack pop condition
        // If popSymbol is "", it's an epsilon pop (don't pop anything)
        if (t.popSymbol === "") {
          const newStack = [...config.stack];
          if (t.pushSymbol !== "") {
            newStack.push(t.pushSymbol);
          }
          nextConfigs.push({
            stateId: t.target,
            stack: newStack
          });
        } else {
          // Check if stack has top matching popSymbol
          const top = config.stack[config.stack.length - 1];
          if (top === t.popSymbol) {
            const newStack = config.stack.slice(0, -1);
            if (t.pushSymbol !== "") {
              newStack.push(t.pushSymbol);
            }
            nextConfigs.push({
              stateId: t.target,
              stack: newStack
            });
          }
        }
      }
    }
  }

  // Handle epsilon transitions recursively for the next configurations
  // (In a full NPDA we would compute the epsilon closure of configurations)
  // For now, we only handle one level of epsilon after a symbol step or as the step itself.
  if (symbol !== "") {
    const epsilonConfigs = computePDANextConfigs(pda, nextConfigs, "");
    // Merge without duplicates (very basic check)
    return [...nextConfigs, ...epsilonConfigs].filter((v, i, a) => 
      a.findIndex(t => t.stateId === v.stateId && JSON.stringify(t.stack) === JSON.stringify(v.stack)) === i
    );
  }

  return nextConfigs;
}

export function isPDAAccepted(
  pda: PDA,
  configs: PDAConfiguration[]
): boolean {
  for (const config of configs) {
    const state = pda.states[config.stateId];
    if (state && state.isFinal) {
      return true;
    }
  }
  return false;
}

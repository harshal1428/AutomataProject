
import { sampleDFA } from './src/core/samples';
import { completeDFA, minimizeDFA } from './src/core/dfa-utils';

const completed = completeDFA(sampleDFA);
const minimized = minimizeDFA(sampleDFA);

console.log('--- Minimized States ---');
for (const [id, state] of Object.entries(minimized.states)) {
  console.log(`${id}: ${state.label} (Initial: ${state.isInitial}, Final: ${state.isFinal})`);
}

console.log('\n--- Minimized Transitions ---');
for (const t of Object.values(minimized.transitions)) {
  console.log(`${t.source} --(${t.symbol})--> ${t.target}`);
}

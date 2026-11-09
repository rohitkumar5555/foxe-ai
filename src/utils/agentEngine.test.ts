import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectUserIntent,
  generateAgentPlan,
  calculateGoalProgress,
  processApprovalDecision,
  filterArtifacts,
  calculatePotentialSavings,
  INITIAL_ARTIFACTS,
  INITIAL_IDEAS,
} from './agentEngine';

test('detectUserIntent identifies travel and flight booking queries', () => {
  const intent = detectUserIntent('Find me the cheapest flight to Tokyo in November');
  assert.equal(intent, 'flight_booking');
});

test('detectUserIntent identifies subscription audit requests', () => {
  const intent = detectUserIntent('Audit my subscriptions and cancel inactive Netflix or Paramount');
  assert.equal(intent, 'subscription_audit');
});

test('detectUserIntent identifies price drop and deals', () => {
  const intent = detectUserIntent('Track price drops for Sony headphones on Amazon');
  assert.equal(intent, 'price_tracker');
});

test('detectUserIntent identifies space creation', () => {
  const intent = detectUserIntent('Build a custom Space for tracking my daily workouts and habits');
  assert.equal(intent, 'create_space');
});

test('generateAgentPlan creates multi-step plan with human-in-the-loop approval', () => {
  const plan = generateAgentPlan('Book flight to Tokyo', 'flight_booking');
  assert.equal(plan.intent, 'flight_booking');
  assert.ok(plan.steps.length >= 3, 'Should have multiple autonomous steps');
  assert.ok(plan.approval, 'Should produce a human-in-the-loop permission approval');
  assert.equal(plan.approval.actionType, 'purchase');
  assert.equal(plan.approval.status, 'pending');
  assert.ok(plan.vmDetails, 'Should include VM browser execution details');
});

test('calculateGoalProgress correctly computes completion percentage', () => {
  const progressEmpty = calculateGoalProgress([]);
  assert.equal(progressEmpty, 0);

  const subtasks = [
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: false },
  ];
  const progress = calculateGoalProgress(subtasks);
  assert.equal(progress, 50);

  const allDone = [{ completed: true }, { completed: true }];
  assert.equal(calculateGoalProgress(allDone), 100);
});

test('processApprovalDecision updates approval status correctly', () => {
  const initial = {
    id: 'appr-1',
    title: 'Cancel gym',
    actionType: 'subscription_cancel' as const,
    summary: 'Cancel monthly fee',
    details: {},
    status: 'pending' as const,
    createdAt: '10:00 AM',
  };

  const approved = processApprovalDecision(initial, 'approved');
  assert.equal(approved.status, 'approved');

  const declined = processApprovalDecision(initial, 'declined');
  assert.equal(declined.status, 'declined');
});

test('filterArtifacts filters by category and keyword', () => {
  const filteredCategory = filterArtifacts(INITIAL_ARTIFACTS, '', 'spreadsheet');
  assert.equal(filteredCategory.length, 1);
  assert.equal(filteredCategory[0].category, 'spreadsheet');

  const filteredSearch = filterArtifacts(INITIAL_ARTIFACTS, 'Tokyo', 'all');
  assert.equal(filteredSearch.length, 1);
  assert.ok(filteredSearch[0].title.includes('Tokyo'));
});

test('calculatePotentialSavings computes total impact correctly', () => {
  const total = calculatePotentialSavings(INITIAL_IDEAS);
  assert.ok(total > 0, 'Total should be positive savings number');
  assert.equal(total, 144 + 188); // $144 + $188 = 332
});

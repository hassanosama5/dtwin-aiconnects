/**
 * End-to-End Decision Pipeline Test
 *
 * Tests:
 * 1. loadDecisionContext (with fallback or live Supabase profile)
 * 2. DecisionAgent execution (generates answer, reasoning, confidence)
 * 3. ReviewAgent execution (verifies decision, evaluates confidence & human escalation)
 * 4. CoordinatorAgent orchestration (end-to-end CHAT workflow with onStageChange)
 */

import { createAgentRegistry } from '../agents/AgentRegistry';
import { loadDecisionContext } from '../middleware/loadDecisionContext';

async function main() {
  console.log('==================================================');
  console.log('🧪 DECISION PIPELINE END-TO-END TEST');
  console.log('==================================================\n');

  const registry = createAgentRegistry();

  // Test Twin & Project IDs (will fallback gracefully to mock profile if DB record doesn't exist)
  const testTwinId = 'ab144c93-8f9c-458a-b74e-4e7e0cca240a';
  const testProjectId = 'demo-project-1';

  // --- Step 1: Middleware Decision Context ---
  console.log('📌 STEP 1: Testing Middleware (loadDecisionContext)...');
  const contextResult = await loadDecisionContext({
    twinId: testTwinId,
    projectId: testProjectId,
    conversationHistory: [],
    context: {},
  });

  if (!contextResult.success) {
    console.error('❌ Middleware failed:', contextResult.error);
    process.exit(1);
  }
  console.log('✅ Middleware loaded context successfully!');
  console.log('   Summary:', contextResult.context.contextSummary);
  console.log('   Person Profile Name:', contextResult.context.personProfile.name);
  console.log('   Project Profile Goal:', contextResult.context.projectProfile.goal);
  console.log('');

  // --- Step 2: Coordinator Orchestration (End-to-End CHAT workflow) ---
  console.log('📌 STEP 2: Testing Coordinator -> Decision -> Review Orchestration...');
  const testQuestion = 'Can we delay the upcoming sprint release by 3 days to fix a security vulnerability?';
  console.log(`   Question: "${testQuestion}"`);

  const stagesVisited: string[] = [];
  const result = await registry.coordinator.execute({
    message: testQuestion,
    context: {
      twinId: testTwinId,
      projectId: testProjectId,
    },
    onStageChange: (stage) => {
      stagesVisited.push(stage);
      console.log(`   ⏱️ [Stage Change Callback]: -> ${stage}`);
    },
  });

  console.log('');
  if (!result.success) {
    console.error('❌ Coordinator Pipeline execution failed:', result.error);
    process.exit(1);
  }

  console.log('==================================================');
  console.log('🎉 PIPELINE RESULTS');
  console.log('==================================================');
  console.log('Workflow:', result.output.workflow);
  console.log('Stages Visited:', stagesVisited.join(' -> '));

  if (result.output.workflow !== 'CHAT') {
    console.error('❌ Expected CHAT workflow, but got:', result.output.workflow);
    process.exit(1);
  }

  console.log('\n--- Decision Agent Output ---');
  console.log('Answer:', result.output.decision.answer);
  console.log('Reasoning:', JSON.stringify(result.output.decision.reasoning, null, 2));
  console.log('Decision Confidence:', `${result.output.decision.confidence}%`);

  console.log('\n--- Review Agent Output ---');
  console.log('Approved:', result.output.review.approved ? '✅ YES' : '❌ NO');
  console.log('Review Confidence:', `${result.output.review.confidence}%`);
  console.log('Requires Human Escalation:', result.output.review.requiresHuman ? '⚠️ YES' : 'NO');
  if (result.output.review.reason) {
    console.log('Review Reason / Escalation Note:', result.output.review.reason);
  }
  console.log('==================================================');
}

main().catch((error) => {
  console.error('💥 Test run encountered unhandled error:', error);
  process.exit(1);
});

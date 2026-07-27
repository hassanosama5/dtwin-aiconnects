import { runDecisionPipeline } from '../services/decision/pipeline';

async function main() {
  const result = await runDecisionPipeline({
    question: 'Can we delay the release by two days?',
    twinId: 'demo-twin',
    projectId: 'demo-project',
    conversationHistory: [],
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Demo Seed Script — Phase 5 (Omar)
 *
 * Populates the Decision Twin database with realistic demo data: twins,
 * projects, and conversation history.
 *
 * Talks to Supabase directly via @supabase/supabase-js — it does NOT go
 * through the app's own persistence tools (tools/profile.ts, project.ts,
 * conversation.ts), because those import services/supabase.ts, which
 * imports config/env.ts, which imports `expo-constants` — a package that
 * cannot be required from plain Node outside the Expo/Metro runtime.
 * Instead, every insert below uses the exact same table/column names and
 * JSON shapes those tools use, so the seeded rows are indistinguishable
 * from what the real app would have written.
 *
 * Personas:
 * - Hassan Osama / Banking App is reused verbatim from PROJECT_SPEC.md's
 *   Example Scenario (§1), Demo Script (§10), and its Personal Profile
 *   JSON example (§5) — this persona is explicitly part of the agreed
 *   demo scenario, not invented here.
 * - The second twin (Mona Khalil / AI Dashboard) is a generic, fictional
 *   persona. PROJECT_SPEC.md's only mention of a second twin ("Khaled
 *   Ashraf") is a single unelaborated line in the Home screen mockup (§2)
 *   with no accompanying scenario, JSON, or demo-script content — and
 *   "Khaled" is also a real team member's name (see ROADMAP.md Team
 *   Structure), so a generic name is used instead so the demo isn't tied
 *   to anyone on the team.
 *
 * Idempotent: safe to re-run. Twins are matched by (name, role); projects
 * by (twin_id, name); a project's conversation is only seeded if that
 * project doesn't already have any messages. Re-running never creates
 * duplicates.
 *
 * Usage (requires a real, already-signed-up account -- RLS scopes every
 * row to owner_id = auth.uid(), so an anonymous client can't insert
 * anything; seeded rows end up owned by whichever account you provide):
 *   SEED_USER_EMAIL=you@example.com SEED_USER_PASSWORD=yourpassword node scripts/seed-demo-data.cjs
 * (or add SEED_USER_EMAIL / SEED_USER_PASSWORD to .env instead of the inline env vars)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ENV_PATH = path.join(__dirname, '..', '.env');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing .env file at ${filePath}. Copy .env.example to .env and populate it first.`
    );
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

function requireEnvVar(env, key) {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key} (checked .env)`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------

const DEMO_TWINS = [
  {
    name: 'Hassan Osama',
    role: 'Project Manager',
    personalProfile: {
      name: 'Hassan Osama',
      role: 'Project Manager',
      leadershipStyle: 'Collaborative',
      communicationStyle: 'Direct',
      decisionStyle: 'Data Driven',
      values: ['Security', 'Customer First', 'Honesty'],
      delegationRules: ['Developers can decide implementation details.'],
      approvalRules: ['Timeline changes require approval.'],
      conflictResolution: 'Seeks consensus, but makes the final call when needed.',
      generalPrinciples: ['Ship on time unless security is at risk.'],
    },
    project: {
      name: 'Banking App',
      description: 'Core banking application MVP.',
      projectProfile: {
        title: 'Banking App',
        description: 'Core banking application MVP.',
        objectives: ['Ship MVP', 'Pass regulatory compliance review'],
        deadline: 'Fixed deadline, two weeks remaining',
        stakeholders: ['Compliance team', 'Security team'],
        constraints: ['Fixed Deadline', 'Regulatory compliance'],
        notes: 'Delay only for security issues. UI polish can slip; security cannot.',
      },
      conversation: [
        {
          role: 'user',
          content: 'Can we delay the release by two days to improve onboarding animations?',
        },
        {
          role: 'assistant',
          content:
            'Hassan would likely reject delaying the release because this project prioritizes shipping on time unless security is affected.',
          metadata: {
            reasoning: [
              "The project's decision rule allows delays only for security issues.",
              'Onboarding animation polish is explicitly a lower priority than the fixed deadline.',
              'No security concern is mentioned in this request.',
            ],
            confidence: 94,
          },
        },
        { role: 'user', content: 'Can we increase the project budget?' },
        {
          role: 'assistant',
          content: "This decision requires Hassan's approval.",
          metadata: { confidence: 45, requiresHuman: true },
        },
      ],
    },
  },
  {
    name: 'Mona Khalil',
    role: 'Team Lead',
    personalProfile: {
      name: 'Mona Khalil',
      role: 'Team Lead',
      leadershipStyle: 'Hands-on',
      communicationStyle: 'Concise',
      decisionStyle: 'Pragmatic',
      values: ['Code Quality', 'Team Wellbeing', 'Velocity'],
      delegationRules: ['Senior engineers own architecture decisions within their module.'],
      approvalRules: ["Cross-team dependencies require her sign-off."],
      conflictResolution: 'Facilitates a quick discussion, then decides if no consensus in 10 minutes.',
      generalPrinciples: ['Sustainable pace beats short-term velocity.'],
    },
    project: {
      name: 'AI Dashboard',
      description: 'Internal analytics dashboard powered by AI insights.',
      projectProfile: {
        title: 'AI Dashboard',
        description: 'Internal analytics dashboard powered by AI insights.',
        objectives: ['Deliver a usable v1 dashboard for the ops team'],
        deadline: 'Flexible, targeting end of quarter',
        stakeholders: ['Ops team'],
        constraints: ['Limited engineering headcount'],
        notes:
          'New features must not compromise data accuracy. Third-party data source has intermittent latency.',
      },
      conversation: [
        {
          role: 'user',
          content: 'Can we cut the anomaly-detection chart from v1 to hit the deadline?',
        },
        {
          role: 'assistant',
          content:
            "Mona would likely approve cutting that chart from v1 since it doesn't compromise data accuracy and the team is protecting a fixed headcount constraint.",
          metadata: {
            reasoning: [
              "The decision rule only blocks changes that compromise data accuracy, and this chart isn't part of the accuracy-critical pipeline.",
              'Limited engineering headcount favors trimming scope over adding risk.',
              "This aligns with the project's usability-first priority for v1.",
            ],
            confidence: 88,
          },
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Idempotent upserts — insert shapes match tools/profile.ts, project.ts,
// conversation.ts exactly.
// ---------------------------------------------------------------------------

const summary = {
  twinsCreated: 0,
  twinsReused: 0,
  projectsCreated: 0,
  projectsReused: 0,
  messagesCreated: 0,
  messagesSkippedProjects: 0,
};

async function findOrCreateTwin(supabase, ownerId, name, role, personalProfile) {
  const existing = await supabase
    .from('twins')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('name', name)
    .eq('role', role)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`Failed to look up twin "${name}": ${existing.error.message}`);
  }
  if (existing.data) {
    summary.twinsReused += 1;
    return existing.data;
  }

  const inserted = await supabase
    .from('twins')
    .insert([{ owner_id: ownerId, name, role, avatar_url: null, personal_profile: personalProfile }])
    .select()
    .single();
  if (inserted.error) {
    throw new Error(`Failed to create twin "${name}": ${inserted.error.message}`);
  }
  summary.twinsCreated += 1;
  return inserted.data;
}

// Projects are independent of Twins now (see tools/project.ts) -- twinId is
// only seeded as an optional "default twin" hint, and lookups/idempotency
// are keyed on (owner_id, name), not twin_id.
async function findOrCreateProject(supabase, ownerId, twinId, name, description, projectProfile) {
  const existing = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('name', name)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`Failed to look up project "${name}": ${existing.error.message}`);
  }
  if (existing.data) {
    summary.projectsReused += 1;
    return existing.data;
  }

  const inserted = await supabase
    .from('projects')
    .insert([{ owner_id: ownerId, twin_id: twinId, name, description, project_profile: projectProfile }])
    .select()
    .single();
  if (inserted.error) {
    throw new Error(`Failed to create project "${name}": ${inserted.error.message}`);
  }
  summary.projectsCreated += 1;
  return inserted.data;
}

async function seedConversation(supabase, projectId, turns) {
  const existing = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);
  if (existing.error) {
    throw new Error(`Failed to check existing messages for project ${projectId}: ${existing.error.message}`);
  }

  if ((existing.count ?? 0) > 0) {
    summary.messagesSkippedProjects += 1;
    return;
  }

  for (const turn of turns) {
    const { error } = await supabase
      .from('messages')
      .insert([{ project_id: projectId, role: turn.role, content: turn.content, metadata: turn.metadata ?? null }]);
    if (error) {
      throw new Error(`Failed to save message for project ${projectId}: ${error.message}`);
    }
    summary.messagesCreated += 1;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let env;
  try {
    env = loadEnv(ENV_PATH);
  } catch (err) {
    console.error(`Environment error: ${err.message}`);
    process.exit(1);
    return;
  }

  let supabaseUrl;
  let supabaseAnonKey;
  try {
    supabaseUrl = requireEnvVar(env, 'EXPO_PUBLIC_SUPABASE_URL');
    supabaseAnonKey = requireEnvVar(env, 'EXPO_PUBLIC_SUPABASE_ANON_KEY');
  } catch (err) {
    console.error(`Environment error: ${err.message}`);
    process.exit(1);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // RLS now scopes every row to owner_id = auth.uid() (see
  // supabase/migrations/002_auth_and_ownership.sql) -- an anonymous client
  // has no auth.uid() at all, so it cannot insert anything, regardless of
  // what owner_id value is passed. This must sign in as a real account
  // first; seeded rows are owned by whichever account you provide.
  const seedEmail = env.SEED_USER_EMAIL || process.env.SEED_USER_EMAIL;
  const seedPassword = env.SEED_USER_PASSWORD || process.env.SEED_USER_PASSWORD;
  if (!seedEmail || !seedPassword) {
    console.error(
      'Missing SEED_USER_EMAIL / SEED_USER_PASSWORD.\n' +
        'Sign up a real account in the app first, then run:\n' +
        '  SEED_USER_EMAIL=you@example.com SEED_USER_PASSWORD=yourpassword node scripts/seed-demo-data.cjs\n' +
        '(or add those two lines to .env). Demo data is seeded as owned by that account.'
    );
    process.exit(1);
    return;
  }

  const signIn = await supabase.auth.signInWithPassword({ email: seedEmail, password: seedPassword });
  if (signIn.error || !signIn.data.user) {
    console.error(`Could not sign in as ${seedEmail}: ${signIn.error?.message ?? 'no user returned'}`);
    process.exit(1);
    return;
  }
  const ownerId = signIn.data.user.id;

  try {
    const connectionCheck = await supabase.from('twins').select('id').limit(1);
    if (connectionCheck.error) {
      throw new Error(connectionCheck.error.message);
    }
  } catch (err) {
    console.error(`Could not establish a Supabase connection: ${err.message}`);
    console.error(
      'Check EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, and confirm every migration in supabase/migrations/ has been applied to this project.'
    );
    process.exit(1);
    return;
  }

  try {
    for (const demoTwin of DEMO_TWINS) {
      const twin = await findOrCreateTwin(supabase, ownerId, demoTwin.name, demoTwin.role, demoTwin.personalProfile);
      const project = await findOrCreateProject(
        supabase,
        ownerId,
        twin.id,
        demoTwin.project.name,
        demoTwin.project.description,
        demoTwin.project.projectProfile
      );
      await seedConversation(supabase, project.id, demoTwin.project.conversation);
    }
  } catch (err) {
    console.error(`Seed failed: ${err.message}`);
    process.exit(1);
    return;
  }

  console.log('\n=== Demo Seed Summary ===');
  console.log(`Twins:    created ${summary.twinsCreated}, reused ${summary.twinsReused}`);
  console.log(`Projects: created ${summary.projectsCreated}, reused ${summary.projectsReused}`);
  console.log(
    `Messages: created ${summary.messagesCreated}, skipped ${summary.messagesSkippedProjects} project(s) that already had a conversation`
  );
  console.log('Done.');
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});

import { createClient, Client } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

export interface SubmissionRecord {
  id: string;
  session_token: string;
  identity_mode: 'anonymous' | 'identified';
  respondent_name: string | null;
  respondent_contact: string | null;
  status: 'draft' | 'submitted';
  current_block: number;
  answers_json: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

let clientInstance: Client | null = null;
let tablesPromise: Promise<void> | null = null;

export function getDbClient(): Client {
  if (clientInstance) return clientInstance;

  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

  if (url && (url.startsWith('libsql://') || url.startsWith('https://') || url.startsWith('http://'))) {
    clientInstance = createClient({
      url,
      authToken
    });
  } else {
    // Local fallback file
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'discovery.db');
    clientInstance = createClient({
      url: `file:${dbPath}`
    });
  }

  return clientInstance;
}

export async function ensureTables(): Promise<void> {
  if (tablesPromise) return tablesPromise;

  tablesPromise = (async () => {
    const db = getDbClient();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        identity_mode TEXT NOT NULL,
        respondent_name TEXT,
        respondent_contact TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        current_block INTEGER DEFAULT 0,
        answers_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        submitted_at TEXT
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_identity ON submissions(identity_mode);`);
  })();

  return tablesPromise;
}

export async function createSession(params: {
  identityMode: 'anonymous' | 'identified';
  name?: string;
  contact?: string;
}): Promise<{ id: string; sessionToken: string; identityMode: string }> {
  await ensureTables();
  const db = getDbClient();
  const id = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString('hex');

  // Architectural Anonymity Guarantee:
  // If identityMode is anonymous, name and contact are strictly nullified.
  const respondentName = params.identityMode === 'identified' ? (params.name?.trim() || null) : null;
  const respondentContact = params.identityMode === 'identified' ? (params.contact?.trim() || null) : null;

  await db.execute({
    sql: `INSERT INTO submissions (id, session_token, identity_mode, respondent_name, respondent_contact, status, current_block, answers_json)
          VALUES (?, ?, ?, ?, ?, 'draft', 0, '{}')`,
    args: [id, sessionToken, params.identityMode, respondentName, respondentContact]
  });

  return { id, sessionToken, identityMode: params.identityMode };
}

export async function getSession(id: string, token?: string): Promise<SubmissionRecord | null> {
  await ensureTables();
  const db = getDbClient();
  if (token) {
    const result = await db.execute({
      sql: `SELECT * FROM submissions WHERE id = ? AND session_token = ?`,
      args: [id, token]
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as SubmissionRecord;
  } else {
    const result = await db.execute({
      sql: `SELECT * FROM submissions WHERE id = ?`,
      args: [id]
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as SubmissionRecord;
  }
}

export async function autosaveSession(
  id: string,
  token: string,
  currentBlock: number,
  answers: Record<string, unknown>
): Promise<boolean> {
  await ensureTables();
  const db = getDbClient();
  const answersJson = JSON.stringify(answers);

  const result = await db.execute({
    sql: `UPDATE submissions 
          SET current_block = ?, answers_json = ?, updated_at = datetime('now')
          WHERE id = ? AND session_token = ? AND status != 'submitted'`,
    args: [currentBlock, answersJson, id, token]
  });

  return result.rowsAffected > 0;
}

export async function submitSession(
  id: string,
  token: string,
  finalAnswers?: Record<string, unknown>
): Promise<boolean> {
  await ensureTables();
  const db = getDbClient();
  let result;
  if (finalAnswers) {
    result = await db.execute({
      sql: `UPDATE submissions 
            SET status = 'submitted', 
                answers_json = ?, 
                submitted_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ? AND session_token = ? AND status != 'submitted'`,
      args: [JSON.stringify(finalAnswers), id, token]
    });
  } else {
    result = await db.execute({
      sql: `UPDATE submissions 
            SET status = 'submitted', 
                submitted_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ? AND session_token = ? AND status != 'submitted'`,
      args: [id, token]
    });
  }

  return result.rowsAffected > 0;
}

export async function getAllSubmissions(): Promise<SubmissionRecord[]> {
  await ensureTables();
  const db = getDbClient();
  const result = await db.execute(`
    SELECT id, session_token, identity_mode, respondent_name, respondent_contact, 
           status, current_block, answers_json, created_at, updated_at, submitted_at
    FROM submissions
    ORDER BY created_at DESC
  `);
  return result.rows as unknown as SubmissionRecord[];
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  await ensureTables();
  const db = getDbClient();
  const result = await db.execute({
    sql: `SELECT * FROM submissions WHERE id = ?`,
    args: [id]
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as SubmissionRecord;
}

export async function getAggregatedSummary() {
  const submissions = await getAllSubmissions();
  const submittedOnly = submissions.filter(s => s.status === 'submitted');
  const draftsOnly = submissions.filter(s => s.status === 'draft');
  const anonymousCount = submissions.filter(s => s.identity_mode === 'anonymous').length;
  const identifiedCount = submissions.filter(s => s.identity_mode === 'identified').length;

  const questionAnswersMap: Record<number, Array<{
    submissionId: string;
    respondent: string;
    identityMode: 'anonymous' | 'identified';
    selectedOptions?: string[];
    text?: string;
    submittedAt: string | null;
  }>> = {};

  for (let i = 1; i <= 22; i++) {
    questionAnswersMap[i] = [];
  }

  submittedOnly.forEach((sub, idx) => {
    try {
      const parsed = JSON.parse(sub.answers_json || '{}');
      const label = sub.identity_mode === 'identified' && sub.respondent_name 
        ? sub.respondent_name 
        : `Colaborador Anónimo #${idx + 1}`;

      for (let qId = 1; qId <= 22; qId++) {
        const ans = parsed[qId];
        if (ans) {
          const text = typeof ans === 'string' ? ans : ans.text || '';
          const selectedOptions = typeof ans === 'object' && ans.selectedOptions ? ans.selectedOptions : [];
          if (text || (selectedOptions && selectedOptions.length > 0)) {
            questionAnswersMap[qId].push({
              submissionId: sub.id,
              respondent: label,
              identityMode: sub.identity_mode,
              selectedOptions,
              text,
              submittedAt: sub.submitted_at
            });
          }
        }
      }
    } catch {
      // Ignore malformed JSON safely
    }
  });

  return {
    totalSessions: submissions.length,
    submittedCount: submittedOnly.length,
    draftCount: draftsOnly.length,
    anonymousCount,
    identifiedCount,
    questionAnswersMap
  };
}

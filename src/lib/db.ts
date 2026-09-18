import { DatabaseSync } from 'node:sqlite';
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

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'discovery.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency and crash resilience
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');

  db.exec(`
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
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_submissions_identity ON submissions(identity_mode);
  `);

  dbInstance = db;
  return dbInstance;
}

export function createSession(params: {
  identityMode: 'anonymous' | 'identified';
  name?: string;
  contact?: string;
}): { id: string; sessionToken: string; identityMode: string } {
  const db = getDb();
  const id = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString('hex');

  // Architectural Anonymity Guarantee:
  // If identityMode is anonymous, name and contact are strictly nullified.
  const respondentName = params.identityMode === 'identified' ? (params.name?.trim() || null) : null;
  const respondentContact = params.identityMode === 'identified' ? (params.contact?.trim() || null) : null;

  const stmt = db.prepare(`
    INSERT INTO submissions (id, session_token, identity_mode, respondent_name, respondent_contact, status, current_block, answers_json)
    VALUES (?, ?, ?, ?, ?, 'draft', 0, '{}')
  `);

  stmt.run(id, sessionToken, params.identityMode, respondentName, respondentContact);

  return { id, sessionToken, identityMode: params.identityMode };
}

export function getSession(id: string, token?: string): SubmissionRecord | null {
  const db = getDb();
  if (token) {
    const stmt = db.prepare(`SELECT * FROM submissions WHERE id = ? AND session_token = ?`);
    const row = stmt.get(id, token) as unknown as SubmissionRecord | undefined;
    return row || null;
  } else {
    const stmt = db.prepare(`SELECT * FROM submissions WHERE id = ?`);
    const row = stmt.get(id) as unknown as SubmissionRecord | undefined;
    return row || null;
  }
}

export function autosaveSession(
  id: string,
  token: string,
  currentBlock: number,
  answers: Record<string, unknown>
): boolean {
  const db = getDb();
  const answersJson = JSON.stringify(answers);

  const stmt = db.prepare(`
    UPDATE submissions 
    SET current_block = ?, answers_json = ?, updated_at = datetime('now')
    WHERE id = ? AND session_token = ? AND status != 'submitted'
  `);

  const result = stmt.run(currentBlock, answersJson, id, token);
  return Number(result.changes) > 0;
}

export function submitSession(
  id: string,
  token: string,
  finalAnswers?: Record<string, unknown>
): boolean {
  const db = getDb();
  let stmt;
  if (finalAnswers) {
    stmt = db.prepare(`
      UPDATE submissions 
      SET status = 'submitted', 
          answers_json = ?, 
          submitted_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ? AND session_token = ? AND status != 'submitted'
    `);
    const result = stmt.run(JSON.stringify(finalAnswers), id, token);
    return Number(result.changes) > 0;
  } else {
    stmt = db.prepare(`
      UPDATE submissions 
      SET status = 'submitted', 
          submitted_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ? AND session_token = ? AND status != 'submitted'
    `);
    const result = stmt.run(id, token);
    return Number(result.changes) > 0;
  }
}

export function getAllSubmissions(): SubmissionRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, session_token, identity_mode, respondent_name, respondent_contact, 
           status, current_block, answers_json, created_at, updated_at, submitted_at
    FROM submissions
    ORDER BY created_at DESC
  `);
  return stmt.all() as unknown as SubmissionRecord[];
}

export function getSubmissionById(id: string): SubmissionRecord | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM submissions WHERE id = ?`);
  const row = stmt.get(id) as unknown as SubmissionRecord | undefined;
  return row || null;
}

export function getAggregatedSummary() {
  const submissions = getAllSubmissions();
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

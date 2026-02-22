import * as fs from 'fs-extra';
import * as path from 'path';
import { Guide, GuideSchema } from '@workfloweeeer/core';
import { GuideStorage } from './storage.js';

export interface AutosaveConfig {
  intervalMs: number;
  maxBackups: number;
}

export interface RecoverySession {
  guideId: string;
  guide: Guide;
  timestamp: string;
  type: 'capture' | 'editor';
}

export class CrashRecovery {
  private storage: GuideStorage;
  private autosavePath: string;
  private intervalId: NodeJS.Timeout | null = null;
  private config: AutosaveConfig;

  constructor(storage: GuideStorage, config: Partial<AutosaveConfig> = {}) {
    this.storage = storage;
    this.autosavePath = path.join(storage.getBasePath(), 'autosave');
    this.config = {
      intervalMs: config.intervalMs ?? 30000,
      maxBackups: config.maxBackups ?? 5,
    };
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.autosavePath);
  }

  private getSessionPath(guideId: string): string {
    return path.join(this.autosavePath, `session-${guideId}.json`);
  }

  async saveSession(guide: Guide, type: 'capture' | 'editor'): Promise<void> {
    const session: RecoverySession = {
      guideId: guide.id,
      guide: GuideSchema.parse(guide),
      timestamp: new Date().toISOString(),
      type,
    };
    
    await fs.writeJson(this.getSessionPath(guide.id), session, { spaces: 2 });
  }

  async loadSession(guideId: string): Promise<RecoverySession | null> {
    const sessionPath = this.getSessionPath(guideId);
    
    if (!(await fs.pathExists(sessionPath))) {
      return null;
    }
    
    try {
      const data = await fs.readJson(sessionPath);
      data.guide = GuideSchema.parse(data.guide);
      return data as RecoverySession;
    } catch {
      return null;
    }
  }

  async clearSession(guideId: string): Promise<void> {
    const sessionPath = this.getSessionPath(guideId);
    if (await fs.pathExists(sessionPath)) {
      await fs.remove(sessionPath);
    }
  }

  async listRecoverableSessions(): Promise<RecoverySession[]> {
    const files = await fs.readdir(this.autosavePath);
    const sessions: RecoverySession[] = [];
    
    for (const file of files) {
      if (file.startsWith('session-') && file.endsWith('.json')) {
        try {
          const data = await fs.readJson(path.join(this.autosavePath, file));
          data.guide = GuideSchema.parse(data.guide);
          sessions.push(data as RecoverySession);
        } catch {
          // Skip invalid session files
        }
      }
    }
    
    return sessions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  startAutosave(
    getGuide: () => Guide | null,
    type: 'capture' | 'editor'
  ): void {
    this.stopAutosave();
    
    this.intervalId = setInterval(async () => {
      const guide = getGuide();
      if (guide) {
        try {
          await this.saveSession(guide, type);
        } catch (error) {
          console.error('Autosave failed:', error);
        }
      }
    }, this.config.intervalMs);
  }

  stopAutosave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async recoverSession(guideId: string): Promise<Guide | null> {
    const session = await this.loadSession(guideId);
    
    if (!session) {
      return null;
    }
    
    await this.storage.saveGuide(session.guide);
    await this.clearSession(guideId);
    
    return session.guide;
  }
}

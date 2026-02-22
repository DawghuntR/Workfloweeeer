import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {
  Guide,
  GuideSchema,
  serializeGuide,
  deserializeGuide,
} from '@workfloweeeer/core';

export interface StorageConfig {
  basePath?: string;
}

export interface GuideSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  source: 'chrome' | 'desktop' | 'mixed';
  stepCount: number;
}

export interface LibraryIndex {
  version: string;
  guides: GuideSummary[];
  lastUpdated: string;
}

function getDefaultBasePath(): string {
  const platform = os.platform();
  const home = os.homedir();
  
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Workfloweeeer');
  } else if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Workfloweeeer');
  } else {
    return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'Workfloweeeer');
  }
}

export class GuideStorage {
  private basePath: string;
  private guidesPath: string;
  private indexPath: string;

  constructor(config: StorageConfig = {}) {
    this.basePath = config.basePath || getDefaultBasePath();
    this.guidesPath = path.join(this.basePath, 'guides');
    this.indexPath = path.join(this.basePath, 'library.json');
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.basePath);
    await fs.ensureDir(this.guidesPath);
    
    if (!(await fs.pathExists(this.indexPath))) {
      await this.saveIndex({
        version: '1.0',
        guides: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  getBasePath(): string {
    return this.basePath;
  }

  private getGuidePath(guideId: string): string {
    const safeId = guideId.replace(/[^a-zA-Z0-9-]/g, '_');
    return path.join(this.guidesPath, safeId);
  }

  private getGuideMetadataPath(guideId: string): string {
    return path.join(this.getGuidePath(guideId), 'guide.json');
  }

  private getGuideImagesPath(guideId: string): string {
    return path.join(this.getGuidePath(guideId), 'images');
  }

  private async loadIndex(): Promise<LibraryIndex> {
    try {
      const data = await fs.readJson(this.indexPath);
      return data;
    } catch {
      return {
        version: '1.0',
        guides: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private async saveIndex(index: LibraryIndex): Promise<void> {
    await fs.writeJson(this.indexPath, index, { spaces: 2 });
  }

  private guideToSummary(guide: Guide): GuideSummary {
    return {
      id: guide.id,
      title: guide.title,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      source: guide.source,
      stepCount: guide.steps.length,
    };
  }

  async saveGuide(guide: Guide, extractImages = true): Promise<void> {
    const validGuide = GuideSchema.parse(guide);
    const guidePath = this.getGuidePath(validGuide.id);
    const imagesPath = this.getGuideImagesPath(validGuide.id);
    
    await fs.ensureDir(guidePath);
    await fs.ensureDir(imagesPath);
    
    let guideToSave = validGuide;
    
    if (extractImages) {
      const stepsWithExtractedImages = await Promise.all(
        validGuide.steps.map(async (step, index) => {
          if (step.screenshotBase64) {
            const ext = step.screenshotMimeType === 'image/jpeg' ? 'jpg' : 'png';
            const imageName = `step-${index + 1}-${step.id.slice(0, 8)}.${ext}`;
            const imagePath = path.join(imagesPath, imageName);
            
            const buffer = Buffer.from(step.screenshotBase64, 'base64');
            await fs.writeFile(imagePath, buffer);
            
            return {
              ...step,
              screenshotPath: path.relative(guidePath, imagePath),
              screenshotBase64: undefined,
            };
          }
          return step;
        })
      );
      
      guideToSave = {
        ...validGuide,
        steps: stepsWithExtractedImages,
      } as Guide;
    }
    
    await fs.writeJson(this.getGuideMetadataPath(validGuide.id), guideToSave, { spaces: 2 });
    
    const index = await this.loadIndex();
    const existingIndex = index.guides.findIndex((g) => g.id === validGuide.id);
    const summary = this.guideToSummary(validGuide);
    
    if (existingIndex >= 0) {
      index.guides[existingIndex] = summary;
    } else {
      index.guides.push(summary);
    }
    
    index.lastUpdated = new Date().toISOString();
    await this.saveIndex(index);
  }

  async loadGuide(guideId: string, embedImages = true): Promise<Guide> {
    const guidePath = this.getGuidePath(guideId);
    const metadataPath = this.getGuideMetadataPath(guideId);
    
    if (!(await fs.pathExists(metadataPath))) {
      throw new Error(`Guide not found: ${guideId}`);
    }
    
    const guideData = await fs.readJson(metadataPath);
    
    if (embedImages) {
      const stepsWithImages = await Promise.all(
        guideData.steps.map(async (step: any) => {
          if (step.screenshotPath && !step.screenshotBase64) {
            const imagePath = path.join(guidePath, step.screenshotPath);
            if (await fs.pathExists(imagePath)) {
              const buffer = await fs.readFile(imagePath);
              return {
                ...step,
                screenshotBase64: buffer.toString('base64'),
                screenshotPath: undefined,
              };
            }
          }
          return step;
        })
      );
      
      guideData.steps = stepsWithImages;
    }
    
    return GuideSchema.parse(guideData);
  }

  async deleteGuide(guideId: string): Promise<void> {
    const guidePath = this.getGuidePath(guideId);
    
    if (await fs.pathExists(guidePath)) {
      await fs.remove(guidePath);
    }
    
    const index = await this.loadIndex();
    index.guides = index.guides.filter((g) => g.id !== guideId);
    index.lastUpdated = new Date().toISOString();
    await this.saveIndex(index);
  }

  async listGuides(): Promise<GuideSummary[]> {
    const index = await this.loadIndex();
    return index.guides.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async guideExists(guideId: string): Promise<boolean> {
    const metadataPath = this.getGuideMetadataPath(guideId);
    return fs.pathExists(metadataPath);
  }

  async exportGuideAsJson(guideId: string, outputPath: string): Promise<void> {
    const guide = await this.loadGuide(guideId, true);
    const json = serializeGuide(guide);
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  async importGuideFromJson(jsonPath: string): Promise<Guide> {
    const json = await fs.readFile(jsonPath, 'utf-8');
    const guide = deserializeGuide(json);
    await this.saveGuide(guide);
    return guide;
  }
}

let defaultStorage: GuideStorage | null = null;

export function getDefaultStorage(): GuideStorage {
  if (!defaultStorage) {
    defaultStorage = new GuideStorage();
  }
  return defaultStorage;
}

export async function initializeStorage(config?: StorageConfig): Promise<GuideStorage> {
  const storage = config ? new GuideStorage(config) : getDefaultStorage();
  await storage.initialize();
  return storage;
}

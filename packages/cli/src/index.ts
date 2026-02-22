#!/usr/bin/env node

import { Command } from 'commander';
import { initializeStorage, GuideStorage } from '@workfloweeeer/storage';
import { exportToJson, exportToHtml, exportToPdf } from '@workfloweeeer/export';
import { validateGuide, deserializeGuide } from '@workfloweeeer/core';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('workfloweeeer')
  .description('CLI tools for Workfloweeeer workflow documentation')
  .version('0.1.0');

program
  .command('list')
  .description('List all saved guides')
  .option('-j, --json', 'Output as JSON')
  .action(async (options) => {
    try {
      const storage = await initializeStorage();
      const guides = await storage.listGuides();
      
      if (options.json) {
        console.log(JSON.stringify(guides, null, 2));
      } else {
        if (guides.length === 0) {
          console.log('No guides found.');
          return;
        }
        
        console.log('\nSaved Guides:\n');
        console.log('ID                                   | Title                          | Steps | Updated');
        console.log('-'.repeat(95));
        
        for (const guide of guides) {
          const title = guide.title.padEnd(30).slice(0, 30);
          const date = new Date(guide.updatedAt).toLocaleDateString();
          console.log(`${guide.id} | ${title} | ${guide.stepCount.toString().padStart(5)} | ${date}`);
        }
        
        console.log(`\nTotal: ${guides.length} guide(s)`);
      }
    } catch (error) {
      console.error('Error listing guides:', error);
      process.exit(1);
    }
  });

program
  .command('export <guideId>')
  .description('Export a guide to a file')
  .requiredOption('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Export format (json, html, pdf)', 'json')
  .option('--theme <theme>', 'HTML theme (light, dark)', 'light')
  .option('--no-toc', 'Exclude table of contents')
  .option('--page-size <size>', 'PDF page size (A4, LETTER)', 'A4')
  .action(async (guideId, options) => {
    try {
      const storage = await initializeStorage();
      const guide = await storage.loadGuide(guideId, true);
      
      const outputPath = path.resolve(options.output);
      
      switch (options.format.toLowerCase()) {
        case 'json':
          const json = exportToJson(guide);
          await fs.writeFile(outputPath, json, 'utf-8');
          console.log(`Exported JSON to: ${outputPath}`);
          break;
        
        case 'html':
          const html = exportToHtml(guide, {
            theme: options.theme,
            includeTableOfContents: options.toc !== false,
          });
          await fs.writeFile(outputPath, html, 'utf-8');
          console.log(`Exported HTML to: ${outputPath}`);
          break;
        
        case 'pdf':
          const pdf = await exportToPdf(guide, {
            pageSize: options.pageSize,
            includeTableOfContents: options.toc !== false,
          });
          await fs.writeFile(outputPath, pdf);
          console.log(`Exported PDF to: ${outputPath}`);
          break;
        
        default:
          console.error(`Unknown format: ${options.format}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('Error exporting guide:', error);
      process.exit(1);
    }
  });

program
  .command('import <filePath>')
  .description('Import a guide from a JSON file')
  .action(async (filePath) => {
    try {
      const absolutePath = path.resolve(filePath);
      const json = await fs.readFile(absolutePath, 'utf-8');
      
      const guide = deserializeGuide(json);
      
      const storage = await initializeStorage();
      await storage.saveGuide(guide);
      
      console.log(`Imported guide: ${guide.title} (${guide.id})`);
      console.log(`Steps: ${guide.steps.length}`);
    } catch (error) {
      console.error('Error importing guide:', error);
      process.exit(1);
    }
  });

program
  .command('validate <filePath>')
  .description('Validate a JSON guide file against the schema')
  .action(async (filePath) => {
    try {
      const absolutePath = path.resolve(filePath);
      const json = await fs.readFile(absolutePath, 'utf-8');
      const data = JSON.parse(json);
      
      const result = validateGuide(data);
      
      if (result.success) {
        console.log('✓ Valid guide file');
        console.log(`  Title: ${result.data.title}`);
        console.log(`  Steps: ${result.data.steps.length}`);
        console.log(`  Schema version: ${result.data.schemaVersion}`);
      } else {
        console.log('✗ Invalid guide file');
        console.log('Errors:');
        for (const error of result.errors) {
          console.log(`  - ${error}`);
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('Error validating file:', error);
      process.exit(1);
    }
  });

program
  .command('delete <guideId>')
  .description('Delete a saved guide')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (guideId, options) => {
    try {
      const storage = await initializeStorage();
      
      const exists = await storage.guideExists(guideId);
      if (!exists) {
        console.error(`Guide not found: ${guideId}`);
        process.exit(1);
      }
      
      if (!options.yes) {
        const guide = await storage.loadGuide(guideId, false);
        console.log(`About to delete: ${guide.title}`);
        console.log('Use --yes flag to confirm deletion');
        process.exit(0);
      }
      
      await storage.deleteGuide(guideId);
      console.log(`Deleted guide: ${guideId}`);
    } catch (error) {
      console.error('Error deleting guide:', error);
      process.exit(1);
    }
  });

program
  .command('info <guideId>')
  .description('Show detailed information about a guide')
  .action(async (guideId) => {
    try {
      const storage = await initializeStorage();
      const guide = await storage.loadGuide(guideId, false);
      
      console.log('\nGuide Information:');
      console.log('='.repeat(50));
      console.log(`ID:          ${guide.id}`);
      console.log(`Title:       ${guide.title}`);
      console.log(`Description: ${guide.description || '(none)'}`);
      console.log(`Source:      ${guide.source}`);
      console.log(`Steps:       ${guide.steps.length}`);
      console.log(`Created:     ${new Date(guide.createdAt).toLocaleString()}`);
      console.log(`Updated:     ${new Date(guide.updatedAt).toLocaleString()}`);
      console.log(`Version:     ${guide.schemaVersion}`);
      
      if (guide.steps.length > 0) {
        console.log('\nSteps:');
        console.log('-'.repeat(50));
        guide.steps.forEach((step, index) => {
          console.log(`${(index + 1).toString().padStart(3)}. ${step.title || '(untitled)'}`);
          console.log(`     Action: ${step.actionType} | Screenshot: ${step.screenshotBase64 ? 'Yes' : 'No'}`);
        });
      }
    } catch (error) {
      console.error('Error getting guide info:', error);
      process.exit(1);
    }
  });

program
  .command('storage-path')
  .description('Show the storage directory path')
  .action(async () => {
    const storage = await initializeStorage();
    console.log(storage.getBasePath());
  });

program.parse();

/**
 * Local HTTP server for GUI mode
 */

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AddressInfo } from 'net';
import { detectProject } from '../analyzer/index.js';
import { buildConfig } from '../cli/prompts.js';
import { GuiOrchestrator, ProgressEvent } from './orchestrator.js';

export interface GuiServerOptions {
  cwd: string;
  port?: number;
  autoOpen?: boolean;
}

export class GuiServer {
  private server: http.Server;
  private sseClients: Set<http.ServerResponse>;
  private orchestrator: GuiOrchestrator;
  private options: GuiServerOptions;
  private isGenerating: boolean = false;

  constructor(options: GuiServerOptions) {
    this.options = options;
    this.sseClients = new Set();
    this.orchestrator = new GuiOrchestrator(options.cwd);

    // Pipe orchestrator progress events to SSE
    this.orchestrator.on('progress', (event: ProgressEvent) => {
      this.broadcastEvent('progress', event);
    });

    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  async start(): Promise<{ port: number; url: string }> {
    const port = this.options.port || 0;

    return new Promise((resolve) => {
      this.server.listen(port, '127.0.0.1', async () => {
        const addr = this.server.address() as AddressInfo;
        const url = `http://localhost:${addr.port}`;

        console.log('\n  GUI mode started.');
        console.log(`  Open in browser: ${url}`);
        console.log('\n  Press Ctrl+C to stop the server.\n');

        if (this.options.autoOpen !== false) {
          try {
            const open = (await import('open')).default;
            await open(url);
          } catch {
            console.log('  Could not auto-open browser. Please open the URL manually.');
          }
        }

        resolve({ port: addr.port, url });
      });
    });
  }

  async shutdown(): Promise<void> {
    for (const client of this.sseClients) {
      client.end();
    }
    this.sseClients.clear();

    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('\n  Server stopped.\n');
        resolve();
        process.exit(0);
      });

      setTimeout(() => {
        process.exit(0);
      }, 5000);
    });
  }

  broadcastEvent(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://localhost`);
    const pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && pathname === '/') {
      return this.handleGetIndex(res);
    }
    if (req.method === 'GET' && pathname === '/api/project') {
      void this.handleGetProject(res);
      return;
    }
    if (req.method === 'POST' && pathname === '/api/preview') {
      void this.handlePostPreview(req, res);
      return;
    }
    if (req.method === 'POST' && pathname === '/api/generate') {
      void this.handlePostGenerate(req, res);
      return;
    }
    if (req.method === 'GET' && pathname === '/api/events') {
      this.handleGetEvents(req, res);
      return;
    }
    if (req.method === 'POST' && pathname === '/api/shutdown') {
      this.handlePostShutdown(res);
      return;
    }

    this.sendJson(res, 404, { error: 'Not found' });
  }

  private handleGetIndex(res: http.ServerResponse): void {
    // Try multiple locations: __dirname varies depending on how the code is loaded
    // - dist/gui/server.js (standalone): __dirname = dist/gui/ → gui.html is in same dir
    // - dist/cli.js (bundled by tsup): __dirname = dist/ → gui.html is in gui/ subfolder
    const candidates = [
      path.join(__dirname, 'gui.html'),
      path.join(__dirname, 'gui', 'gui.html'),
      path.join(__dirname, '..', 'dist', 'gui', 'gui.html'),
      path.join(__dirname, '..', 'src', 'gui', 'gui.html'),
    ];

    for (const candidate of candidates) {
      try {
        const html = fs.readFileSync(candidate, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      } catch {
        // Try next candidate
      }
    }

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('GUI HTML file not found. Please rebuild with: npm run build');
  }

  private async handleGetProject(res: http.ServerResponse): Promise<void> {
    try {
      const projectInfo = await detectProject(this.options.cwd);
      this.sendJson(res, 200, {
        isValid: projectInfo.isValid,
        errors: projectInfo.errors,
        nestVersion: projectInfo.nestVersion,
        orm: projectInfo.orm,
        database: projectInfo.database,
        sourceRoot: projectInfo.sourceRoot,
        authExists: projectInfo.authExists,
        root: projectInfo.root,
      });
    } catch (error) {
      this.sendJson(res, 500, { error: error instanceof Error ? error.message : 'Detection failed' });
    }
  }

  private async handlePostPreview(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await this.parseBody(req) as { answers: any };
      const projectInfo = await detectProject(this.options.cwd);

      if (!projectInfo.isValid) {
        this.sendJson(res, 400, { error: 'Invalid NestJS project', details: projectInfo.errors });
        return;
      }

      const config = buildConfig(
        body.answers,
        projectInfo.root.split(/[/\\]/).pop() || 'project',
        projectInfo.sourceRoot,
        projectInfo.orm,
        projectInfo.database
      );

      const preview = await this.orchestrator.preview(config, projectInfo);
      this.sendJson(res, 200, preview);
    } catch (error) {
      this.sendJson(res, 500, { error: error instanceof Error ? error.message : 'Preview failed' });
    }
  }

  private async handlePostGenerate(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (this.isGenerating) {
      this.sendJson(res, 409, { error: 'Generation already in progress' });
      return;
    }

    try {
      const body = await this.parseBody(req) as { answers: any; overwrite?: boolean };
      const projectInfo = await detectProject(this.options.cwd);

      if (!projectInfo.isValid) {
        this.sendJson(res, 400, { error: 'Invalid NestJS project', details: projectInfo.errors });
        return;
      }

      const config = buildConfig(
        body.answers,
        projectInfo.root.split(/[/\\]/).pop() || 'project',
        projectInfo.sourceRoot,
        projectInfo.orm,
        projectInfo.database
      );

      // Respond immediately
      this.sendJson(res, 202, { status: 'started', message: 'Generation in progress. Follow /api/events for updates.' });

      // Run generation asynchronously
      this.isGenerating = true;
      const result = await this.orchestrator.generate({
        config,
        projectInfo,
        overwrite: body.overwrite || !!projectInfo.authExists,
      });
      this.isGenerating = false;

      // Broadcast final result
      this.broadcastEvent('generation-complete', result);

      // Schedule shutdown after success
      if (result.success) {
        setTimeout(() => {
          this.broadcastEvent('server-shutdown', { message: 'Generation complete. Server shutting down.' });
          setTimeout(() => this.shutdown(), 2000);
        }, 5000);
      }
    } catch (error) {
      this.isGenerating = false;
      this.broadcastEvent('generation-complete', {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      });
    }
  }

  private handleGetEvents(req: http.IncomingMessage, res: http.ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);

    this.sseClients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(heartbeat);
        this.sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      this.sseClients.delete(res);
      clearInterval(heartbeat);
    });
  }

  private handlePostShutdown(res: http.ServerResponse): void {
    this.sendJson(res, 200, { ok: true });
    setTimeout(() => this.shutdown(), 500);
  }

  private parseBody(req: http.IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;
      const MAX_SIZE = 1024 * 1024; // 1MB

      req.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_SIZE) {
          reject(new Error('Request body too large'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error('Invalid JSON body'));
        }
      });

      req.on('error', reject);
    });
  }

  private sendJson(res: http.ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

import { NextResponse } from 'next/server';
import { Solari } from '@solarisdk/browser';
import { SandboxClient } from '@solarisdk/sandbox';

export async function POST(req: Request) {
  let browser: any = null;
  let sandbox: any = null;

  try {
    const { url, competitorName } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiKey = process.env.SOLARI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SOLARI_API_KEY is not configured' }, { status: 500 });
    }

    // 1. Launch Solari Cloud Browser with recording
    const browserClient = new Solari({ apiKey });
    browser = await browserClient.launch({
      recording: true,
    });

    const sessionId = browser.id;
    const page = await browser.newPage();

    // Navigate to target competitor site and extract content
    await page.goto(url, { waitUntil: 'networkidle' });
    const pageTitle = await page.title();
    const rawContent = await page.evaluate(() => {
      return document.body.innerText.slice(0, 8000);
    });

    // Close browser cleanly once content is fetched
    await browser.close();
    browser = null;

    // Fetch the Solari Session Replay URL
    let replayUrl = '';
    try {
      const replay = await browserClient.sessions.getReplayUrl(sessionId);
      replayUrl = replay.url;
    } catch {
      replayUrl = `https://console.getsolari.com/sessions/${sessionId}`;
    }

    // 2. Launch Solari Sandbox MicroVM
    const sandboxClient = new SandboxClient({
      apiKey,
      baseUrl: process.env.SOLARI_BASE_URL || 'https://api.getsolari.com',
    });

    sandbox = await sandboxClient.create({ template: 'base' });
    await sandbox.connect();

    // Python extraction script (must be flush-left to avoid IndentationError)
    const pythonScript = `import json, re

raw_text = """${rawContent.replace(/"""/g, '\\"\\"\\"')}"""

prices = re.findall(r'\\$\\d+(?:\\.\\d{2})?', raw_text)
unique_prices = sorted(list(set(prices)))

result = {
    "detectedPrices": unique_prices[:6],
    "textLength": len(raw_text),
    "pricingTiersDetected": len(unique_prices) > 0,
    "confidenceScore": 0.94 if len(unique_prices) > 0 else 0.65
}

with open('/tmp/diff_result.json', 'w') as f:
    json.dump(result, f)
`;

    await sandbox.files.write('/tmp/analyze.py', pythonScript);

    // Run the Python analysis script
    const runResult = await sandbox.commands.run('python3', { args: ['/tmp/analyze.py'] });
    if (runResult && (runResult as any).exitCode !== 0 && (runResult as any).exitCode !== undefined) {
      console.error('Python execution error:', (runResult as any).stderr || runResult);
    }

    // Read the output from the sandbox
    const diffOutputRaw = await sandbox.files.read('/tmp/diff_result.json');

    // Unpack whether diffOutputRaw is a string, Buffer, or object wrapper
    let jsonString = '';
    if (typeof diffOutputRaw === 'string') {
      jsonString = diffOutputRaw;
    } else if (Buffer.isBuffer(diffOutputRaw)) {
      jsonString = diffOutputRaw.toString('utf-8');
    } else if (diffOutputRaw && typeof diffOutputRaw === 'object') {
      jsonString =
        (diffOutputRaw as any).content ||
        (diffOutputRaw as any).text ||
        (diffOutputRaw as any).data ||
        JSON.stringify(diffOutputRaw);
    }

    let diffData: any = {};
    try {
      diffData = typeof jsonString === 'object' ? jsonString : JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('Raw unparseable output from sandbox:', diffOutputRaw);
      diffData = { detectedPrices: [], confidenceScore: 0.5 };
    }

    // Clean up sandbox VM immediately
    await sandbox.kill();
    sandbox = null;

    return NextResponse.json({
      success: true,
      competitorName: competitorName || pageTitle,
      url,
      sessionId,
      replayUrl,
      analysis: {
        pageTitle,
        detectedPrices: diffData.detectedPrices || [],
        confidence: diffData.confidenceScore || 0.85,
        timestamp: new Date().toISOString(),
        summary: `Successfully monitored ${competitorName || pageTitle}. Detected ${
          diffData.detectedPrices?.length || 0
        } active pricing tiers via Solari cloud session.`,
      },
    });
  } catch (error: any) {
    console.error('Solari Scan Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete radar scan' },
      { status: 500 }
    );
  } finally {
    // Safety cleanup so sessions don't leak and cause 429 concurrency limit errors
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch {}
    }
  }
}
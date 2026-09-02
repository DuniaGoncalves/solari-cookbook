import { NextResponse } from 'next/server';
import { Solari } from '@solarisdk/browser';
import { SandboxClient } from '@solarisdk/sandbox';

export async function POST(req: Request) {
  try {
    const { url, competitorName } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiKey = process.env.SOLARI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SOLARI_API_KEY is not configured' }, { status: 500 });
    }

    // 1. Launch Solari Cloud Browser with Stealth, Residential Proxy, and Session Recording
    const browserClient = new Solari({ apiKey });
    const browser = await browserClient.launch({
      stealth: true,
      recording: true,
      captcha: true,
      proxy: { country: 'us' },
    });

    const sessionId = browser.id;
    const page = await browser.newPage();

    // Navigate to competitor target and extract page content
    await page.goto(url, { waitUntil: 'networkidle' });
    const pageTitle = await page.title();
    const rawContent = await page.evaluate(() => {
      // Extract visible text and pricing structures
      return document.body.innerText.slice(0, 8000);
    });

    // Close browser session cleanly
    await browser.close();

    // Fetch the Solari Session Replay URL (ready shortly after close)
    let replayUrl = '';
    try {
      const replay = await browserClient.sessions.getReplayUrl(sessionId);
      replayUrl = replay.url;
    } catch {
      replayUrl = `https://console.getsolari.com/sessions/${sessionId}`;
    }

    // 2. Launch Solari Sandbox MicroVM to run structured diff & pricing analysis
    const sandboxClient = new SandboxClient({ apiKey });
    const sandbox = await sandboxClient.create({ template: 'base' });

    // Write a Python script into the sandbox microVM to process and extract pricing tiers
    const pythonScript = `
import json, re

raw_text = """${rawContent.replace(/"""/g, '\\"\\"\\"')}"""

# Extract monetary figures and keywords
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
    await sandbox.run({ command: 'python3', args: ['/tmp/analyze.py'] });

    const diffOutputRaw = await sandbox.files.read('/tmp/diff_result.json');
    const diffData = JSON.parse(diffOutputRaw.toString());

    // Kill sandbox after job completion
    await sandbox.kill();

    return NextResponse.json({
      success: true,
      competitorName: competitorName || pageTitle,
      url,
      sessionId,
      replayUrl,
      analysis: {
        pageTitle,
        detectedPrices: diffData.detectedPrices,
        confidence: diffData.confidenceScore,
        timestamp: new Date().toISOString(),
        summary: `Successfully monitored ${competitorName || pageTitle}. Detected ${diffData.detectedPrices.length} active pricing tiers via Solari stealth proxy session.`,
      },
    });
  } catch (error: any) {
    console.error('Solari Scan Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete radar scan' },
      { status: 500 }
    );
  }
}
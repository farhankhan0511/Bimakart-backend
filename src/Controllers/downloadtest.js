// Add this to your controller file

import { asynchandler } from "../Utils/asynchandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import axios from "axios";
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DOWNLOAD_DIR = path.join(__dirname, "../test-downloads");

if (!fs.existsSync(TEST_DOWNLOAD_DIR)) {
  fs.mkdirSync(TEST_DOWNLOAD_DIR, { recursive: true });
}

// Diagnostic function
async function runDiagnostics(url) {
  const results = {
    url,
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    tests: {}
  };

  const urlObj = new URL(url);

  // Test 1: DNS Resolution
  console.log('\n🔍 Test 1: DNS Resolution');
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.resolve4(urlObj.hostname);
    results.tests.dns = {
      success: true,
      addresses,
      message: `Resolved to ${addresses.join(', ')}`
    };
    console.log(`✓ DNS: ${addresses.join(', ')}`);
  } catch (err) {
    results.tests.dns = {
      success: false,
      error: err.message,
      code: err.code
    };
    console.error(`❌ DNS failed: ${err.message}`);
  }

  // Test 2: TCP Connection
  console.log('\n🔍 Test 2: TCP Connection');
  try {
    const net = await import('net');
    const port = urlObj.protocol === 'https:' ? 443 : 80;
    
    await new Promise((resolve, reject) => {
      const startTime = Date.now();
      const socket = net.createConnection({
        host: urlObj.hostname,
        port,
        timeout: 10000
      });
      
      socket.on('connect', () => {
        const elapsed = Date.now() - startTime;
        results.tests.tcp = {
          success: true,
          port,
          elapsed: `${elapsed}ms`,
          message: `Connected to ${urlObj.hostname}:${port}`
        };
        console.log(`✓ TCP: Connected in ${elapsed}ms`);
        socket.end();
        resolve();
      });
      
      socket.on('error', (err) => {
        results.tests.tcp = {
          success: false,
          port,
          error: err.message,
          code: err.code
        };
        reject(err);
      });
      
      socket.on('timeout', () => {
        results.tests.tcp = {
          success: false,
          port,
          error: 'Connection timeout'
        };
        reject(new Error('TCP timeout'));
      });
    });
  } catch (err) {
    console.error(`❌ TCP failed: ${err.message}`);
  }

  // Test 3: HTTPS/HTTP HEAD Request
  console.log('\n🔍 Test 3: HTTP HEAD Request');
  try {
    const startTime = Date.now();
    const response = await axios.head(url, {
      timeout: 15000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        rejectUnauthorized: true,
        timeout: 10000
      }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const elapsed = Date.now() - startTime;
    results.tests.httpHead = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      contentLength: response.headers['content-length'],
      contentType: response.headers['content-type'],
      elapsed: `${elapsed}ms`,
      headers: response.headers
    };
    console.log(`✓ HTTP HEAD: ${response.status}, ${response.headers['content-length']} bytes`);
  } catch (err) {
    results.tests.httpHead = {
      success: false,
      error: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText
    };
    console.error(`❌ HTTP HEAD failed: ${err.message}`);
  }

  // Test 4: Partial Download (first 10KB)
  console.log('\n🔍 Test 4: Partial Download (Range Request)');
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'arraybuffer',
      headers: {
        'Range': 'bytes=0-10239',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: true,
        timeout: 10000
      })
    });
    
    const elapsed = Date.now() - startTime;
    results.tests.partialDownload = {
      success: true,
      bytesReceived: response.data.byteLength,
      status: response.status,
      elapsed: `${elapsed}ms`,
      supportsRangeRequests: response.status === 206
    };
    console.log(`✓ Partial download: ${response.data.byteLength} bytes in ${elapsed}ms`);
  } catch (err) {
    results.tests.partialDownload = {
      success: false,
      error: err.message,
      code: err.code,
      status: err.response?.status
    };
    console.error(`❌ Partial download failed: ${err.message}`);
  }

  return results;
}

// Full download function
async function testFullDownload(url, fileName) {
  console.log('\n🔍 Test 5: Full File Download');
  const filePath = path.join(TEST_DOWNLOAD_DIR, fileName);
  const startTime = Date.now();
  
  const result = {
    success: false,
    filePath: null,
    fileSize: 0,
    duration: 0,
    speed: 0,
    error: null
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    let bytesReceived = 0;
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      signal: controller.signal,
      timeout: 30000,
      httpsAgent: new https.Agent({
        keepAlive: true,
        timeout: 15000
      }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*'
      },
      maxRedirects: 5
    });

    console.log(`✓ Connection established, Content-Length: ${response.headers['content-length']}`);

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      let lastUpdate = Date.now();

      response.data.on('data', (chunk) => {
        bytesReceived += chunk.length;
        const now = Date.now();
        
        // Progress update every second
        if (now - lastUpdate > 1000) {
          const elapsed = (now - startTime) / 1000;
          const speed = (bytesReceived / 1024 / elapsed).toFixed(2);
          console.log(`  📊 ${bytesReceived} bytes (${speed} KB/s)`);
          lastUpdate = now;
        }
      });

      response.data.on('error', reject);
      writer.on('finish', resolve);
      writer.on('error', reject);

      response.data.pipe(writer);
    });

    clearTimeout(timeout);

    const stats = fs.statSync(filePath);
    const duration = (Date.now() - startTime) / 1000;
    const speed = (stats.size / 1024 / duration).toFixed(2);

    result.success = true;
    result.filePath = filePath;
    result.fileSize = stats.size;
    result.duration = `${duration.toFixed(2)}s`;
    result.speed = `${speed} KB/s`;

    console.log(`✅ Download complete: ${stats.size} bytes in ${duration.toFixed(2)}s (${speed} KB/s)`);
    
  } catch (err) {
    result.error = {
      message: err.message,
      code: err.code,
      name: err.name
    };
    console.error(`❌ Download failed: ${err.message}`);
    
    // Cleanup partial file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return result;
}

// Main test endpoint
export const testPDFDownload = asynchandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json(
      new ApiResponse(400, {}, "URL is required in request body")
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json(
      new ApiResponse(400, {}, "Invalid URL format")
    );
  }

  console.log('\n' + '='.repeat(70));
  console.log('🧪 PDF DOWNLOAD TEST');
  console.log('='.repeat(70));
  console.log(`URL: ${url}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  try {
    // Run diagnostics
    const diagnostics = await runDiagnostics(url);
    
    // Attempt full download
    const fileName = `test_${Date.now()}.pdf`;
    const downloadResult = await testFullDownload(url, fileName);

    const response = {
      diagnostics,
      download: downloadResult,
      summary: {
        allTestsPassed: 
          diagnostics.tests.dns?.success &&
          diagnostics.tests.tcp?.success &&
          diagnostics.tests.httpHead?.success &&
          downloadResult.success,
        canConnectToServer: diagnostics.tests.tcp?.success,
        canMakeHttpRequest: diagnostics.tests.httpHead?.success,
        canDownloadFile: downloadResult.success
      }
    };

    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`DNS Resolution: ${diagnostics.tests.dns?.success ? '✅' : '❌'}`);
    console.log(`TCP Connection: ${diagnostics.tests.tcp?.success ? '✅' : '❌'}`);
    console.log(`HTTP Request: ${diagnostics.tests.httpHead?.success ? '✅' : '❌'}`);
    console.log(`File Download: ${downloadResult.success ? '✅' : '❌'}`);
    console.log('='.repeat(70) + '\n');

    if (downloadResult.success) {
      return res.status(200).json(
        new ApiResponse(200, response, "PDF download test completed successfully")
      );
    } else {
      return res.status(500).json(
        new ApiResponse(500, response, "PDF download test failed")
      );
    }

  } catch (error) {
    console.error('\n❌ Test endpoint error:', error);
    return res.status(500).json(
      new ApiResponse(500, { error: error.message }, "Test endpoint error")
    );
  }
});
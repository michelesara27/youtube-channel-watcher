// src/utils/videoTestSuite.js

class VideoTestSuite {
  constructor() {
    this.results = [];
    this.videoLogger = videoLogger;
  }

  async runAllTests(videoUrl) {
    console.log('🎬 Iniciando suite de testes de vídeo...');
    
    const tests = [
      this.testNetworkConnectivity.bind(this, videoUrl),
      this.testVideoElementCreation.bind(this),
      this.testAutoplayPolicies.bind(this),
      this.testCodecSupport.bind(this),
      this.testBufferingPerformance.bind(this, videoUrl),
      this.testErrorHandling.bind(this),
      this.testUserInteractions.bind(this)
    ];

    for (const test of tests) {
      await this.runTest(test);
    }

    this.generateReport();
    return this.results;
  }

  async runTest(testFunction) {
    const testName = testFunction.name;
    
    try {
      console.log(`🧪 Executando teste: ${testName}`);
      const result = await testFunction();
      this.results.push({
        test: testName,
        status: 'PASSED',
        result,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ ${testName}: PASSED`);
    } catch (error) {
      this.results.push({
        test: testName,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async testNetworkConnectivity(videoUrl) {
    const tests = [
      this.pingUrl(videoUrl),
      this.testDownloadSpeed(videoUrl),
      this.testLatency()
    ];

    const results = await Promise.allSettled(tests);
    
    return {
      urlReachable: results[0].status === 'fulfilled',
      downloadSpeed: results[1].status === 'fulfilled' ? results[1].value : null,
      latency: results[2].status === 'fulfilled' ? results[2].value : null
    };
  }

  async pingUrl(url) {
    const startTime = performance.now();
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    const endTime = performance.now();
    
    return {
      responseTime: endTime - startTime,
      status: response.type === 'opaque' ? 'CORS blocked' : 'accessible'
    };
  }

  async testDownloadSpeed(url) {
    const startTime = performance.now();
    const response = await fetch(url);
    const blob = await response.blob();
    const endTime = performance.now();
    
    const sizeInMB = blob.size / (1024 * 1024);
    const timeInSeconds = (endTime - startTime) / 1000;
    
    return {
      downloadSpeed: sizeInMB / timeInSeconds,
      size: blob.size,
      duration: endTime - startTime
    };
  }

  async testLatency() {
    // Teste simples de latência
    const times = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await new Promise(resolve => setTimeout(resolve, 0));
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  testVideoElementCreation() {
    const video = document.createElement('video');
    
    // Testar diferentes atributos
    video.src = 'data:video/mp4;base64,AAAAFGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAC721kYXQhEAUGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY';
    video.controls = true;
    video.autoplay = false;
    video.muted = true;
    
    return {
      tagName: video.tagName,
      canPlayType: {
        mp4: video.canPlayType('video/mp4'),
        webm: video.canPlayType('video/webm'),
        ogg: video.canPlayType('video/ogg')
      },
      attributes: {
        controls: video.controls,
        autoplay: video.autoplay,
        muted: video.muted,
        readyState: video.readyState
      }
    };
  }

  async testAutoplayPolicies() {
    const video = document.createElement('video');
    video.muted = true;
    
    const results = {
      mutedAutoplay: null,
      unmutedAutoplay: null
    };
    
    // Testar autoplay com muted (geralmente permitido)
    try {
      video.muted = true;
      const mutedPromise = video.play();
      if (mutedPromise !== undefined) {
        await mutedPromise;
        results.mutedAutoplay = 'allowed';
      } else {
        results.mutedAutoplay = 'not_supported';
      }
    } catch (error) {
      results.mutedAutoplay = 'blocked: ' + error.message;
    }
    
    // Testar autoplay sem muted (geralmente bloqueado)
    try {
      video.muted = false;
      const unmutedPromise = video.play();
      if (unmutedPromise !== undefined) {
        await unmutedPromise;
        results.unmutedAutoplay = 'allowed';
      } else {
        results.unmutedAutoplay = 'not_supported';
      }
    } catch (error) {
      results.unmutedAutoplay = 'blocked: ' + error.message;
    }
    
    return results;
  }

  testCodecSupport() {
    const video = document.createElement('video');
    
    return {
      h264: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
      h265: video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"'),
      vp8: video.canPlayType('video/webm; codecs="vp8, vorbis"'),
      vp9: video.canPlayType('video/webm; codecs="vp9, opus"'),
      av1: video.canPlayType('video/webm; codecs="av01.0.05M.08"'),
      theora: video.canPlayType('video/ogg; codecs="theora, vorbis"')
    };
  }

  async testBufferingPerformance(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      let loadTime = null;
      let canPlayTime = null;
      
      video.addEventListener('loadeddata', () => {
        loadTime = performance.now() - startTime;
      });
      
      video.addEventListener('canplay', () => {
        canPlayTime = performance.now() - startTime;
      });
      
      video.addEventListener('canplaythrough', () => {
        resolve({
          loadTime,
          canPlayTime,
          canPlayThroughTime: performance.now() - startTime,
          bufferedRanges: video.buffered.length
        });
      });
      
      // Timeout após 10 segundos
      setTimeout(() => {
        resolve({
          loadTime,
          canPlayTime,
          canPlayThroughTime: null,
          bufferedRanges: video.buffered.length,
          timeout: true
        });
      }, 10000);
    });
  }

  testErrorHandling() {
    const video = document.createElement('video');
    
    // Testar diferentes cenários de erro
    const errorScenarios = [
      () => { video.src = 'invalid-url'; },
      () => { video.networkState = 3; }, // NETWORK_NO_SOURCE
      () => { video.error = { code: 4, message: 'MEDIA_ERR_SRC_NOT_SUPPORTED' }; }
    ];
    
    const results = errorScenarios.map((scenario, index) => {
      try {
        scenario();
        return {
          scenario: index,
          errorTriggered: video.error !== null,
          errorCode: video.error?.code,
          errorMessage: video.error?.message
        };
      } catch (error) {
        return {
          scenario: index,
          error: error.message
        };
      }
    });
    
    return results;
  }

  testUserInteractions() {
    // Simular interações do usuário
    const interactions = [
      'click',
      'touchstart',
      'keydown',
      'focus'
    ];
    
    const results = interactions.map(interaction => {
      const event = new Event(interaction, { bubbles: true });
      const element = document.createElement('div');
      
      let eventFired = false;
      element.addEventListener(interaction, () => {
        eventFired = true;
      });
      
      element.dispatchEvent(event);
      
      return {
        interaction,
        eventFired,
        timestamp: Date.now()
      };
    });
    
    return results;
  }

  generateReport() {
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const total = this.results.length;
    
    const report = {
      summary: {
        totalTests: total,
        passed,
        failed,
        successRate: (passed / total) * 100
      },
      details: this.results,
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        online: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      }
    };
    
    console.log('📊 Relatório de Testes:', report);
    this.videoLogger.log('TEST_SUITE_COMPLETED', report);
    
    return report;
  }

  // Método para executar testes específicos
  async runSpecificTests(testNames, videoUrl) {
    const testMap = {
      network: this.testNetworkConnectivity.bind(this, videoUrl),
      element: this.testVideoElementCreation.bind(this),
      autoplay: this.testAutoplayPolicies.bind(this),
      codecs: this.testCodecSupport.bind(this),
      buffering: this.testBufferingPerformance.bind(this, videoUrl),
      errors: this.testErrorHandling.bind(this),
      interactions: this.testUserInteractions.bind(this)
    };
    
    for (const testName of testNames) {
      if (testMap[testName]) {
        await this.runTest(testMap[testName]);
      }
    }
    
    return this.generateReport();
  }
}

// Instância global da suite de testes
const videoTestSuite = new VideoTestSuite();

export default videoTestSuite;
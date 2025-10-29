// src/utils/videoLogger.js

class VideoLogger {
  constructor() {
    this.logs = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(event, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      sessionId: this.sessionId,
      timestamp,
      event,
      data,
      elapsedTime: Date.now() - this.startTime,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(logEntry);
    console.log(`🎥 [VIDEO LOG] ${timestamp} - ${event}:`, data);

    // Enviar para analytics/backend se necessário
    this.sendToAnalytics(logEntry);
  }

  sendToAnalytics(logEntry) {
    // Implementar envio para serviço de analytics
    try {
      // Exemplo: Google Analytics, Sentry, etc.
      if (window.gtag) {
        window.gtag('event', 'video_interaction', {
          event_category: 'video_player',
          event_label: logEntry.event,
          value: logEntry.elapsedTime,
          ...logEntry.data
        });
      }
    } catch (error) {
      console.warn('Erro ao enviar log para analytics:', error);
    }
  }

  // Logs específicos para eventos de clique
  logClickEvent(videoId, element, coordinates) {
    this.log('CLICK_ATTEMPT', {
      videoId,
      element: element?.tagName || 'unknown',
      coordinates,
      timestamp: Date.now(),
      pageState: {
        readyState: document.readyState,
        visibilityState: document.visibilityState,
        networkState: navigator.onLine ? 'online' : 'offline'
      }
    });
  }

  // Logs de estado do player
  logPlayerState(state, videoData) {
    this.log('PLAYER_STATE_CHANGE', {
      previousState: this.getLastState(),
      newState: state,
      videoData,
      playerInfo: this.getPlayerInfo()
    });
  }

  // Logs de erro
  logError(errorType, error, context = {}) {
    this.log('PLAYER_ERROR', {
      errorType,
      errorMessage: error?.message || error,
      errorStack: error?.stack,
      context,
      browserInfo: this.getBrowserInfo(),
      networkInfo: this.getNetworkInfo()
    });
  }

  // Logs de performance
  logPerformance(metric, value, metadata = {}) {
    this.log('PERFORMANCE_METRIC', {
      metric,
      value,
      unit: 'ms',
      metadata
    });
  }

  // Métodos auxiliares
  getLastState() {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1]?.event : 'initial';
  }

  getPlayerInfo() {
    const videoElement = document.querySelector('video') || document.querySelector('iframe');
    return {
      hasVideoElement: !!videoElement,
      videoElementType: videoElement?.tagName,
      src: videoElement?.src || videoElement?.getAttribute('src'),
      autoplay: videoElement?.autoplay,
      controls: videoElement?.controls,
      muted: videoElement?.muted,
      readyState: videoElement?.readyState,
      networkState: videoElement?.networkState
    };
  }

  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      javaEnabled: navigator.javaEnabled?.(),
      pdfViewerEnabled: navigator.pdfViewerEnabled
    };
  }

  getNetworkInfo() {
    return {
      online: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'not_supported'
    };
  }

  // Exportar logs para debug
  exportLogs() {
    return {
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      logs: this.logs,
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const errorCount = this.logs.filter(log => log.event === 'PLAYER_ERROR').length;
    const clickCount = this.logs.filter(log => log.event === 'CLICK_ATTEMPT').length;
    const stateChanges = this.logs.filter(log => log.event === 'PLAYER_STATE_CHANGE').length;

    return {
      errorCount,
      clickCount,
      stateChanges,
      sessionDuration: Date.now() - this.startTime,
      finalState: this.getLastState()
    };
  }

  // Limpar logs (para evitar memory leaks em sessões longas)
  clearLogs() {
    this.logs = [];
    this.startTime = Date.now();
  }
}

// Instância global do logger
const videoLogger = new VideoLogger();

export default videoLogger;
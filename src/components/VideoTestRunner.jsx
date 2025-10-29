"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  BarChart3,
  Wifi,
  Settings,
  Clock,
  Zap
} from "lucide-react";
import videoTestSuite from "../utils/videoTestSuite";
import videoLogger from "../utils/videoLogger";

const VideoTestRunner = ({ videoUrl, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedTests, setSelectedTests] = useState([
    'network', 'element', 'autoplay', 'codecs', 'buffering', 'errors', 'interactions'
  ]);

  const testConfig = {
    network: { name: 'Conectividade de Rede', icon: Wifi },
    element: { name: 'Elemento de Vídeo', icon: Play },
    autoplay: { name: 'Políticas de Autoplay', icon: Settings },
    codecs: { name: 'Suporte a Codecs', icon: Zap },
    buffering: { name: 'Performance de Buffering', icon: Clock },
    errors: { name: 'Tratamento de Erros', icon: AlertTriangle },
    interactions: { name: 'Interações do Usuário', icon: BarChart3 }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);
    
    videoLogger.log('TEST_RUNNER_STARTED', {
      selectedTests,
      videoUrl
    });

    try {
      const results = await videoTestSuite.runSpecificTests(selectedTests, videoUrl);
      setTestResults(results.details);
      
      videoLogger.log('TEST_RUNNER_COMPLETED', {
        summary: results.summary,
        totalTests: results.details.length
      });
    } catch (error) {
      videoLogger.logError('TEST_RUNNER_FAILED', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const toggleTest = (testName) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    );
  };

  const exportResults = () => {
    const data = {
      testResults,
      videoUrl,
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-tests-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'PASSED').length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Testes de Vídeo Automatizados</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Controles de teste */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Selecionar Testes</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTests(Object.keys(testConfig))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={() => setSelectedTests([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(testConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = selectedTests.includes(key);
                
                return (
                  <button
                    key={key}
                    onClick={() => toggleTest(key)}
                    disabled={isRunning}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={isRunning || selectedTests.length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
Vou completar a implementação do componente de testes e criar um documento de solução:

<dyad-write path="src/components/VideoTestRunner.jsx" description="Completando componente de testes automatizados de vídeo">
"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  BarChart3,
  Wifi,
  Settings,
  Clock,
  Zap,
  X
} from "lucide-react";
import videoTestSuite from "../utils/videoTestSuite";
import videoLogger from "../utils/videoLogger";

const VideoTestRunner = ({ videoUrl, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedTests, setSelectedTests] = useState([
    'network', 'element', 'autoplay', 'codecs', 'buffering', 'errors', 'interactions'
  ]);

  const testConfig = {
    network: { name: 'Conectividade de Rede', icon: Wifi },
    element: { name: 'Elemento de Vídeo', icon: Play },
    autoplay: { name: 'Políticas de Autoplay', icon: Settings },
    codecs: { name: 'Suporte a Codecs', icon: Zap },
    buffering: { name: 'Performance de Buffering', icon: Clock },
    errors: { name: 'Tratamento de Erros', icon: AlertTriangle },
    interactions: { name: 'Interações do Usuário', icon: BarChart3 }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);
    
    videoLogger.log('TEST_RUNNER_STARTED', {
      selectedTests,
      videoUrl
    });

    try {
      const results = await videoTestSuite.runSpecificTests(selectedTests, videoUrl);
      setTestResults(results.details);
      
      videoLogger.log('TEST_RUNNER_COMPLETED', {
        summary: results.summary,
        totalTests: results.details.length
      });
    } catch (error) {
      videoLogger.logError('TEST_RUNNER_FAILED', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const toggleTest = (testName) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    );
  };

  const exportResults = () => {
    const data = {
      testResults,
      videoUrl,
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-tests-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'PASSED').length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Testes de Vídeo Automatizados</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Controles de teste */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Selecionar Testes</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTests(Object.keys(testConfig))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={() => setSelectedTests([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(testConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = selectedTests.includes(key);
                
                return (
                  <button
                    key={key}
                    onClick={() => toggleTest(key)}
                    disabled={isRunning}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={isRunning || selectedTests.length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executando Testes...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Executar Testes ({selectedTests.length})</span>
                  </>
                )}
              </button>

              {testResults.length > 0 && (
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Resultados</span>
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Resultados dos Testes</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600">
                    ✅ {passedTests} passaram
                  </span>
                  <span className="text-red-600">
                    ❌ {totalTests - passedTests} falharam
                  </span>
                  <span className="text-blue-600">
                    📊 {successRate.toFixed(1)}% sucesso
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <span className={`text-sm ${
                        result.status === 'PASSED' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    
                    {result.status === 'PASSED' && result.result && (
                      <div className="text-sm text-gray-600 mt-2">
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {result.status === 'FAILED' && result.error && (
                      <div className="text-sm text-red-600 mt-2">
                        Erro: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações do ambiente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Informações do Ambiente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Navegador:</span>
                  <span>{navigator.userAgent.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plataforma:</span>
                  <span>{navigator.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online:</span>
                  <span>{navigator.onLine ? 'Sim' : 'Não'}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL do Vídeo:</span>
                  <span className="truncate max-w-xs">{videoUrl}</span>
                </div>
                {navigator.connection && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de Conexão:</span>
                      <span>{navigator.connection.effectiveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Velocidade:</span>
                      <span>{navigator.connection.downlink} Mbps</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTestRunner;
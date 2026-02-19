import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search } from 'lucide-react';

interface VoiceSearchProps {
  onSearch: (query: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const VoiceSearch = ({ onSearch, placeholder = "Search...", className = "", disabled = false }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ'; // Uzbek language support

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          setTranscript(transcriptText);
          setIsListening(false);
          onSearch(transcriptText);
        } else {
          setTranscript(transcriptText);
        }
      };

      recognition.onerror = (event: any) => {
        setError(event.error);
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSearch]);

  const toggleListening = () => {
    if (disabled || !isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const handleManualSearch = () => {
    if (transcript.trim()) {
      onSearch(transcript.trim());
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="text-xs text-gray-500 ml-2">
          Voice search not supported
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1 relative">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            isListening 
              ? 'border-red-400 bg-red-50 animate-pulse' 
              : 'border-gray-300'
          }`}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      <button
        onClick={toggleListening}
        className={`p-2 rounded-full transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isListening
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        disabled={disabled}
        title={isListening ? "Stop recording" : "Start voice search"}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {error && (
        <div className="text-xs text-red-500 ml-2">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;

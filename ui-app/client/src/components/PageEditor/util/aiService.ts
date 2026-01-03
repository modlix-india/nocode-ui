/**
 * AI Service Client for PageEditor
 * 
 * Handles SSE streaming communication with the AI service for page modifications.
 * Supports visual feedback via component screenshots.
 */

import { PageDefinition } from '../../../types/common';

/** Event types emitted by the AI service */
export type AIEventType = 
  | 'status'
  | 'phase'
  | 'agent_start'
  | 'agent_thinking'
  | 'agent_complete'
  | 'merging'
  | 'complete'
  | 'error'
  | 'keepalive';

/** Structure of an SSE event from the AI service */
export interface AIEvent {
  event: AIEventType;
  data: {
    message?: string;
    agent?: string;
    success?: boolean;
    page?: PageDefinition;
    agentLogs?: Record<string, any>;
    error?: string;
    [key: string]: any;
  };
}

/** Request options for AI generation */
export interface AIRequestOptions {
  mode: 'modify' | 'enhance';
}

/** Screenshots from different device viewports */
export interface DeviceScreenshots {
  desktop?: string;  // Base64 encoded desktop viewport screenshot
  tablet?: string;   // Base64 encoded tablet viewport screenshot
  mobile?: string;   // Base64 encoded mobile viewport screenshot
}

/** File data for AI requests */
export interface AIRequestFile {
  name: string;
  type: string;
  content: string;  // Base64 encoded file content
}

/** Theme information for AI requests */
export interface AIRequestTheme {
  themeName: string;
}

/** Font pack information */
export interface AIRequestFontPack {
  name: string;
  code: string;  // HTML link tag code for font loading
}

/** Request payload for AI service */
export interface AIRequest {
  instruction: string;
  page: PageDefinition;
  selectedComponentKey?: string;
  componentScreenshot?: string;  // Base64 encoded image of selected component
  pageScreenshot?: string;       // Base64 encoded image of full page viewport (deprecated, use deviceScreenshots)
  deviceScreenshots?: DeviceScreenshots;  // Screenshots from all available device viewports
  file?: AIRequestFile;  // Uploaded file (non-image) as base64
  theme?: AIRequestTheme;  // Theme information
  iconPacks?: string[];  // List of available icon pack names
  fontPacks?: AIRequestFontPack[];  // List of available font packs with names and loading codes
  options: AIRequestOptions;
}

/** Response from AI service (final result) */
export interface AIResponse {
  success: boolean;
  page: PageDefinition;
  agentLogs: Record<string, any>;
}

/**
 * Get the auth token from localStorage.
 * In design mode, it's stored as 'designMode_AuthToken'.
 * The token is stored as a JSON string, may or may not have 'Bearer' prefix.
 */
function getAuthToken(): string | null {
  const tokenName = globalThis.isDesignMode ? 'designMode_AuthToken' : 'AuthToken';
  const token = localStorage.getItem(tokenName);
  if (!token) return null;
  
  try {
    // Token is stored as JSON string
    return JSON.parse(token);
  } catch {
    return token;
  }
}

/**
 * Parse an SSE line into event name and data
 */
function parseSSELine(line: string): { field: string; value: string } | null {
  if (!line || line.startsWith(':')) return null;  // Comment or empty
  
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return { field: line, value: '' };
  
  const field = line.slice(0, colonIndex);
  let value = line.slice(colonIndex + 1);
  if (value.startsWith(' ')) value = value.slice(1);  // Remove leading space
  
  return { field, value };
}

/**
 * Stream AI request to the backend and yield events.
 * 
 * @param request - The AI request payload
 * @param appCode - The app code (sitezump or appbuilder)
 * @param onEvent - Callback for each SSE event
 * @param onComplete - Callback when generation is complete
 * @param onError - Callback on error
 * @param abortSignal - Optional AbortSignal to cancel the request
 */
export async function streamAIRequest(
  request: AIRequest,
  appCode: string,
  onEvent: (event: AIEvent) => void,
  onComplete: (response: AIResponse) => void,
  onError: (error: string) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    onError('Not authenticated. Please log in.');
    return;
  }
  
  try {
    // Debug: log the request being sent
    console.log('[AI Service] Sending request:', {
      instruction: request.instruction,
      selectedComponentKey: request.selectedComponentKey,
      hasComponentScreenshot: !!request.componentScreenshot,
      componentScreenshotLength: request.componentScreenshot?.length || 0,
      hasPageScreenshot: !!request.pageScreenshot,
      pageScreenshotLength: request.pageScreenshot?.length || 0,
      options: request.options,
    });

    const response = await fetch('/api/ai/agent/page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,  // Pass as-is (may or may not have Bearer)
        'appCode': appCode,
        'Accept': 'text/event-stream',  // Signal we expect SSE
        'Cache-Control': 'no-cache',     // Prevent caching
      },
      body: JSON.stringify(request),
      signal: abortSignal,
      // @ts-ignore - These may help with streaming
      cache: 'no-store',
      keepalive: false,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `AI service error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText;
      }
      onError(errorMessage);
      return;
    }
    
    if (!response.body) {
      onError('No response body from AI service');
      return;
    }
    
    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = 'message';
    let currentData = '';
    let completeCalled = false;
    
    const processEvent = () => {
      if (!currentData) return;
      
      try {
        console.log('[SSE] Processing event:', currentEvent, 'data:', currentData.substring(0, 200));
        const data = JSON.parse(currentData);
        const event: AIEvent = {
          event: currentEvent as AIEventType,
          data
        };
        
        onEvent(event);
        
        // Check for completion
        // Note: The page result is nested in data.data from Python's ProgressEvent
        console.log('[SSE] Checking event type:', currentEvent, 'equals complete?', currentEvent === 'complete');
        if (currentEvent === 'complete') {
          const result = data.data || data;  // Handle both nested and flat
          console.log('[SSE] Complete event received, calling onComplete');
          completeCalled = true;
          onComplete({
            success: result.success ?? true,
            page: result.page,
            agentLogs: result.agentLogs ?? {}
          });
          console.log('[SSE] onComplete called, completeCalled =', completeCalled);
        } else if (currentEvent === 'error') {
          console.log('[SSE] Error event received');
          completeCalled = true;
          onError(data.error || data.message || 'Unknown error');
        }
      } catch (e) {
        console.warn('[SSE] Failed to parse data:', currentData, e);
      }
      currentData = '';
      currentEvent = 'message';
    };
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Process any remaining data in buffer
        if (currentData) {
          processEvent();
        }
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';  // Keep incomplete line in buffer
      
      for (const line of lines) {
        // Log raw lines for debugging
        if (line.trim()) {
          console.log('[SSE Raw]', line);
        }
        
        const parsed = parseSSELine(line);
        
        if (!parsed) {
          // Empty line = end of event
          if (currentData) {
            console.log('[SSE] Event ready (empty line):', currentEvent);
          }
          processEvent();
          continue;
        }
        
        if (parsed.field === 'event') {
          // New event starting - process previous event first if we have data
          if (currentData) {
            console.log('[SSE] Event ready (new event):', currentEvent);
            processEvent();
          }
          currentEvent = parsed.value.trim();  // Trim whitespace
          console.log('[SSE] Event type:', currentEvent);
        } else if (parsed.field === 'data') {
          currentData += parsed.value;
        }
      }
    }
    
    // If stream ended but complete was never called, report error
    console.log('[SSE] Stream ended, completeCalled =', completeCalled);
    if (!completeCalled) {
      console.warn('[SSE] Stream ended without complete event');
      onError('Stream ended unexpectedly');
    }
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      onEvent({ event: 'status', data: { message: 'Request cancelled' } });
    } else {
      onError(error.message || 'Failed to connect to AI service');
    }
  }
}

/**
 * Make a synchronous (non-streaming) AI request.
 * Returns the complete result after generation finishes.
 */
export async function sendAIRequest(
  request: AIRequest,
  appCode: string,
  abortSignal?: AbortSignal
): Promise<AIResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  const response = await fetch('/api/ai/agent/page/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'appCode': appCode,
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI service error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// ============== Function AI APIs ==============

/** Request payload for function explanation */
export interface FunctionExplainRequest {
  functionDefinition: any;  // KIRun function definition
  functionName: string;
}

/** Response from function explanation */
export interface FunctionExplainResponse {
  success: boolean;
  explanation: string;
  summary: string;
  steps: Array<{
    name: string;
    description: string;
  }>;
}

/** Request payload for function modification */
export interface FunctionModifyRequest {
  instruction: string;
  functionDefinition: any;
  functionName: string;
  pageContext?: {
    componentDefinition?: Record<string, any>;
    storePaths?: string[];
  };
}

/** Response from function modification */
export interface FunctionModifyResponse {
  success: boolean;
  functionDefinition: any;
  reasoning: string;
  changes: string[];
}

/**
 * Explain a KIRun function using AI.
 * Returns a human-readable explanation of what the function does.
 */
export async function explainFunction(
  request: FunctionExplainRequest,
  appCode: string,
  abortSignal?: AbortSignal
): Promise<FunctionExplainResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  const response = await fetch('/api/ai/function/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'appCode': appCode,
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI service error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Modify a KIRun function using AI.
 * Takes a natural language instruction and returns a modified function.
 */
export async function modifyFunction(
  request: FunctionModifyRequest,
  appCode: string,
  abortSignal?: AbortSignal
): Promise<FunctionModifyResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  const response = await fetch('/api/ai/function/modify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'appCode': appCode,
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `AI service error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}


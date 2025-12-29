/**
 * Component Screenshot Capture Utility
 * 
 * Dynamically loads html2canvas from CDN and captures a component screenshot.
 * Used for visual feedback in the AI refinement loop.
 */

// Track if html2canvas has been loaded
let html2canvasLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Dynamically load html2canvas from CDN.
 * Only loads once, subsequent calls return immediately.
 */
async function loadHtml2Canvas(): Promise<void> {
  // Already loaded
  if (html2canvasLoaded || (window as any).html2canvas) {
    html2canvasLoaded = true;
    return;
  }
  
  // Loading in progress
  if (loadPromise) {
    return loadPromise;
  }
  
  // Start loading
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    
    script.onload = () => {
      html2canvasLoaded = true;
      loadPromise = null;
      resolve();
    };
    
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load html2canvas from CDN'));
    };
    
    document.head.appendChild(script);
  });
  
  return loadPromise;
}

/**
 * Capture a screenshot of a specific component in the preview iframe.
 * 
 * @param iframe - The preview iframe element
 * @param componentKey - The key of the component to capture (data-key attribute)
 * @returns Base64 encoded PNG image (without data:image/png;base64, prefix)
 */
export async function captureComponent(
  iframe: HTMLIFrameElement,
  componentKey: string
): Promise<string> {
  // Load html2canvas from CDN if not already loaded
  await loadHtml2Canvas();
  
  const html2canvas = (window as any).html2canvas;
  
  if (!html2canvas) {
    throw new Error('html2canvas failed to load');
  }
  
  // Get iframe document
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  
  if (!iframeDoc) {
    throw new Error('Cannot access iframe content. Cross-origin restriction?');
  }
  
  // Find the component element by data-key attribute
  const element = iframeDoc.querySelector(`[data-key="${componentKey}"]`);
  
  if (!element) {
    throw new Error(`Component with key "${componentKey}" not found in preview`);
  }
  
  // Capture to canvas
  const canvas = await html2canvas(element as HTMLElement, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,  // Transparent background
    scale: 2,  // Higher resolution for better AI analysis
  });
  
  // Convert to base64 (remove the data:image/png;base64, prefix)
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1];
}

/**
 * Capture the visible viewport of the preview iframe.
 * 
 * @param iframe - The preview iframe element
 * @returns Base64 encoded PNG image
 */
export async function captureViewport(
  iframe: HTMLIFrameElement
): Promise<string> {
  await loadHtml2Canvas();
  
  const html2canvas = (window as any).html2canvas;
  
  if (!html2canvas) {
    throw new Error('html2canvas failed to load');
  }
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  
  if (!iframeDoc) {
    throw new Error('Cannot access iframe content');
  }
  
  const body = iframeDoc.body;
  
  if (!body) {
    throw new Error('Iframe has no body element');
  }
  
  // Capture viewport area only
  const canvas = await html2canvas(body, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,
    scale: 1,
    windowWidth: iframe.clientWidth,
    windowHeight: iframe.clientHeight,
  });
  
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1];
}

/**
 * Check if html2canvas is available.
 */
export function isHtml2CanvasLoaded(): boolean {
  return html2canvasLoaded || !!(window as any).html2canvas;
}

/**
 * Preload html2canvas (can be called early to reduce capture delay).
 */
export async function preloadHtml2Canvas(): Promise<void> {
  try {
    await loadHtml2Canvas();
  } catch (e) {
    console.warn('Failed to preload html2canvas:', e);
  }
}


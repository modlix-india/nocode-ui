/**
 * Component Screenshot Capture Utility
 *
 * Dynamically loads html2canvas into the iframe and captures a component screenshot.
 * Used for visual feedback in the AI refinement loop.
 *
 * IMPORTANT: html2canvas must be loaded inside the iframe to capture elements from it.
 * Loading it in the parent window won't work for cross-document element capture.
 */

const HTML2CANVAS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

/**
 * Load html2canvas into an iframe's window.
 * Returns the html2canvas function from the iframe's window.
 */
async function loadHtml2CanvasInIframe(iframeWindow: Window): Promise<any> {
  // Check if already loaded in this iframe
  if ((iframeWindow as any).html2canvas) {
    return (iframeWindow as any).html2canvas;
  }

  return new Promise((resolve, reject) => {
    const script = iframeWindow.document.createElement('script');
    script.src = HTML2CANVAS_CDN;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      const html2canvas = (iframeWindow as any).html2canvas;
      if (html2canvas) {
        resolve(html2canvas);
      } else {
        reject(new Error('html2canvas loaded but not available on window'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load html2canvas from CDN into iframe'));
    };

    iframeWindow.document.head.appendChild(script);
  });
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
  // Get iframe window and document
  const iframeWindow = iframe.contentWindow;
  const iframeDoc = iframe.contentDocument || iframeWindow?.document;

  if (!iframeWindow || !iframeDoc) {
    throw new Error('Cannot access iframe content. Cross-origin restriction?');
  }

  // Find the wrapper element by data-key attribute
  const wrapper = iframeDoc.querySelector(`[data-key="${componentKey}"]`);

  if (!wrapper) {
    throw new Error(`Component with key "${componentKey}" not found in preview`);
  }

  // The wrapper uses display:contents so it has no dimensions.
  // We need to capture the actual component inside it (first child).
  // If the wrapper has children, capture the first child; otherwise try the wrapper itself.
  let element: Element = wrapper;
  if (wrapper.children.length > 0) {
    element = wrapper.children[0];
    console.log('[Capture] Using first child of wrapper:', element.tagName);
  }

  // Verify the element has dimensions
  const rect = element.getBoundingClientRect();
  console.log('[Capture] Found element:', element.tagName, 'with data-key:', componentKey, 'dimensions:', rect.width, 'x', rect.height);

  if (rect.width === 0 || rect.height === 0) {
    // Try to find any visible descendant
    const visibleDescendant = wrapper.querySelector('*:not(:empty)');
    if (visibleDescendant) {
      const descRect = visibleDescendant.getBoundingClientRect();
      if (descRect.width > 0 && descRect.height > 0) {
        element = visibleDescendant;
        console.log('[Capture] Using visible descendant:', element.tagName, 'dimensions:', descRect.width, 'x', descRect.height);
      }
    }
  }

  // Load html2canvas INTO the iframe (critical for cross-document capture)
  const html2canvas = await loadHtml2CanvasInIframe(iframeWindow);

  console.log('[Capture] html2canvas loaded in iframe, starting capture...');

  // Capture to canvas (using iframe's html2canvas instance)
  const canvas = await html2canvas(element as HTMLElement, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',  // White background for better visibility
    scale: 2,  // Higher resolution for better AI analysis
  });

  console.log('[Capture] Canvas created:', canvas.width, 'x', canvas.height);

  // Convert to base64 (remove the data:image/png;base64, prefix)
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];

  console.log('[Capture] Base64 length:', base64?.length || 0);

  return base64;
}

/**
 * Capture the visible viewport of the preview iframe.
 *
 * @param iframe - The preview iframe element
 * @returns Base64 encoded PNG image
 */
export async function captureViewport(iframe: HTMLIFrameElement): Promise<string> {
  const iframeWindow = iframe.contentWindow;
  const iframeDoc = iframe.contentDocument || iframeWindow?.document;

  if (!iframeWindow || !iframeDoc) {
    throw new Error('Cannot access iframe content');
  }

  const body = iframeDoc.body;

  if (!body) {
    throw new Error('Iframe has no body element');
  }

  // Load html2canvas into the iframe
  const html2canvas = await loadHtml2CanvasInIframe(iframeWindow);

  // Capture viewport area only
  const canvas = await html2canvas(body, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    scale: 1,
    windowWidth: iframe.clientWidth,
    windowHeight: iframe.clientHeight,
  });

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1];
}

/**
 * Check if html2canvas is available in an iframe.
 */
export function isHtml2CanvasLoaded(iframe: HTMLIFrameElement): boolean {
  return !!(iframe.contentWindow as any)?.html2canvas;
}

/**
 * Preload html2canvas into an iframe (can be called early to reduce capture delay).
 */
export async function preloadHtml2Canvas(iframe: HTMLIFrameElement): Promise<void> {
  try {
    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      await loadHtml2CanvasInIframe(iframeWindow);
    }
  } catch (e) {
    console.warn('Failed to preload html2canvas:', e);
  }
}


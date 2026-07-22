// Client for the server-side template preview endpoints (POST api/core/templates/preview[/pdf]).
// The whole (possibly unsaved) template is sent so work-in-progress edits preview without saving.
// Rendering is FreeMarker on the server; PDF preview returns real OpenHTMLtoPDF bytes.

import axios from 'axios';

export interface PreviewHeaders {
	Authorization?: string;
	clientCode?: string;
	appCode?: string;
}

function cleanHeaders(h: PreviewHeaders): Record<string, string> {
	const out: Record<string, string> = {};
	if (h.Authorization) out.Authorization = h.Authorization;
	if (h.clientCode) out.clientCode = h.clientCode;
	if (h.appCode) out.appCode = h.appCode;
	return out;
}

// Returns the rendered parts map, e.g. { subject: "...", body: "<html>...</html>" }.
export async function fetchHtmlPreview(
	template: any,
	language: string,
	data: any,
	headers: PreviewHeaders,
): Promise<Record<string, string>> {
	const res = await axios.post(
		'api/core/templates/preview',
		{ template, language, data },
		{ headers: cleanHeaders(headers) },
	);
	return res.data ?? {};
}

export interface TemplateAiRequest {
	prompt: string;
	template: any;
	language: string;
	part: string;
	templateType: string;
}

export interface TemplateAiResponse {
	subject?: string;
	html?: string;
	message?: string;
}

// Sends a natural-language prompt + the current template to the configured AI endpoint and returns
// the generated { subject, html, message }. The endpoint is a component property so it can point at
// the appbuilder AI service (default api/ai/appbuilder/template) or any compatible service.
export async function generateTemplate(
	endpoint: string,
	req: TemplateAiRequest,
	headers: PreviewHeaders,
): Promise<TemplateAiResponse> {
	const res = await axios.post(endpoint, req, { headers: cleanHeaders(headers) });
	return res.data ?? {};
}

// Returns an object URL for the rendered PDF blob (caller must revoke it).
export async function fetchPdfPreview(
	template: any,
	data: any,
	headers: PreviewHeaders,
): Promise<string> {
	const res = await axios.post(
		'api/core/templates/preview/pdf',
		{ template, data },
		{ headers: cleanHeaders(headers), responseType: 'blob' },
	);
	return URL.createObjectURL(res.data);
}

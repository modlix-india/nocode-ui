// Google demand for a keyword the user typed. Shared by the keyword panel and the custom
// segment editor: both gate an add on it, and the endpoint contract should live in one place.
// Returns 0 on any failure — a missing number must not block the edit.
export async function fetchKeywordVolume(
	keyword: string,
	sessionId: string | null,
	agentEndpoint: string,
	getAuthHeaders: () => Record<string, string>,
): Promise<number> {
	if (!sessionId) return 0;
	try {
		const baseUrl = agentEndpoint.replace(/\/chat$/, '');
		const res = await fetch(`${baseUrl}/keyword/volume`, {
			method: 'POST',
			headers: getAuthHeaders(), // already sets Content-Type: application/json
			body: JSON.stringify({ session_id: sessionId, keywords: [keyword] }),
		});
		if (!res.ok) return 0;
		return ((await res.json())?.results?.[0]?.volume as number) ?? 0;
	} catch {
		return 0;
	}
}

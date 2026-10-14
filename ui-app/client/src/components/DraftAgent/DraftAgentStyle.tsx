import React from 'react';

// The chrome carries its own stylesheet (draftAgentCss.ts) because it also has to
// render where no page put it, before AppStyle knows the component exists.
export default function DraftAgentStyle() {
	return <style id="DraftAgentCss">{''}</style>;
}

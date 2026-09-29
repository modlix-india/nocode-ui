import React, { useState } from 'react';
import type { SceneDocument, SceneShader } from '../../../util/three/sceneDocument';
import { undeclaredUniforms } from '../../../util/three/sceneEdits';

/**
 * The GLSL source of one shader, plus a control per declared uniform.
 *
 * The compile errors matter more than the editing. A shader that fails to
 * compile renders NOTHING, with the reason only in the browser console, so
 * without this pane the author's whole signal is "the canvas went black".
 */
export function ShaderPane({
	doc,
	shaderId,
	compileError,
	onUpdateShader,
	onSetUniform,
}: Readonly<{
	doc: SceneDocument;
	shaderId: string;
	/** Whatever the viewport's last build reported, if anything. */
	compileError?: string;
	onUpdateShader: (id: string, patch: Partial<SceneShader>) => void;
	onSetUniform: (shaderId: string, name: string, value: unknown) => void;
}>) {
	const shader = doc.shaders.find(s => s.id === shaderId);
	const [draft, setDraft] = useState<string | null>(null);

	if (!shader) return <div className="_sceneShaderPane">This shader no longer exists.</div>;

	const missing = undeclaredUniforms(shader);
	const source = draft ?? shader.fragment ?? '';

	return (
		<div className="_sceneShaderPane">
			<div className="_sceneInspectorTitle">Fragment shader · {shader.id}</div>

			{compileError ? (
				<pre className="_sceneShaderError">{compileError}</pre>
			) : (
				<p className="_sceneNote">
					uTime, uResolution, uPointer, uPointerActive and uProgress are bound for you,
					but their declarations are not added for you: declare each one you use or the
					shader will not compile.
				</p>
			)}

			<textarea
				className="_sceneShaderSource"
				spellCheck={false}
				value={source}
				onChange={e => setDraft(e.target.value)}
				// Committed on blur rather than per keystroke: every commit
				// rebuilds the GL scene, and doing that mid-word means compiling
				// a half-written shader on every character.
				onBlur={() => {
					if (draft !== null && draft !== shader.fragment) {
						onUpdateShader(shader.id, { fragment: draft });
					}
					setDraft(null);
				}}
			/>

			{missing.length ? (
				<div className="_sceneShaderMissing">
					Declared in the source but not in this scene:{' '}
					<strong>{missing.join(', ')}</strong>. Three binds values by name to uniforms
					the source declares; one with no value here stays at zero, which usually renders
					black.
					<button
						type="button"
						className="_sceneToolBtn"
						onClick={() =>
							onUpdateShader(shader.id, {
								uniforms: [
									...shader.uniforms,
									...missing.map(name => ({
										name,
										type: 'float' as const,
										value: 0,
									})),
								],
							})
						}
					>
						Add them as floats
					</button>
				</div>
			) : null}

			<div className="_sceneInspectorTitle">Uniforms</div>
			{shader.uniforms.map(u => (
				<label className="_sceneField" key={u.name}>
					<span>{u.name}</span>
					{u.type === 'color' ? (
						<input
							type="color"
							value={typeof u.value === 'string' ? u.value : '#000000'}
							onChange={e => onSetUniform(shader.id, u.name, e.target.value)}
						/>
					) : (
						<input
							type="number"
							step={0.05}
							value={typeof u.value === 'number' ? u.value : 0}
							onChange={e => {
								const n = Number(e.target.value);
								if (Number.isFinite(n)) onSetUniform(shader.id, u.name, n);
							}}
						/>
					)}
				</label>
			))}
			{!shader.uniforms.length ? (
				<p className="_sceneNote">This shader declares no uniforms of its own.</p>
			) : null}
		</div>
	);
}

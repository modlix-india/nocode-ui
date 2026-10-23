import React from 'react';

export interface AdSlotPicture {
	asset_id?: number | null;
	creative_id?: number | null;
	design_id?: number | null;
	url?: string;
	name?: string | null;
	width?: number;
	height?: number;
	shape?: string;
	source?: string;
	verdict?: string;
	reason?: string;
	/** May be absent when a picture has no asset_id yet — omitted by the backend in that case. */
	pick?: string;
	read?: {
		says?: string[];
		prices?: string[];
		rera_number?: string;
		drawn_cta?: string;
		photo?: string;
	} | null;
}

export interface AdSlotText {
	key: string;
	label: string;
	min: number;
	max: number;
	cap?: number | null;
	required: boolean;
	lines: Array<{ text: string; about?: string; pinned?: boolean }>;
}

export interface AdSlotCardPayload {
	type: 'adslot';
	rev: number;
	title?: string;
	format?: {
		key?: string;
		platform?: string;
		campaign_type?: string;
		parts?: string[];
	};
	account?: string;
	account_name?: string;
	destination?: string;
	slots?: Array<{
		key: string;
		label: string;
		kind?: string;
		min: number;
		max: number;
		required: boolean;
		recommended?: string;
		shapes?: string[];
		min_size?: [number, number] | null;
		placed?: AdSlotPicture[];
		choices?: AdSlotPicture[];
	}>;
	text?: AdSlotText[];
	cta?: {
		value?: string | null;
		label?: string;
		required: boolean;
		choices: Array<{ value: string; label: string; pick: string }>;
	};
	chat?: { value?: string | null; required: boolean; written: boolean };
	extras?: Array<{
		key: string;
		label: string;
		cap?: number | null;
		required: boolean;
		value: string;
	}>;
	owed?: Array<{
		key: string;
		kind: string;
		label: string;
		message: string;
		count: number;
	}>;
	checks?: Array<{
		check: string;
		severity: string;
		where: string;
		message: string;
	}>;
	facts?: Array<{
		key: string;
		value: string;
		known: boolean;
		source: string;
		source_url?: string;
	}>;
}

interface AdSlotCardProps {
	payload: AdSlotCardPayload;
	onPick?: (sendText: string, displayText: string, meta?: Record<string, any>) => void;
	disabled?: boolean;
	confirmed?: boolean;
	confirmedMeta?: Record<string, any>;
}

function pictureUrl(url?: string): string {
	if (!url) return '';
	if (/^https?:\/\//i.test(url)) return url;
	return url.startsWith('/') ? url : `/${url}`;
}

function shapeLabel(shape?: string): string {
	const labels: Record<string, string> = {
		'1.91:1': 'wide',
		'16:9': 'landscape',
		'1:1': 'square',
		'4:5': 'tall',
		'9:16': 'full screen',
	};
	return shape ? labels[shape] || shape : '';
}

/**
 * Convert a "W:H" shape string to a CSS aspect-ratio value.
 * Falls back to "1 / 1" for unknown or missing shapes so the thumbnail
 * always has some defined dimension rather than collapsing.
 */
function shapeToRatio(shape?: string): string {
	if (!shape) return '1 / 1';
	const [w, h] = shape.split(':').map(Number);
	if (!w || !h || isNaN(w) || isNaN(h)) return '1 / 1';
	return `${w} / ${h}`;
}

function readNote(picture: AdSlotPicture): string {
	const read = picture.read;
	if (!read) return '';
	const parts = [...(read.says || []).slice(0, 2), ...(read.prices || []).slice(0, 1)];
	if (read.rera_number) parts.push(`RERA ${read.rera_number}`);
	if (!parts.length && read.photo) parts.push(read.photo);
	return parts.join(' · ');
}

function Picture({
	picture,
	className,
	shapeStyle,
}: Readonly<{ picture: AdSlotPicture; className: string; shapeStyle?: React.CSSProperties }>) {
	const url = pictureUrl(picture.url);
	if (!url) {
		return <div className={`${className} _adPicEmpty`} style={shapeStyle}>No preview</div>;
	}
	return (
		<img
			className={className}
			src={url}
			alt={picture.name || 'Ad picture'}
			loading="lazy"
			style={shapeStyle}
		/>
	);
}

function SlotBlock({
	slot,
	onPick,
	disabled,
}: Readonly<{
	slot: NonNullable<AdSlotCardPayload['slots']>[number];
	onPick?: AdSlotCardProps['onPick'];
	disabled?: boolean;
}>) {
	const placed = slot.placed || [];
	const choices = slot.choices || [];
	const needed = Math.max(0, (slot.min || 0) - placed.length);
	return (
		<div className="_adSlot">
			<div className="_adSlotHead">
				<span className="_adSlotName">{slot.label}</span>
				<span className="_adSlotRule">
					{slot.min}–{slot.max}
					{slot.recommended ? ` · ${shapeLabel(slot.recommended)}` : ''}
				</span>
			</div>
			{placed.length > 0 ? (
				<div className="_adPictures">
					{placed.map(picture => (
						<div className="_adPicture" key={picture.asset_id ?? picture.url}>
							<Picture
								picture={picture}
								className="_adThumb"
								shapeStyle={{ aspectRatio: shapeToRatio(picture.shape), width: 72, height: 'auto' }}
							/>
							<div className="_adPictureMeta">
								<span className="_adPictureName">{picture.name || 'Picture'}</span>
								<span className="_adPictureShape">
									{shapeLabel(picture.shape) ||
										`${picture.width || 0}×${picture.height || 0}`}
								</span>
								{readNote(picture) ? (
									<span className="_adRead">{readNote(picture)}</span>
								) : null}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="_adEmpty">
					{needed > 0
						? `Add ${needed} picture${needed === 1 ? '' : 's'}.`
						: 'No picture placed.'}
				</div>
			)}
			{needed > 0 && choices.length > 0 ? (
				<div className="_adChoices">
					{choices.map(choice => (
						<button
							type="button"
							className="_adChoice"
							key={choice.asset_id ?? choice.url}
							disabled={disabled || !choice.pick || !onPick}
							onClick={() => {
								if (!choice.pick || !onPick) return;
								onPick(choice.pick, `Use ${choice.name || 'this picture'}`, {
									asset_id: choice.asset_id,
									slot: slot.key,
								});
							}}
						>
							<Picture picture={choice} className="_adChoiceThumb" />
							<span className="_adChoiceName">{choice.name || 'Picture'}</span>
							<span className="_adChoiceShape">
								{shapeLabel(choice.shape) ||
									`${choice.width || 0}×${choice.height || 0}`}
							</span>
						</button>
					))}
				</div>
			) : null}
			{needed > 0 && choices.length === 0 ? (
				<div className="_adEmpty _adEmptyHint">
					No stored picture fits this slot without a crop. Attach a new file.
				</div>
			) : null}
		</div>
	);
}

export function AdSlotCard({
	payload,
	onPick,
	disabled,
	confirmed,
	confirmedMeta,
}: Readonly<AdSlotCardProps>) {
	const slots = payload.slots || [];
	const text = payload.text || [];
	const owed = payload.owed || [];
	const checks = payload.checks || [];
	const facts = payload.facts || [];
	const account = payload.account_name || payload.account || 'No account selected';
	const title = payload.title || 'Ad creative';
	const formatLabel = payload.format?.key || '';
	const cta = payload.cta;
	const chat = payload.chat;
	const extras = payload.extras || [];

	return (
		<div className={`_adCard${confirmed ? ' _adCardConfirmed' : ''}`}>
			<div className="_adHead">
				<div>
					<div className="_adTitle">{title}</div>
					<div className="_adMeta">
						{formatLabel ? <span>{formatLabel}</span> : null}
						<span>{account}</span>
						<span>rev {payload.rev}</span>
					</div>
				</div>
				{payload.destination ? (
					<div className="_adDestination" title={payload.destination}>
						{payload.destination}
					</div>
				) : null}
			</div>

			{slots.length > 0 ? (
				<div className="_adSlots">
					{slots.map(slot => (
						<SlotBlock key={slot.key} slot={slot} onPick={onPick} disabled={disabled} />
					))}
				</div>
			) : null}

			{text.length > 0 ? (
				<div className="_adSection">
					<div className="_adSectionTitle">Copy</div>
					{text.map(slot => (
						<div className="_adTextSlot" key={slot.key}>
							<span className="_adTextLabel">{slot.label}</span>
							{slot.lines.length > 0 ? (
								slot.lines.map((line, index) => (
									<span className="_adLine" key={`${slot.key}-${index}`}>
										{line.text}
									</span>
								))
							) : (
								<span className="_adLine _adMissingLine">
									{slot.required ? 'Not written yet.' : 'Not used.'}
								</span>
							)}
						</div>
					))}
				</div>
			) : null}

			{cta && cta.choices.length > 0 ? (
				<div className="_adSection">
					<div className="_adSectionTitle">Button</div>
					<div className="_adChips">
						{cta.choices.map(choice => (
							<button
								type="button"
								key={choice.value}
								className={`_adChip${cta.value === choice.value ? ' _adChipOn' : ''}`}
								disabled={disabled || !onPick}
								onClick={() => {
									if (!onPick) return;
									onPick(choice.pick, `Button: ${choice.label}`, {
										cta: choice.value,
									});
								}}
							>
								{choice.label}
							</button>
						))}
					</div>
				</div>
			) : null}

			{(chat?.written || chat?.required) ? (
				<div className="_adSection">
					<div className="_adSectionTitle">First message</div>
					<div className={`_adLine${chat?.value ? '' : ' _adMissingLine'}`}>
						{chat?.value || 'Not written yet — ask the agent to write it.'}
					</div>
				</div>
			) : null}

			{extras.length > 0 ? (
				<div className="_adSection">
					<div className="_adSectionTitle">Details</div>
					{extras.map(extra => (
						<div className="_adKv" key={extra.key}>
							<span>{extra.label}</span>
							<span className={extra.value ? '' : '_adMissingLine'}>
								{extra.value || (extra.required ? 'Needed' : 'Not set')}
							</span>
						</div>
					))}
				</div>
			) : null}

			{facts.length > 0 ? (
				<div className="_adSection">
					<div className="_adSectionTitle">Checked against</div>
					{facts.map(fact => (
						<div className="_adKv" key={fact.key}>
							<span>{fact.key}</span>
							<span className={fact.known ? '' : '_adMissingLine'}>
								{fact.known && fact.value ? fact.value : 'Not known'}
								<span className="_adSource">
									{fact.known ? ` · ${fact.source}` : ' · ask the user'}
								</span>
							</span>
						</div>
					))}
				</div>
			) : null}

			{checks.length > 0 ? (
				<div className="_adSection">
					<div className="_adSectionTitle">Checks</div>
					{checks.map((check, index) => (
						<div
							className={`_adCheck _adCheck${check.severity}`}
							key={`${check.check}-${check.where}-${index}`}
						>
							<span className="_adCheckName">{check.check.replace(/_/g, ' ')}</span>
							<span>{check.message}</span>
						</div>
					))}
				</div>
			) : null}

			{owed.length > 0 ? (
				<div className="_adOwed">
					<div className="_adSectionTitle">Still needed</div>
					{owed.map(item => (
						<div key={`${item.kind}-${item.key}`}>{item.message}</div>
					))}
				</div>
			) : null}

			{confirmed ? (
				<div className="_adConfirmed">
					<i className="fa fa-check" style={{ marginRight: 6 }} aria-hidden="true" />
					{confirmedMeta?.asset_id
						? 'Picture selected.'
						: confirmedMeta?.cta
							? 'Button selected.'
							: 'Choice sent.'}
				</div>
			) : null}
		</div>
	);
}

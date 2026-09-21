/**
 * The bits the two analytics widgets both need to draw a readable time series.
 *
 * Shared rather than copied because they had already drifted once: the bars were identical
 * in both and neither had an axis, so a chart of thirty days with two busy ones read as a
 * chart with two bars in it.
 */

/**
 * `2026-09-20` as `20 Sep`. The engine answers days in a sortable format, which is the right
 * thing to send and the wrong thing to print under a bar. Anything else is returned as it
 * came: the same renderer draws event timelines whose buckets are not days.
 */
export function shortDay(label: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(label);
	if (!m) return label;
	const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	if (Number.isNaN(d.getTime())) return label;
	return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * Which buckets get a label: first, middle and last. Thirty dates under a 400px card is a
 * grey smear, and the two that answer "what period am I looking at?" are the ends.
 */
export function axisTicks(count: number): Array<number> {
	if (count <= 0) return [];
	if (count <= 3) return Array.from({ length: count }, (_, i) => i);
	return [0, Math.floor((count - 1) / 2), count - 1];
}

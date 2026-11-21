import React, { useEffect, useState } from 'react';
import { navigateTo } from '../../../functions/navigateTo';
import {
	DEFAULT_GROUP,
	GROUP_LABEL_MAX,
	GroupInfo,
	isUserGroupId,
	labelError,
	tabGroups,
	USER_GROUP_CAP,
} from '../groupsModel';
import { useReportGroups } from '../groupsStore';
import { namespaceOf } from '../reportApi';
import { Icon } from './common';
import { DashboardView, DashboardViewProps } from './DashboardView';
import { useCatalog } from './hooks';
import { Dialog } from './portal';

/**
 * A Dashboard over report groups (CONTRACT 9): the group it opens on (`group`), optional tabs
 * to switch groups in place (`groups`: "none" | "all" | list of ids) and an optional group
 * manager (New group, Rename, Delete with confirm) for the user's own groups. Each group is
 * its own DashboardView on its own document; a user group shows only once the user's groups
 * are in, so a stale link never creates a document for a group that does not exist.
 */

export interface GroupedDashboardViewProps extends Omit<DashboardViewProps, 'name'> {
	group: string;
	groups?: unknown;
	showGroupManager?: boolean;
	/**
	 * The app's group page, e.g. "/reportGroup/{id}". Set: a new group and a deleted current
	 * group navigate (the new group's page; the first remaining group of the user's, else the
	 * dashboard group). Not set: the dashboard switches in place.
	 */
	groupPagePath?: string;
}

/** The group page path for a group id: `{id}` replaced, else the id appended. */
export function groupPageHref(template: string, id: string): string {
	const t = template.trim();
	const enc = encodeURIComponent(id);
	return t.includes('{id}') ? t.split('{id}').join(enc) : `${t.replace(/\/+$/, '')}/${enc}`;
}

interface ManageState {
	kind: 'new' | 'rename' | 'delete';
	label: string;
	error?: string;
	busy?: boolean;
}

export function GroupedDashboardView(props: Readonly<GroupedDashboardViewProps>) {
	const { group, groups: groupsProp, showGroupManager, groupPagePath, ...rest } = props;
	const { transport } = rest;
	const app = rest.appNamespace || namespaceOf(rest.runFunction);
	const cat = useCatalog(transport, rest.catalogFunction);
	const groups = useReportGroups(transport, app, cat.catalog);
	const [active, setActive] = useState(group || DEFAULT_GROUP);
	const [manage, setManage] = useState<ManageState | undefined>(undefined);
	const [gone, setGone] = useState('');

	useEffect(() => setActive(group || DEFAULT_GROUP), [group]);

	const tabs = tabGroups(groupsProp, groups.all);
	const info: GroupInfo | undefined = groups.all.find(g => g.id === active);
	const userGroup = isUserGroupId(active);
	const knownMissing = userGroup && groups.status === 'ready' && !info;

	// Tabs over a group that went away (deleted here or elsewhere): the first tab.
	useEffect(() => {
		if (!tabs.length || !knownMissing) return;
		setActive(tabs[0].id);
	}, [tabs.length, knownMissing]); // eslint-disable-line react-hooks/exhaustive-deps

	// A title only when one is set, or on a group page (manager or tabs): then the group label.
	// A plain `group` shows none (the page has its own heading).
	const asGroupPage = !!showGroupManager || tabs.length > 0;
	const title = rest.title || (asGroupPage ? info?.label : undefined);
	const canAdd = groups.status === 'ready' && groups.user.groups.length < USER_GROUP_CAP;

	const submit = async () => {
		if (!manage) return;
		if (manage.kind !== 'delete') {
			const err = labelError(
				manage.label,
				groups.user,
				groups.app,
				manage.kind === 'rename' ? active : undefined,
			);
			if (err) return setManage({ ...manage, error: err });
		}
		setManage({ ...manage, busy: true, error: undefined });
		const r =
			manage.kind === 'new'
				? await groups.create(manage.label)
				: manage.kind === 'rename'
					? await groups.rename(active, manage.label)
					: await groups.remove(active);
		if (!r.ok) return setManage({ ...manage, busy: false, error: r.error });
		setManage(undefined);
		const pagePath = groupPagePath?.trim();
		if (manage.kind === 'new' && r.id) {
			setGone('');
			setActive(r.id);
			if (pagePath) navigateTo(groupPageHref(pagePath, r.id));
		} else if (manage.kind === 'delete') {
			if (pagePath) {
				const next =
					r.doc.groups
						.slice()
						.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
						.find(g => g.id !== active)?.id ?? DEFAULT_GROUP;
				setGone('');
				setActive(next);
				navigateTo(groupPageHref(pagePath, next));
			} else if (tabs.length) setActive(tabs.find(t => t.id !== active)?.id ?? DEFAULT_GROUP);
			else setGone(info?.label ?? '');
		}
	};

	const tools = showGroupManager ? (
		<div className="_rpGroupTools">
			<button
				type="button"
				className="_rpBtn"
				disabled={!canAdd}
				title={
					canAdd || groups.status !== 'ready'
						? undefined
						: `You can have at most ${USER_GROUP_CAP} groups of your own.`
				}
				onClick={() => setManage({ kind: 'new', label: '' })}
			>
				<Icon name="fa-folder-plus" /> New group
			</button>
			{info?.kind === 'user' ? (
				<>
					<button
						type="button"
						className="_rpBtn"
						onClick={() => setManage({ kind: 'rename', label: info.label })}
					>
						<Icon name="fa-pen" /> Rename
					</button>
					<button
						type="button"
						className="_rpBtn"
						onClick={() => setManage({ kind: 'delete', label: info.label })}
					>
						<Icon name="fa-trash" /> Delete
					</button>
				</>
			) : null}
		</div>
	) : null;

	const head =
		tabs.length || tools ? (
			<div className="_rpGroups">
				{tabs.length ? (
					<div className="_rpTabs" role="tablist" aria-label="Report groups">
						{tabs.map(t => (
							<button
								key={t.id}
								type="button"
								role="tab"
								className="_rpTab"
								aria-selected={t.id === active}
								onClick={() => {
									setGone('');
									setActive(t.id);
								}}
							>
								{t.label}
							</button>
						))}
					</div>
				) : null}
				{tools}
			</div>
		) : null;

	let body: React.ReactNode;
	if (userGroup && !info) {
		if (groups.status === 'error')
			body = (
				<div className="_rpWidget">
					<div className="_rpState" role="alert">
						<span className="_rpError">{groups.error}</span>
						<button type="button" className="_rpBtn" onClick={groups.retry}>
							Try again
						</button>
					</div>
				</div>
			);
		else if (groups.status === 'loading')
			body = (
				<div className="_rpWidget" aria-busy="true">
					<div className="_rpState">
						<div className="_rpSkeleton" style={{ width: '100%' }} />
					</div>
				</div>
			);
		else
			body = (
				<div className="_rpWidget">
					<div className="_rpState">
						<span className="_rpMuted">
							{gone
								? `The group ${gone} was deleted.`
								: 'This group no longer exists.'}
						</span>
					</div>
				</div>
			);
	} else body = <DashboardView key={active} {...rest} name={active} title={title} />;

	// No tabs, no manager: exactly the plain dashboard.
	if (!head) return <>{body}</>;

	return (
		<div className="_rpDash">
			{head}
			{body}
			{manage ? (
				<Dialog
					kind="modal"
					label={DIALOG_TITLES[manage.kind]}
					onClose={() => setManage(undefined)}
				>
					<form
						style={{ display: 'contents' }}
						onSubmit={e => {
							e.preventDefault();
							void submit();
						}}
					>
						<div className="_rpDrawerHead">
							<span>{DIALOG_TITLES[manage.kind]}</span>
							<button
								type="button"
								className="_rpIconBtn"
								aria-label="Close"
								title="Close"
								onClick={() => setManage(undefined)}
							>
								<Icon name="fa-xmark" />
							</button>
						</div>
						<div className="_rpDrawerBody">
							{manage.kind === 'delete' ? (
								<span>
									Delete the group {manage.label} and every widget in it? This
									cannot be undone.
								</span>
							) : (
								<label className="_rpLabel">
									Group name
									<input
										className="_rpInput"
										autoFocus
										maxLength={GROUP_LABEL_MAX}
										value={manage.label}
										onChange={e =>
											setManage(s =>
												s
													? {
															...s,
															label: e.target.value,
															error: undefined,
														}
													: s,
											)
										}
									/>
								</label>
							)}
							{manage.error ? (
								<div className="_rpError" role="alert">
									{manage.error}
								</div>
							) : null}
						</div>
						<div className="_rpDrawerFoot">
							<button
								type="button"
								className="_rpBtn"
								onClick={() => setManage(undefined)}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="_rpBtn _primary"
								disabled={manage.busy}
							>
								{manage.busy ? <Icon name="fa-spinner fa-spin" /> : null}
								{SUBMIT_LABELS[manage.kind]}
							</button>
						</div>
					</form>
				</Dialog>
			) : null}
		</div>
	);
}

const DIALOG_TITLES = { new: 'New group', rename: 'Rename group', delete: 'Delete group' };
const SUBMIT_LABELS = { new: 'Create', rename: 'Rename', delete: 'Delete' };

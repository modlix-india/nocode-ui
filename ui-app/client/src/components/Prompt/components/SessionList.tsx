import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

export interface Session {
	session_id: string;
	// Nullable on the wire: the service's own list model has it Optional, and a
	// session created by anything other than a typed message can arrive with no
	// title at all. `sessionLabel` is what turns that into something readable.
	title?: string | null;
	status?: string;
	updated_at?: string;
}

interface SessionListProps {
	sessions: Session[];
	activeSessionId: string | null;
	onSelectSession: (sessionId: string) => void;
	onNewChat: () => void;
	onDeleteSession: (sessionId: string) => void;
	onRenameSession: (sessionId: string, newTitle: string) => void;
	isOpen: boolean;
	onToggle: () => void;
	definition: ComponentDefinition;
	styleProperties: any;
	hasMore?: boolean;
	loadingMore?: boolean;
	onLoadMore?: () => void;
	newChatLabel?: string;
	yourChatsLabel?: string;
	deleteConfirmMessage?: string;
	sidebarWidth?: number;
	sidebarRef?: React.RefObject<HTMLDivElement | null>;
	onResizeStart?: (e: React.MouseEvent) => void;
	newChatSidebarIcon?: string;
	renameIcon?: string;
	deleteIcon?: string;
}

/** What to draw for a chat that has no title.
 *
 * A session can reach the list unnamed — a build the agent ran on its own, a
 * send that carried only an attachment — and an empty row is worse than a dull
 * one: it renders as a blank line nobody can tell from the chat above it or
 * click with any idea of what they are opening.
 */
function sessionLabel(session: Session): string {
	return session.title?.trim() || 'Untitled chat';
}

export function SessionList({
	sessions,
	activeSessionId,
	onSelectSession,
	onNewChat,
	onDeleteSession,
	onRenameSession,
	isOpen,
	onToggle,
	definition,
	styleProperties,
	hasMore,
	loadingMore,
	onLoadMore,
	newChatLabel = 'New chat',
	yourChatsLabel = 'Your chats',
	deleteConfirmMessage = 'Delete this chat? This action cannot be undone.',
	sidebarWidth,
	sidebarRef,
	onResizeStart,
	newChatSidebarIcon = 'fa fa-plus',
	renameIcon = 'fa fa-pen',
	deleteIcon = 'fa fa-trash',
}: Readonly<SessionListProps>) {
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState('');
	const renameInputRef = useRef<HTMLInputElement>(null);

	const handleDeleteClick = useCallback(
		(e: React.MouseEvent, sessionId: string) => {
			e.stopPropagation();
			setConfirmDeleteId(sessionId);
		},
		[],
	);

	const handleConfirmDelete = useCallback(() => {
		if (confirmDeleteId) {
			onDeleteSession(confirmDeleteId);
			setConfirmDeleteId(null);
		}
	}, [confirmDeleteId, onDeleteSession]);

	const handleCancelDelete = useCallback(() => {
		setConfirmDeleteId(null);
	}, []);

	const handleRenameClick = useCallback(
		(e: React.MouseEvent, session: Session) => {
			e.stopPropagation();
			setEditingId(session.session_id);
			setEditingTitle(session.title ?? '');
		},
		[],
	);

	const handleRenameConfirm = useCallback(() => {
		if (editingId && editingTitle.trim()) {
			onRenameSession(editingId, editingTitle.trim());
		}
		setEditingId(null);
		setEditingTitle('');
	}, [editingId, editingTitle, onRenameSession]);

	const handleRenameCancel = useCallback(() => {
		setEditingId(null);
		setEditingTitle('');
	}, []);

	const handleRenameKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				handleRenameConfirm();
			} else if (e.key === 'Escape') {
				handleRenameCancel();
			}
		},
		[handleRenameConfirm, handleRenameCancel],
	);

	useEffect(() => {
		if (editingId && renameInputRef.current) {
			renameInputRef.current.focus();
			renameInputRef.current.select();
		}
	}, [editingId]);

	return (
		<>
			<div
				ref={sidebarRef}
				className={`_sessionSidebar ${isOpen ? '_open' : '_collapsed'}`}
				style={{
					...(styleProperties?.sessionSidebar ?? {}),
					...(sidebarWidth && isOpen ? { width: `${sidebarWidth}px` } : {}),
				}}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="sessionSidebar"
				/>
				<div
					className="_sidebarHeader"
					style={styleProperties?.sidebarHeader ?? {}}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="sidebarHeader"
					/>
					<button
						className="_newChatButton"
						onClick={onNewChat}
						title={newChatLabel}
						style={styleProperties?.newChatButton ?? {}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="newChatButton"
						/>
						<i className={newChatSidebarIcon} />
						<span>{newChatLabel}</span>
					</button>
					</div>

				{sessions.length > 0 && (
					<div className="_sessionGroup">
						<div className="_sessionGroupLabel">
							{yourChatsLabel}
						</div>
						<div className="_sessionItems">
							{sessions.map(s => (
								<div
									key={s.session_id}
									className={`_sessionItem ${
										s.session_id === activeSessionId
											? '_active'
											: ''
									}`}
									onClick={() =>
										editingId !== s.session_id &&
										onSelectSession(s.session_id)
									}
									onKeyDown={e => {
										if (
											e.key === 'Enter' &&
											editingId !== s.session_id
										) {
											onSelectSession(s.session_id);
										}
									}}
									title={sessionLabel(s)}
									style={
										styleProperties?.sessionItem ?? {}
									}
									role="button"
									tabIndex={0}
								>
									<SubHelperComponent
										definition={definition}
										subComponentName="sessionItem"
									/>
									{editingId === s.session_id ? (
										<input
											ref={renameInputRef}
											className="_sessionRenameInput"
											value={editingTitle}
											onChange={e =>
												setEditingTitle(
													e.target.value,
												)
											}
											onKeyDown={handleRenameKeyDown}
											onBlur={handleRenameConfirm}
											onClick={e =>
												e.stopPropagation()
											}
										/>
									) : (
										<>
											<span className="_sessionTitle">
												{sessionLabel(s)}
											</span>
											<div className="_sessionActions">
												<button
													className="_renameSessionButton"
													onClick={e =>
														handleRenameClick(
															e,
															s,
														)
													}
													title="Rename session"
												>
													<i className={renameIcon} />
												</button>
												<button
													className="_deleteSessionButton"
													onClick={e =>
														handleDeleteClick(
															e,
															s.session_id,
														)
													}
													title="Delete session"
												>
													<i className={deleteIcon} />
												</button>
											</div>
										</>
									)}
								</div>
							))}
							{hasMore && (
								<button
									className="_loadMoreSessions"
									onClick={onLoadMore}
									disabled={loadingMore}
								>
									{loadingMore
										? 'Loading...'
										: 'Load more'}
								</button>
							)}
						</div>
					</div>
				)}
				{onResizeStart && isOpen && (
					<div
						className="_sidebarResizeHandle"
						onMouseDown={onResizeStart}
						role="separator"
						aria-orientation="vertical"
					/>
				)}
			</div>

			{isOpen && (
				<div
					className="_sidebarOverlay"
					onClick={onToggle}
					role="presentation"
				/>
			)}

			{confirmDeleteId && (
				<div
					className="_deleteConfirmOverlay"
					onClick={handleCancelDelete}
					role="presentation"
				>
					<div
						className="_deleteConfirmDialog"
						onClick={e => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						<p className="_deleteConfirmText">
							{deleteConfirmMessage}
						</p>
						<div className="_deleteConfirmActions">
							<button
								className="_deleteConfirmCancel"
								onClick={handleCancelDelete}
							>
								Cancel
							</button>
							<button
								className="_deleteConfirmDelete"
								onClick={handleConfirmDelete}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

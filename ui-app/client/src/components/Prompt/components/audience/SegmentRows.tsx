import React from 'react';

// A list, not a grid - demographics keeps the table, it genuinely has three columns.
export function SegmentRows({
	rows,
	sectionKey,
	canDelete,
	acting,
	pendingDelete,
	setPendingDelete,
	loading,
	onDelete,
	shortPath,
}: Readonly<{
	rows: Record<string, any>[];
	sectionKey: string;
	canDelete: boolean;
	acting: boolean;
	pendingDelete: string | null;
	setPendingDelete: (id: string | null) => void;
	loading: (id: string) => boolean;
	onDelete: (id: string, row: Record<string, any>) => void;
	shortPath: (category: string) => string;
}>) {
	const anyPath = rows.some(r => r.category);
	return (
		<div className="_audItems">
			<div className="_audItemsHead">
				<span>Items</span>
				{anyPath && <span className="_audItemsHeadPath">Sits under</span>}
			</div>
			{rows.map((row, ri) => {
				const key = row.segment ?? String(ri);
				const delId = `${sectionKey}:${key}`;
				const pending = pendingDelete === delId;
				const category = String(row.category ?? '');
				return (
					<div key={delId} className={`_audItem${pending ? ' _pending' : ''}`}>
						<div className="_audItemMain">
							<div className="_audItemLabel">{row.segment}</div>
							{row.rationale && <div className="_audItemWhy">{row.rationale}</div>}
						</div>
						{category && (
							<div className="_audItemPath" title={category}>
								{shortPath(category)}
							</div>
						)}
						{canDelete && (
							<div className="_audItemActions">
								{pending ? (
									<>
										<button
											type="button"
											className="_kwDeleteBtn"
											title="Confirm remove"
											aria-label={`Confirm remove ${row.segment}`}
											disabled={acting}
											onClick={() => onDelete(delId, row)}
										>
											<i
												className={`fa fa-solid ${
													loading(delId)
														? 'fa-spinner fa-spin'
														: 'fa-check'
												}`}
											/>
										</button>
										<button
											type="button"
											className="_kwCancelBtn"
											title="Cancel"
											aria-label="Cancel remove"
											onClick={() => setPendingDelete(null)}
										>
											<i className="fa fa-solid fa-xmark" />
										</button>
									</>
								) : (
									<button
										type="button"
										className="_kwDeleteBtn"
										title="Remove"
										aria-label={`Remove ${row.segment}`}
										disabled={acting}
										onClick={() => setPendingDelete(delId)}
									>
										<i className="fa fa-solid fa-trash" />
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

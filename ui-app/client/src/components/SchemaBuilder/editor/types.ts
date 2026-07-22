import { Repository, Schema } from '@fincity/kirun-js';
import { ReactNode } from 'react';

export type SchemaEditorMode = 'COMPACT' | 'EXTENDED' | 'JSON';

export type TreeNodeKind = 'root' | 'property' | 'item' | 'tupleItem' | 'sub';

export interface TreeNodeProps {
	schema: any;
	path: string;
	depth: number;
	kind: TreeNodeKind;
	propName?: string;
	parentSchema?: any;
	parentPath?: string;
	label?: string;
	lockedType?: string;
	showNameNamespace?: boolean;
	onDelete?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
}

export interface TreeContext {
	mode: 'COMPACT' | 'EXTENDED';
	readOnly: boolean;
	schemaRepository: Repository<Schema>;
	updateAt: (path: string, v: any) => void;
	isExpanded: (path: string, depth: number) => boolean;
	toggleExpand: (path: string) => void;
	isDetailsOpen: (path: string) => boolean;
	toggleDetails: (path: string) => void;
	renderTree: (props: TreeNodeProps) => ReactNode;
}

export function relChange(path: string, ctx: TreeContext) {
	return (rel: string, v: any) => ctx.updateAt(path ? `${path}.${rel}` : rel, v);
}

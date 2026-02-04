import { usedComponents } from '../App/usedComponents';
import KIRunEditorStyle from '../components/KIRunEditor/KIRunEditorStyle';
import { lazyCSSURL } from '../components/util/lazyStylePropertyUtil';

const NAME = 'DebugWindow';

export default function DebugWindowStyle() {
	usedComponents.using('KIRun Editor');
	return <>
		<link rel="stylesheet" href={lazyCSSURL(NAME)} />
		<KIRunEditorStyle theme={new Map()}/>
	</>;
}

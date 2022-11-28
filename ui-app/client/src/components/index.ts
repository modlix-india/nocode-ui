import Button from './Button';
import CheckBox from './CheckBox';
import Grid from './Grid';
import Label from './Label';
import Link from './Link';
import Page from './Page';
import RadioButton from './RadioButton';
import TextBox from './TextBox/TextBox';
import ToggleButton from './ToggleButton';
import ArrayRepeater from './ArrayRepeater';

export default new Map<string, React.ElementType>([
	['Button', Button.component],
	['Grid', Grid.component],
	['Page', Page],
	['Label', Label.component],
	['CheckBox', CheckBox.component],
	['RadioButton', RadioButton.component],
	['ToggleButton', ToggleButton.component],
	['TextBox', TextBox.component],
	['Link', Link.component],
	['ArrayRepeater', ArrayRepeater.component],
]);

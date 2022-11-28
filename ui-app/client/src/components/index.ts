import Button from './Button';
import CheckBox from './CheckBox';
import Grid from './Grid';
import Label from './Label';
import Link from './Link';
import Page from './Page';
import RadioButton from './RadioButton';
import TextBox from './TextBox/TextBox';
import ToggleButton from './ToggleButton';
import ArrayRepeator from './ArrayRepeator';

export default new Map<string, React.ElementType>([
	['Button', Button],
	['Grid', Grid],
	['Page', Page],
	['Label', Label],
	['CheckBox', CheckBox],
	['RadioButton', RadioButton],
	['ToggleButton', ToggleButton],
	['TextBox', TextBox.component],
	['Link', Link],
	['ArrayRepeator', ArrayRepeator],
]);

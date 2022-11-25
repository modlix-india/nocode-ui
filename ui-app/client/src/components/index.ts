import Button from './Button';
import CheckBox from './CheckBox';
import Grid from './Grid';
import Label from './Label';
import Link from './Link';
import Page from './Page';
import RadioButton from './RadioButton';
import TextBox from './TextBox';
import ToggleButton from './ToggleButton';
import ArrayRepeator from './ArrayRepeator';
import Tabs from './Tabs';
import  Image from './Image';

export default new Map<string, React.ElementType>([
	['Button', Button],
	['Grid', Grid],
	['Page', Page],
	['Label', Label],
	['CheckBox', CheckBox],
	['RadioButton', RadioButton],
	['ToggleButton', ToggleButton],
	['TextBox', TextBox],
	['Link', Link],
	['ArrayRepeator', ArrayRepeator],
	['Tabs', Tabs],
	['Image', Image]
]);

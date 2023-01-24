import Button from './Button/Button';
import CheckBox from './CheckBox/CheckBox';
import Grid from './Grid/Grid';
import Label from './Label/Label';
import Link from './Link/Link';
import Page from './Page';
import RadioButton from './RadioButton/RadioButton';
import TextBox from './TextBox/TextBox';
import Calendar from './Calendar/Calendar';
import ToggleButton from './ToggleButton/ToggleButton';
import ArrayRepeater from './ArrayRepeater/ArrayRepeater';
import Popup from './Popup/Popup';
import Dropdown from './Dropdown/Dropdown';
import Menu from './Menu/Menu';
import Tags from './Tags/Tags';
import Image from './Image/Image';
import Icon from './Icon/Icon';
import Text from './Text/Text';

export const Components = new Map<string, React.ElementType>([
	[Button.name, Button.component],
	[Grid.name, Grid.component],
	['Page', Page],
	[Label.name, Label.component],
	[CheckBox.name, CheckBox.component],
	[RadioButton.name, RadioButton.component],
	[ToggleButton.name, ToggleButton.component],
	[TextBox.name, TextBox.component],
	[Calendar.name, Calendar.component],
	[Link.name, Link.component],
	[ArrayRepeater.name, ArrayRepeater.component],
	[Popup.name, Popup.component],
	[Dropdown.name, Dropdown.component],
	[Menu.name, Menu.component],
	[Tags.name, Tags.component],
	[Image.name, Image.component],
	[Icon.name, Icon.component],
	[Text.name, Text.component],
]);

export const ComponentDefinitions = [
	Button,
	Grid,
	Label,
	CheckBox,
	RadioButton,
	ToggleButton,
	TextBox,
	Calendar,
	Link,
	ArrayRepeater,
	Popup,
	Dropdown,
	Menu,
	Tags,
	Image,
	Icon,
	Text,
];

import Button from './Button/Button';
import CheckBox from './CheckBox/CheckBox';
import Grid from './Grid/Grid';
import Label from './Label/Label';
import Link from './Link/Link';
import Page from './Page/Page';
import RadioButton from './RadioButton/RadioButton';
import TextBox from './TextBox/TextBox';
import ToggleButton from './ToggleButton/ToggleButton';
import ArrayRepeater from './ArrayRepeater/ArrayRepeater';
import Popup from './Popup/Popup';
import Dropdown from './Dropdown/Dropdown';
import Menu from './Menu/Menu';
import Tags from './Tags/Tags';
import Image from './Image/Image';
import Tabs from './Tabs/Tabs';
import Icon from './Icon/Icon';
import Text from './Text/Text';
import TextList from './TextList/TextList';
import Stepper from './Stepper/Stepper';
import Table from './Table/Table';
import TableGrid from './TableGrid/TableGrid';
import TableColumns from './TableColumns/TableColumns';
import TableEmptyGrid from './TableEmptyGrid/TableEmptyGrid';
import TablePreviewGrid from './TablePreviewGrid/TablePreviewGrid';
import TextEditor from './TextEditor/TextEditor';
import TableColumn from './TableColumn/TableColumn';
import TableColumnHeader from './TableColumnHeader/TableColumnHeader';
import ProgressBar from './ProgressBar/ProgressBar';
import Popover from './Popover/Popover';

export const Components = new Map<string, React.ElementType>([
	[Button.name, Button.component],
	[Grid.name, Grid.component],
	[Page.name, Page.component],
	[Label.name, Label.component],
	[CheckBox.name, CheckBox.component],
	[RadioButton.name, RadioButton.component],
	[ToggleButton.name, ToggleButton.component],
	[TextBox.name, TextBox.component],
	[Link.name, Link.component],
	[ArrayRepeater.name, ArrayRepeater.component],
	[Popup.name, Popup.component],
	[Dropdown.name, Dropdown.component],
	[Menu.name, Menu.component],
	[Tags.name, Tags.component],
	[Image.name, Image.component],
	[Tabs.name, Tabs.component],
	[Icon.name, Icon.component],
	[Text.name, Text.component],
	[TextList.name, TextList.component],
	[Stepper.name, Stepper.component],
	[Table.name, Table.component],
	[TableGrid.name, TableGrid.component],
	[TableEmptyGrid.name, TableEmptyGrid.component],
	[TablePreviewGrid.name, TablePreviewGrid.component],
	[TextEditor.name, TextEditor.component],
	[TableColumns.name, TableColumns.component],
	[TableColumn.name, TableColumn.component],
	[TableColumnHeader.name, TableColumnHeader.component],
	[ProgressBar.name, ProgressBar.component],
	[Popover.name, Popover.component],
]);

export const ComponentDefinitions = [
	Button,
	Grid,
	Label,
	CheckBox,
	RadioButton,
	ToggleButton,
	TextBox,
	Link,
	ArrayRepeater,
	Popup,
	Dropdown,
	Menu,
	Tags,
	Image,
	Tabs,
	Icon,
	Text,
	TextList,
	Page,
	Stepper,
	Table,
	TableEmptyGrid,
	TableGrid,
	TablePreviewGrid,
	TextEditor,
	TableColumns,
	TableColumn,
	TableColumnHeader,
	ProgressBar,
	Popover,
];

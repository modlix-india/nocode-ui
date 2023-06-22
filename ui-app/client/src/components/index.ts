import Button from './Button/Button';
import ButtonBar from './Buttonbar/ButtonBar';
import CheckBox from './CheckBox/CheckBox';
import Grid from './Grid/Grid';
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
import SubPage from './SubPage/SubPage';
import PageEditor from './PageEditor/PageEditor';
import { Component } from '../types/common';
import Iframe from './Iframe/Iframe';
import Carousel from './Carousel/Carousel';
import FileUpload from './FileUpload/FileUpload';
import KIRunEditor from './KIRunEditor/KIRunEditor';
import Video from './Video/Video';
import SchemaForm from './SchemaForm/SchemaForm';
import SchemaBuilder from './SchemaBuilder/SchemaBuilder';
import Gallery from './Gallery/Gallery';

export default new Map<string, Component>([
	[Button.name, Button],
	[ButtonBar.name, ButtonBar],
	[Grid.name, Grid],
	[Page.name, Page],
	[CheckBox.name, CheckBox],
	[RadioButton.name, RadioButton],
	[ToggleButton.name, ToggleButton],
	[TextBox.name, TextBox],
	[Link.name, Link],
	[ArrayRepeater.name, ArrayRepeater],
	[Popup.name, Popup],
	[Dropdown.name, Dropdown],
	[Menu.name, Menu],
	[Tags.name, Tags],
	[Image.name, Image],
	[Tabs.name, Tabs],
	[Icon.name, Icon],
	[Text.name, Text],
	[TextList.name, TextList],
	[Stepper.name, Stepper],
	[Table.name, Table],
	[TableGrid.name, TableGrid],
	[TableEmptyGrid.name, TableEmptyGrid],
	[TablePreviewGrid.name, TablePreviewGrid],
	[TextEditor.name, TextEditor],
	[TableColumns.name, TableColumns],
	[TableColumn.name, TableColumn],
	[TableColumnHeader.name, TableColumnHeader],
	[ProgressBar.name, ProgressBar],
	[SubPage.name, SubPage],
	[PageEditor.name, PageEditor],
	[Iframe.name, Iframe],
	[Carousel.name, Carousel],
	[Popover.name, Popover],
	[FileUpload.name, FileUpload],
	[KIRunEditor.name, KIRunEditor],
	[Video.name, Video],
	[SchemaForm.name, SchemaForm],
	[SchemaBuilder.name, SchemaBuilder],
	[Gallery.name, Gallery],
]);

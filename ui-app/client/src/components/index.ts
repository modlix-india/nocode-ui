import { Component } from '../types/common';
import Animator from './Animator/Animator';
import ArrayRepeater from './ArrayRepeater/ArrayRepeater';
import Button from './Button/Button';
import ButtonBar from './Buttonbar/ButtonBar';
import Carousel from './Carousel/Carousel';
import CheckBox from './CheckBox/CheckBox';
import Dropdown from './Dropdown/Dropdown';
import FileUpload from './FileUpload/FileUpload';
import Gallery from './Gallery/Gallery';
import Grid from './Grid/Grid';
import Icon from './Icon/Icon';
import Iframe from './Iframe/Iframe';
import Image from './Image/Image';
import KIRunEditor from './KIRunEditor/KIRunEditor';
import Link from './Link/Link';
import Menu from './Menu/Menu';
import Page from './Page/Page';
import PageEditor from './PageEditor/PageEditor';
import Popover from './Popover/Popover';
import Popup from './Popup/Popup';
import ProgressBar from './ProgressBar/ProgressBar';
import RadioButton from './RadioButton/RadioButton';
import SchemaBuilder from './SchemaBuilder/SchemaBuilder';
import SchemaForm from './SchemaForm/SchemaForm';
import Stepper from './Stepper/Stepper';
import SubPage from './SubPage/SubPage';
import Table from './Table/Table';
import TableColumn from './TableColumn/TableColumn';
import TableColumnHeader from './TableColumnHeader/TableColumnHeader';
import TableColumns from './TableColumns/TableColumns';
import TableDynamicColumns from './TableDynamicColumns/TableDynamicColumns';
import TableEmptyGrid from './TableEmptyGrid/TableEmptyGrid';
import TableGrid from './TableGrid/TableGrid';
import TablePreviewGrid from './TablePreviewGrid/TablePreviewGrid';
import Tabs from './Tabs/Tabs';
import Tags from './Tags/Tags';
import Text from './Text/Text';
import TextArea from './TextArea/TextArea';
import TextBox from './TextBox/TextBox';
import TextEditor from './TextEditor/TextEditor';
import TextList from './TextList/TextList';
import ToggleButton from './ToggleButton/ToggleButton';
import Video from './Video/Video';
import ImageWithBrowser from './ImageWithBrowser/ImageWithBrowser';
import FillerValueEditor from './FillerValueEditor/FillerValueEditor';
import ColorPicker from './ColorPicker/ColorPicker';
import Jot from './Jot/Jot';
import FillerDefinitionEditor from './FillerDefinitionEditor/FillerDefinitionEditor';
import FormStorageEditor from './FormStorageEditor/FormStorageEditor';
import SectionGrid from './SectionGrid/SectionGrid';
import PhoneNumber from './PhoneNumber/PhoneNumber';
import SmallCarousel from './SmallCarousel/SmallCarousel';
import Otp from './Otp/Otp';
import Chart from './Chart/Chart';
import Calendar from './Calendar/Calendar';
import TemplateEditor from './TemplateEditor/TemplateEditor';
import FileSelector from './FileSelector/FileSelector';
import RangeSlider from './RangeSlider/RangeSlider';

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
	[TextArea.name, TextArea],
	[TableDynamicColumns.name, TableDynamicColumns],
	[Animator.name, Animator],
	[ImageWithBrowser.name, ImageWithBrowser],
	[FillerValueEditor.name, FillerValueEditor],
	[ColorPicker.name, ColorPicker],
	[Jot.name, Jot],
	[FillerDefinitionEditor.name, FillerDefinitionEditor],
	[FormStorageEditor.name, FormStorageEditor],
	[SectionGrid.name, SectionGrid],
	[PhoneNumber.name, PhoneNumber],
	[SmallCarousel.name, SmallCarousel],
	[Otp.name, Otp],
	[Chart.name, Chart],
	[Calendar.name, Calendar],
	[TemplateEditor.name, TemplateEditor],
	[FileSelector.name, FileSelector],
	[RangeSlider.name, RangeSlider],
]); 

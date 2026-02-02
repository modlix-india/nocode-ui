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
import Link from './Link/Link';
import Menu from './Menu/Menu';
import Page from './Page/Page';
import Popover from './Popover/Popover';
import Popup from './Popup/Popup';
import ProgressBar from './ProgressBar/ProgressBar';
import RadioButton from './RadioButton/RadioButton';
import Stepper from './Stepper/Stepper';
import SubPage from './SubPage/SubPage';
import {
	Table,
	TableColumn,
	TableColumnHeader,
	TableColumns,
	TableDynamicColumn,
	TableEmptyGrid,
	TableGrid,
	TablePreviewGrid,
	TableRow,
} from './TableComponents';

import Tabs from './Tabs/Tabs';
import Tags from './Tags/Tags';
import Text from './Text/Text';
import TextArea from './TextArea/TextArea';
import TextBox from './TextBox/TextBox';
import TextList from './TextList/TextList';
import ToggleButton from './ToggleButton/ToggleButton';
import Video from './Video/Video';
import ImageWithBrowser from './ImageWithBrowser/ImageWithBrowser';
import ColorPicker from './ColorPicker/ColorPicker';
import SectionGrid from './SectionGrid/SectionGrid';
import PhoneNumber from './PhoneNumber/PhoneNumber';
import SmallCarousel from './SmallCarousel/SmallCarousel';
import Otp from './Otp/Otp';
import Calendar from './Calendar/Calendar';
import RangeSlider from './RangeSlider/RangeSlider';
import Timer from './Timer/Timer';
import MarkdownEditor from './MarkdownEditor/MarkdownEditor';
import MarkdownTOC from './MarkdownTOC/MarkdownTOC';
import Audio from './Audio/Audio';
import ThemeEditor from './ThemeEditor/ThemeEditor';
import SSEventListener from './SSEventListener/SSEventListener';
import Chart from './Chart/Chart';
import FileSelector from './FileSelector/FileSelector';
// import Jot from './Jot/Jot';
import FillerDefinitionEditor from './FillerDefinitionEditor/FillerDefinitionEditor';
import FillerValueEditor from './FillerValueEditor/FillerValueEditor';
import KIRunEditor from './KIRunEditor/KIRunEditor';
import FormEditor from './FormEditor/FormEditor';
import Form from './Form/Form';
import PageEditor from './PageEditor/PageEditor';
import SchemaBuilder from './SchemaBuilder/SchemaBuilder';
import SchemaForm from './SchemaForm/SchemaForm';
import TemplateEditor from './TemplateEditor/TemplateEditor';
import TextEditor from './TextEditor/TextEditor';

const componentMap = new Map<string, Component>([
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
	[TableColumns.name, TableColumns],
	[TableColumn.name, TableColumn],
	[TableColumnHeader.name, TableColumnHeader],
	[ProgressBar.name, ProgressBar],
	[SubPage.name, SubPage],
	[Iframe.name, Iframe],
	[Carousel.name, Carousel],
	[Popover.name, Popover],
	[FileUpload.name, FileUpload],
	[Video.name, Video],
	[Gallery.name, Gallery],
	[TextArea.name, TextArea],
	[TableDynamicColumn.name, TableDynamicColumn],
	[Animator.name, Animator],
	[ImageWithBrowser.name, ImageWithBrowser],
	[ColorPicker.name, ColorPicker],
	[SectionGrid.name, SectionGrid],
	[PhoneNumber.name, PhoneNumber],
	[SmallCarousel.name, SmallCarousel],
	[Otp.name, Otp],
	[Calendar.name, Calendar],
	[RangeSlider.name, RangeSlider],
	[Timer.name, Timer],
	[MarkdownEditor.name, MarkdownEditor],
	[MarkdownTOC.name, MarkdownTOC],
	[Audio.name, Audio],
	[SSEventListener.name, SSEventListener],
	[Chart.name, Chart],
	[FileSelector.name, FileSelector],
	[FillerDefinitionEditor.name, FillerDefinitionEditor],
	[FillerValueEditor.name, FillerValueEditor],
	[KIRunEditor.name, KIRunEditor],
	[FormEditor.name, FormEditor],
	[PageEditor.name, PageEditor],
	[SchemaBuilder.name, SchemaBuilder],
	[SchemaForm.name, SchemaForm],
	[TemplateEditor.name, TemplateEditor],
	[TextEditor.name, TextEditor],
	[ThemeEditor.name, ThemeEditor],
	[Form.name, Form],
	[TableRow.name, TableRow],
]);

export default componentMap;

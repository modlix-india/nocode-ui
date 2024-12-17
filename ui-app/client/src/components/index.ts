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
import TextList from './TextList/TextList';
import ToggleButton from './ToggleButton/ToggleButton';
import Video from './Video/Video';
import ImageWithBrowser from './ImageWithBrowser/ImageWithBrowser';
import ColorPicker from './ColorPicker/ColorPicker';
import SectionGrid from './SectionGrid/SectionGrid';
import PhoneNumber from './PhoneNumber/PhoneNumber';
import SmallCarousel from './SmallCarousel/SmallCarousel';
import Otp from './Otp/Otp';
import TableDynamicColumn from './TableDynamicColumn/TableDynamicColumn';
import Calendar from './Calendar/Calendar';
import RangeSlider from './RangeSlider/RangeSlider';
import Timer from './Timer/Timer';
import MarkdownEditor from './MarkdownEditor/MarkdownEditor';
import MarkdownTOC from './MarkdownTOC/MarkdownTOC';

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
	[TableDynamicColumns.name, TableDynamicColumns],
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
]);

import Chart from './Chart/Chart';
import FileSelector from './FileSelector/FileSelector';
import Jot from './Jot/Jot';
import FillerDefinitionEditor from './FillerDefinitionEditor/FillerDefinitionEditor';
import FillerValueEditor from './FillerValueEditor/FillerValueEditor';
import KIRunEditor from './KIRunEditor/KIRunEditor';
import FormStorageEditor from './FormStorageEditor/FormStorageEditor';
import PageEditor from './PageEditor/PageEditor';
import SchemaBuilder from './SchemaBuilder/SchemaBuilder';
import SchemaForm from './SchemaForm/SchemaForm';
import TemplateEditor from './TemplateEditor/TemplateEditor';
import TextEditor from './TextEditor/TextEditor';

componentMap.set(Chart.name, Chart);
componentMap.set(FileSelector.name, FileSelector);
componentMap.set(Jot.name, Jot);
componentMap.set(FillerDefinitionEditor.name, FillerDefinitionEditor);
componentMap.set(FillerValueEditor.name, FillerValueEditor);
componentMap.set(KIRunEditor.name, KIRunEditor);
componentMap.set(FormStorageEditor.name, FormStorageEditor);
componentMap.set(PageEditor.name, PageEditor);
componentMap.set(SchemaBuilder.name, SchemaBuilder);
componentMap.set(SchemaForm.name, SchemaForm);
componentMap.set(TemplateEditor.name, TemplateEditor);
componentMap.set(TextEditor.name, TextEditor);

export default componentMap;

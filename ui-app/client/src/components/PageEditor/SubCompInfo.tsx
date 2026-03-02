import React from 'react';

import Animator from '../Animator/Animator';
import ArrayRepeater from '../ArrayRepeater/ArrayRepeater';
import Button from '../Button/Button';
import ButtonBar from '../Buttonbar/ButtonBar';
import Carousel from '../Carousel/Carousel';
import CheckBox from '../CheckBox/CheckBox';
import Dropdown from '../Dropdown/Dropdown';
import FileUpload from '../FileUpload/FileUpload';
import Gallery from '../Gallery/Gallery';
import Grid from '../Grid/Grid';
import Icon from '../Icon/Icon';
import Iframe from '../Iframe/Iframe';
import Image from '../Image/Image';
import Link from '../Link/Link';
import Menu from '../Menu/Menu';
import Page from '../Page/Page';
import Popover from '../Popover/Popover';
import Popup from '../Popup/Popup';
import ProgressBar from '../ProgressBar/ProgressBar';
import RadioButton from '../RadioButton/RadioButton';
import Stepper from '../Stepper/Stepper';
import SubPage from '../SubPage/SubPage';
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
} from '../TableComponents';

import Tabs from '../Tabs/Tabs';
import Tags from '../Tags/Tags';
import Text from '../Text/Text';
import TextArea from '../TextArea/TextArea';
import TextBox from '../TextBox/TextBox';
import TextList from '../TextList/TextList';
import ToggleButton from '../ToggleButton/ToggleButton';
import Video from '../Video/Video';
import ImageWithBrowser from '../ImageWithBrowser/ImageWithBrowser';
import ColorPicker from '../ColorPicker/ColorPicker';
import SectionGrid from '../SectionGrid/SectionGrid';
import PhoneNumber from '../PhoneNumber/PhoneNumber';
import SmallCarousel from '../SmallCarousel/SmallCarousel';
import Otp from '../Otp/Otp';
import Calendar from '../Calendar/Calendar';
import RangeSlider from '../RangeSlider/RangeSlider';
import Timer from '../Timer/Timer';
import MarkdownEditor from '../MarkdownEditor/MarkdownEditor';
import MarkdownTOC from '../MarkdownTOC/MarkdownTOC';
import Audio from '../Audio/Audio';
import SSEventListener from '../SSEventListener/SSEventListener';
import Chart from '../Chart/Chart';
import FileSelector from '../FileSelector/FileSelector';
import FillerDefinitionEditor from '../FillerDefinitionEditor/FillerDefinitionEditor';
import FillerValueEditor from '../FillerValueEditor/FillerValueEditor';
import KIRunEditor from '../KIRunEditor/KIRunEditor';
import FormEditor from '../FormEditor/FormEditor';
import Form from '../Form/Form';
import SchemaBuilder from '../SchemaBuilder/SchemaBuilder';
import SchemaForm from '../SchemaForm/SchemaForm';
import TemplateEditor from '../TemplateEditor/TemplateEditor';
import TextEditor from '../TextEditor/TextEditor';
import Prompt from '../Prompt/Prompt';

import { ComponentStyleSubComponentDefinition } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import TimerIcon from '../Timer/TimerIcon';

export const SubComponentDefinitions: Record<
	string,
	Array<ComponentStyleSubComponentDefinition>
> = {
	Animator: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="0.0737305"
						y="0.0731812"
						width="29.8534"
						height="29.8529"
						fill="#F9F9F9"
					/>
					<path
						className="_animatorGlobeBG1"
						d="M12.4568 5.25473C9.16189 5.23846 6.05895 6.50497 3.71968 8.82103C1.49015 11.0283 0.193969 13.9634 0.0693218 17.091C-0.0569787 20.5532 1.20862 23.8083 3.63354 26.2569C6.05847 28.7055 9.29895 30.0004 12.7703 29.9106C15.8946 29.817 18.8429 28.5501 21.072 26.3431C25.9037 21.5597 25.9424 13.7381 21.1582 8.90717C18.8419 6.56811 15.7516 5.27101 12.4568 5.25473Z"
						fill="#96A1B4"
						fillOpacity="0.2"
					/>
					<path
						className="_animatorGlobeBG2"
						d="M17.675 0.0865836C14.3801 0.0703073 11.2772 1.33682 8.93794 3.65287C6.70841 5.86011 5.41223 8.79522 5.28758 11.9228C5.16128 15.385 6.42688 18.6402 8.85181 21.0888C11.2767 23.5374 14.5172 24.8322 17.9885 24.7424C21.1129 24.6489 24.0611 23.382 26.2903 21.1749C31.122 16.3915 31.1607 8.56991 26.3764 3.73902C24.0602 1.39996 20.9699 0.10286 17.675 0.0865836Z"
						fill="#96A1B4"
						fillOpacity="0.2"
					/>
					<path
						className="_animatorglobe"
						d="M14.9962 24.7351C17.5974 24.7351 20.0422 23.7232 21.8799 21.8856C23.6314 20.1344 24.6433 17.8121 24.7295 15.3425C24.8157 12.6088 23.8038 10.0438 21.8799 8.12023C19.9559 6.19662 17.3926 5.18701 14.6525 5.27144C12.1863 5.35748 9.86371 6.36915 8.11248 8.12023C4.31667 11.9154 4.31667 18.0904 8.11248 21.8856C9.95021 23.7232 12.3949 24.7351 14.9962 24.7351Z"
						fill="#7E81D6"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
	],

	[ArrayRepeater.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper id="_arrayRepeaterIcon" viewBox="0 0 30 30">
					<rect id="_rect1" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect5" y="15" width="13" height="13" rx="1" fill="#008FDD" />
					<rect id="_rect3" x="15" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect7" x="15" y="15" width="13" height="13" rx="1" fill="#008FDD" />
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'repeaterProperties',
			displayName: 'Each Repeater Container',
			description: 'Each Repeater Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'repeatedComp',
			displayName: 'Repeated Component',
			description: 'Repeated Component',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'iconGrid',
			displayName: 'Icon Grid',
			description: 'Icon Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'add',
			displayName: 'Add Button',
			description: 'Add Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'remove',
			displayName: 'Delete Button',
			description: 'Delete Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'move',
			displayName: 'Move Button',
			description: 'Move Button',
			icon: 'fa-solid fa-box',
		},
	],

	[Audio.name]: [
		{
			name: '',
			displayName: 'Component',
			mainComponent: true,
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 37 37">
					<path
						className="_audioWave1"
						d="M28.5422 13.184C30.9658 15.1483 32.5198 18.1449 32.5198 21.4987C32.5198 24.8524 30.9658 27.849 28.5422 29.8133C27.9643 30.282 27.1172 30.1928 26.6459 29.618C26.1747 29.0432 26.2644 28.2006 26.8423 27.7318C28.6656 26.2587 29.8269 24.0154 29.8269 21.4987C29.8269 18.982 28.6656 16.7387 26.8423 15.2599C26.2644 14.7912 26.1803 13.9485 26.6459 13.3738C27.1116 12.799 27.9643 12.7153 28.5422 13.1785V13.184Z"
						fill="#EDEAEA"
					/>
					<path
						className="_audioWave2"
						d="M25.148 17.3414C26.3542 18.3235 27.134 19.819 27.134 21.4987C27.134 23.1783 26.3542 24.6739 25.148 25.656C24.5701 26.1247 23.723 26.0354 23.2517 25.4607C22.7805 24.8859 22.8703 24.0433 23.4481 23.5745C24.054 23.0835 24.4411 22.3357 24.4411 21.4987C24.4411 20.6616 24.054 19.9139 23.4481 19.4172C22.8703 18.9485 22.7861 18.1059 23.2517 17.5311C23.7174 16.9563 24.5701 16.8726 25.148 17.3358V17.3414Z"
						fill="#EDEAEA"
					/>
					<path
						d="M19.9526 10.7846C19.9526 10.0815 19.5375 9.44535 18.8923 9.15518C18.2471 8.87059 17.4898 8.98219 16.9624 9.45093L9.39424 16.1417H5.59053C3.61013 16.1417 2 17.7432 2 19.7131V23.2845C2 25.2543 3.61013 26.8558 5.59053 26.8558H9.39424L16.9624 33.5466C17.4898 34.0153 18.2471 34.1325 18.8923 33.8424C19.5375 33.5522 19.9526 32.916 19.9526 32.2129V10.7846Z"
						fill="#54a2fc"
					/>
				</IconHelper>
			),
		},
		{
			name: 'playIcon',
			displayName: 'Play Icon',
			description: 'Play Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'pauseIcon',
			displayName: 'Pause Icon',
			description: 'Pause Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'timeText',
			displayName: 'Time Text',
			description: 'Time Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekTimeTextOnHover',
			displayName: 'Seek Time Text On Hover',
			description: 'Seek Time Text On Hover',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekSlider',
			displayName: 'Seek Slider',
			description: 'Seek Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSlider',
			displayName: 'Volume Slider',
			description: 'Volume Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'rewindIcon',
			displayName: 'Rewind Icon',
			description: 'Rewind Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'forwardIcon',
			displayName: 'Forward Icon',
			description: 'Forward Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeIcon',
			displayName: 'Volume Icon',
			description: 'Volume Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeMuteIcon',
			displayName: 'Volume Mute Icon',
			description: 'Volume Mute Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSliderContainer',
			displayName: 'Volume Slider Container',
			description: 'Volume Slider Container',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeButton',
			displayName: 'Volume Container',
			description: 'Volume Container',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedGrid',
			displayName: 'PlayBackSpeed Grid',
			description: 'PlayBackSpeed Grid',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedDropdown',
			displayName: 'PlayBackSpeed Dropdown',
			description: 'PlayBackSpeed Dropdown',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedDropdownOption',
			displayName: 'PlayBackSpeed Dropdown Option',
			description: 'PlayBackSpeed Dropdown Option',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'fileName',
			displayName: 'File Name Container',
			description: 'File Name Container',
			icon: 'fa fa-solid fa-box',
		},
	],

	[Button.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="none" />
					<rect
						width="24.286"
						height="24.286"
						rx="2"
						transform="translate(4.786 4.795)"
						fill="#edeaea"
					/>
					<g className="_updownAnimation _leftrightAnimation">
						<rect
							width="24.286"
							height="24.286"
							rx="2"
							transform="translate(0.929 0.92)"
							fill="#1893E9"
						/>
					</g>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftImage',
			displayName: 'Left Image',
			description: 'Left Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'activeLeftImage',
			displayName: 'Active Left Image',
			description: 'Active Left Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightImage',
			displayName: 'Right Image',
			description: 'Right Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'activeRightImage',
			displayName: 'Active Right Image',
			description: 'Active Right Image',
			icon: 'fa-solid fa-box',
		},
	],

	[ButtonBar.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="19.4116"
						y="17.6454"
						width="10.5884"
						height="10.5884"
						rx="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_buttonBar2"
						x="10.5889"
						y="10.5917"
						width="14.1179"
						height="14.1179"
						rx="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_buttonBar1"
						width="21.1768"
						height="21.1768"
						rx="2"
						fill="#FFB534"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-font',
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'button',
			displayName: 'Button',
			description: 'Button',
			icon: 'fa-solid fa-box',
		},
	],

	[Calendar.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 31">
					<path
						d="M9.375 1.875C9.375 0.837891 8.53711 0 7.5 0C6.46289 0 5.625 0.837891 5.625 1.875V3.75H2.8125C1.25977 3.75 0 5.00977 0 6.5625V11.25H26.25V6.5625C26.25 5.00977 24.9902 3.75 23.4375 3.75H20.625V1.875C20.625 0.837891 19.7871 0 18.75 0C17.7129 0 16.875 0.837891 16.875 1.875V3.75H9.375V1.875Z"
						fill="#EDEAEA"
					/>
					<path
						className="_calender31bg"
						d="M0 11H26.25V28C26.25 29.6569 24.9069 31 23.25 31H3C1.34315 31 0 29.6569 0 28V11Z"
						fill="#1D96F1"
					/>
					<path
						className="_calender31num"
						d="M9.62358 26.1392C8.84801 26.1392 8.16027 26.0066 7.56037 25.7415C6.96378 25.473 6.49313 25.1035 6.14844 24.6328C5.80374 24.1622 5.62808 23.6203 5.62145 23.0071H8.0973C8.10724 23.2292 8.1785 23.4264 8.31108 23.5987C8.44366 23.7678 8.62429 23.9003 8.85298 23.9964C9.08168 24.0926 9.34186 24.1406 9.63352 24.1406C9.92519 24.1406 10.1821 24.0893 10.4041 23.9865C10.6295 23.8804 10.8052 23.7363 10.9311 23.554C11.0571 23.3684 11.1184 23.1562 11.1151 22.9176C11.1184 22.679 11.0504 22.4669 10.9112 22.2812C10.772 22.0956 10.5748 21.9515 10.3196 21.8487C10.0677 21.746 9.76941 21.6946 9.42472 21.6946H8.43537V19.9446H9.42472C9.72633 19.9446 9.99148 19.8949 10.2202 19.7955C10.4522 19.696 10.6328 19.5568 10.7621 19.3778C10.8913 19.1955 10.9543 18.9867 10.951 18.7514C10.9543 18.5227 10.8996 18.3222 10.7869 18.1499C10.6776 17.9742 10.5234 17.8383 10.3246 17.7422C10.129 17.6461 9.90199 17.598 9.64347 17.598C9.37169 17.598 9.12476 17.6461 8.9027 17.7422C8.68395 17.8383 8.50994 17.9742 8.38068 18.1499C8.25142 18.3255 8.18348 18.5294 8.17685 18.7614H5.82528C5.83191 18.1548 6.00095 17.6212 6.33239 17.1605C6.66383 16.6965 7.11458 16.3336 7.68466 16.0717C8.25805 15.8099 8.91099 15.679 9.64347 15.679C10.3726 15.679 11.014 15.8066 11.5675 16.0618C12.121 16.317 12.5518 16.665 12.8601 17.1058C13.1683 17.5433 13.3224 18.0388 13.3224 18.5923C13.3258 19.1657 13.1385 19.638 12.7607 20.0092C12.3861 20.3804 11.9039 20.6091 11.3139 20.6953V20.7749C12.1027 20.8677 12.6977 21.1229 13.0987 21.5405C13.5031 21.9581 13.7036 22.4801 13.7003 23.1065C13.7003 23.6965 13.5263 24.2202 13.1783 24.6776C12.8336 25.1316 12.353 25.4896 11.7365 25.7514C11.1233 26.0099 10.419 26.1392 9.62358 26.1392ZM19.7967 15.8182V26H17.3407V18.1151H17.2811L15.0041 19.5071V17.3793L17.5147 15.8182H19.7967Z"
						fill="white"
					/>
					<path
						className="_calender01bg"
						d="M0 11H26.25V28C26.25 29.6569 24.9069 31 23.25 31H3C1.34315 31 0 29.6569 0 28V11Z"
						fill="#1D96F1"
						opacity={0}
					/>
					<path
						className="_calender01num"
						d="M9.96165 26.2486C9.07339 26.2486 8.30777 26.0381 7.66477 25.6172C7.02178 25.1929 6.52628 24.5848 6.17827 23.7926C5.83026 22.9972 5.65791 22.041 5.66122 20.924C5.66454 19.8071 5.83854 18.8591 6.18324 18.0803C6.53125 17.2981 7.02509 16.7031 7.66477 16.2955C8.30777 15.8845 9.07339 15.679 9.96165 15.679C10.8499 15.679 11.6155 15.8845 12.2585 16.2955C12.9048 16.7031 13.402 17.2981 13.75 18.0803C14.098 18.8625 14.2704 19.8104 14.267 20.924C14.267 22.0443 14.093 23.0021 13.745 23.7976C13.397 24.593 12.9015 25.2012 12.2585 25.6222C11.6188 26.0398 10.8532 26.2486 9.96165 26.2486ZM9.96165 24.2351C10.492 24.2351 10.9212 23.965 11.2493 23.4247C11.5774 22.8812 11.7398 22.0476 11.7365 20.924C11.7365 20.1882 11.6619 19.5817 11.5128 19.1044C11.3636 18.6238 11.1565 18.2659 10.8913 18.0305C10.6262 17.7952 10.3163 17.6776 9.96165 17.6776C9.43466 17.6776 9.00876 17.9444 8.68395 18.478C8.35914 19.0083 8.19508 19.8236 8.19176 20.924C8.18845 21.6697 8.25971 22.2879 8.40554 22.7784C8.55469 23.2689 8.76349 23.6352 9.03196 23.8771C9.30043 24.1158 9.61032 24.2351 9.96165 24.2351ZM20.3846 15.8182V26H17.9286V18.1151H17.869L15.592 19.5071V17.3793L18.1026 15.8182H20.3846Z"
						fill="white"
						opacity={0}
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'calendarHeader',
			displayName: 'Calendar Header',
			description: 'Calendar Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyMonths',
			displayName: 'Calendar Body Months',
			description: 'Calendar Body Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseYears',
			displayName: 'Calendar Body Browse Years',
			description: 'Calendar Body Browse Years',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseMonths',
			displayName: 'Calendar Body Browse Months',
			description: 'Calendar Body Browse Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderTitle',
			displayName: 'Calendar Header Title',
			description: 'Calendar Header Title',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonthsContainer',
			displayName: 'Calendar Months Container Above Month',
			description: 'Calendar Months Container Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonths',
			displayName: 'Calendar Month Above Month',
			description: 'Calendar Month Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendar',
			displayName: 'Calendar Body Container',
			description: 'Calendar Body Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrow',
			displayName: 'Left Arrow',
			description: 'Left Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrowImage',
			displayName: 'Left Arrow Image',
			description: 'Left Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrow',
			displayName: 'Right Arrow',
			description: 'Right Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrowImage',
			displayName: 'Right Arrow Image',
			description: 'Right Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekName',
			displayName: 'Week Name',
			description: 'Week Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'month',
			displayName: 'Month',
			description: 'Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'date',
			displayName: 'Date',
			description: 'Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'monthName',
			displayName: 'Month Name',
			description: 'Month Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'yearNumber',
			displayName: 'Year Number',
			description: 'Year Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'prevNextMonthDate',
			displayName: 'Prev Next Month Date',
			description: 'Prev Next Month Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'todayDate',
			displayName: 'Today Date',
			description: 'Today Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedDate',
			displayName: 'Selected Date',
			description: 'Selected Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'emptyDate',
			displayName: 'Empty Date',
			description: 'Empty Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekendLowLightDate',
			displayName: 'Weekend Low Light Date',
			description: 'Weekend Low Light Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekNumber',
			displayName: 'Week Number',
			description: 'Week Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropDownContainer',
			displayName: 'Drop Down Container',
			description: 'Drop Down Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarDropdownContainer',
			displayName: 'Calendar Dropdown Container',
			description: 'Container for all dropdown elements',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarDropdownRow',
			displayName: 'Calendar Dropdown Row',
			description: 'Row containing all dropdowns',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'yearDropdownWrapper',
			displayName: 'Year Dropdown Wrapper',
			description: 'Wrapper for year dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'yearDropdown',
			displayName: 'Year Dropdown',
			description: 'Year dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'monthDropdownWrapper',
			displayName: 'Month Dropdown Wrapper',
			description: 'Wrapper for month dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'monthDropdown',
			displayName: 'Month Dropdown',
			description: 'Month dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dayDropdownWrapper',
			displayName: 'Day Dropdown Wrapper',
			description: 'Wrapper for day dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dayDropdown',
			displayName: 'Day Dropdown',
			description: 'Day dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hourDropdownWrapper',
			displayName: 'Hour Dropdown Wrapper',
			description: 'Wrapper for hour dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hourDropdown',
			displayName: 'Hour Dropdown',
			description: 'Hour dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'minuteDropdownWrapper',
			displayName: 'Minute Dropdown Wrapper',
			description: 'Wrapper for minute dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'minuteDropdown',
			displayName: 'Minute Dropdown',
			description: 'Minute dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'secondDropdownWrapper',
			displayName: 'Second Dropdown Wrapper',
			description: 'Wrapper for second dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'secondDropdown',
			displayName: 'Second Dropdown',
			description: 'Second dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ampmDropdownWrapper',
			displayName: 'AM/PM Dropdown Wrapper',
			description: 'Wrapper for AM/PM dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ampmDropdown',
			displayName: 'AM/PM Dropdown',
			description: 'AM/PM dropdown select element',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarDropdownBody',
			displayName: 'Calendar Dropdown Body',
			description: 'Dropdown body container for all dropdowns',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarDropdownOption',
			displayName: 'Calendar Dropdown Option',
			description: 'Individual option in dropdown',
			icon: 'fa-solid fa-box',
		},
	],

	[Carousel.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.41416 8.17383H5.06702C4.51473 8.17383 4.06702 8.62154 4.06702 9.17383V21.1865C4.06702 21.7388 4.51473 22.1865 5.06702 22.1865H7.41416C7.96644 22.1865 8.41416 21.7388 8.41416 21.1865V9.17383C8.41416 8.62154 7.96644 8.17383 7.41416 8.17383Z"
						fill="#EF7E3440"
						className="_carouselsecondframe"
					/>
					<path
						d="M24.9327 8.17383H22.5852C22.0329 8.17383 21.5852 8.62154 21.5852 9.17383V21.1865C21.5852 21.7388 22.0329 22.1865 22.5852 22.1865H24.9327C25.485 22.1865 25.9327 21.7388 25.9327 21.1865V9.17383C25.9327 8.62154 25.485 8.17383 24.9327 8.17383Z"
						fill="#EF7E3440"
						className="_carouselthirdframe"
					/>
					<path
						d="M29.0001 9.66992H28.0828C27.5305 9.66992 27.0828 10.1176 27.0828 10.6699V19.6934C27.0828 20.2457 27.5305 20.6934 28.0828 20.6934H29C29.5523 20.6934 30.0001 20.2457 30.0001 19.6934V10.6699C30.0001 10.1176 29.5523 9.66992 29.0001 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfourthframe"
					/>
					<path
						d="M1.91763 9.66992H1C0.447715 9.66992 0 10.1176 0 10.6699V19.6934C0 20.2457 0.447716 20.6934 1 20.6934H1.91763C2.46991 20.6934 2.91763 20.2457 2.91763 19.6934V10.6699C2.91763 10.1176 2.46991 9.66992 1.91763 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfirstframe"
					/>
					<path
						d="M19.4348 6H10.5673C10.015 6 9.56726 6.44771 9.56726 7V23.3598C9.56726 23.9121 10.015 24.3598 10.5673 24.3598H19.4348C19.9871 24.3598 20.4348 23.9121 20.4348 23.3598V7C20.4348 6.44772 19.9871 6 19.4348 6Z"
						fill="#EF7E34"
						className="_carouselmainframe"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'arrowButtonsContainer',
			displayName: 'Arrow Buttons Container',
			description: 'Arrow Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideButtonsContainer',
			displayName: 'Slide Buttons Container',
			description: 'Slide Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'indicatorContainer',
			displayName: 'Indicator Container',
			description: 'Container for slide indicators',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButton',
			displayName: 'Indicator Button',
			description: 'Individual indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButtonActive',
			displayName: 'Indicator Button Active',
			description: 'Active indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorNavBtn',
			displayName: 'Indicator Navigation Arrow',
			description: 'Indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
		{
			name: 'indicatorNavBtnActive',
			displayName: 'Active Indicator Navigation Arrow',
			description: 'Active indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
	],

	[Chart.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						className="_chartbars"
						y="14"
						width="5"
						height="15"
						rx="1"
						fill="#FFAA47"
					/>
					<rect
						className="_chartbars1"
						x="8"
						y="23"
						width="5"
						height="6"
						rx="1"
						fill="#86D171"
					/>
					<rect
						className="_chartbars"
						x="16"
						width="5"
						height="29"
						rx="1"
						fill="#F6332A"
					/>
					<rect
						className="_chartbars1"
						x="24"
						y="14"
						width="5"
						height="15"
						rx="1"
						fill="#89C2F5"
					/>
				</IconHelper>
			),
		},
		{
			name: 'xAxisLabel',
			displayName: 'X Axis Label',
			description: 'X Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisLabel',
			displayName: 'Y Axis Label',
			description: 'Y Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxisTitle',
			displayName: 'X Axis Title',
			description: 'X Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisTitle',
			displayName: 'Y Axis Title',
			description: 'Y Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxis',
			displayName: 'X Axis',
			description: 'X Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxis',
			displayName: 'Y Axis',
			description: 'Y Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xTicks',
			displayName: 'X Ticks',
			description: 'X Axis Tick Marks',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yTicks',
			displayName: 'Y Ticks',
			description: 'Y Axis Tick Marks',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendLabel',
			displayName: 'Legend Label',
			description: 'Legend Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendRectangle',
			displayName: 'Legend Rectangle',
			description: 'Legend Rectangle',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'tooltip',
			displayName: 'Tooltip',
			description: 'Tooltip',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'horizontalLines',
			displayName: 'Horizontal Lines',
			description: 'Horizontal Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'verticalLines',
			displayName: 'Vertical Lines',
			description: 'Vertical Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'bar',
			displayName: 'Bar',
			description: 'Bar',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'line',
			displayName: 'Line',
			description: 'Line',
			icon: 'fa fa-solid fa-chart-line',
		},
		{
			name: 'point',
			displayName: 'Point',
			description: 'Point/Marker',
			icon: 'fa fa-solid fa-circle',
		},
		{
			name: 'area',
			displayName: 'Area',
			description: 'Filled Area',
			icon: 'fa fa-solid fa-chart-area',
		},
		{
			name: 'pie',
			displayName: 'Pie',
			description: 'Pie Slice',
			icon: 'fa fa-solid fa-chart-pie',
		},
		{
			name: 'doughnut',
			displayName: 'Doughnut',
			description: 'Doughnut Segment',
			icon: 'fa fa-solid fa-circle-notch',
		},
		{
			name: 'radar',
			displayName: 'Radar',
			description: 'Radar Chart',
			icon: 'fa fa-solid fa-diagram-project',
		},
		{
			name: 'polarArea',
			displayName: 'Polar Area',
			description: 'Polar Area Segment',
			icon: 'fa fa-solid fa-circle-half-stroke',
		},
	],

	[CheckBox.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M25.2667 0H4.76667C2.13333 0 0 2.13333 0 4.76667V25.2667C0 27.8667 2.13333 30 4.76667 30H25.2667C27.8667 30 30 27.8667 30 25.2667V4.76667C30 2.13333 27.8667 0 25.2667 0ZM23.7333 11.9667L14 21.7C13.6667 22.0333 13.2333 22.2 12.8333 22.2C12.4333 22.2 11.9667 22.0333 11.6667 21.7L6.26667 16.3C5.6 15.6333 5.6 22.1 6.26667 21.4333C6.93333 20.7667 7.96667 20.7667 8.63333 21.4333L12.8667 25.6667L26.25 10.3125C26.9167 9.64583 23.1333 8.93333 23.8 9.6C24.4 10.2667 24.4 11.3333 23.7333 11.9667Z"
						fill="#02B694"
					/>
					<path
						d="M21.6216 12.1883L14.2559 19.6183C14.0288 19.8728 13.6757 20 13.373 20C13.0703 20 12.7423 19.8728 12.4901 19.6183L8.37838 15.5216C7.87387 15.0127 7.87387 14.2239 8.37838 13.715C8.88288 13.2061 9.66486 13.2061 10.1694 13.715L13.373 16.9211L19.8306 10.3817C20.3351 9.87277 21.1171 9.87277 21.6216 10.3817C22.1261 10.8906 22.1261 11.6794 21.6216 12.1883Z"
						fill="white"
						className="_checkboxTick"
					/>
					<rect
						className="_checkboxbox"
						x={0}
						y={0}
						width="15"
						height="15"
						fill="#02B694"
						opacity="0"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'checkbox',
			displayName: 'Checkbox',
			description: 'Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Tick',
			description: 'Tick',
			icon: 'fa-solid fa-box',
		},
	],

	[ColorPicker.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.57739 21.6728C6.10024 20.0256 5.15977 17.8842 5.03225 15.5306H4.50621C4.27508 15.5266 0.0867971 15.5333 0.0374884 15.5306C0.032175 19.1186 1.67668 22.8113 4.04373 25.2063L7.57739 21.6728Z"
						fill="#7743DB"
						className="_colorPickerIcon"
					/>
					<path
						d="M22.423 8.32848C23.9002 9.97566 24.8407 12.1171 24.9682 14.4706H25.4942C25.7253 14.4746 29.9136 14.468 29.9629 14.4706C29.9683 10.8827 28.3237 7.18996 25.9567 4.79492L22.423 8.32848Z"
						fill="#018B8B"
						className="_colorPickerIcon"
					/>
					<path
						d="M15.5314 0.531615C15.53 0.823856 15.5327 4.90206 15.5314 5.03197C17.8852 5.15949 20.0266 6.09996 21.6735 7.57711L22.0455 7.20515C22.2142 7.04176 25.1671 4.07953 25.207 4.04365C22.7761 1.63269 19.2321 0.130243 15.5258 0C15.5311 0.0106269 15.5311 0.0265671 15.5311 0.0371957L15.5314 0.531615Z"
						fill="#EC255A"
						className="_colorPickerIcon"
					/>
					<path
						d="M14.4686 29.4674C14.47 29.1751 14.4673 25.0969 14.4686 24.967C12.1148 24.8395 9.9734 23.899 8.32649 22.4219L7.95453 22.7938C7.78583 22.9572 4.83288 25.9195 4.79303 25.9553C7.22259 28.365 10.7679 29.8701 14.4742 29.999C14.4689 29.9884 14.4689 29.9724 14.4689 29.9618L14.4686 29.4674Z"
						fill="#FFB534"
						className="_colorPickerIcon"
					/>
					<path
						d="M5.14353 4.39432C5.34943 4.60155 8.23597 7.4854 8.32629 7.57708C9.97347 6.09993 12.1149 5.15946 14.4684 5.03194V4.5059C14.4724 4.27476 14.4658 0.0864826 14.4684 0.0371739C10.8393 0.0252188 7.29658 1.67504 4.7713 4.02233L4.79255 4.04359L5.14353 4.39432Z"
						fill="#3F83EA"
						className="_colorPickerIcon"
					/>
					<path
						d="M24.8565 25.6046C24.6506 25.3974 21.7641 22.5136 21.6737 22.4219C20.0266 23.899 17.8851 24.8395 15.5316 24.967V25.4931C15.5276 25.7242 15.5342 29.9125 15.5316 29.9618C19.1607 29.9737 22.7034 28.3239 25.2287 25.9766C25.2234 25.966 25.2128 25.9607 25.2075 25.9554L24.8565 25.6046Z"
						fill="#BDD449"
						className="_colorPickerIcon"
					/>
					<path
						d="M29.4684 15.5309C29.1762 15.5296 25.098 15.5323 24.9681 15.5309C24.8405 17.8848 23.9001 20.0262 22.4229 21.6731L22.7949 22.045C22.9583 22.2137 25.9205 25.1667 25.9564 25.2065C28.3673 22.7757 29.8698 19.2317 30 15.5254C29.9894 15.5307 29.9735 15.5307 29.9628 15.5307L29.4684 15.5309Z"
						fill="#02B694"
						className="_colorPickerIcon"
					/>
					<path
						d="M0.531615 14.4705C0.823856 14.4719 4.90206 14.4692 5.03197 14.4705C5.15949 12.1167 6.09996 9.97529 7.57711 8.32838L7.20515 7.95642C7.04176 7.78772 4.07953 4.83478 4.04365 4.79492C1.63269 7.2258 0.130243 10.7698 0 14.4761C0.0106269 14.4708 0.0265672 14.4708 0.0371958 14.4708L0.531615 14.4705Z"
						fill="black"
						className="_colorPickerIcon"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'dropDownContainer',
			displayName: 'Dropdown Container',
			description: 'Dropdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
	],

	[Dropdown.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 20">
					<path
						className="_dropdownlines"
						d="M26 14L26 12C26 11.4477 25.5523 11 25 11L1 11C0.447716 11 -1.95702e-08 11.4477 -4.37114e-08 12L-1.31134e-07 14C-1.55275e-07 14.5523 0.447716 15 1 15L25 15C25.5523 15 26 14.5523 26 14Z"
						fill="#EC255A40"
					/>
					<path
						className="_dropdownlines"
						d="M19 20L19 18C19 17.4477 18.5523 17 18 17L1 17C0.447716 17 -1.95702e-08 17.4477 -4.37114e-08 18L-1.31134e-07 20C-1.55275e-07 20.5523 0.447716 21 1 21L18 21C18.5523 21 19 20.5523 19 20Z"
						fill="#EC255A40"
					/>
					<path
						d="M30 8L30 1C30 0.447715 29.5523 -1.95703e-08 29 -4.37114e-08L1 -1.26763e-06C0.447716 -1.29177e-06 1.88778e-06 0.447714 1.86364e-06 0.999999L1.55766e-06 8C1.53352e-06 8.55228 0.447717 9 1 9L29 9C29.5523 9 30 8.55229 30 8Z"
						fill="#EC255A"
					/>
					<path
						d="M24.433 5.75C24.2406 6.08333 23.7594 6.08333 23.567 5.75L22.701 4.25C22.5085 3.91667 22.7491 3.5 23.134 3.5L24.866 3.5C25.2509 3.5 25.4915 3.91667 25.299 4.25L24.433 5.75Z"
						fill="white"
					/>
					<path
						d="M25.0657 3.5H22.9343C22.5349 3.5 22.2967 3.94507 22.5182 4.27735L23.584 5.87596C23.7819 6.17283 24.2181 6.17283 24.416 5.87596L25.4818 4.27735C25.7033 3.94507 25.4651 3.5 25.0657 3.5Z"
						fill="white"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'dropDownContainer',
			displayName: 'Dropdown Container',
			description: 'Dropdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownItem',
			displayName: 'Dropdown Item',
			description: 'Dropdown Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownItemLabel',
			displayName: 'Dropdown Item Label',
			description: 'Dropdown Item Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownCheckIcon',
			displayName: 'Dropdown Check Icon',
			description: 'Dropdown Check Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownSearchBoxContainer',
			displayName: 'Dropdown Search Box Container',
			description: 'Dropdown Search Box Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropDownSearchIcon',
			displayName: 'Dropdown Search Icon',
			description: 'Dropdown Search Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownSearchBox',
			displayName: 'Dropdown Search Box',
			description: 'Dropdown Search Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'checkbox',
			displayName: 'Checkbox',
			description: 'Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Thumb',
			description: 'Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],

	[FileSelector.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path d="M15.5 2H2L1.5 23.5L5.5 27H19L22 23.5V8.5L15.5 2Z" fill="#5CCEFE" />
					<path
						d="M18.0371 27C21.3241 27 24 24.3506 24 21.0968V10.1701C24 9.09012 23.5739 8.07482 22.804 7.31123L16.6149 1.18407C15.8436 0.420477 14.8181 0 13.7272 0H5.96286C2.67594 0 0 2.64937 0 5.90324V21.0962C0 24.3503 2.67612 26.9995 5.96286 26.9995C6.56657 26.9995 7.05376 26.5171 7.05376 25.9195C7.05376 25.3218 6.56657 24.8395 5.96286 24.8395C3.87622 24.8395 2.1818 23.1576 2.1818 21.0962V5.90324C2.1818 3.83747 3.88066 2.15999 5.96286 2.15999H13.4544V5.46185C13.4544 7.90871 15.4658 9.8999 17.9373 9.8999H21.7882C21.8024 9.9899 21.8138 10.0799 21.8138 10.1699V21.0965C21.8138 23.1623 20.1149 24.8398 18.0327 24.8398C17.429 24.8398 16.9418 25.3221 16.9418 25.9198C16.9418 26.5175 17.4335 27 18.0371 27ZM17.9377 7.74013C16.6692 7.74013 15.6366 6.71781 15.6366 5.46203V3.27393L20.1537 7.74006L17.9377 7.74013Z"
						fill="#5CCEFE"
					/>
					<path
						d="M17.9377 7.74013C16.6692 7.74013 15.6366 6.71781 15.6366 5.46203V3.27393L20.1537 7.74006L17.9377 7.74013Z"
						fill="white"
					/>
					<path
						className="_FileSelectorArrow"
						d="M17.6316 17.9337C18.1228 17.5096 18.1228 16.8224 17.6316 16.3997L12.8914 12.3065C12.4182 11.8978 11.5832 11.8978 11.1149 12.3065L6.3684 16.3997C5.8772 16.8239 5.8772 17.511 6.3684 17.9337C6.85961 18.3579 7.65533 18.3579 8.1449 17.9337L10.745 15.6942V20.9142C10.745 21.5151 11.3065 22 12.0024 22C12.6983 22 13.2599 21.5151 13.2599 20.9142V15.6942L15.855 17.9351C16.1022 18.1486 16.4215 18.2533 16.7441 18.2533C17.065 18.2533 17.3893 18.1486 17.6316 17.9337Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'image',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
	],

	[FileUpload.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 30">
					<path
						className="_fileUploadBG"
						d="M14.2958 6.09627V0H2.11268C0.947746 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.947746 30 2.11268 30H21.0963C22.2612 30 23.2089 29.0523 23.2089 27.8873V8.91317H17.1127C15.5594 8.91317 14.2958 7.64951 14.2958 6.09627Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadRC"
						d="M15.707 6.08405C15.707 6.86067 16.3389 7.4925 17.1155 7.4925H22.1675L15.707 1.0625V6.08405Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadAT"
						d="M5.88372 19.0316C5.54285 19.0316 5.35818 18.6325 5.57882 18.3727L10.724 12.3136C10.8827 12.1268 11.1705 12.1253 11.3311 12.3104L16.5866 18.3695C16.8112 18.6285 16.6273 19.0316 16.2844 19.0316L5.88372 19.0316Z"
						fill="white"
					/>
					<path
						className="_fileUploadAB"
						d="M13.5039 23.2891C13.5039 23.8413 13.0562 24.2891 12.5039 24.2891L9.38435 24.2891C8.83207 24.2891 8.38435 23.8413 8.38435 23.2891L8.38435 18.4381L13.5039 18.4381L13.5039 23.2891Z"
						fill="white"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'uploadButton',
			displayName: 'Upload Button',
			description: 'Uplaod Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedFiles',
			displayName: 'Selected Files',
			description: 'Selected Files',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeIcon',
			displayName: 'Close Icon',
			description: 'Close Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessagesContainer',
			displayName: 'Validation Messages Container',
			description: 'Validation Messages Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessage',
			displayName: 'Validation Message',
			description: 'Validation Message',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'subText',
			displayName: 'Sub Text',
			description: 'Sub Text',
			icon: 'fa-solid fa-box',
		},
	],

	[FillerDefinitionEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 27 27">
					<path
						d="M0 1C0 0.447715 0.447715 0 1 0H20C20.5523 0 21 0.447715 21 1V2C21 2.55228 20.5523 3 20 3H1C0.447715 3 0 2.55228 0 2V1Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 9C0 8.44772 0.447715 8 1 8H20C20.5523 8 21 8.44772 21 9V10C21 10.5523 20.5523 11 20 11H1C0.447715 11 0 10.5523 0 10V9Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 17C0 16.4477 0.447715 16 1 16H20C20.5523 16 21 16.4477 21 17V18C21 18.5523 20.5523 19 20 19H1C0.447715 19 0 18.5523 0 18V17Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 25C0 24.4477 0.447715 24 1 24H20C20.5523 24 21 24.4477 21 25V26C21 26.5523 20.5523 27 20 27H1C0.447715 27 0 26.5523 0 26V25Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FDEPen"
						d="M3.10547 21.0239L12.0018 12.1276C13.5053 10.6241 15.169 10.6241 16.6724 12.1276C18.1759 13.631 18.1759 15.2947 16.6724 16.7982L7.77607 25.6945L3.10547 21.0239ZM6.5816 26.3683L2.73357 26.7959C2.31287 26.8426 1.9574 26.4871 2.00414 26.0664L2.4317 22.2184L6.5816 26.3683Z"
						fill="#00B5B9"
					/>
				</IconHelper>
			),
		},
	],

	[FillerValueEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M1 10.6875V21.25C1 23.0426 2.45742 24.5 4.25 24.5H23.75C25.5426 24.5 27 23.0426 27 21.25V10.6875L15.95 18.975C14.7922 19.8434 13.2078 19.8434 12.05 18.975L1 10.6875Z"
						fill="#EDEAEA"
						opacity="0.8"
					/>
					<path
						className="_FVEMailCloser"
						d="M1 7.4375C1 6.0918 2.0918 5 3.4375 5H24.5625C25.9082 5 27 6.0918 27 7.4375C27 8.2043 26.6395 8.92539 26.025 9.3875L14.975 17.675C14.3961 18.1066 13.6039 18.1066 13.025 17.675L1.975 9.3875C1.36055 8.92539 1 8.2043 1 7.4375Z"
						fill="#8267BE"
					/>
					<path
						className="_FVEMailPencil"
						d="M19.7557 18.8522L25.8371 12.7708C26.8648 11.7431 28.0021 11.7431 29.0298 12.7708C30.0576 13.7985 30.0576 14.9358 29.0298 15.9635L22.9484 22.045L19.7557 18.8522ZM22.1319 22.5055L19.5015 22.7978C19.2139 22.8298 18.9709 22.5868 19.0028 22.2992L19.2951 19.6687L22.1319 22.5055Z"
						fill="#8267BE"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9528"
							x1="14"
							y1="5"
							x2="14"
							y2="24.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EAEAEA" stopOpacity="0.8" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9528"
							x1="14"
							y1="5"
							x2="14"
							y2="24.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B8A6DF" />
							<stop offset="1" stopColor="#8267BE" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9528"
							x1="24.4003"
							y1="12"
							x2="24.4003"
							y2="22.8006"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B8A6DF" />
							<stop offset="1" stopColor="#8267BE" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],

	[Form.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 24">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M0 12.75C0 10.6781 1.67812 9 3.75 9H12.75C13.5797 9 14.25 9.67031 14.25 10.5C14.25 11.3297 13.5797 12 12.75 12H3.75C3.3375 12 3 12.3375 3 12.75V23.25C3 23.6625 3.3375 24 3.75 24H23.25C23.6625 24 24 23.6625 24 23.25V17.25C24 16.4203 24.6703 15.75 25.5 15.75C26.3297 15.75 27 16.4203 27 17.25V23.25C27 25.3219 25.3219 27 23.25 27H3.75C1.67812 27 0 25.3219 0 23.25V12.75Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FormDot1"
						d="M9.03686 18.1861C9.03686 17.7809 8.87688 17.3922 8.59212 17.1057C8.30736 16.8192 7.92114 16.6582 7.51843 16.6582C7.11572 16.6582 6.7295 16.8192 6.44474 17.1057C6.15998 17.3922 6 17.7809 6 18.1861C6 18.5913 6.15998 18.9799 6.44474 19.2665C6.7295 19.553 7.11572 19.714 7.51843 19.714C7.92114 19.714 8.30736 19.553 8.59212 19.2665C8.87688 18.9799 9.03686 18.5913 9.03686 18.1861Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormDot2"
						d="M13.1474 19.2665C12.8627 19.553 12.4764 19.714 12.0737 19.714C11.671 19.714 11.2848 19.553 11 19.2665C10.7153 18.9799 10.5553 18.5913 10.5553 18.1861C10.5553 17.7809 10.7153 17.3922 11 17.1057C11.2848 16.8192 11.671 16.6582 12.0737 16.6582C12.4764 16.6582 12.8627 16.8192 13.1474 17.1057C13.4322 17.3922 13.5922 17.7809 13.5922 18.1861C13.5922 18.5913 13.4322 18.9799 13.1474 19.2665Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormPen"
						d="M24.9045 5.56698L26.7883 3.67144H26.7835C27.6708 2.77858 29.1134 2.7738 30.0054 3.67144L31.0494 4.71709C31.9414 5.61472 31.9367 7.08054 31.0304 7.9734L29.1418 9.83075L24.9045 5.56698Z"
						fill="#CD5C08"
					/>
					<path
						className="_FormPen"
						d="M17.0323 13.4977L23.8273 6.65082L28.0552 10.905L21.1701 17.6898C20.8427 18.0145 20.4441 18.258 20.0075 18.406L16.6148 19.5472C16.202 19.6856 15.7512 19.5806 15.4475 19.2702C15.1438 18.9599 15.0347 18.5063 15.1723 18.0957L16.3016 14.6913C16.4487 14.2425 16.7002 13.8319 17.0323 13.4977Z"
						fill="#CD5C08"
					/>
				</IconHelper>
			),
		},
	],

	[FormEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M16.2958 6.09627V0H4.11268C2.94775 0 2 0.947747 2 2.11268V27.8873C2 29.0523 2.94775 30 4.11268 30H23.0963C24.2612 30 25.2089 29.0523 25.2089 27.8873V8.91317H19.1127C17.5594 8.91317 16.2958 7.64951 16.2958 6.09627Z"
						fill="#EDEAEA"
					/>
					<path
						d="M17.7056 6.09754C17.7056 6.87416 18.3374 7.50599 19.114 7.50599H24.1661L17.7056 1.07599V6.09754Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FSEPen"
						d="M19.1195 19.1228L25.2009 13.0414C26.2286 12.0136 27.3659 12.0136 28.3936 13.0414C29.4213 14.0691 29.4213 15.2064 28.3936 16.2341L22.3122 22.3155L19.1195 19.1228ZM21.4957 22.7761L18.8652 23.0684C18.5776 23.1003 18.3346 22.8573 18.3666 22.5697L18.6589 19.9393L21.4957 22.7761Z"
						fill="#C23373"
					/>
				</IconHelper>
			),
		},
		{
			name: 'objectTypeEditor',
			displayName: 'Object Type Editor',
			description: 'Object Type Editor',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'addFieldButton',
			displayName: 'Add Field Button',
			description: 'Add Field Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'objectAddBar',
			displayName: 'Object Add Bar',
			description: 'Object Add Bar',
			icon: 'fa-solid fa-box',
		},
	],

	[Gallery.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 23">
					<path
						d="M29.8059 19.9991L29.8059 14.7734C29.8059 13.6689 28.9105 12.7734 27.8059 12.7734L2 12.7734C0.895433 12.7734 3.77556e-06 13.6689 3.72727e-06 14.7734L3.49885e-06 19.9991C3.45057e-06 21.1036 0.895431 21.9991 2 21.9991L27.8059 21.9991C28.9105 21.9991 29.8059 21.1036 29.8059 19.9991Z"
						fill="#AC94FF"
						className="_gallerymainframe"
					/>
					<path
						d="M27.6769 8.64471L27.6769 8.38672C27.6769 7.28215 26.7814 6.38672 25.6769 6.38672L4.12896 6.38672C3.02439 6.38672 2.12896 7.28215 2.12896 8.38672L2.12896 8.64471C2.12896 9.74927 3.02439 10.6447 4.12896 10.6447L25.6769 10.6447C26.7814 10.6447 27.6769 9.74928 27.6769 8.64471Z"
						fill="#AC94FF40"
						className="_gallerysecondframe"
					/>
					<path
						d="M24.1285 2.25799L24.1285 2C24.1285 0.89543 23.2331 -3.91404e-08 22.1285 -8.74227e-08L7.67727 -7.19108e-07C6.5727 -7.6739e-07 5.67727 0.895429 5.67727 2L5.67727 2.25799C5.67727 3.36256 6.5727 4.25799 7.67726 4.25799L22.1285 4.25799C23.2331 4.25799 24.1285 3.36256 24.1285 2.25799Z"
						fill="#AC94FF40"
						className="_galleryfirstframe"
					/>
				</IconHelper>
			),
		},
		{
			name: 'toolbarLeftColumn',
			displayName: 'Toolbar Left Column',
			description: 'Toolbar Left Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarRightColumn',
			displayName: 'Toolbar Right Column',
			description: 'Toolbar Right Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarButton',
			displayName: 'Toolbar Button',
			description: 'Toolbar Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideImage',
			displayName: 'Slide Image',
			description: 'Slide Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailContainer',
			displayName: 'Thumbnail Container',
			description: 'Thumbnail Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImageDiv',
			displayName: 'Thumbnail Image Div',
			description: 'Thumbnail Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImage',
			displayName: 'Thumbnail Image',
			description: 'Thumbnail Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewContainer',
			displayName: 'Preview Container',
			description: 'Preview Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewCloseButton',
			displayName: 'Preview Close Button',
			description: 'Preview Close Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewList',
			displayName: 'Preview List',
			description: 'Preview List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImageDiv',
			displayName: 'Preview Image Div',
			description: 'Preview Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImage',
			displayName: 'Preview Image',
			description: 'Preview Image',
			icon: 'fa-solid fa-box',
		},
	],

	[Grid.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_scaleBottomTop"
						d="M11 0H1C0.447715 0 0 0.447715 0 1V18C0 18.5523 0.447715 19 1 19H11C11.5523 19 12 18.5523 12 18V1C12 0.447715 11.5523 0 11 0Z"
						fill="#7743DB"
					/>
					<path
						className="_scaleTopBottom"
						d="M26 11H16C15.4477 11 15 11.4477 15 12V29C15 29.5523 15.4477 30 16 30H26C26.5523 30 27 29.5523 27 29V12C27 11.4477 26.5523 11 26 11Z"
						fill="#7743DB"
					/>
					<path
						d="M11 22H1C0.447715 22 0 22.4477 0 23V29C0 29.5523 0.447715 30 1 30H11C11.5523 30 12 29.5523 12 29V23C12 22.4477 11.5523 22 11 22Z"
						fill="#EDEAEA"
					/>
					<path
						d="M26 0H16C15.4477 0 15 0.447715 15 1V7C15 7.55229 15.4477 8 16 8H26C26.5523 8 27 7.55229 27 7V1C27 0.447715 26.5523 0 26 0Z"
						fill="#EDEAEA"
					/>
				</IconHelper>
			),
		},
	],

	[Icon.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 15">
					<circle className="_iconcircle" cx="24.5" cy="10" r="5" fill="#02B694" />
					<path
						className="_icontriangle"
						d="M5.06292 6.78674C5.25342 6.44384 5.74658 6.44384 5.93708 6.78674L10.0873 14.2572C10.2725 14.5904 10.0315 15 9.65024 15L1.34976 15C0.968515 15 0.727531 14.5904 0.912679 14.2572L5.06292 6.78674Z"
						fill="#EC465E"
					/>
					<rect className="_iconbar" x="12" width="5" height="15" fill="#7B66FF" />
				</IconHelper>
			),
		},
	],

	[Iframe.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M0 3.76307C0 1.6875 1.68164 0 3.75 0H26.25C28.3184 0 30 1.6875 30 3.76307V22.5784C30 24.654 28.3184 26.3415 26.25 26.3415H3.75C1.68164 26.3415 0 24.654 0 22.5784V3.76307ZM3.75 5.6446C3.75 6.14361 3.94754 6.62219 4.29917 6.97504C4.65081 7.3279 5.12772 7.52613 5.625 7.52613C6.12228 7.52613 6.59919 7.3279 6.95083 6.97504C7.30246 6.62219 7.5 6.14361 7.5 5.6446C7.5 5.14559 7.30246 4.66701 6.95083 4.31415C6.59919 3.9613 6.12228 3.76307 5.625 3.76307C5.12772 3.76307 4.65081 3.9613 4.29917 4.31415C3.94754 4.66701 3.75 5.14559 3.75 5.6446ZM26.25 5.6446C26.25 4.86259 25.623 4.23345 24.8438 4.23345H10.7812C10.002 4.23345 9.375 4.86259 9.375 5.6446C9.375 6.42661 10.002 7.05575 10.7812 7.05575H24.8438C25.623 7.05575 26.25 6.42661 26.25 5.6446Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 10H30V26C30 27.6569 28.6569 29 27 29H3C1.34315 29 0 27.6569 0 26V10Z"
						fill="#FFDB00"
					/>
					<path
						className="_iframesymbolslash"
						d="M16.5927 14.0269C16.2208 13.9217 15.8335 14.1343 15.7263 14.4995L12.9261 24.1225C12.8189 24.4876 13.0355 24.8678 13.4074 24.9731C13.7793 25.0783 14.1665 24.8657 14.2737 24.5005L17.0739 14.8775C17.1811 14.5124 16.9646 14.1322 16.5927 14.0269Z"
						fill="white"
					/>
					<path
						className="_iframesymbolstart"
						d="M10.6553 16.6076C10.9287 16.3391 11.3728 16.3391 11.6463 16.6076C11.9198 16.8761 11.9198 17.3122 11.6463 17.5807L9.69052 19.501L11.6463 21.4191C11.9198 21.6876 11.9198 22.1236 11.6463 22.3921C11.3728 22.6606 10.9287 22.6606 10.6553 22.3921L8.20509 19.9864C7.93164 19.7179 7.93164 19.2819 8.20509 19.0134L10.6553 16.6076Z"
						fill="white"
					/>
					<path
						className="_iframesymbolend"
						d="M18.3558 16.6074C18.3555 16.6078 18.3551 16.6081 18.3548 16.6085C18.6283 16.3411 19.0716 16.3414 19.3447 16.6096L21.7949 19.0153C22.0683 19.2838 22.0683 19.7199 21.7949 19.9884L19.3447 22.3941C19.0712 22.6626 18.6271 22.6626 18.3537 22.3941C18.0802 22.1256 18.0802 21.6896 18.3537 21.4211L20.3094 19.5008L18.3558 17.5805C18.0827 17.3123 18.0824 16.8771 18.3548 16.6085C18.3544 16.6088 18.354 16.6092 18.3537 16.6095L18.3558 16.6074Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'iframe',
			displayName: 'Iframe',
			description: 'Iframe',
			icon: 'fa-solid fa-box',
		},
	],

	[Image.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M0 3.75C0 1.68164 1.68164 0 3.75 0H26.25C28.3184 0 30 1.68164 30 3.75V22.5C30 24.5684 28.3184 26.25 26.25 26.25H3.75C1.68164 26.25 0 24.5684 0 22.5V3.75ZM18.9727 9.99023C18.709 9.60352 18.2754 9.375 17.8125 9.375C17.3496 9.375 16.9102 9.60352 16.6523 9.99023L11.5547 17.4668L10.002 15.5273C9.73242 15.1934 9.32812 15 8.90625 15C8.48438 15 8.07422 15.1934 7.81055 15.5273L4.06055 20.2148C3.7207 20.6367 3.65625 21.2168 3.89062 21.7031C4.125 22.1895 4.61719 22.5 5.15625 22.5H10.7812H12.6562H24.8438C25.3652 22.5 25.8457 22.2129 26.0859 21.75C26.3262 21.2871 26.2969 20.7305 26.0039 20.3027L18.9727 9.99023ZM6.5625 9.375C7.30842 9.375 8.02379 9.07868 8.55124 8.55124C9.07868 8.02379 9.375 7.30842 9.375 6.5625C9.375 5.81658 9.07868 5.10121 8.55124 4.57376C8.02379 4.04632 7.30842 3.75 6.5625 3.75C5.81658 3.75 5.10121 4.04632 4.57376 4.57376C4.04632 5.10121 3.75 5.81658 3.75 6.5625C3.75 7.30842 4.04632 8.02379 4.57376 8.55124C5.10121 9.07868 5.81658 9.375 6.5625 9.375Z"
						fill="#EDEAEA"
					/>
					<path
						d="M6.5625 9.375C7.30842 9.375 8.02379 9.07868 8.55124 8.55124C9.07868 8.02379 9.375 7.30842 9.375 6.5625C9.375 5.81658 9.07868 5.10121 8.55124 4.57376C8.02379 4.04632 7.30842 3.75 6.5625 3.75C5.81658 3.75 5.10121 4.04632 4.57376 4.57376C4.04632 5.10121 3.75 5.81658 3.75 6.5625C3.75 7.30842 4.04632 8.02379 4.57376 8.55124C5.10121 9.07868 5.81658 9.375 6.5625 9.375Z"
						fill="#EDEAEA"
					/>
					<path
						d="M18.9727 9.99023C18.709 9.60352 18.2754 9.375 17.8125 9.375C17.3496 9.375 16.9102 9.60352 16.6524 9.99023L11.5547 17.4668L10.002 15.5273C9.73245 15.1934 9.32816 15 8.90628 15C8.48441 15 8.07425 15.1934 7.81058 15.5273L4.06058 20.2148C3.72074 20.6367 3.65628 21.2168 3.89066 21.7031C4.12503 22.1895 4.61722 22.5 5.15628 22.5H10.7813H12.6563H24.8438C25.3653 22.5 25.8457 22.2129 26.086 21.75C26.3262 21.2871 26.2969 20.7305 26.0039 20.3027L18.9727 9.99023Z"
						fill="#3F83EA"
					/>
					<circle className="_imageCircle" cx="7" cy="7" r="3" fill="#FFB534" />
				</IconHelper>
			),
		},
		{
			name: 'image',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'zoomPreview',
			displayName: 'Zoom Preview',
			description: 'Zoom Preview Window',
			icon: 'fa-solid fa-magnifying-glass-plus',
		},
		{
			name: 'magnifier',
			displayName: 'Magnifier',
			description: 'Magnification Lens',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'sliderHandle',
			displayName: 'Slider Handle',
			description: 'Image Comparison Slider Handle',
			icon: 'fa-solid fa-arrows-left-right',
		},
		{
			name: 'sliderLine',
			displayName: 'Slider Line',
			description: 'Image Comparison Slider Line',
			icon: 'fa-solid fa-grip-lines-vertical',
		},
		{
			name: 'tooltip',
			displayName: 'Tooltip',
			description: 'Image Tooltip',
			icon: 'fa-solid fa-comment',
		},
	],

	[ImageWithBrowser.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 32 27">
					<path
						d="M0 4.86107V2.77775C0 1.24306 1.22047 0 2.72727 0H27.2727C28.7795 0 30 1.24306 30 2.77775V4.86107H0ZM20.4545 2.77775C20.4545 3.1597 20.7614 3.47219 21.1364 3.47219H26.5909C26.9659 3.47219 27.2727 3.1597 27.2727 2.77775C27.2727 2.39581 26.9659 2.08331 26.5909 2.08331H21.1364C20.7614 2.08331 20.4545 2.39581 20.4545 2.77775ZM6.15011 2.77775C6.15011 3.1597 6.45693 3.47219 6.83193 3.47219C7.20693 3.47219 7.51375 3.1597 7.51375 2.77775C7.51375 2.39581 7.20693 2.08331 6.83193 2.08331H6.82511C6.45011 2.08331 6.15011 2.39581 6.15011 2.77775ZM4.10465 2.77775C4.10465 3.1597 4.41147 3.47219 4.78647 3.47219C5.16147 3.47219 5.46829 3.1597 5.46829 2.77775C5.46829 2.39581 5.16147 2.08331 4.78647 2.08331H4.77965C4.40465 2.08331 4.10465 2.39581 4.10465 2.77775ZM2.0592 2.77775C2.0592 3.1597 2.36602 3.47219 2.74102 3.47219C3.11602 3.47219 3.42284 3.1597 3.42284 2.77775C3.42284 2.39581 3.11602 2.08331 2.74102 2.08331H2.7342C2.3592 2.08331 2.0592 2.39581 2.0592 2.77775Z"
						fill="#4C7FEE"
					/>
					<path
						d="M0 6H30V23C30 24.1046 29.1046 25 28 25H2C0.89543 25 0 24.1046 0 23V6Z"
						fill="#EDEAEA"
					/>
					<path
						d="M11.3228 15.4779L6.63111 21.4833C6.37465 21.8116 6.60855 22.2911 7.02512 22.2911H22.9325C23.3564 22.2911 23.588 21.7967 23.3166 21.471L19.8059 17.2582C19.6133 17.0271 19.2616 17.0172 19.0563 17.2372L16.6318 19.8348C16.4294 20.0517 16.0837 20.0456 15.889 19.8217L12.0942 15.4576C11.8879 15.2204 11.5164 15.2302 11.3228 15.4779Z"
						fill="#4C7FEE"
					/>
					<circle className="_IWBCircle" cx="19.3" cy="11.291" r="2" fill="#4C7FEE" />
				</IconHelper>
			),
		},
		{
			name: 'image',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
	],

	[KIRunEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.14429 9.80664V26.5148C7.14429 27.0671 7.592 27.5148 8.14429 27.5148H19.793"
						stroke="black"
						strokeOpacity="0.3"
						strokeWidth="0.75"
						strokeDasharray="2 1"
						fill="none"
					/>
					<path
						d="M24.7 18.6621V4.48371C24.7 3.93143 24.2522 3.48371 23.7 3.48371H12.0513"
						stroke="black"
						strokeOpacity="0.3"
						strokeWidth="0.75"
						strokeDasharray="2 1"
						fill="none"
					/>
					<circle className="_circle11" cx="8.72538" cy="3.67326" r="2" fill="#00ADB7" />
					<path
						d="M2.55914 0.953125C1.59987 0.953125 0.819946 1.73304 0.819946 2.69232V4.43151C0.819946 5.39078 1.59987 6.1707 2.55914 6.1707H12.9943C13.9536 6.1707 14.7335 5.39078 14.7335 4.43151V2.69232C14.7335 1.73304 13.9536 0.953125 12.9943 0.953125H2.55914ZM10.1681 2.90972C10.3411 2.90972 10.507 2.97843 10.6293 3.10074C10.7516 3.22305 10.8203 3.38894 10.8203 3.56191C10.8203 3.73489 10.7516 3.90077 10.6293 4.02309C10.507 4.1454 10.3411 4.21411 10.1681 4.21411C9.99513 4.21411 9.82924 4.1454 9.70693 4.02309C9.58462 3.90077 9.5159 3.73489 9.5159 3.56191C9.5159 3.38894 9.58462 3.22305 9.70693 3.10074C9.82924 2.97843 9.99513 2.90972 10.1681 2.90972ZM11.4725 3.56191C11.4725 3.38894 11.5412 3.22305 11.6635 3.10074C11.7858 2.97843 11.9517 2.90972 12.1247 2.90972C12.2977 2.90972 12.4636 2.97843 12.5859 3.10074C12.7082 3.22305 12.7769 3.38894 12.7769 3.56191C12.7769 3.73489 12.7082 3.90077 12.5859 4.02309C12.4636 4.1454 12.2977 4.21411 12.1247 4.21411C11.9517 4.21411 11.7858 4.1454 11.6635 4.02309C11.5412 3.90077 11.4725 3.73489 11.4725 3.56191ZM2.55914 7.90989C1.59987 7.90989 0.819946 8.68981 0.819946 9.64908V11.3883C0.819946 12.3475 1.59987 13.1275 2.55914 13.1275H12.9943C13.9536 13.1275 14.7335 12.3475 14.7335 11.3883V9.64908C14.7335 8.68981 13.9536 7.90989 12.9943 7.90989H2.55914ZM10.1681 9.86648C10.3411 9.86648 10.507 9.93519 10.6293 10.0575C10.7516 10.1798 10.8203 10.3457 10.8203 10.5187C10.8203 10.6917 10.7516 10.8575 10.6293 10.9798C10.507 11.1022 10.3411 11.1709 10.1681 11.1709C9.99513 11.1709 9.82924 11.1022 9.70693 10.9798C9.58462 10.8575 9.5159 10.6917 9.5159 10.5187C9.5159 10.3457 9.58462 10.1798 9.70693 10.0575C9.82924 9.93519 9.99513 9.86648 10.1681 9.86648ZM11.6899 10.5187C11.6899 10.3457 11.7586 10.1798 11.8809 10.0575C12.0032 9.93519 12.1691 9.86648 12.3421 9.86648C12.5151 9.86648 12.681 9.93519 12.8033 10.0575C12.9256 10.1798 12.9943 10.3457 12.9943 10.5187C12.9943 10.6917 12.9256 10.8575 12.8033 10.9798C12.681 11.1022 12.5151 11.1709 12.3421 11.1709C12.1691 11.1709 12.0032 11.1022 11.8809 10.9798C11.7586 10.8575 11.6899 10.6917 11.6899 10.5187Z"
						fill="#BC065B"
					/>
					<path
						d="M10.1681 2.90972C10.3411 2.90972 10.507 2.97843 10.6293 3.10074C10.7516 3.22305 10.8203 3.38894 10.8203 3.56191C10.8203 3.73489 10.7516 3.90077 10.6293 4.02309C10.507 4.1454 10.3411 4.21411 10.1681 4.21411C9.99513 4.21411 9.82924 4.1454 9.70693 4.02309C9.58462 3.90077 9.5159 3.73489 9.5159 3.56191C9.5159 3.38894 9.58462 3.22305 9.70693 3.10074C9.82924 2.97843 9.99513 2.90972 10.1681 2.90972Z"
						fill="#BC065B"
					/>
					<path
						d="M11.4725 3.56191C11.4725 3.38894 11.5412 3.22305 11.6635 3.10074C11.7858 2.97843 11.9517 2.90972 12.1247 2.90972C12.2977 2.90972 12.4636 2.97843 12.5859 3.10074C12.7082 3.22305 12.7769 3.38894 12.7769 3.56191C12.7769 3.73489 12.7082 3.90077 12.5859 4.02309C12.4636 4.1454 12.2977 4.21411 12.1247 4.21411C11.9517 4.21411 11.7858 4.1454 11.6635 4.02309C11.5412 3.90077 11.4725 3.73489 11.4725 3.56191Z"
						fill="#BC065B"
					/>
					<path
						d="M10.1681 9.86648C10.3411 9.86648 10.507 9.93519 10.6293 10.0575C10.7516 10.1798 10.8203 10.3457 10.8203 10.5187C10.8203 10.6917 10.7516 10.8575 10.6293 10.9798C10.507 11.1022 10.3411 11.1709 10.1681 11.1709C9.99513 11.1709 9.82924 11.1022 9.70693 10.9798C9.58462 10.8575 9.5159 10.6917 9.5159 10.5187C9.5159 10.3457 9.58462 10.1798 9.70693 10.0575C9.82924 9.93519 9.99513 9.86648 10.1681 9.86648Z"
						fill="#BC065B"
					/>
					<path
						d="M11.6899 10.5187C11.6899 10.3457 11.7586 10.1798 11.8809 10.0575C12.0032 9.93519 12.1691 9.86648 12.3421 9.86648C12.5151 9.86648 12.681 9.93519 12.8033 10.0575C12.9256 10.1798 12.9943 10.3457 12.9943 10.5187C12.9943 10.6917 12.9256 10.8575 12.8033 10.9798C12.681 11.1022 12.5151 11.1709 12.3421 11.1709C12.1691 11.1709 12.0032 11.1022 11.8809 10.9798C11.7586 10.8575 11.6899 10.6917 11.6899 10.5187Z"
						fill="#BC065B"
					/>
					<path
						d="M18.5281 19.4538C19.7749 20.4005 22.3184 20.9002 24.7528 20.9002C27.1872 20.9002 29.7306 20.4005 30.9775 19.4538V21.4329C30.9775 22.3735 28.3154 23.4255 24.7528 23.4255C21.1902 23.4255 18.5281 22.3735 18.5281 21.4329V19.4538ZM18.5281 24.7424C18.5281 25.6829 21.1902 26.7349 24.7528 26.7349C28.3154 26.7349 30.9775 25.6829 30.9775 24.7424V22.7632C29.7306 23.7098 27.1872 24.2096 24.7528 24.2096C22.3184 24.2096 19.7749 23.7098 18.5281 22.7632V24.7424ZM18.5281 28.0518C18.5281 28.9924 21.1902 30.0444 24.7528 30.0444C28.3154 30.0444 30.9775 28.9924 30.9775 28.0518V26.0727C29.7306 27.0193 27.1872 27.5191 24.7528 27.5191C22.3184 27.5191 19.7749 27.0193 18.5281 26.0727V28.0518ZM30.9775 18.1234C30.9775 17.1829 28.3154 16.1309 24.7528 16.1309C21.1902 16.1309 18.5281 17.1829 18.5281 18.1234C18.5281 19.0641 21.1902 20.1161 24.7528 20.1161C28.3154 20.1161 30.9775 19.0641 30.9775 18.1234Z"
						fill="#00ADB7"
					/>
					<circle cx="8.72538" cy="3.67326" r="0.94865" fill="white" />
					<circle cx="8.72538" cy="10.5033" r="0.94865" fill="white" />
					<circle cx="12.3935" cy="3.67326" r="0.94865" fill="white" />
					<circle cx="12.3935" cy="10.5033" r="0.94865" fill="white" />
				</IconHelper>
			),
		},
	],

	[Link.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						className="_linkbox"
						y="0.5"
						width="30"
						height="30"
						rx="4"
						fill="#09A0C2"
					/>
					<path
						className="_linkarrowleft"
						d="M17.8963 8C18.5949 8 19.2963 8 19.9949 8C21.1098 8 22.222 8 23.3369 8C23.5912 8 23.8455 8 24.0998 8C24.4575 8 24.8347 7.832 25.089 7.562C25.3321 7.301 25.5137 6.875 25.497 6.5C25.4802 6.113 25.3628 5.711 25.089 5.438C24.8151 5.168 24.4798 5 24.0998 5C23.4012 5 22.6998 5 22.0012 5C20.8863 5 19.7741 5 18.6592 5C18.4049 5 18.1506 5 17.8963 5C17.5386 5 17.1614 5.168 16.9071 5.438C16.664 5.699 16.4824 6.125 16.4991 6.5C16.5159 6.887 16.6332 7.289 16.9071 7.562C17.1809 7.829 17.5191 8 17.8963 8Z"
						fill="white"
					/>
					<path
						className="_linkarrowright"
						d="M25.498 12.6017C25.498 11.9032 25.498 11.2018 25.498 10.5032C25.498 9.38823 25.498 8.27607 25.498 7.16112C25.498 6.90683 25.498 6.65254 25.498 6.39826C25.498 6.04058 25.33 5.66334 25.06 5.40905C24.799 5.16594 24.373 4.98431 23.998 5.00107C23.611 5.01784 23.209 5.1352 22.936 5.40905C22.666 5.6829 22.498 6.01822 22.498 6.39826C22.498 7.09685 22.498 7.79823 22.498 8.49682C22.498 9.61177 22.498 10.7239 22.498 11.8389C22.498 12.0932 22.498 12.3475 22.498 12.6017C22.498 12.9594 22.666 13.3367 22.936 13.5909C23.197 13.8341 23.623 14.0157 23.998 13.9989C24.385 13.9822 24.787 13.8648 25.06 13.5909C25.327 13.3171 25.498 12.979 25.498 12.6017Z"
						fill="white"
					/>
					<path
						className="_linkarrowtail"
						d="M14.3211 18.1022C14.6799 17.7435 15.0414 17.3821 15.4001 17.0233C16.2563 16.1673 17.1152 15.3086 17.9713 14.4526C19.0068 13.4172 20.0424 12.3818 21.0806 11.3437C21.9803 10.4442 22.8772 9.54745 23.7768 8.64795C24.2117 8.21315 24.6547 7.78106 25.0842 7.34083C25.0896 7.33539 25.095 7.32996 25.1032 7.3218C25.3505 7.07451 25.5 6.71036 25.5 6.3598C25.5 6.02555 25.3532 5.62879 25.1032 5.3978C24.845 5.16138 24.5052 4.98474 24.141 5.00104C23.7795 5.01735 23.4398 5.13964 23.1789 5.3978C22.8201 5.75651 22.4586 6.11794 22.0999 6.47666C21.2437 7.33267 20.3848 8.19141 19.5287 9.04743C18.4932 10.0828 17.4576 11.1182 16.4194 12.1563C15.5197 13.0558 14.6228 13.9525 13.7232 14.852C13.2883 15.2868 12.8453 15.7189 12.4158 16.1592C12.4104 16.1646 12.405 16.17 12.3968 16.1782C12.1495 16.4255 12 16.7896 12 17.1402C12 17.4745 12.1468 17.8712 12.3968 18.1022C12.655 18.3386 12.9948 18.5153 13.359 18.499C13.7205 18.4854 14.0602 18.3631 14.3211 18.1022Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'externalIcon',
			displayName: 'External Icon',
			description: 'External Icon',
			icon: 'fa-solid fa-box',
		},
	],

	[MarkdownEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="#834E63" />
					<path
						className="_MarkdownEditorMIcon"
						d="M13.5801 20.8509H16.7596V10H13.5697L10.3798 13.9887L7.18991 10H4V20.8509H7.20028V14.6267L10.3902 18.6153L13.5801 14.6267V20.8509Z"
						fill="white"
					/>
					<path
						className="_MarkdownEditorArrowIcon"
						d="M18 15.1421L22.5375 20.4366L27.07 15.1421H24.0467V10H21.0233V15.1421H18Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'tabBar',
			displayName: 'Tab Bar',
			description: 'Tab Bar',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabButton',
			displayName: 'Tab Button',
			description: 'Tab Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabSeparator',
			displayName: 'Tab Separator',
			description: 'Tab Separator',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'textArea',
			displayName: 'Text Area',
			description: 'Text Area',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markdownContainer',
			displayName: 'Markdown Container',
			description: 'Markdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'em',
			displayName: 'Emphasised Text',
			description: 'Emphasised Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'b',
			displayName: 'Bold Text',
			description: 'Bold Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'p',
			displayName: 'Paragraph',
			description: 'Paragraph',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'mark',
			displayName: 'High Light Text',
			description: 'High Light Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 's',
			displayName: 'Strike Through Text',
			description: 'Strike Through Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sup',
			displayName: 'Super Script',
			description: 'Super Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sub',
			displayName: 'Sub Script',
			description: 'Sub Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'br',
			displayName: 'Line Break',
			description: 'Line Break',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ol',
			displayName: 'Ordered List',
			description: 'Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'oli',
			displayName: 'Ordered List Item',
			description: 'Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ul',
			displayName: 'Un Ordered List',
			description: 'Un Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ulli',
			displayName: 'Un Ordered List Item',
			description: 'Un Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlli',
			displayName: 'Task List Item',
			description: 'Task List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlcheckbox',
			displayName: 'Task List Checkbox',
			description: 'Task List Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'links',
			displayName: 'Links',
			description: 'Links',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'linksHover',
			displayName: 'Links Hover',
			description: 'Links Hover',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'images',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icBlock',
			displayName: 'Inline Code Block',
			description: 'Inline Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlock',
			displayName: 'Code Block',
			description: 'Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockKeywords',
			displayName: 'Code Block Keywords',
			description: 'Code Block Keywords',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockVariables',
			displayName: 'Code Block Variables',
			description: 'Code Block Variables',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'table',
			displayName: 'Table',
			description: 'Table',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'th',
			displayName: 'Table Header Cell',
			description: 'Table Header Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tr',
			displayName: 'Table Row',
			description: 'Table Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'td',
			displayName: 'Table Cell',
			description: 'Table Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'blockQuotes',
			displayName: 'Block Quote',
			description: 'Block Quote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hr',
			displayName: 'Horizontal Rule',
			description: 'Horizontal Rule',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'video',
			displayName: 'Video',
			description: 'Video',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNote',
			displayName: 'Footnote',
			description: 'Footnote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNoteLink',
			displayName: 'Footnote Link',
			description: 'Footnote Link',
			icon: 'fa-solid fa-box',
		},
	],

	[MarkdownTOC.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="3" fill="#3DBCB8" />
					<path
						d="M26 13.5H11C10.7239 13.5 10.5 13.7239 10.5 14V16C10.5 16.2761 10.7239 16.5 11 16.5H26C26.2761 16.5 26.5 16.2761 26.5 16V14C26.5 13.7239 26.2761 13.5 26 13.5Z"
						fill="white"
						className="_MTOCLine2"
					/>
					<path
						d="M4.5 15C4.5 15.8284 5.17157 16.5 6 16.5C6.82843 16.5 7.5 15.8284 7.5 15C7.5 14.1716 6.82843 13.5 6 13.5C5.17157 13.5 4.5 14.1716 4.5 15Z"
						fill="white"
						className="_MTOCcircle1"
					/>
					<path
						d="M22 7.5H11C10.7239 7.5 10.5 7.72386 10.5 8V10C10.5 10.2761 10.7239 10.5 11 10.5H22C22.2761 10.5 22.5 10.2761 22.5 10V8C22.5 7.72386 22.2761 7.5 22 7.5Z"
						fill="white"
						className="_MTOCLine1"
					/>
					<path
						d="M4.5 9C4.5 9.82843 5.17157 10.5 6 10.5C6.82843 10.5 7.5 9.82843 7.5 9C7.5 8.17157 6.82843 7.5 6 7.5C5.17157 7.5 4.5 8.17157 4.5 9Z"
						fill="white"
						className="_MTOCcircle1"
					/>
					<path
						d="M22 19.5H11C10.7239 19.5 10.5 19.7239 10.5 20V22C10.5 22.2761 10.7239 22.5 11 22.5H22C22.2761 22.5 22.5 22.2761 22.5 22V20C22.5 19.7239 22.2761 19.5 22 19.5Z"
						fill="white"
						className="_MTOCLine3"
					/>
					<path
						d="M4.5 21C4.5 21.8284 5.17157 22.5 6 22.5C6.82843 22.5 7.5 21.8284 7.5 21C7.5 20.1716 6.82843 19.5 6 19.5C5.17157 19.5 4.5 20.1716 4.5 21Z"
						fill="white"
						className="_MTOCcircle3"
					/>
				</IconHelper>
			),
		},
		{
			name: 'titleText',
			displayName: 'Title Text',
			description: 'Title Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'collapsibleIcon',
			displayName: 'Collapasible Icon',
			description: 'Collapasible Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topLabel',
			displayName: 'Goto Top Label',
			description: 'gototopLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabel',
			displayName: 'Goto Bottom Label',
			description: 'gotobottomLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bulletIconImage',
			displayName: 'Bullet Icon Image',
			description: 'BulletIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topIconImage',
			displayName: 'Top Icon Image',
			description: 'topIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomIconImage',
			displayName: 'Bottom Icon Image',
			description: 'bottomIconImage',
			icon: 'fa-solid fa-box',
		},
	],

	[Menu.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M15 0.85C7.19505 0.85 0.85 7.19505 0.85 15C0.85 22.8049 7.19505 29.15 15 29.15C22.8049 29.15 29.15 22.8049 29.15 15C29.15 7.19505 22.8049 0.85 15 0.85Z"
						fill="#02B694"
						stroke="#02B694"
						strokeWidth="0.3"
					/>
					<path
						d="M20.3023 8.85H9.69767C9.44104 8.85 9.22511 8.99519 9.07931 9.20417C8.93365 9.41295 8.85 9.69401 8.85 10C8.85 10.306 8.93365 10.5871 9.07931 10.7958C9.22511 11.0048 9.44104 11.15 9.69767 11.15H20.3023C20.559 11.15 20.7749 11.0048 20.9207 10.7958C21.0663 10.5871 21.15 10.306 21.15 10C21.15 9.69401 21.0663 9.41295 20.9207 9.20417C20.7749 8.99519 20.559 8.85 20.3023 8.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner1"
					/>
					<path
						d="M20.3023 13.85H9.69767C9.44104 13.85 9.22511 13.9952 9.07931 14.2042C8.93365 14.4129 8.85 14.694 8.85 15C8.85 15.306 8.93365 15.5871 9.07931 15.7958C9.22511 16.0048 9.44104 16.15 9.69767 16.15H20.3023C20.559 16.15 20.7749 16.0048 20.9207 15.7958C21.0663 15.5871 21.15 15.306 21.15 15C21.15 14.694 21.0663 14.4129 20.9207 14.2042C20.7749 13.9952 20.559 13.85 20.3023 13.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner2"
					/>
					<path
						d="M20.3023 18.85H9.69767C9.44104 18.85 9.22511 18.9952 9.07931 19.2042C8.93365 19.4129 8.85 19.694 8.85 20C8.85 20.306 8.93365 20.5871 9.07931 20.7958C9.22511 21.0048 9.44104 21.15 9.69767 21.15H20.3023C20.559 21.15 20.7749 21.0048 20.9207 20.7958C21.0663 20.5871 21.15 20.306 21.15 20C21.15 19.694 21.0663 19.4129 20.9207 19.2042C20.7749 18.9952 20.559 18.85 20.3023 18.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner3"
					/>
				</IconHelper>
			),
		},
		{
			name: 'externalIcon',
			displayName: 'External Icon',
			description: 'External Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'imageIcon',
			displayName: 'ImageIcon',
			description: 'ImageIcon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'activeImageIcon',
			displayName: 'ActiveImageIcon',
			description: 'ActiveImageIcon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'caretIcon',
			displayName: 'Caret Icon',
			description: 'Caret Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'subMenuContainer',
			displayName: 'Sub Menu Container',
			description: 'Sub Menu Container',
			icon: 'fa-solid fa-box',
		},
	],

	[Otp.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_OtpLockBoxClosed"
						d="M22.6096 10.4048C23.3362 10.5983 23.9952 10.6803 24.5696 10.9439C26.3595 11.7651 27.1696 13.2469 27.1811 15.1597C27.2015 18.5552 27.1926 21.9509 27.1843 25.3465C27.1804 27.0083 26.5587 28.3696 25.1265 29.3025C24.4101 29.7691 23.6113 29.9942 22.7567 29.9949C17.6483 29.9989 12.5398 30.0048 7.43144 29.9933C5.10753 29.9881 3.25934 28.2764 3.04683 25.9728C3.01893 25.6704 3.00237 25.3659 3.00209 25.0624C2.99911 21.7955 3.0001 18.5288 3.00039 15.2619C3.00039 14.1462 3.25736 13.11 3.96597 12.2159C4.79351 11.1717 5.89784 10.6528 7.2127 10.5355C7.30472 10.5273 7.39689 10.5201 7.53097 10.509C7.53097 10.3497 7.52672 10.2013 7.53168 10.0532C7.57373 8.78012 7.49557 7.48863 7.68671 6.23789C8.06374 3.77042 9.42192 1.90477 11.7121 0.836283C14.6998 -0.557505 17.546 -0.210428 20.0859 1.88763C21.6674 3.19388 22.5045 4.94682 22.6 6.99781C22.6538 8.15286 22.6096 9.31268 22.6096 10.4048ZM19.6149 10.5089C19.6149 9.41667 19.6555 8.36195 19.6055 7.31144C19.5265 5.65208 18.7726 4.35511 17.2753 3.56765C14.5876 2.15447 11.0536 3.6025 10.6387 6.83621C10.5054 7.87407 10.5819 8.93849 10.5635 9.99082C10.5605 10.1614 10.5631 10.3323 10.5631 10.5089H19.6149Z"
						fill="#6349D7"
						opacity="0"
					/>
					<path
						className="_OtpLockBoxOpen"
						d="M7.54225 10.491C7.54225 9.25911 7.45796 8.05803 7.55925 6.87269C7.79258 4.1447 9.13021 2.09031 11.5835 0.835227C13.5975 -0.195275 15.6841 -0.253775 17.7886 0.557914C19.0909 1.06023 20.089 1.96346 20.9311 3.05331C21.5542 3.85966 21.9676 4.76725 22.2084 5.75627C22.387 6.48949 21.9595 7.26279 21.2513 7.47865C20.5304 7.69845 19.6597 7.28388 19.4001 6.60551C19.0561 5.70663 18.6605 4.84783 17.9403 4.16186C16.7201 2.99987 14.7784 2.65815 13.2584 3.40445C11.4447 4.29489 10.4749 5.72449 10.5021 7.78409C10.5139 8.67396 10.5041 9.56426 10.5041 10.5097H10.9195C14.7472 10.5097 18.5751 10.5011 22.4027 10.5133C24.2864 10.5193 25.702 11.3374 26.5544 13.0476C26.8891 13.7192 26.9959 14.4485 26.9967 15.1914C27.0004 18.5661 27.0017 21.941 26.9969 25.3157C26.9945 26.9925 26.3827 28.3671 24.9483 29.3068C24.2267 29.7796 23.4214 29.9968 22.5607 29.9971C17.5156 29.9988 12.4704 30.0035 7.42523 29.9954C5.09737 29.9918 3.25964 28.2891 3.04611 25.964C3.01942 25.673 3.00228 25.3801 3.002 25.088C2.99905 21.8071 3.00032 18.526 3.00004 15.245C3.00004 14.0889 3.27678 13.0218 4.02721 12.1152C4.84662 11.1252 5.92029 10.6299 7.18614 10.5214C7.27703 10.5136 7.36777 10.5058 7.54211 10.4908L7.54225 10.491Z"
						fill="#6349D7"
					/>
					<path
						className="_OtpInputstar1"
						d="M7.81534 22.9091L7.93892 21.3324L6.62642 22.2315L6 21.1321L7.4233 20.4545L6 19.777L6.62642 18.6776L7.93892 19.5767L7.81534 18H9.07244L8.94886 19.5767L10.2614 18.6776L10.8878 19.777L9.46449 20.4545L10.8878 21.1321L10.2614 22.2315L8.94886 21.3324L9.07244 22.9091H7.81534Z"
						fill="white"
						opacity="0"
					/>
					<path
						className="_OtpInputstar2"
						d="M14.7415 22.9091L14.8651 21.3324L13.5526 22.2315L12.9261 21.1321L14.3494 20.4545L12.9261 19.777L13.5526 18.6776L14.8651 19.5767L14.7415 18H15.9986L15.875 19.5767L17.1875 18.6776L17.8139 19.777L16.3906 20.4545L17.8139 21.1321L17.1875 22.2315L15.875 21.3324L15.9986 22.9091H14.7415Z"
						fill="white"
						opacity="0"
					/>
					<path
						className="_OtpInputstar3"
						d="M21.7415 22.9091L21.8651 21.3324L20.5526 22.2315L19.9261 21.1321L21.3494 20.4545L19.9261 19.777L20.5526 18.6776L21.8651 19.5767L21.7415 18H22.9986L22.875 19.5767L24.1875 18.6776L24.8139 19.777L23.3906 20.4545L24.8139 21.1321L24.1875 22.2315L22.875 21.3324L22.9986 22.9091H21.7415Z"
						fill="white"
						opacity="0"
					/>

					<rect
						className="_OtpInputBox1"
						x="6"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
					<rect
						className="_OtpInputBox2"
						x="12.8181"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
					<rect
						className="_OtpInputBox3"
						x="19.6364"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
				</IconHelper>
			),
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'activeInputBox',
			displayName: 'Active Input Box',
			description: 'Active Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'visibilityToggle',
			displayName: 'Visibility Toggle Icon',
			description: 'Visibility Toggle Icon',
			icon: 'fa-solid fa-eye',
		},
	],

	[Page.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M17.3144 7.68985V2H1.86912C0.838487 2 0 2.88456 0 3.97183V28.0282C0 29.1154 0.838487 30 1.86912 30H23.3309C24.3615 30 25.2 29.1154 25.2 28.0282V10.319H19.8065C18.4324 10.319 17.3144 9.13954 17.3144 7.68985Z"
						fill="#F72C5B"
						fillOpacity="0.1"
					/>
					<path
						d="M18.5623 7.69459C18.5623 8.41944 19.1212 9.00915 19.8083 9.00915H24.278L18.5623 3.00781V7.69459Z"
						fill="#F72C5B"
						fillOpacity="0.1"
					/>
					<path
						d="M20.1143 5.82462V0.134766H4.66905C3.63841 0.134766 2.79993 1.01933 2.79993 2.1066V26.1629C2.79993 27.2502 3.63841 28.1348 4.66905 28.1348H26.1308C27.1614 28.1348 27.9999 27.2502 27.9999 26.1629V8.45372H22.6065C21.2323 8.45372 20.1143 7.27431 20.1143 5.82462Z"
						fill="#F72C5B"
					/>
					<path
						className="_pagePen"
						d="M6.45915 21.1634L10.1542 17.4683C10.7787 16.8439 11.4697 16.8439 12.0942 17.4683C12.7186 18.0928 12.7186 18.7838 12.0942 19.4083L8.39908 23.1033L6.45915 21.1634ZM7.90296 23.3832L6.30469 23.5608C6.12995 23.5802 5.98231 23.4325 6.00172 23.2578L6.17931 21.6595L7.90296 23.3832Z"
						fill="white"
					/>
					<ellipse cx="6.75026" cy="4.75026" rx="0.750265" ry="0.750265" fill="white" />
					<ellipse cx="9.75002" cy="4.75026" rx="0.750265" ry="0.750265" fill="white" />
					<path
						d="M21.3622 5.82936C21.3622 6.5542 21.9212 7.14391 22.6083 7.14391H27.0779L21.3622 1.14258V5.82936Z"
						fill="#F72C5B"
					/>
				</IconHelper>
			),
		},
	],

	[PhoneNumber.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<circle cx="15" cy="15" r="15" fill="#0FBDA0" />
					<path
						className="_phonenumber"
						d="M11.9787 6.81636C11.7197 6.19876 11.049 5.87337 10.4048 6.04603L7.48284 6.84292C6.89845 7.0023 6.5 7.52693 6.5 8.1246C6.5 16.3393 13.1607 23 21.3754 23C21.9731 23 22.4977 22.6015 22.6571 22.0238L23.454 19.1018C23.6266 18.4577 23.3012 17.7803 22.6836 17.528L19.4961 16.1998C18.9515 15.974 18.3273 16.1334 17.9554 16.585L16.6139 18.2186C14.2764 17.1162 12.3838 15.2236 11.2814 12.8861L12.9217 11.5446C13.3732 11.1727 13.5326 10.5485 13.3068 10.0039L11.9787 6.81636Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'dropdownSelect',
			displayName: 'Dropdown Select',
			description: 'Dropdown Select',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedOption',
			displayName: 'Selected Option',
			description: 'Selected Option',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowIcon',
			displayName: 'Arrow Icon',
			description: 'Arrow Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownBody',
			displayName: 'Dropdown Body',
			description: 'Dropdown Body',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchBoxContainer',
			displayName: 'Dropdown Search Box Container',
			description: 'Dropdown Search Box Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchIcon',
			displayName: 'Dropdown Search Icon',
			description: 'Dropdown Search Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchBox',
			displayName: 'Dropdown Search Box',
			description: 'Dropdown Search Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownOptionList',
			displayName: 'Dropdown Option List',
			description: 'Dropdown Option List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownOption',
			displayName: 'Dropdown Option',
			description: 'Dropdown Option',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],

	[Popover.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M1.5 9C0.671573 9 0 8.32843 0 7.5V1.5C0 0.671573 0.671573 0 1.5 0H28.5C29.3284 0 30 0.671573 30 1.5V7.5C30 8.32843 29.3284 9 28.5 9H1.5ZM8.5 3.5H21.5C21.7761 3.5 22 3.72386 22 4V5C22 5.27614 21.7761 5.5 21.5 5.5H8.5C8.22386 5.5 8 5.27614 8 5V4C8 3.72386 8.22386 3.5 8.5 3.5Z"
						fill="#C5A400"
						className="_popOver"
						transform="translate(0, 19)"
						opacity={0}
					/>
					<rect width="30" height="24" rx="2" fill="#C5A400" className="_popOver1" />
					<path
						d="M23.5 11H6.5C6.22386 11 6 11.2239 6 11.5V12.5C6 12.7761 6.22386 13 6.5 13H23.5C23.7761 13 24 12.7761 24 12.5V11.5C24 11.2239 23.7761 11 23.5 11Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M23.5 5H12.5C12.2239 5 12 5.22386 12 5.5V6.5C12 6.77614 12.2239 7 12.5 7H23.5C23.7761 7 24 6.77614 24 6.5V5.5C24 5.22386 23.7761 5 23.5 5Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M23.5 17H12.5C12.2239 17 12 17.2239 12 17.5V18.5C12 18.7761 12.2239 19 12.5 19H23.5C23.7761 19 24 18.7761 24 18.5V17.5C24 17.2239 23.7761 17 23.5 17Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M10.6062 28.95C10.3368 29.4167 9.66321 29.4167 9.39378 28.95L6.27609 23.55C6.00666 23.0833 6.34345 22.5 6.88231 22.5H13.1177C13.6566 22.5 13.9933 23.0833 13.7239 23.55L10.6062 28.95Z"
						fill="#C5A400"
						className="_popOver1"
					/>
				</IconHelper>
			),
		},
		{
			name: 'popoverParentContainer',
			displayName: 'Popover Parent Container',
			description: 'Popover Parent Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'popoverContainer',
			displayName: 'Popover Container',
			description: 'Popover Container',
			icon: 'fa-solid fa-box',
		},
	],

	[Popup.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 26">
					<path
						d="M29.6971 0H27.9555C27.7873 0 27.6515 0.134272 27.6515 0.301832V19.7241H0.302883C0.135851 19.7241 0 19.8594 0 20.0259V21.6982C0 21.8646 0.135851 22 0.302883 22H29.6971C29.8641 22 30 21.8646 30 21.6982V0.301889C30 0.134329 29.8641 0 29.6971 0Z"
						fill="#EDEAEA"
					/>
					<rect width="26" height="18" rx="1" fill="#B35900" />
					<path
						d="M5.89245 4.03022H9.02365C9.18494 4.03022 9.31612 3.90939 9.31612 3.75985V2.26938C9.31612 2.11983 9.18494 2 9.02365 2H2.29247C2.13118 2 2 2.11983 2 2.26938V8.24026C2 8.3898 2.13118 8.50963 2.29247 8.50963H3.97636C4.13872 8.50963 4.2699 8.3898 4.2699 8.24026V5.45041L9.31505 9.92572C9.37204 9.97524 9.44516 10 9.51828 10C9.59139 10 9.66452 9.97524 9.72043 9.92572L10.9097 8.86901C10.9677 8.8185 11 8.74819 11 8.6749C11 8.60261 10.9677 8.5313 10.9097 8.4808L5.89245 4.03022Z"
						fill="white"
						className="_popupInner"
					/>
				</IconHelper>
			),
		},
		{
			name: 'modal',
			displayName: 'Modal',
			description: 'Modal',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'titleGrid',
			displayName: 'Title Grid',
			description: 'Title Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeButton',
			displayName: 'Close Button',
			description: 'Close Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'modalTitle',
			displayName: 'Modal Title',
			description: 'Modal Title',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeButtonContainer',
			displayName: 'Close Button Container',
			description: 'Close Button Container',
			icon: 'fa-solid fa-box',
		},
	],

	[ProgressBar.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<rect
						className="_progressBarInner1"
						x="5.625"
						y="8.75781"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 5.625 8.75781)"
						fill="#7B66FF"
					/>
					<rect
						className="_progressBarInner2"
						x="13.4379"
						y="8.75781"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 13.4379 8.75781)"
						fill="#7B66FF"
					/>
					<rect
						className="_progressBarInner3"
						x="21.2496"
						y="8.75781"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 21.2496 8.75781)"
						fill="#7B66FF"
					/>
					<rect
						className="_progressBarInner4"
						x="29.0625"
						y="8.75781"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 29.0625 8.75781)"
						fill="#EDEAEA"
					/>
				</IconHelper>
			),
		},
		{
			name: 'track',
			displayName: 'Track',
			description: 'Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'progress',
			displayName: 'Progress',
			description: 'Progress',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
	],

	[RadioButton.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<circle
						className="_radioButtonArc"
						cx="15"
						cy="15"
						r="13.5"
						stroke="#EDEAEA"
						strokeWidth={3}
						fill="white"
						fillOpacity={1}
					/>
					<circle className="_RadioButtonCircle" cx="15" cy="15" r="10" fill="#36d593" />
				</IconHelper>
			),
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'checkbox',
			displayName: 'Radio / Checkbox',
			description: 'Radio / Chedckbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Circle / Tick',
			description: 'Circle / Tick',
			icon: 'fa-solid fa-box',
		},
	],

	[RangeSlider.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 12">
					<rect
						className="_RangeSliderTrack"
						y="3"
						width="28"
						height="3"
						rx="0.5"
						fill="#EDEAEA"
					/>
					<path
						className="_RangeSliderRangeTrack"
						d="M0 3.5C0 3.22386 0.223858 3 0.5 3H15V6H0.5C0.223858 6 0 5.77614 0 5.5V3.5Z"
						fill="#A170FF"
					/>
					<circle
						className="_RangeSliderThumbPit"
						cx="15"
						cy="4"
						r="3"
						fill="white"
						stroke="#A170FF"
						strokeWidth="2"
					/>
				</IconHelper>
			),
		},
		{
			name: 'track',
			displayName: 'Track',
			description: 'Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rangeTrack',
			displayName: 'Range Track',
			description: 'Range Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb1',
			displayName: 'Thumb 1',
			description: 'First Slider Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb2',
			displayName: 'Thumb 2',
			description: 'Second slider thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbPit1',
			displayName: 'Thumb Pit 1',
			description: 'First Slider Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbPit2',
			displayName: 'Thumb Pit 2',
			description: 'Second slider thumb pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolTip1',
			displayName: 'Tool Tip 1',
			description: 'First Slider tooltip',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolTip2',
			displayName: 'Tool Tip 2',
			description: 'Second slider tooltip',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'minLabel',
			displayName: 'Min Label',
			description: 'Min Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'maxLabel',
			displayName: 'Max Label',
			description: 'Max Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topLabelContainer',
			displayName: 'Top Label Container',
			description: 'Top Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabelContainer',
			displayName: 'Bottom Label Container',
			description: 'Bottom Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumb',
			displayName: 'Mark Thumb',
			description: 'Mark Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumbPit',
			displayName: 'Mark Thumb Pit',
			description: 'Mark Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markLabel',
			displayName: 'Mark Label',
			description: 'Mark Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ticksContainer',
			displayName: 'Ticks Container',
			description: 'Ticks Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickContainer',
			displayName: 'Tick Container',
			description: 'Tick Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tick',
			displayName: 'Tick',
			description: 'Tick',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickLabel',
			displayName: 'Tick Label',
			description: 'Tick Label',
			icon: 'fa-solid fa-box',
		},
	],

	[SSEventListener.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',

			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path d="M15 0L5 10V20L15 30L25 20V10L15 0Z" fill="#FF7599" />
				</IconHelper>
			),
			mainComponent: true,
		},
	],

	[SchemaBuilder.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_SchemaBuilderDBTop"
						d="M25.9965 4.24528C25.9965 5.22035 24.6698 6.27991 22.448 7.0825C19.9361 7.99069 16.5786 8.49055 12.9982 8.49055C9.41788 8.49055 6.06042 7.99069 3.54851 7.0825C1.32671 6.27991 0 5.22035 0 4.24528C0 3.2702 1.32671 2.21064 3.54851 1.40805C6.06042 0.499858 9.41788 0 12.9982 0C16.5786 0 19.9361 0.499858 22.448 1.40805C24.6698 2.21064 25.9965 3.2702 25.9965 4.24528Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB1"
						d="M25.9965 6.77832V11.4108C25.9965 12.3859 24.6698 13.4454 22.448 14.248C19.9361 15.1562 16.5786 15.6561 12.9982 15.6561C9.41788 15.6561 6.06042 15.1562 3.54851 14.248C1.32671 13.4454 0 12.3859 0 11.4108V6.77832C0.137978 6.89448 0.290108 7.00361 0.449313 7.11273C0.502381 7.15145 0.558988 7.18666 0.615594 7.22538C0.675738 7.2641 0.739421 7.30634 0.803103 7.34506C0.831406 7.36266 0.859709 7.38026 0.888012 7.39786C0.941081 7.42954 0.997687 7.46122 1.05076 7.49291C1.07198 7.50699 1.09675 7.51755 1.11798 7.53163C1.15689 7.55275 1.19581 7.57387 1.23473 7.59499C1.25949 7.60907 1.28779 7.62315 1.31256 7.63723C1.35148 7.65835 1.39039 7.67947 1.42931 7.69707C1.46115 7.71467 1.49299 7.72875 1.5213 7.74636C1.54252 7.75692 1.56729 7.771 1.58852 7.78156C1.61328 7.79212 1.63451 7.80268 1.65927 7.81676C1.75833 7.86604 1.86093 7.9118 1.96353 7.95756C1.9883 7.96812 2.01306 7.97868 2.03429 7.98924C2.09444 8.01741 2.15812 8.04557 2.2218 8.07021C2.26072 8.08781 2.29963 8.10189 2.33501 8.11949C2.37393 8.13709 2.41285 8.15117 2.45176 8.16877C2.49068 8.18637 2.5296 8.20045 2.56851 8.21805C2.60389 8.23213 2.64281 8.24621 2.67819 8.26029C2.72064 8.2779 2.76664 8.2955 2.80909 8.30958C2.89046 8.34126 2.97183 8.37294 3.05674 8.4011C5.72786 9.36561 9.25868 9.89363 12.9982 9.89363C16.7378 9.89363 20.2686 9.36561 22.9327 8.4011C23.0176 8.36942 23.0989 8.34126 23.1803 8.30958C23.2263 8.29198 23.2688 8.2779 23.3112 8.26029C23.3466 8.24621 23.3855 8.23213 23.4209 8.21805C23.4598 8.20045 23.4987 8.18637 23.5376 8.16877C23.5766 8.15117 23.6155 8.13709 23.6544 8.11949C23.6933 8.10189 23.7322 8.08781 23.7676 8.07021C23.8313 8.04205 23.8914 8.01741 23.9551 7.98924C23.9799 7.97868 24.0046 7.96812 24.0259 7.95756C24.1285 7.9118 24.2311 7.86252 24.3301 7.81676C24.3549 7.8062 24.3761 7.79564 24.4009 7.78156C24.4221 7.771 24.4469 7.76044 24.4681 7.74636C24.4999 7.72875 24.5318 7.71467 24.5601 7.69707C24.599 7.67595 24.6379 7.65483 24.6768 7.63723C24.7051 7.62315 24.7299 7.60907 24.7547 7.59499C24.7936 7.57387 24.8325 7.55275 24.8714 7.53163C24.8962 7.51755 24.9174 7.50699 24.9386 7.49291C24.9952 7.46122 25.0483 7.42954 25.1014 7.39786C25.1297 7.38026 25.158 7.36266 25.1863 7.34506C25.25 7.30634 25.3137 7.26762 25.3738 7.22538C25.4304 7.19018 25.4835 7.15145 25.5401 7.11273C25.7064 7.00713 25.8585 6.89448 25.9965 6.77832Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB2"
						d="M25.9965 13.951V18.5835C25.9965 19.5586 24.6698 20.6182 22.448 21.4208C19.9361 22.329 16.5786 22.8288 12.9982 22.8288C9.41788 22.8288 6.06042 22.329 3.54851 21.4208C1.32671 20.6182 0 19.5586 0 18.5835V13.951C0.750034 14.5636 1.77956 15.1092 3.06382 15.5738C5.72786 16.5348 9.25514 17.0628 12.9982 17.0628C16.7413 17.0628 20.2686 16.5348 22.9327 15.5738C24.2169 15.1092 25.25 14.5636 25.9965 13.951Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB3"
						d="M0 25.7544V21.1219C0.750034 21.7345 1.77956 22.2801 3.06382 22.7447C5.72786 23.7057 9.25514 24.2373 12.9982 24.2373C16.7413 24.2373 20.2686 23.7092 22.9327 22.7447C24.2204 22.2801 25.25 21.7345 25.9965 21.1219V25.7544C25.9965 26.7295 24.6698 27.7891 22.448 28.5917C19.9361 29.4999 16.5786 29.9997 12.9982 29.9997C9.41788 29.9997 6.06042 29.4999 3.54851 28.5917C1.32671 27.7891 0 26.7295 0 25.7544Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderPen"
						d="M16.0484 20.5984L15.9772 20.6692L16.0484 20.7401L20.4604 25.1299L20.5309 25.2001L20.6015 25.1299L29.0052 16.7684C29.728 16.0492 30.0998 15.281 30.0998 14.5026C30.0998 13.7243 29.728 12.956 29.0052 12.2368C28.2823 11.5176 27.5104 11.1479 26.7287 11.1479C25.9469 11.1479 25.175 11.5176 24.4522 12.2368L16.0484 20.5984ZM19.4136 25.7917L19.6212 25.7688L19.4731 25.6214L15.553 21.721L15.4061 21.5748L15.3831 21.7808L14.9792 25.3975C14.9279 25.8572 15.3182 26.2445 15.7786 26.1936L19.4136 25.7917Z"
						fill="#F94A29"
						stroke="white"
						strokeWidth="0.2"
					/>
				</IconHelper>
			),
		},
	],

	[SchemaForm.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 24">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M0 12.75C0 10.6781 1.67812 9 3.75 9H12.75C13.5797 9 14.25 9.67031 14.25 10.5C14.25 11.3297 13.5797 12 12.75 12H3.75C3.3375 12 3 12.3375 3 12.75V23.25C3 23.6625 3.3375 24 3.75 24H23.25C23.6625 24 24 23.6625 24 23.25V17.25C24 16.4203 24.6703 15.75 25.5 15.75C26.3297 15.75 27 16.4203 27 17.25V23.25C27 25.3219 25.3219 27 23.25 27H3.75C1.67812 27 0 25.3219 0 23.25V12.75Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaFormDot1"
						d="M9.03686 18.1861C9.03686 17.7809 8.87688 17.3922 8.59212 17.1057C8.30736 16.8192 7.92114 16.6582 7.51843 16.6582C7.11572 16.6582 6.7295 16.8192 6.44474 17.1057C6.15998 17.3922 6 17.7809 6 18.1861C6 18.5913 6.15998 18.9799 6.44474 19.2665C6.7295 19.553 7.11572 19.714 7.51843 19.714C7.92114 19.714 8.30736 19.553 8.59212 19.2665C8.87688 18.9799 9.03686 18.5913 9.03686 18.1861Z"
						fill="#CD5C08"
					/>
					<path
						className="_SchemaFormDot2"
						d="M13.1474 19.2665C12.8627 19.553 12.4764 19.714 12.0737 19.714C11.671 19.714 11.2848 19.553 11 19.2665C10.7153 18.9799 10.5553 18.5913 10.5553 18.1861C10.5553 17.7809 10.7153 17.3922 11 17.1057C11.2848 16.8192 11.671 16.6582 12.0737 16.6582C12.4764 16.6582 12.8627 16.8192 13.1474 17.1057C13.4322 17.3922 13.5922 17.7809 13.5922 18.1861C13.5922 18.5913 13.4322 18.9799 13.1474 19.2665Z"
						fill="#CD5C08"
					/>
					<path
						className="_SchemaFormPen"
						d="M24.9045 5.56698L26.7883 3.67144H26.7835C27.6708 2.77858 29.1134 2.7738 30.0054 3.67144L31.0494 4.71709C31.9414 5.61472 31.9367 7.08054 31.0304 7.9734L29.1418 9.83075L24.9045 5.56698Z"
						fill="#CD5C08"
					/>
					<path
						className="_SchemaFormPen"
						d="M17.0323 13.4977L23.8273 6.65082L28.0552 10.905L21.1701 17.6898C20.8427 18.0145 20.4441 18.258 20.0075 18.406L16.6148 19.5472C16.202 19.6856 15.7512 19.5806 15.4475 19.2702C15.1438 18.9599 15.0347 18.5063 15.1723 18.0957L16.3016 14.6913C16.4487 14.2425 16.7002 13.8319 17.0323 13.4977Z"
						fill="#CD5C08"
					/>
				</IconHelper>
			),
		},
	],

	[SectionGrid.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="0"
						y="0"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock1"
						fill="#FF557E"
					/>

					<rect
						x="16"
						y="0"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock2"
						fill="#FF557E"
					/>

					<rect
						x="0"
						y="16"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock3"
						fill="#FF557E"
					/>

					<rect
						x="16"
						y="16"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock4"
						fill="#FF557E"
					/>
				</IconHelper>
			),
		},
	],

	[SmallCarousel.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.41416 8.17383H5.06702C4.51473 8.17383 4.06702 8.62154 4.06702 9.17383V21.1865C4.06702 21.7388 4.51473 22.1865 5.06702 22.1865H7.41416C7.96644 22.1865 8.41416 21.7388 8.41416 21.1865V9.17383C8.41416 8.62154 7.96644 8.17383 7.41416 8.17383Z"
						fill="#B1A5FF40"
						className="_carouselsecondframe"
					/>
					<path
						d="M24.9327 8.17383H22.5852C22.0329 8.17383 21.5852 8.62154 21.5852 9.17383V21.1865C21.5852 21.7388 22.0329 22.1865 22.5852 22.1865H24.9327C25.485 22.1865 25.9327 21.7388 25.9327 21.1865V9.17383C25.9327 8.62154 25.485 8.17383 24.9327 8.17383Z"
						fill="#B1A5FF40"
						className="_carouselthirdframe"
					/>
					<path
						d="M29.0001 9.66992H28.0828C27.5305 9.66992 27.0828 10.1176 27.0828 10.6699V19.6934C27.0828 20.2457 27.5305 20.6934 28.0828 20.6934H29C29.5523 20.6934 30.0001 20.2457 30.0001 19.6934V10.6699C30.0001 10.1176 29.5523 9.66992 29.0001 9.66992Z"
						fill="#B1A5FF40"
						className="_carouselfourthframe"
					/>
					<path
						d="M1.91763 9.66992H1C0.447715 9.66992 0 10.1176 0 10.6699V19.6934C0 20.2457 0.447716 20.6934 1 20.6934H1.91763C2.46991 20.6934 2.91763 20.2457 2.91763 19.6934V10.6699C2.91763 10.1176 2.46991 9.66992 1.91763 9.66992Z"
						fill="#B1A5FF40"
						className="_carouselfirstframe"
					/>
					<path
						d="M19.4348 6H10.5673C10.015 6 9.56726 6.44771 9.56726 7V23.3598C9.56726 23.9121 10.015 24.3598 10.5673 24.3598H19.4348C19.9871 24.3598 20.4348 23.9121 20.4348 23.3598V7C20.4348 6.44772 19.9871 6 19.4348 6Z"
						fill="#B1A5FF"
						className="_carouselmainframe"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'prevButton',
			displayName: 'Previous Arrow Button',
			description: 'Previous Arrow Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextButton',
			displayName: 'Next Arrow Button',
			description: 'Next Arrow Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideButtonsContainer',
			displayName: 'Slide Buttons Container',
			description: 'Slide Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dotButtons',
			displayName: 'Dot Buttons',
			description: 'Dot Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slidesContainer',
			displayName: 'Slide Container',
			description: 'Slder Wapper for Slider',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideItem',
			displayName: 'Slide Item',
			description: 'Each Slides in the Slider',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'indicatorContainer',
			displayName: 'Indicator Container',
			description: 'Container for slide indicators',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButton',
			displayName: 'Indicator Button',
			description: 'Individual indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButtonActive',
			displayName: 'Active Indicator Button',
			description: 'Active indicator button',
			icon: 'fa-solid fa-circle-dot',
		},
		{
			name: 'indicatorNavBtn',
			displayName: 'Indicator Navigation Arrow',
			description: 'Indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
		{
			name: 'indicatorNavBtnActive',
			displayName: 'Active Indicator Navigation Arrow',
			description: 'Active indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
	],

	[Stepper.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 12">
					<path
						d="M18 6L10 6"
						stroke="black"
						strokeOpacity="0.1"
						strokeLinecap="square"
						strokeDasharray="1 1"
					/>
					<circle className="_greenStepperInitialIcon" cx="6" cy="6" r="6" fill="white" />
					<path
						d="M6 12C7.5913 12 9.11742 11.3679 10.2426 10.2426C11.3679 9.11742 12 7.5913 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 7.5913 0.632141 9.11742 1.75736 10.2426C2.88258 11.3679 4.4087 12 6 12ZM8.64844 4.89844L5.64844 7.89844C5.42813 8.11875 5.07188 8.11875 4.85391 7.89844L3.35391 6.39844C3.13359 6.17813 3.13359 5.82188 3.35391 5.60391C3.57422 5.38594 3.93047 5.38359 4.14844 5.60391L5.25 6.70547L7.85156 4.10156C8.07187 3.88125 8.42812 3.88125 8.64609 4.10156C8.86406 4.32187 8.86641 4.67812 8.64609 4.89609L8.64844 4.89844Z"
						fill="#1CBA79"
						className="_greenStepperIcon"
					/>
					<circle className="_greenFinalStepIcon" cx="24" cy="6" r="6" fill="#E0E0E7" />
				</IconHelper>
			),
		},
		{
			name: 'listItem',
			displayName: 'Step',
			description: 'Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneListItem',
			displayName: 'Done Step',
			description: 'Done Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeListItem',
			displayName: 'Active Step',
			description: 'Active Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'itemContainer',
			displayName: 'Item Container',
			description: 'Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneItemContainer',
			displayName: 'Done Item Container',
			description: 'Done Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeItemContainer',
			displayName: 'Active Item Container',
			description: 'Active Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'step',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneStep',
			displayName: 'Done Icon',
			description: 'Done Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeStep',
			displayName: 'Active Icon',
			description: 'Active Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'title',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneTitle',
			displayName: 'Done Text',
			description: 'Done Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeTitle',
			displayName: 'Active Text',
			description: 'Active Text',
			icon: 'fa-solid fa-list',
		},

		{
			name: 'line',
			displayName: 'Lines',
			description: 'Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneLine',
			displayName: 'Done Lines',
			description: 'Done Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeLine',
			displayName: 'Active Line',
			description: 'Active Line',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeBeforeLine',
			displayName: 'Active Before Line',
			description: 'Active Before Line',
			icon: 'fa-solid fa-list',
		},
	],

	[SubPage.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M16.0991 7.70755L14.6481 2.52648L2.81514 5.06389C1.68369 5.30652 0.988766 6.30937 1.26604 7.29942L7.40092 29.2047C7.6782 30.1947 8.82429 30.8028 9.95574 30.5602L28.3937 26.6064C29.5252 26.3638 30.2201 25.3609 29.9428 24.3709L25.4266 8.2452L19.5056 9.51488C17.997 9.83838 16.4688 9.02761 16.0991 7.70755Z"
						fill="#5D59F2"
						fillOpacity="0.3"
						className="_SubPageIcon"
					/>
					<path
						d="M19.707 8.04046C19.707 8.72002 20.3389 9.27289 21.1155 9.27289H26.1675L19.707 3.64648V8.04046Z"
						fill="#00ADB7"
					/>
					<rect x="9" y="1" width="21" height="29" rx="2" fill="#5D59F2" />
					<ellipse cx="12.8003" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<ellipse cx="16" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<rect x="12" y="7" width="15" height="1.5" rx="0.75" fill="white" />
				</IconHelper>
			),
		},
	],

	[Table.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
						className="_tableline"
					/>
					<path
						className="_tableline"
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
						className="_tableHeader"
					/>
				</IconHelper>
			),
		},
		{
			name: 'modesContainer',
			displayName: 'Modes Container',
			description: 'Modes Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeIcon',
			displayName: 'Columns Mode Icon',
			description: 'Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedColumnsModeIcon',
			displayName: 'Selected Columns Mode Icon',
			description: 'Selected Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeImage',
			displayName: 'Columns Mode Image',
			description: 'Columns Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeIcon',
			displayName: 'Grid Mode Icon',
			description: 'Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedGridModeIcon',
			displayName: 'Selected Grid Mode Icon',
			description: 'Selected Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeImage',
			displayName: 'Grid Mode Image',
			description: 'Grid Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextArrow',
			displayName: 'Next Arrow',
			description: 'Next Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousArrow',
			displayName: 'Previous Arrow',
			description: 'Previous Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextText',
			displayName: 'Next Text',
			description: 'Next Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousText',
			displayName: 'Previous Text',
			description: 'Previous Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageNumbers',
			displayName: 'Page Numbers',
			description: 'Page Numbers',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ellipsesGrid',
			displayName: 'Ellipses Grid',
			description: 'Ellipses Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedPageNumber',
			displayName: 'Selected Page Number',
			description: 'Selected Page Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'itemsPerPageDropdown',
			displayName: 'Items per page Dropdown',
			description: 'Items per page Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'perPageLabel',
			displayName: 'Per Page Label',
			description: 'Per Page Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionDropdown',
			displayName: 'Page Selection Dropdown',
			description: 'Page Selection Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionLabel',
			displayName: 'Page Selection Label',
			description: 'Page Selection Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tableContainer',
			displayName: 'Table Container',
			description: 'Table Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tableWithPagination',
			displayName: 'Table With Pagination',
			description: 'Table With Pagination',
			icon: 'fa-solid fa-box',
		},
	],

	[TableColumn.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="21.9967"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="23"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortAscendingIcon',
			displayName: 'Sort Ascending Icon',
			description: 'Sort Ascending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortDescendingIcon',
			displayName: 'Sort Descending Icon',
			description: 'Sort Descending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortNoneIcon',
			displayName: 'Sort None Icon',
			description: 'Sort None Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tooltipContainer',
			displayName: 'Tooltip Container',
			description: 'Tooltip Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tooltipTriangle',
			displayName: 'Tooltip Triangle',
			description: 'Tooltip Triangle',
			icon: 'fa-solid fa-box',
		},
	],

	[TableColumnHeader.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="21.9967"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="23"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],

	[TableColumns.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
						className="_tableHeader"
					/>
				</IconHelper>
			),
		},
		{
			name: 'row',
			displayName: 'Row',
			description: 'Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedRow',
			displayName: 'Selected Row',
			description: 'Selected Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rowContainer',
			displayName: 'Row Container',
			description: 'Row Container',
			icon: 'fa-solid fa-box',
		},
	],
	[TableRow.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
						className="_tableHeader"
					/>
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 21.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<rect
						x="1.5"
						y="14.28"
						width="27"
						height="6.29"
						fill="#2196F3"
						fillOpacity="0.2"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
				</IconHelper>
			),
		},
		{
			name: 'rowContainer',
			displayName: 'Row Container',
			description: 'Row Container',
			icon: 'fa-solid fa-box',
		},
	],

	[TableDynamicColumn.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="12.6"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="12"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="19.5"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="31.5"
						y="3.53955"
						width="10"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortAscendingIcon',
			displayName: 'Sort Ascending Icon',
			description: 'Sort Ascending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortDescendingIcon',
			displayName: 'Sort Descending Icon',
			description: 'Sort Descending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortNoneIcon',
			displayName: 'Sort None Icon',
			description: 'Sort None Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],

	[TableEmptyGrid.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.6989 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.6989 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="12.6"
						y="17.5"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_tablePG"
						x="3.69995"
						y="11.6992"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_tablePG"
						x="21.5"
						y="11.6992"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<path
						className="_tablePG"
						d="M3.69995 24H8.69995V26H4.19995C3.92381 26 3.69995 25.7761 3.69995 25.5V24Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tablePG"
						d="M26.4 24H21.4V26H25.9C26.1762 26 26.4 25.7761 26.4 25.5V24Z"
						fill="#EDEAEA"
					/>
				</IconHelper>
			),
		},
	],

	[TableGrid.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect x="1" y="9.7998" width="5.5" height="4.4" rx="0.2" fill="currentColor" />
					<path
						d="M1 17.5H6.5V23H1.8C1.35817 23 1 22.6418 1 22.2V17.5Z"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="9.7998"
						width="4.4"
						height="4.4"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="17.5"
						y="9.7998"
						width="5.5"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.5 17.5H23V22.2C23 22.6418 22.6418 23 22.2 23H17.5V17.5Z"
						fill="currentColor"
					/>
					<path d="M1 6.5H6.5V1H1.8C1.35817 1 1 1.35817 1 1.8V6.5Z" fill="currentColor" />
					<rect
						width="4.4"
						height="5.5"
						rx="0.2"
						transform="matrix(1 0 0 -1 9.80078 6.5)"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M17.5 6.5H23V1.8C23 1.35817 22.6418 1 22.2 1H17.5V6.5Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'eachGrid',
			displayName: 'Each Grid',
			description: 'Each Grid',
			icon: 'fa-solid fa-box',
		},
	],

	[TablePreviewGrid.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.6989 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.6989 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="12.6"
						y="17.5"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="3.69995"
						y="11.6992"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="21.5"
						y="11.6992"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<path
						className="_tablePG"
						d="M3.69995 24H8.69995V26H4.19995C3.92381 26 3.69995 25.7761 3.69995 25.5V24Z"
						fill="#2196F3"
					/>
					<path
						className="_tablePG"
						d="M26.4 24H21.4V26H25.9C26.1762 26 26.4 25.7761 26.4 25.5V24Z"
						fill="#2196F3"
					/>
				</IconHelper>
			),
		},
	],

	[Tabs.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect x="4.28577" width="25.7143" height="25.7143" rx="4" fill="#EDEAEA" />
					<rect y="4.28516" width="25.7143" height="25.7143" rx="4" fill="#3792FE" />
					<path
						className="_tabs"
						d="M12.8572 24.6426C14.8463 24.6426 16.754 23.8524 18.1605 22.4459C19.567 21.0394 20.3572 19.1317 20.3572 17.1426C20.3572 15.1535 19.567 13.2458 18.1605 11.8393C16.754 10.4328 14.8463 9.64258 12.8572 9.64258C10.8681 9.64258 8.9604 10.4328 7.55388 11.8393C6.14735 13.2458 5.35718 15.1535 5.35718 17.1426C5.35718 19.1317 6.14735 21.0394 7.55388 22.4459C8.9604 23.8524 10.8681 24.6426 12.8572 24.6426ZM12.1541 19.7207V17.8457H10.2791C9.8894 17.8457 9.57593 17.5322 9.57593 17.1426C9.57593 16.7529 9.8894 16.4395 10.2791 16.4395H12.1541V14.5645C12.1541 14.1748 12.4675 13.8613 12.8572 13.8613C13.2468 13.8613 13.5603 14.1748 13.5603 14.5645V16.4395H15.4353C15.825 16.4395 16.1384 16.7529 16.1384 17.1426C16.1384 17.5322 15.825 17.8457 15.4353 17.8457H13.5603V19.7207C13.5603 20.1104 13.2468 20.4238 12.8572 20.4238C12.4675 20.4238 12.1541 20.1104 12.1541 19.7207Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'tabsContainer',
			displayName: 'Tabs Container',
			description: 'Tabs Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tab',
			displayName: 'Tab',
			description: 'Tab',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabHighlighter',
			displayName: 'Tab Highlighter',
			description: 'Tab Highlighter',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'childContainer',
			displayName: 'Child Container',
			description: 'Child Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabsSeperator',
			displayName: 'Tabs Seperator',
			description: 'Tabs Seperator',
			icon: 'fa-solid fa-box',
		},
	],

	[Tags.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 29">
					<path
						className="_tagIcon3"
						d="M0.0543799 22.6386C-0.172639 23.5162 0.331737 24.419 1.18348 24.6557L6.43726 26.1074L2.79495 12.0859L0.0543799 22.6386Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tagIcon2"
						d="M8.84657 26.9103C9.07592 27.7883 9.95033 28.3097 10.8014 28.0752L16.6716 26.4515L5.82031 15.2578L8.84657 26.9103Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tagIcon"
						d="M29.5334 13.326L17.0777 0.474959C16.7837 0.171618 16.385 0.00137578 15.9693 0.00103186L7.46155 0C6.28611 0 5.33236 0.983622 5.33236 2.19664L5.33203 10.9753C5.33203 11.4042 5.49704 11.8159 5.79107 12.1192L18.2475 24.9699C18.5595 25.2918 18.9679 25.4524 19.3762 25.4524C19.7846 25.4524 20.193 25.2915 20.505 24.9699L29.5334 15.654C30.1565 15.0109 30.1565 13.9688 29.5334 13.326ZM9.94376 6.07576C9.02334 6.07576 8.27695 5.30571 8.27695 4.35614C8.27695 3.40657 9.02334 2.63652 9.94376 2.63652C10.8642 2.63652 11.6106 3.40657 11.6106 4.35614C11.6106 5.30606 10.8642 6.07576 9.94376 6.07576Z"
						fill="#E442E2"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9286"
							x1="3.21863"
							y1="12.0859"
							x2="3.21863"
							y2="26.1074"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9286"
							x1="11.2459"
							y1="15.2578"
							x2="11.2459"
							y2="28.1313"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9286"
							x1="17.6664"
							y1="0"
							x2="17.6664"
							y2="25.4524"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF79FD" />
							<stop offset="1" stopColor="#E442E2" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'outerContainerWithInputBox',
			displayName: 'Outer Container With Input Box',
			description: 'Outer Container With Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagContainer',
			displayName: 'Tag Container',
			description: 'Tag Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagText',
			displayName: 'Tag Text',
			description: 'Tag Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagCloseIcon',
			displayName: 'Tag Close Icon',
			description: 'Tag Close Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'titleLabel',
			displayName: 'Title Label',
			description: 'Title Label',
			icon: 'fa-solid fa-box',
		},
	],

	[TemplateEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="0.5"
						y="0.5"
						width="29"
						height="29"
						rx="1.5"
						fill="white"
						stroke="#EDEAEA"
					/>
					<path
						d="M5.1197 17.1237L11.2011 11.0423C12.2288 10.0146 13.3661 10.0146 14.3939 11.0423C15.4216 12.07 15.4216 13.2073 14.3939 14.235L8.31244 20.3164L5.1197 17.1237ZM7.49592 20.777L4.86547 21.0693C4.57789 21.1012 4.33489 20.8582 4.36685 20.5707L4.65912 17.9402L7.49592 20.777Z"
						fill="#F94566"
						className="_TEIcon"
					/>
					<path
						d="M4 25C3.44772 25 3 24.5523 3 24C3 23.4477 3.44772 23 4 23H25C25.5523 23 26 23.4477 26 24C26 24.5523 25.5523 25 25 25H4Z"
						fill="#EDEAEA"
					/>
					<path
						d="M1 2C1 1.44772 1.44772 1 2 1H28C28.5523 1 29 1.44772 29 2V5H1V2Z"
						fill="#F94566"
					/>
					<rect x="3" y="2.5" width="4" height="1" rx="0.5" fill="white" />
				</IconHelper>
			),
		},
	],

	[Text.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M0 2.72727C0 1.22104 1.22104 0 2.72727 0H27.2727C28.779 0 30 1.22104 30 2.72727V27.2727C30 28.779 28.779 30 27.2727 30H2.72727C1.22104 30 0 28.779 0 27.2727V2.72727Z"
						fill="#FF76CE"
					/>
					<path
						className="_updownAnimation"
						d="M22 8V11.7891H21.5862C21.341 10.9149 21.069 10.2886 20.7701 9.91003C20.4713 9.52458 20.0613 9.21829 19.5402 8.99115C19.249 8.86726 18.7395 8.80531 18.0115 8.80531H16.8506V19.6047C16.8506 20.3206 16.8927 20.7679 16.977 20.9469C17.069 21.1259 17.2414 21.2842 17.4943 21.4218C17.7548 21.5526 18.1073 21.618 18.5517 21.618H19.069V22H10.908V21.618H11.4253C11.8774 21.618 12.2414 21.5457 12.5172 21.4012C12.7165 21.3048 12.8736 21.1396 12.9885 20.9056C13.0728 20.7404 13.1149 20.3068 13.1149 19.6047V8.80531H11.9885C10.9387 8.80531 10.1762 9.00492 9.70115 9.40413C9.03448 9.96165 8.61303 10.7566 8.43678 11.7891H8V8H22Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'text',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'markdownContainer',
			displayName: 'Markdown Container',
			description: 'Markdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'em',
			displayName: 'Emphasised Text',
			description: 'Emphasised Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'b',
			displayName: 'Bold Text',
			description: 'Bold Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'p',
			displayName: 'Paragraph',
			description: 'Paragraph',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'mark',
			displayName: 'High Light Text',
			description: 'High Light Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 's',
			displayName: 'Strike Through Text',
			description: 'Strike Through Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sup',
			displayName: 'Super Script',
			description: 'Super Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sub',
			displayName: 'Sub Script',
			description: 'Sub Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'br',
			displayName: 'Line Break',
			description: 'Line Break',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ol',
			displayName: 'Ordered List',
			description: 'Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'oli',
			displayName: 'Ordered List Item',
			description: 'Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ul',
			displayName: 'Un Ordered List',
			description: 'Un Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ulli',
			displayName: 'Un Ordered List Item',
			description: 'Un Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlli',
			displayName: 'Task List Item',
			description: 'Task List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlcheckbox',
			displayName: 'Task List Checkbox',
			description: 'Task List Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'links',
			displayName: 'Links',
			description: 'Links',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'linksHover',
			displayName: 'Links Hover',
			description: 'Links Hover',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'images',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icBlock',
			displayName: 'Inline Code Block',
			description: 'Inline Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlock',
			displayName: 'Code Block',
			description: 'Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockKeywords',
			displayName: 'Code Block Keywords',
			description: 'Code Block Keywords',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockVariables',
			displayName: 'Code Block Variables',
			description: 'Code Block Variables',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'table',
			displayName: 'Table',
			description: 'Table',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'th',
			displayName: 'Table Header Cell',
			description: 'Table Header Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tr',
			displayName: 'Table Row',
			description: 'Table Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'td',
			displayName: 'Table Cell',
			description: 'Table Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'blockQuotes',
			displayName: 'Block Quote',
			description: 'Block Quote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hr',
			displayName: 'Horizontal Rule',
			description: 'Horizontal Rule',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'video',
			displayName: 'Video',
			description: 'Video',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNote',
			displayName: 'Footnote',
			description: 'Footnote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNoteLink',
			displayName: 'Footnote Link',
			description: 'Footnote Link',
			icon: 'fa-solid fa-box',
		},
	],

	[TextArea.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 24">
					<rect width="28" height="24" rx="3" fill="#9B82F3" />
					<path
						className="_TAFirstLine"
						d="M25.5013 14.9382C25.5013 14.6896 25.4025 14.4512 25.2268 14.2754C25.1397 14.1881 25.0362 14.1189 24.9223 14.0716C24.8084 14.0243 24.6863 14 24.563 14C24.4397 14 24.3176 14.0243 24.2037 14.0716C24.0898 14.1189 23.9864 14.1881 23.8993 14.2754L18.2743 19.9004C18.0985 20.0765 17.9998 20.3151 18 20.5639C18.0002 20.8127 18.0992 21.0512 18.2752 21.227C18.4512 21.4028 18.6899 21.5014 18.9387 21.5013C19.1875 21.5011 19.426 21.4021 19.6018 21.2261L25.2268 15.601C25.4025 15.4252 25.5013 15.1868 25.5013 14.9382Z"
						fill="white"
					/>
					<path
						className="_TASecondLine"
						d="M25.5013 19.6257C25.5013 19.3771 25.4025 19.1387 25.2268 18.9629C25.1397 18.8756 25.0362 18.8064 24.9223 18.7591C24.8084 18.7118 24.6863 18.6875 24.563 18.6875C24.4397 18.6875 24.3176 18.7118 24.2037 18.7591C24.0898 18.8064 23.9864 18.8756 23.8993 18.9629L22.9618 19.9004C22.786 20.0765 22.6873 20.3151 22.6875 20.5639C22.6877 20.8127 22.7867 21.0512 22.9627 21.227C23.1387 21.4028 23.3774 21.5014 23.6262 21.5013C23.875 21.5011 24.1135 21.4021 24.2893 21.2261L25.2268 20.2886C25.4025 20.1127 25.5013 19.8743 25.5013 19.6257Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'inputContainer',
			displayName: 'Input Container',
			description: 'Input Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],

	[TextBox.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="3" fill="#EC255A" />
					<path
						id="_text_box_text"
						d="M22.0608 7.52344V11.4658H21.6741C21.4449 10.5563 21.1907 9.90462 20.9114 9.51074C20.6321 9.1097 20.2489 8.79102 19.762 8.55469C19.4898 8.42578 19.0136 8.36133 18.3333 8.36133H17.2483V19.5977C17.2483 20.3424 17.2877 20.8079 17.3665 20.9941C17.4524 21.1803 17.6135 21.3451 17.8499 21.4883C18.0933 21.6243 18.4228 21.6924 18.8381 21.6924H19.3215V22.0898H11.6946V21.6924H12.178C12.6005 21.6924 12.9407 21.6172 13.1985 21.4668C13.3847 21.3665 13.5315 21.1947 13.6389 20.9512C13.7177 20.7793 13.7571 20.3281 13.7571 19.5977V8.36133H12.7043C11.7232 8.36133 11.0107 8.56901 10.5667 8.98438C9.9436 9.56445 9.54972 10.3916 9.38501 11.4658H8.97681V7.52344H22.0608Z"
						fill="white"
					/>
					<g id="_text_box_caret" opacity={0}>
						<rect width="2" height="18" transform="translate(5 6)" fill="white" />
					</g>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],

	[TextEditor.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="28" height="30" rx="3" fill="#9B82F3" />
					<path
						d="M22.5 14H5.5C5.22386 14 5 14.2239 5 14.5V15.5C5 15.7761 5.22386 16 5.5 16H22.5C22.7761 16 23 15.7761 23 15.5V14.5C23 14.2239 22.7761 14 22.5 14Z"
						fill="white"
						className="_TextEditorLine2"
					/>
					<path
						d="M22.5 8H11.5C11.2239 8 11 8.22386 11 8.5V9.5C11 9.77614 11.2239 10 11.5 10H22.5C22.7761 10 23 9.77614 23 9.5V8.5C23 8.22386 22.7761 8 22.5 8Z"
						fill="white"
						className="_TextEditorLine1"
					/>
					<path
						d="M22.5 20H11.5C11.2239 20 11 20.2239 11 20.5V21.5C11 21.7761 11.2239 22 11.5 22H22.5C22.7761 22 23 21.7761 23 21.5V20.5C23 20.2239 22.7761 20 22.5 20Z"
						fill="white"
						className="_TextEditorLine3"
					/>
				</IconHelper>
			),
		},
	],

	[TextList.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<svg
						width="22"
						height="30"
						viewBox="0 0 22 30"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13.5511 6.09627V0H2.00263C0.898379 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.898379 30 2.00263 30H19.9974C21.1016 30 22 29.0523 22 27.8873V8.91317H16.2213C14.749 8.91317 13.5511 7.64951 13.5511 6.09627Z"
							fill="#E663CA"
						/>
						<path
							d="M14.8882 6.10163C14.8882 6.87825 15.4871 7.51008 16.2233 7.51008H21.0122L14.8882 1.08008V6.10163Z"
							fill="#E663CA"
						/>
						<path
							d="M17.5 14H6.5C6.22386 14 6 14.2239 6 14.5V15.5C6 15.7761 6.22386 16 6.5 16H17.5C17.7761 16 18 15.7761 18 15.5V14.5C18 14.2239 17.7761 14 17.5 14Z"
							fill="white"
							className="_TextListLine1"
						/>
						<path
							d="M17.5 19H6.5C6.22386 19 6 19.2239 6 19.5V20.5C6 20.7761 6.22386 21 6.5 21H17.5C17.7761 21 18 20.7761 18 20.5V19.5C18 19.2239 17.7761 19 17.5 19Z"
							fill="white"
							className="_TextListLine2"
						/>
						<path
							d="M17.5 24H6.5C6.22386 24 6 24.2239 6 24.5V25.5C6 25.7761 6.22386 26 6.5 26H17.5C17.7761 26 18 25.7761 18 25.5V24.5C18 24.2239 17.7761 24 17.5 24Z"
							fill="white"
							className="_TextListLine3"
						/>
						<path
							d="M2 15C2 15.5523 2.44772 16 3 16C3.55228 16 4 15.5523 4 15C4 14.4477 3.55228 14 3 14C2.44772 14 2 14.4477 2 15Z"
							fill="white"
							className="_TextListCircle1"
						/>
						<path
							d="M2 20C2 20.5523 2.44772 21 3 21C3.55228 21 4 20.5523 4 20C4 19.4477 3.55228 19 3 19C2.44772 19 2 19.4477 2 20Z"
							fill="white"
							className="_TextListCircle2"
						/>
						<path
							d="M2 25C2 25.5523 2.44772 26 3 26C3.55228 26 4 25.5523 4 25C4 24.4477 3.55228 24 3 24C2.44772 24 2 24.4477 2 25Z"
							fill="white"
							className="_TextListCircle3"
						/>
					</svg>
				</IconHelper>
			),
		},
		{
			name: 'list',
			displayName: 'List',
			description: 'List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'listItem',
			displayName: 'List Item',
			description: 'List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'listItemIcon',
			displayName: 'List Item Icon',
			description: 'List Item Icon',
			icon: 'fa-solid fa-box',
		},
	],

	ThemeEditor: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 32 32">
					<style type="text/css">
						{`.cubies_zesentwintig{fill:#65C3AB;}
	.cubies_acht{fill:#8E7866;}
	.cubies_zeven{fill:#725A48;}
	.cubies_eenentwintig{fill:#C9483A;}
	.cubies_zevenentwintig{fill:#98D3BC;}
	.cubies_tweeentwintig{fill:#D97360;}
	.cubies_vijf{fill:#C9C6C0;}
	.cubies_zes{fill:#EDEAE5;}
	.st0{fill:#F2C99E;}
	.st1{fill:#F9E0BD;}
	.st2{fill:#725A48;}
	.st3{fill:#CCE2CD;}
	.st4{fill:#EDB57E;}
	.st5{fill:#EC9B5A;}
	.st6{fill:#4C4842;}
	.st7{fill:#67625D;}
	.st8{fill:#FFF2DF;}
	.st9{fill:#A4C83F;}
	.st10{fill:#BCD269;}
	.st11{fill:#D1DE8B;}
	.st12{fill:#E69D8A;}
	.st13{fill:#E3D4C0;}
	.st14{fill:#C6B5A2;}
	.st15{fill:#837F79;}
	.st16{fill:#A5A29C;}
	.st17{fill:#2EB39A;}
	.st18{fill:#AB9784;}`}
					</style>
					<g>
						<path
							className="cubies_vijf"
							d="M1.244,21c1.125,0,2.203,0.447,2.998,1.242l1.76,1.76c1.656,1.656,4.34,1.656,5.996,0l0.004-0.004   c1.656-1.656,4.34-1.656,5.996,0l0.004,0.004c1.656,1.656,4.34,1.656,5.996,0l1.76-1.76C26.553,21.447,27.632,21,28.756,21H32v-3H0   v3H1.244z"
						/>
						<path
							className="cubies_eenentwintig"
							d="M28.756,21c-1.125,0-2.203,0.447-2.998,1.242l-1.76,1.76c-1.656,1.656-4.344,1.652-6-0.004   s-4.34-1.656-5.996,0s-4.344,1.66-6,0.004l-1.76-1.76C3.447,21.447,2.368,21,1.244,21H0v8c0,1.657,1.343,3,3,3h26   c1.657,0,3-1.343,3-3v-8H28.756z"
						/>
						<rect x="0" y="14" className="cubies_zesentwintig" width="32" height="4" />
						<path
							className="cubies_zeven"
							d="M29,6h-8V3c0-1.657-1.343-3-3-3h-4c-1.657,0-3,1.343-3,3v3H3C1.343,6,0,7.343,0,9v5h32V9   C32,7.343,30.657,6,29,6z"
						/>
						<path
							className="cubies_acht"
							d="M27,6h-8V3c0-1.657-1.343-3-3-3h-2c-1.657,0-3,1.343-3,3v3H3C1.343,6,0,7.343,0,9v5h30V9   C30,7.343,28.657,6,27,6z"
						/>
						<rect
							x="0"
							y="14"
							className="cubies_zevenentwintig"
							width="30"
							height="4"
						/>
						<path
							className="cubies_tweeentwintig"
							d="M28.756,21c-1.125,0-2.203,0.447-2.998,1.242l-1.76,1.76c-1.656,1.656-4.344,1.652-6-0.004   s-4.34-1.656-5.996,0s-4.344,1.66-6,0.004l-1.76-1.76C3.447,21.447,2.368,21,1.244,21H0v8c0,1.657,1.343,3,3,3h24   c1.657,0,3-1.343,3-3v-8H28.756z"
						/>
						<path
							className="cubies_zes"
							d="M1.244,21c1.125,0,2.203,0.447,2.998,1.242l1.76,1.76c1.656,1.656,4.34,1.656,5.996,0l0.004-0.004   c1.656-1.656,4.34-1.656,5.996,0l0.004,0.004c1.656,1.656,4.34,1.656,5.996,0l1.76-1.76C26.553,21.447,27.632,21,28.756,21H30v-3H0   v3H1.244z"
						/>
						<circle className="cubies_zeven" cx="15" cy="3" r="1" />
					</g>
				</IconHelper>
			),
			mainComponent: true,
		},
	],

	[Timer.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',

			icon: <TimerIcon />,
			mainComponent: true,
		},
	],

	[ToggleButton.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 15">
					<rect
						className="_toggleButtonTrack"
						width="30"
						height="15"
						rx="7.5"
						fill="#02B694"
					/>
					<circle
						className="_toggleButtonKnob"
						cx="22.498"
						cy="7.50781"
						r="4.5"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'knob',
			displayName: 'Knob',
			description: 'Knob',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
	],

	[Video.name]: [
		{
			name: '',
			displayName: 'Component',
			mainComponent: true,
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<circle cx="14" cy="14" r="14" fill="#000000" />
					<circle
						cx="14"
						cy="14"
						r="13.5"
						stroke=""
						strokeOpacity="0.04"
						fillOpacity={0}
					/>
					<path
						className="_videoPlayStart"
						d="M19.8932 13.2644C20.4594 13.5913 20.4594 14.4087 19.8932 14.7356L10.9743 19.8849C10.408 20.2119 9.70016 19.8032 9.70016 19.1493L9.70016 8.85068C9.70016 8.1968 10.408 7.78813 10.9743 8.11507L19.8932 13.2644Z"
						fill="white"
					/>
					<rect
						className="_videoPlayPause"
						x="9"
						y="8"
						width="4"
						height="12"
						rx="1"
						fill="white"
						opacity={0}
					/>
					<rect
						className="_videoPlayPause"
						x="15"
						y="8"
						width="4"
						height="12"
						rx="1"
						fill="white"
						opacity={0}
					/>
				</IconHelper>
			),
		},
		{
			name: 'player',
			displayName: 'Player',
			description: 'Player',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSlider',
			displayName: 'Volume Slider',
			description: 'Volume Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekSlider',
			displayName: 'Seek Slider',
			description: 'Seek Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playPauseButton',
			displayName: 'Play Pause Button',
			description: 'Play Pause Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'pipButton',
			displayName: 'Pip Button',
			description: 'Pip Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'fullScreenButton',
			displayName: 'Full Screen Button',
			description: 'Full Screen Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'timeText',
			displayName: 'Time Text',
			description: 'Time Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekTimeTextOnHover',
			displayName: 'Seek Time Text On Hover',
			description: 'Seek Time Text On Hover',
			icon: 'fa fa-solid fa-box',
		},
	],
	PageEditor: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 34">
					<rect
						x="0.75"
						y="2.8125"
						width="23.4375"
						height="27.1875"
						rx="2"
						fill="#F2599B"
						fillOpacity="0.1"
					/>
					<path
						d="M13.6033 6.56857C13.6033 7.20566 14.1956 7.72397 14.9237 7.72397H19.66L13.6033 2.44922V6.56857Z"
						fill="#00ADB7"
					/>
					<rect x="3.5625" width="23.4375" height="27.1875" rx="2" fill="#F2599B" />
					<ellipse cx="7.12526" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<ellipse cx="10.125" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<rect
						x="6.375"
						y="5.625"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<rect
						x="6.375"
						y="21.6875"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<path
						className="_PageEditorPen"
						d="M7.77165 17.4134L11.4667 13.7183C12.0912 13.0939 12.7822 13.0939 13.4067 13.7183C14.0311 14.3428 14.0311 15.0338 13.4067 15.6583L9.71158 19.3533L7.77165 17.4134ZM9.21546 19.6332L7.61719 19.8108C7.44245 19.8302 7.29481 19.6825 7.31422 19.5078L7.49181 17.9095L9.21546 19.6332Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
	],

	[Prompt.name]: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="#F9F9F9" />
					<rect x="4" y="4" width="22" height="15" rx="2" fill="#96A1B4" fillOpacity="0.2" />
					<rect x="6" y="7" width="12" height="2" rx="1" fill="#96A1B4" />
					<rect x="6" y="11" width="8" height="2" rx="1" fill="#96A1B4" />
					<rect x="14" y="14" width="10" height="2" rx="1" fill="#007BFF" />
					<rect x="4" y="21" width="17" height="5" rx="2" fill="#96A1B4" fillOpacity="0.15" stroke="#96A1B4" strokeWidth="0.5" />
					<circle cx="24" cy="23.5" r="2.5" fill="#007BFF" />
					<path d="M23.5 23L24.5 23.5L23.5 24V23Z" fill="white" />
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'messagesContainer',
			displayName: 'Messages Container',
			description: 'Messages Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'userMessage',
			displayName: 'User Message',
			description: 'User Message',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'assistantMessage',
			displayName: 'Assistant Message',
			description: 'Assistant Message',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolCallCard',
			displayName: 'Tool Call Card',
			description: 'Tool Call Card',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBar',
			displayName: 'Input Bar',
			description: 'Input Bar',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputTextArea',
			displayName: 'Input Text Area',
			description: 'Input Text Area',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sendButton',
			displayName: 'Send Button',
			description: 'Send Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sessionSidebar',
			displayName: 'Session Sidebar',
			description: 'Session Sidebar',
			icon: 'fa-solid fa-sidebar',
		},
		{
			name: 'sidebarHeader',
			displayName: 'Sidebar Header',
			description: 'Sidebar Header',
			icon: 'fa-solid fa-bars',
		},
		{
			name: 'newChatButton',
			displayName: 'New Chat Button',
			description: 'New Chat Button',
			icon: 'fa-solid fa-plus',
		},
		{
			name: 'sessionItem',
			displayName: 'Session Item',
			description: 'Session Item',
			icon: 'fa-solid fa-message',
		},
	],
};

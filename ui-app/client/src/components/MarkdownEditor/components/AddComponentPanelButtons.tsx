import React, { useState, useRef, useEffect } from 'react';
import { FileBrowser } from '../../../commonComponents/FileBrowser';

interface TableConfig {
	rows: number;
	columns: number;
}

interface AddComponentPanelButtonsProps {
	onComponentAdd: (type: string) => void;
	isExpanded: boolean;
	onExpandChange: (expanded: boolean) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	styleProperties: any;
	textAreaRef?: React.RefObject<HTMLTextAreaElement>; // Add this prop
}

const components = [
	{
		id: 'paragraph',
		name: 'Paragraph',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12.5 2.5V17.5M12.5 2.5H8.33333M12.5 2.5H17.5M8.33333 2.5H6.25C4.17893 2.5 2.5 4.17893 2.5 6.25C2.5 8.32107 4.17893 10 6.25 10H8.33333M8.33333 2.5V10M8.33333 10V17.5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: 'some content here',
	},
	{
		id: 'bold',
		name: 'Bold',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M4.16699 5C4.16699 3.82149 4.16699 3.23223 4.53311 2.86612C4.89923 2.5 5.48848 2.5 6.66699 2.5H10.4827C12.5175 2.5 14.167 4.17893 14.167 6.25C14.167 8.32107 12.5175 10 10.4827 10H4.16699V5Z"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M10.3575 10H11.3892C13.3836 10 15.0003 11.6789 15.0003 13.75C15.0003 15.8211 13.3836 17.5 11.3892 17.5H6.66699C5.48848 17.5 4.89923 17.5 4.53311 17.1339C4.16699 16.7677 4.16699 16.1785 4.16699 15V10"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '**bold text**',
	},
	{
		id: 'italic',
		name: 'Italic',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10 3.3335H15.8333"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M6.66699 16.6668L13.3337 3.3335"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M4.16699 16.6665H10.0003"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		syntax: '*italic text*',
	},
	{
		id: 'strikethrough',
		name: 'Strikethrough',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M3.33301 10H16.6663"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M14.5833 6.38889C14.5833 4.24112 12.5313 2.5 10 2.5C7.46869 2.5 5.41667 4.24112 5.41667 6.38889C5.41667 6.79399 5.46113 7.16486 5.55567 7.5M5 13.6111C5 15.7589 7.23857 17.5 10 17.5C12.7614 17.5 15 16.3889 15 13.6111C15 11.617 14.1411 10.4818 12.4232 10"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		syntax: '~~strikethrough text~~',
	},
	{
		id: 'ul',
		name: 'Bullet List',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12.5 3.3335H17.5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.5 12.5H17.5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.5 7.5H17.5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.5 16.6665H17.5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M5.41667 8.33333C7.0275 8.33333 8.33333 7.0275 8.33333 5.41667C8.33333 3.80584 7.0275 2.5 5.41667 2.5C3.80584 2.5 2.5 3.80584 2.5 5.41667C2.5 7.0275 3.80584 8.33333 5.41667 8.33333Z"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M5.41667 17.4998C7.0275 17.4998 8.33333 16.194 8.33333 14.5832C8.33333 12.9723 7.0275 11.6665 5.41667 11.6665C3.80584 11.6665 2.5 12.9723 2.5 14.5832C2.5 16.194 3.80584 17.4998 5.41667 17.4998Z"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '- add the list here\n -',
	},
	{
		id: 'ol',
		name: 'Numbered List',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M9.16699 5H17.5003"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M9.16699 10H17.5003"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M9.16699 15H17.5003"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M2.5 12.5H3.75C3.98232 12.5 4.09849 12.5 4.19509 12.5192C4.59178 12.5981 4.90188 12.9083 4.98078 13.3049C5 13.4015 5 13.5177 5 13.75C5 13.9823 5 14.0985 4.98078 14.1951C4.90188 14.5917 4.59178 14.9019 4.19509 14.9808C4.09849 15 3.98232 15 3.75 15C3.51767 15 3.40151 15 3.30491 15.0192C2.90822 15.0981 2.59813 15.4083 2.51922 15.8049C2.5 15.9015 2.5 16.0177 2.5 16.25V17C2.5 17.2357 2.5 17.3536 2.57322 17.4267C2.64645 17.5 2.7643 17.5 3 17.5H5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M2.5 2.5H3.5C3.63807 2.5 3.75 2.61192 3.75 2.75V7.5M3.75 7.5H2.5M3.75 7.5H5"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '1. add the list here',
	},
	{
		id: 'blockquote',
		name: 'Block Quote',
		icon: (
			<svg
				width="14"
				height="9"
				viewBox="0 0 14 9"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12.2843 3.38988C12.8027 3.56109 13.2173 3.86926 13.5283 4.3144C13.8393 4.72529 13.9948 5.18755 13.9948 5.70117C14.0294 6.21479 13.8912 6.7284 13.5802 7.24202C13.3037 7.7214 12.8545 8.1323 12.2325 8.47471C11.2304 8.98833 10.3493 9.12529 9.58904 8.8856C8.82883 8.61167 8.29322 8.20078 7.98223 7.65292C7.80945 7.37899 7.67123 7.00233 7.56757 6.52296C7.49846 6.04358 7.4639 5.54708 7.4639 5.03346C7.49846 4.4856 7.56757 3.95486 7.67123 3.44125C7.7749 2.92763 7.9304 2.49961 8.13773 2.1572C8.3105 1.91751 8.51783 1.6607 8.75972 1.38677C8.96705 1.14708 9.20893 0.907393 9.48538 0.667704C9.79637 0.428016 10.1419 0.205447 10.522 0L12.3362 0.102724C12.0943 0.376654 11.8697 0.633463 11.6623 0.873152C11.4896 1.0786 11.3341 1.26693 11.1959 1.43813C11.0576 1.60934 10.9194 1.76342 10.7812 1.90039C10.5393 2.14008 10.3493 2.37977 10.211 2.61946C10.0728 2.8249 9.95187 3.04747 9.8482 3.28716C9.77909 3.52685 9.77909 3.76654 9.8482 4.00623C10.2974 3.52685 10.8157 3.28716 11.4032 3.28716C11.6796 3.28716 11.9733 3.3214 12.2843 3.38988ZM5.13143 3.64669C5.6152 3.92062 5.96075 4.29728 6.16809 4.77665C6.40997 5.22179 6.49636 5.70117 6.42725 6.21479C6.35814 6.7284 6.13353 7.20778 5.75342 7.65292C5.40787 8.09805 4.88955 8.44047 4.19844 8.68016C3.12724 9.02257 2.24608 9.00545 1.55498 8.62879C0.863877 8.2179 0.397384 7.7214 0.155498 7.1393C0.0518326 6.83113 0 6.43735 0 5.95798C0 5.4786 0.0518326 4.9821 0.155498 4.46848C0.259163 3.95486 0.397384 3.45837 0.570159 2.97899C0.742935 2.49961 0.967543 2.10584 1.24398 1.79767C1.45131 1.55798 1.6932 1.33541 1.96964 1.12996C2.21153 0.958755 2.48797 0.770428 2.79896 0.564981C3.14451 0.359533 3.52462 0.171206 3.93928 0L5.75342 0.462257C5.47698 0.701946 5.21782 0.907393 4.97593 1.0786C4.7686 1.24981 4.57855 1.40389 4.40578 1.54086C4.233 1.67782 4.06022 1.81479 3.88745 1.95175C3.64556 2.1572 3.43823 2.36265 3.26546 2.56809C3.09268 2.7393 2.93718 2.94475 2.79896 3.18444C2.66074 3.38988 2.60891 3.61245 2.64347 3.85214C2.91991 3.64669 3.19635 3.52685 3.47279 3.49261C3.78378 3.42412 4.06022 3.407 4.30211 3.44125C4.57855 3.47549 4.85499 3.54397 5.13143 3.64669Z"
					fill="black"
				/>
			</svg>
		),
		syntax: '> here is a quote',
	},
	{
		id: 'pullquote',
		name: 'Pullquote',
		icon: (
			<svg
				width="14"
				height="9"
				viewBox="0 0 14 9"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1.71566 5.61012C1.19733 5.43891 0.782673 5.13074 0.471677 4.6856C0.160681 4.27471 0.00518367 3.81245 0.00518372 3.29883C-0.0293717 2.78521 0.108849 2.27159 0.419845 1.75798C0.696286 1.2786 1.1455 0.867704 1.76749 0.525291C2.76959 0.0116729 3.65075 -0.125292 4.41096 0.114397C5.17117 0.388327 5.70678 0.799222 6.01777 1.34708C6.19055 1.62101 6.32877 1.99767 6.43243 2.47704C6.50154 2.95642 6.5361 3.45292 6.5361 3.96654C6.50154 4.5144 6.43243 5.04514 6.32877 5.55875C6.2251 6.07237 6.0696 6.50039 5.86227 6.8428C5.6895 7.08249 5.48217 7.3393 5.24028 7.61323C5.03295 7.85292 4.79107 8.09261 4.51462 8.33229C4.20363 8.57198 3.85808 8.79455 3.47797 9L1.66383 8.89728C1.90571 8.62335 2.13032 8.36654 2.33765 8.12685C2.51043 7.9214 2.66593 7.73307 2.80415 7.56187C2.94237 7.39066 3.08059 7.23658 3.21881 7.09961C3.46069 6.85992 3.65075 6.62023 3.78897 6.38054C3.92719 6.1751 4.04813 5.95253 4.1518 5.71284C4.22091 5.47315 4.22091 5.23346 4.1518 4.99377C3.70258 5.47315 3.18425 5.71284 2.59682 5.71284C2.32037 5.71284 2.02666 5.6786 1.71566 5.61012ZM8.86857 5.35331C8.3848 5.07938 8.03925 4.70272 7.83191 4.22335C7.59003 3.77821 7.50364 3.29883 7.57275 2.78521C7.64186 2.2716 7.86647 1.79222 8.24658 1.34708C8.59213 0.901946 9.11045 0.559534 9.80156 0.319845C10.8728 -0.0225671 11.7539 -0.00544663 12.445 0.371207C13.1361 0.782102 13.6026 1.2786 13.8445 1.8607C13.9482 2.16887 14 2.56265 14 3.04202C14 3.5214 13.9482 4.0179 13.8445 4.53152C13.7408 5.04514 13.6026 5.54163 13.4298 6.02101C13.2571 6.50039 13.0325 6.89416 12.756 7.20233C12.5487 7.44202 12.3068 7.66459 12.0304 7.87004C11.7885 8.04125 11.512 8.22957 11.201 8.43502C10.8555 8.64047 10.4754 8.82879 10.0607 9L8.24658 8.53774C8.52302 8.29805 8.78218 8.09261 9.02407 7.9214C9.2314 7.75019 9.42145 7.59611 9.59422 7.45914C9.767 7.32218 9.93978 7.18521 10.1126 7.04825C10.3544 6.8428 10.5618 6.63735 10.7345 6.43191C10.9073 6.2607 11.0628 6.05525 11.201 5.81556C11.3393 5.61012 11.3911 5.38755 11.3565 5.14786C11.0801 5.35331 10.8037 5.47315 10.5272 5.50739C10.2162 5.57588 9.93978 5.593 9.69789 5.55875C9.42145 5.52451 9.14501 5.45603 8.86857 5.35331Z"
					fill="black"
				/>
			</svg>
		),
		syntax: '>>> Pull quote here',
	},
	{
		id: 'img',
		name: 'Image',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11.667 2.9165H8.33366C5.19096 2.9165 3.61962 2.9165 2.6433 3.89281C1.66699 4.86913 1.66699 6.44047 1.66699 9.58317V11.2498C1.66699 14.3925 1.66699 15.9639 2.6433 16.9402C3.61962 17.9165 5.19096 17.9165 8.33366 17.9165H11.667C14.8097 17.9165 16.3811 17.9165 17.3573 16.9402C18.3337 15.9639 18.3337 14.3925 18.3337 11.2498V9.58317C18.3337 6.44047 18.3337 4.86913 17.3573 3.89281C16.3811 2.9165 14.8097 2.9165 11.667 2.9165Z"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M7.08301 8.75C7.77336 8.75 8.33301 8.19036 8.33301 7.5C8.33301 6.80964 7.77336 6.25 7.08301 6.25C6.39265 6.25 5.83301 6.80964 5.83301 7.5C5.83301 8.19036 6.39265 8.75 7.08301 8.75Z"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M17.9163 14.5835L13.623 9.89991C13.4383 9.69825 13.1773 9.5835 12.9038 9.5835C12.645 9.5835 12.3968 9.68633 12.2139 9.86925L8.33301 13.7502L6.53241 11.9496C6.35138 11.7685 6.10585 11.6668 5.84983 11.6668C5.5741 11.6668 5.31153 11.7847 5.12835 11.9908L2.08301 15.4168"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '![image](image.jpg)',
	},
	{
		id: 'left',
		name: 'Left Align',
		icon: (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1 1H11"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M1 4.33398H5.44445"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M1 7.66602H11"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M1 11H5.44445"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		),
		syntax: '::: left \n left align text here \n :::',
	},
	{
		id: 'center',
		name: 'Center Align',
		icon: (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11 1H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M8 4.33398H3.55555"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 7.66602H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M8 11H3.55555"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		),
		syntax: '::: center \n This text will be centered \n :::',
	},
	{
		id: 'right',
		name: 'Right Align',
		icon: (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11 1H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 4.33398H6.55555"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 7.66602H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 11H6.55555"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		),
		syntax: '::: right \n This text will be right aligned \n :::',
	},
	{
		id: 'justify',
		name: 'Justify',
		icon: (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11 1H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 4.16699H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 7.66602H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11 11.167H1"
					stroke="black"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		),
		syntax: '::: justify \n This text will be justified \n :::',
	},
	{
		id: 'rtl',
		name: 'Right to Left',
		icon: (
			<svg
				width="16"
				height="17"
				viewBox="0 0 16 17"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M7.14767 8.15458H7.42336V10.9505C7.42336 11.336 7.73585 11.6485 8.12132 11.6485C8.5068 11.6485 8.81929 11.336 8.81929 10.9505V3.31945H10.4455V10.9505C10.4455 11.336 10.758 11.6485 11.1435 11.6485C11.529 11.6485 11.8415 11.336 11.8415 10.9505V3.31945H12.5986C12.963 3.31945 13.2583 3.02408 13.2583 2.65973C13.2583 2.29537 12.963 2 12.5986 2H7.14767C5.3525 2 3.89167 3.38015 3.89167 5.07695C3.89167 6.77443 5.35251 8.15458 7.14767 8.15458ZM15 13.8953C15 13.5311 14.7047 13.2358 14.3404 13.2358H4.67347L5.75293 12.2163C6.03625 11.9487 6.03625 11.4979 5.75293 11.2304C5.49161 10.9836 5.08311 10.9836 4.8218 11.2304L2.7698 13.1683C2.35196 13.5629 2.35196 14.2277 2.7698 14.6223L4.8218 16.5603C5.08311 16.8071 5.49161 16.8071 5.75293 16.5603C6.03625 16.2927 6.03625 15.842 5.75293 15.5744L4.67347 14.5549H14.3404C14.7047 14.5549 15 14.2596 15 13.8953Z"
					fill="black"
				/>
			</svg>
		),
		syntax: '::: rtl \n Direction of content is from right to left \n :::',
	},
	{
		id: 'ltr',
		name: 'Left to Right',
		icon: (
			<svg
				width="16"
				height="17"
				viewBox="0 0 16 17"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M8.85233 8.15458H8.57664V10.9505C8.57664 11.336 8.26415 11.6485 7.87868 11.6485C7.4932 11.6485 7.18071 11.336 7.18071 10.9505V3.31945H5.55446V10.9505C5.55446 11.336 5.24197 11.6485 4.85649 11.6485C4.47102 11.6485 4.15853 11.336 4.15853 10.9505V3.31945H3.40139C3.03704 3.31945 2.74167 3.02408 2.74167 2.65973C2.74167 2.29537 3.03704 2 3.40139 2H8.85233C10.6475 2 12.1083 3.38015 12.1083 5.07695C12.1083 6.77443 10.6475 8.15458 8.85233 8.15458ZM0.999999 13.8953C0.999999 13.5311 1.29531 13.2358 1.65958 13.2358H11.3265L10.2471 12.2163C9.96375 11.9487 9.96375 11.4979 10.2471 11.2304C10.5084 10.9836 10.9169 10.9836 11.1782 11.2304L13.2302 13.1683C13.648 13.5629 13.648 14.2277 13.2302 14.6223L11.1782 16.5603C10.9169 16.8071 10.5084 16.8071 10.2471 16.5603C9.96375 16.2927 9.96375 15.842 10.2471 15.5744L11.3265 14.5549H1.65958C1.29531 14.5549 0.999999 14.2596 0.999999 13.8953Z"
					fill="black"
				/>
			</svg>
		),
		syntax: '::: ltr \n Direction of content is from left to right \n :::',
	},
	{
		id: 'h1',
		name: 'Heading 1',
		icon: (
			<svg
				width="20"
				height="16"
				viewBox="0 0 20 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17.498 12.1172C17.0586 12.1172 16.7539 11.8125 16.7539 11.3555V5.00977H16.7246L15.3594 5.95898C15.2129 6.06445 15.0957 6.10547 14.9316 6.10547C14.6152 6.10547 14.3867 5.87695 14.3867 5.54297C14.3867 5.30859 14.4805 5.13281 14.7324 4.95703L16.4609 3.74414C16.8359 3.48047 17.0703 3.42773 17.3867 3.42773C17.9199 3.42773 18.2422 3.75 18.2422 4.27148V11.3555C18.2422 11.8125 17.9375 12.1172 17.498 12.1172Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n# heading 1 \n',
	},
	{
		id: 'h2',
		name: 'Heading 2',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M15.3242 12C14.8555 12 14.6094 11.7422 14.6094 11.3613C14.6094 11.0684 14.709 10.8926 15.0312 10.5879L17.6152 8.02734C18.6934 6.96094 18.9629 6.5332 18.9629 5.88867C18.9629 5.13281 18.3828 4.58789 17.5684 4.58789C16.8066 4.58789 16.2734 4.97461 15.9746 5.73633C15.8223 6.04102 15.6465 6.19922 15.3008 6.19922C14.8906 6.19922 14.6445 5.94727 14.6445 5.57227C14.6445 5.46094 14.6621 5.35547 14.6914 5.25586C14.9199 4.3418 15.9336 3.375 17.5801 3.375C19.2734 3.375 20.4395 4.37695 20.4395 5.79492C20.4395 6.78516 19.9648 7.45312 18.5645 8.82422L16.625 10.7344V10.7637H20C20.3984 10.7637 20.6445 11.0098 20.6445 11.3848C20.6445 11.7539 20.3984 12 20 12H15.3242Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n## heading 2 \n',
	},
	{
		id: 'h3',
		name: 'Heading 3',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17.6621 12.1699C16.1797 12.1699 15.2188 11.5664 14.7793 10.7168C14.668 10.5117 14.6211 10.3184 14.6211 10.1191C14.6211 9.7207 14.873 9.46875 15.2949 9.46875C15.6055 9.46875 15.793 9.60352 15.9512 9.91406C16.2441 10.5527 16.7539 10.9336 17.6797 10.9336C18.6406 10.9336 19.291 10.3828 19.291 9.61523C19.2969 8.71289 18.6406 8.20898 17.5566 8.20898H17.0762C16.7012 8.20898 16.4785 7.98047 16.4785 7.64648C16.4785 7.3125 16.7012 7.08398 17.0762 7.08398H17.5215C18.4531 7.08398 19.0742 6.55078 19.0742 5.80078C19.0742 5.06836 18.5938 4.57617 17.6562 4.57617C16.8594 4.57617 16.3965 4.9043 16.1152 5.56641C15.9512 5.92969 15.7871 6.06445 15.4355 6.06445C15.0137 6.06445 14.791 5.81836 14.791 5.43164C14.791 5.2207 14.832 5.0332 14.9375 4.82812C15.3359 3.99023 16.2734 3.375 17.6504 3.375C19.4023 3.375 20.5273 4.28906 20.5273 5.5957C20.5273 6.65625 19.7715 7.36523 18.752 7.57617V7.60547C20 7.72266 20.8262 8.47266 20.8262 9.65039C20.8262 11.1504 19.5137 12.1699 17.6621 12.1699Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n### heading 3 \n',
	},
	{
		id: 'h4',
		name: 'Heading 4',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M19.373 12.1172C18.957 12.1172 18.6523 11.8477 18.6523 11.373V10.377H15.3184C14.7734 10.377 14.416 10.0312 14.416 9.52734C14.416 9.19922 14.5098 8.92383 14.7441 8.50195C15.3359 7.44141 16.2969 5.99414 17.3105 4.50586C17.8613 3.68555 18.2305 3.42773 18.8516 3.42773C19.6309 3.42773 20.0938 3.83789 20.0938 4.54102V9.13477H20.6855C21.084 9.13477 21.3242 9.39258 21.3242 9.75586C21.3242 10.125 21.084 10.377 20.6797 10.377H20.0938V11.373C20.0938 11.8477 19.7949 12.1172 19.373 12.1172ZM18.6758 9.16992V4.69336H18.6523C17.3105 6.61523 16.4727 7.88086 15.7871 9.12891V9.16992H18.6758Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n#### heading 4 \n',
	},
	{
		id: 'h5',
		name: 'Heading 5',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17.75 12.1699C16.4492 12.1699 15.3242 11.5488 14.9082 10.6289C14.8262 10.4473 14.7734 10.2715 14.7734 10.0547C14.7734 9.66211 15.0254 9.41602 15.4238 9.41602C15.7402 9.41602 15.9336 9.53906 16.0918 9.84961C16.3789 10.5352 16.9414 10.9395 17.7559 10.9395C18.7578 10.9395 19.4668 10.2305 19.4668 9.22852C19.4668 8.25586 18.7578 7.56445 17.7617 7.56445C17.2285 7.56445 16.7656 7.78125 16.4434 8.09766C16.0918 8.44922 15.9453 8.52539 15.5996 8.52539C15.1133 8.52539 14.873 8.17969 14.8848 7.76953C14.8848 7.73438 14.8848 7.71094 14.8906 7.67578L15.1602 4.48242C15.2129 3.81445 15.5527 3.54492 16.2148 3.54492H19.8594C20.2461 3.54492 20.498 3.79102 20.498 4.16016C20.498 4.53516 20.2461 4.78125 19.8594 4.78125H16.4434L16.2207 7.2832H16.25C16.6074 6.75586 17.3047 6.42773 18.1543 6.42773C19.7715 6.42773 20.9258 7.57031 20.9258 9.1875C20.9258 10.957 19.625 12.1699 17.75 12.1699Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n##### heading 5 \n',
	},
	{
		id: 'h6',
		name: 'Heading 6',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17.9141 12.1699C16.5957 12.1699 15.5527 11.5254 14.9668 10.2891C14.6562 9.63867 14.498 8.83008 14.498 7.86914C14.498 5.05078 15.7871 3.36914 17.9375 3.36914C19.2266 3.36914 20.2109 3.93164 20.6328 4.73438C20.7266 4.9043 20.7676 5.05078 20.7676 5.21484C20.7676 5.56055 20.5215 5.82422 20.123 5.82422C19.8242 5.82422 19.6367 5.68359 19.4023 5.38477C19.0098 4.8457 18.5586 4.59961 17.9316 4.59961C16.6543 4.59961 15.9746 5.77734 15.9453 7.72266V7.81055H15.9746C16.3086 7.03125 17.1523 6.44531 18.3008 6.44531C19.9297 6.44531 21.0723 7.61719 21.0723 9.2168C21.0723 10.9336 19.7422 12.1699 17.9141 12.1699ZM17.8906 10.9395C18.834 10.9395 19.584 10.2012 19.584 9.27539C19.5898 8.30273 18.8809 7.61133 17.9082 7.61133C16.9355 7.61133 16.2031 8.30273 16.2031 9.24609C16.2031 10.1953 16.9473 10.9395 17.8906 10.9395Z"
					fill="black"
				/>
				<path
					d="M4 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12 2.6665V13.3332"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 8H12"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '\n###### heading 6 \n',
	},
	{
		id: 'hr',
		name: 'Horizontal Rule',
		icon: (
			<svg
				width="14"
				height="14"
				viewBox="0 0 14 14"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8.33301 1V3.66667C8.33301 3.84348 8.40325 4.01305 8.52827 4.13807C8.65329 4.2631 8.82286 4.33333 8.99967 4.33333H11.6663"
					stroke="black"
					stroke-width="1.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M11.6663 10.9995V11.6662C11.6663 12.0198 11.5259 12.3589 11.2758 12.609C11.0258 12.859 10.6866 12.9995 10.333 12.9995H3.66634C3.31272 12.9995 2.97358 12.859 2.72353 12.609C2.47348 12.3589 2.33301 12.0198 2.33301 11.6662V10.9995"
					stroke="black"
					stroke-width="1.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M1 8.33301H3M6 8.33301H8M11 8.33301H13"
					stroke="black"
					stroke-width="1.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M2.33301 5.66667V2.33333C2.33301 1.97971 2.47348 1.64057 2.72353 1.39052C2.97358 1.14048 3.31272 1 3.66634 1H8.33301L11.6663 4.33333V5.66667"
					stroke="black"
					stroke-width="1.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		),
		syntax: '****',
	}, //not working
	{
		id: 'code',
		name: 'Code Block',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clip-path="url(#clip0_85_1028)">
					<path
						d="M10.0003 18.3332C14.6027 18.3332 18.3337 14.6022 18.3337 9.99984C18.3337 5.39746 14.6027 1.6665 10.0003 1.6665C5.39795 1.6665 1.66699 5.39746 1.66699 9.99984C1.66699 14.6022 5.39795 18.3332 10.0003 18.3332Z"
						stroke="black"
						strokeWidth="1.5"
					/>
					<path
						d="M13.333 8.3335L14.3551 9.2145C14.7848 9.58483 14.9997 9.77008 14.9997 10.0002C14.9997 10.2302 14.7848 10.4155 14.3551 10.7858L13.333 11.6668"
						stroke="black"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6.66667 8.3335L5.64455 9.2145C5.21485 9.58483 5 9.77008 5 10.0002C5 10.2302 5.21485 10.4155 5.64455 10.7858L6.66667 11.6668"
						stroke="black"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M10.8337 7.5L9.16699 12.5"
						stroke="black"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
				<defs>
					<clipPath id="clip0_85_1028">
						<rect width="20" height="20" fill="white" />
					</clipPath>
				</defs>
			</svg>
		),
		syntax: '```\n',
	},
	{
		id: 'link',
		name: 'Link',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M7.61982 8.90915L7.79225 8.73674C9.44116 7.08775 12.1147 7.08775 13.7636 8.73674C15.4126 10.3857 15.4126 13.0592 13.7636 14.7081L11.3751 17.0966C9.72616 18.7456 7.05265 18.7456 5.4037 17.0966C3.75476 15.4477 3.75476 12.7742 5.4037 11.1252L5.79066 10.7383"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M14.2097 9.2615L14.5966 8.87459C16.2456 7.22563 16.2456 4.55216 14.5966 2.90321C12.9477 1.25427 10.2742 1.25427 8.62525 2.90321L6.23671 5.29176C4.58776 6.9407 4.58776 9.61417 6.23671 11.2631C7.88566 12.9121 10.5592 12.9121 12.2081 11.2631L12.3805 11.0907"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		syntax: '[link](URL_ADDRESS.com)',
	},
	{
		id: 'inlineCode',
		name: 'Inline Code',
		icon: (
			<svg
				width="22"
				height="16"
				viewBox="0 0 22 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M16 3L19.0662 5.643C20.3555 6.754 21 7.30975 21 8C21 8.69025 20.3555 9.246 19.0662 10.357L16 13"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M6 3L2.93365 5.643C1.64455 6.754 1 7.30975 1 8C1 8.69025 1.64455 9.246 2.93365 10.357L6 13"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M13 1L9 15"
					stroke="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
		syntax: '`inline code`',
	},
	{ id: 'superscript', name: 'Superscript', icon: 'x⁴', syntax: 'text^superscript^' },
	{ id: 'subscript', name: 'Subscript', icon: 'x₄', syntax: 'text~subscript~' },
	{
		id: 'highlight',
		name: 'Highlight',
		icon: (
			<svg
				width="15"
				height="17"
				viewBox="0 0 15 17"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M7.8568 11.9098L2.88162 12.8337C1.92735 13.0109 1.45023 13.0995 1.17535 12.8247C0.900479 12.5497 0.989079 12.0726 1.16629 11.1183L2.09015 6.14287C2.2383 5.34508 2.31237 4.94617 2.57535 4.70513C2.83833 4.46411 3.31926 4.41707 4.28113 4.32299C5.20818 4.23231 6.08553 3.91451 7 3L11 7.00033C10.0855 7.91487 9.76753 8.7916 9.67673 9.71873C9.58253 10.6807 9.5354 11.1617 9.2944 11.4247C9.0534 11.6876 8.65453 11.7617 7.8568 11.9098Z"
					stroke="black"
					stroke-width="1.2"
					stroke-linejoin="round"
				/>
				<path
					d="M6.33366 9.14066C5.96066 9.08013 5.61963 8.91786 5.35121 8.64946M5.35121 8.64946C5.08278 8.38106 4.92053 8.03999 4.85997 7.66699M5.35121 8.64946L1.66699 12.3337"
					stroke="black"
					stroke-width="1.2"
					stroke-linecap="round"
				/>
				<path
					d="M7 3C7.47487 2.2994 8.11807 1.1208 9.071 1.00732C9.72147 0.92986 10.2604 1.46875 11.3381 2.54652L11.4535 2.66185C12.5313 3.73963 13.0701 4.27851 12.9927 4.929C12.8792 5.88193 11.7006 6.52513 11 7"
					stroke="black"
					stroke-width="1.2"
					stroke-linejoin="round"
				/>
				<path d="M1 16H14" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		),
		syntax: '==highlighted text==',
	},
	{
		id: 'table',
		name: 'Table',
		icon: '▦',
		syntax: "| Syntax      | Description | Test Text     |\n| :---        |    :----:   |          ---: |\n| Header      | Title       | Here's this   |\n| Paragraph   | Text        | And more      |\n",
	},
	{
		id: 'taskList',
		name: 'Task List',
		icon: (
			<svg
				width="19"
				height="19"
				viewBox="0 0 19 19"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10.681 6.19482C10.2898 6.19482 9.97266 6.51196 9.97266 6.90316C9.97266 7.29436 10.2898 7.61149 10.681 7.61149H13.9865C14.3777 7.61149 14.6949 7.29436 14.6949 6.90316C14.6949 6.51196 14.3777 6.19482 13.9865 6.19482H10.681Z"
					fill="#212121"
					stroke="white"
					stroke-width="0.1"
				/>
				<path
					d="M9.97266 12.0975C9.97266 11.7063 10.2897 11.3892 10.681 11.3892H13.9864C14.3776 11.3892 14.6947 11.7063 14.6947 12.0975C14.6947 12.4887 14.3776 12.8058 13.9864 12.8058H10.681C10.2897 12.8058 9.97266 12.4887 9.97266 12.0975Z"
					fill="#212121"
					stroke="white"
					stroke-width="0.1"
				/>
				<path
					d="M8.34817 5.45746C8.62479 5.73408 8.62479 6.18258 8.34817 6.4592L6.45931 8.34806C6.18269 8.62469 5.73419 8.62469 5.45757 8.34806L4.51313 7.40364C4.23651 7.12702 4.23651 6.67853 4.51313 6.40191C4.78975 6.12529 5.23824 6.12529 5.51486 6.40191L5.95844 6.84549L7.34646 5.45746C7.62312 5.18085 8.07154 5.18085 8.34817 5.45746Z"
					fill="#212121"
					stroke="white"
					stroke-width="0.1"
				/>
				<path
					d="M8.34817 11.654C8.62479 11.3773 8.62479 10.9289 8.34817 10.6523C8.07154 10.3757 7.62312 10.3757 7.34646 10.6523L5.95844 12.0403L5.51486 11.5967C5.23824 11.3201 4.78975 11.3201 4.51313 11.5967C4.23651 11.8734 4.23651 12.3218 4.51313 12.5984L5.45757 13.5429C5.73419 13.8195 6.18269 13.8195 6.45931 13.5429L8.34817 11.654Z"
					fill="#212121"
					stroke="white"
					stroke-width="0.1"
				/>
				<path
					d="M3.125 1C1.9514 1 1 1.9514 1 3.125V15.875C1 17.0486 1.9514 18 3.125 18H15.875C17.0486 18 18 17.0486 18 15.875V3.125C18 1.9514 17.0486 1 15.875 1H3.125ZM2.41667 3.125C2.41667 2.7338 2.7338 2.41667 3.125 2.41667H15.875C16.2662 2.41667 16.5833 2.7338 16.5833 3.125V15.875C16.5833 16.2662 16.2662 16.5833 15.875 16.5833H3.125C2.7338 16.5833 2.41667 16.2662 2.41667 15.875V3.125Z"
					fill="#212121"
					stroke="white"
					stroke-width="0.1"
				/>
			</svg>
		),
		syntax: '- [ ] Task to do\n- [x] Completed task',
	},
	{ id: 'definition', name: 'Definition', icon: '📚', syntax: 'Term\n: Definition' },
	{
		id: 'footnote',
		name: 'Footnote',
		icon: (
			<svg
				width="19"
				height="17"
				viewBox="0 0 19 17"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M17.684 1H6.21363C5.96658 1 5.77246 1.19411 5.77246 1.44117C5.77246 1.68822 5.96658 1.88234 6.21363 1.88234H17.684C17.9311 1.88234 18.1252 1.68822 18.1252 1.44117C18.1252 1.19411 17.9311 1 17.684 1Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
				<path
					d="M6.21363 4.5298H15.9193C16.1664 4.5298 16.3605 4.33568 16.3605 4.08863C16.3605 3.84158 16.1664 3.64746 15.9193 3.64746H6.21363C5.96658 3.64746 5.77246 3.84158 5.77246 4.08863C5.77246 4.33568 5.96658 4.5298 6.21363 4.5298Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
				<path
					d="M17.684 6.29395H6.21363C5.96658 6.29395 5.77246 6.48806 5.77246 6.73511C5.77246 6.98217 5.96658 7.17628 6.21363 7.17628H17.684C17.9311 7.17628 18.1252 6.98217 18.1252 6.73511C18.1252 6.48806 17.9311 6.29395 17.684 6.29395Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
				<path
					d="M6.21363 9.82277H15.9193C16.1664 9.82277 16.3605 9.62865 16.3605 9.3816C16.3605 9.13454 16.1664 8.94043 15.9193 8.94043H6.21363C5.96658 8.94043 5.77246 9.13454 5.77246 9.3816C5.77246 9.62865 5.96658 9.82277 6.21363 9.82277Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
				<path
					d="M17.684 11.5884H6.21363C5.96658 11.5884 5.77246 11.7825 5.77246 12.0295V15.5589C5.77246 15.8059 5.96658 16.0001 6.21363 16.0001H17.684C17.9311 16.0001 18.1252 15.8059 18.1252 15.5589V12.0295C18.1252 11.7825 17.9311 11.5884 17.684 11.5884ZM17.2428 15.1177H6.6548V12.4707H17.2428V15.1177Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
				<path
					d="M1.117 15.876C1.20523 15.9642 1.32876 15.9995 1.43464 15.9995C1.54052 15.9995 1.66405 15.9642 1.75228 15.876L3.51695 14.1113C3.69342 13.9349 3.69342 13.6525 3.51695 13.4937L1.75228 11.729C1.57581 11.5526 1.29346 11.5526 1.13464 11.729C0.958176 11.9055 0.958176 12.1878 1.13464 12.3467L2.58168 13.7937L1.13464 15.2407C0.958176 15.4172 0.958176 15.6995 1.117 15.876Z"
					fill="black"
					stroke="black"
					stroke-width="0.3"
				/>
			</svg>
		),
		syntax: 'Text with footnote[^1]\n\n[^1]: Footnote content',
	},
];

export function AddComponentPanelButtons({
	onComponentAdd,
	isExpanded,
	onExpandChange,
	searchTerm,
	onSearchChange,
	styleProperties,
	textAreaRef,
}: Readonly<AddComponentPanelButtonsProps>) {
	const [showAll, setShowAll] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const [showImageBrowser, setShowImageBrowser] = useState(false);
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkText, setLinkText] = useState('');
	const [linkUrl, setLinkUrl] = useState('');

	const [showTableDialog, setShowTableDialog] = useState(false);
	// Update the initial state
	const [tableConfig, setTableConfig] = useState<TableConfig>({
		rows: 2,
		columns: 2,
	});

	// Modify the generateTable function
	const generateTable = ({ rows, columns }: TableConfig) => {
		const headerRow = '| ' + Array(columns).fill('Header').join(' | ') + ' |';
		const alignmentRow = '| ' + Array(columns).fill(':---').join(' | ') + ' |';
		let tableContent = headerRow + '\n' + alignmentRow + '\n';

		// Generate data rows (excluding header)
		for (let i = 0; i < rows - 1; i++) {
			const dataRow = '| ' + Array(columns).fill('Cell').join(' | ') + ' |';
			tableContent += dataRow + (i < rows - 2 ? '\n' : '');
		}

		return tableContent;
	};

	const handleComponentClick = (comp: any) => {
		if (comp.id === 'img') {
			setShowImageBrowser(true);
		} else if (comp.id === 'link') {
			setShowLinkDialog(true);
			setLinkText('');
			setLinkUrl('');
		} else if (comp.id === 'table') {
			setShowTableDialog(true);
		} else {
			onComponentAdd(comp.syntax);
			onExpandChange(false);
			onSearchChange('');
			setShowAll(false);
		}
	};

	const handleLinkAdd = () => {
		onComponentAdd(`[${linkText}](${linkUrl})`);
		setShowLinkDialog(false);
		onExpandChange(false);
		onSearchChange('');
		setShowAll(false);
	};

	let linkDialog = null;
	if (showLinkDialog) {
		linkDialog = (
			<div
				className="_popupBackground"
				onClick={e => {
					if ((e.target as HTMLElement).className === '_popupBackground') {
						setShowLinkDialog(false);
					}
				}}
			>
				<div className="_linkDialog">
					<div className="_linkDialogHeader">
						<h3>Add Link</h3>
						<button onClick={() => setShowLinkDialog(false)} className="_closeButton">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path
									d="M12 4L4 12M4 4L12 12"
									stroke="black"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<div className="_linkDialogContent">
						<div className="_inputGroup">
							<label htmlFor="linkText">Text</label>
							<input
								type="text"
								id="linkText"
								className="_linkInput"
								value={linkText}
								onChange={e => setLinkText(e.target.value)}
								placeholder="Link text"
							/>
						</div>
						<div className="_inputGroup">
							<label htmlFor="linkUrl">URL</label>
							<input
								type="text"
								id="linkUrl"
								className="_linkInput"
								value={linkUrl}
								onChange={e => setLinkUrl(e.target.value)}
								placeholder="https://example.com"
							/>
						</div>
					</div>
					<div className="_linkDialogFooter">
						<button onClick={() => setShowLinkDialog(false)} className="_cancelButton">
							Cancel
						</button>
						<button
							onClick={handleLinkAdd}
							className="_addLinkButton"
							disabled={!linkText || !linkUrl}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		);
	}

	let imageBrowser = undefined;
	if (showImageBrowser) {
		imageBrowser = (
			<div
				className="_popupBackground"
				onClick={e => {
					if (e.target === e.currentTarget) setShowImageBrowser(false);
				}}
			>
				<div className="_popupContainer">
					<FileBrowser
						selectedFile=""
						onChange={file => {
							onComponentAdd(`![image](${file})`);
							setShowImageBrowser(false);
							onExpandChange(false);
							onSearchChange('');
							setShowAll(false);
						}}
						editOnUpload={false}
					/>
				</div>
			</div>
		);
	}

	const handleTableAdd = () => {
		const tableContent = generateTable(tableConfig);
		onComponentAdd('\n' + tableContent + '\n');
		setShowTableDialog(false);
		onExpandChange(false);
		onSearchChange('');
		setShowAll(false);
	};

	const filteredComponents = components.filter(comp =>
		comp.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
				onExpandChange(false);
			}
		};

		if (isExpanded) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isExpanded]);

	const displayComponents = showAll ? filteredComponents : filteredComponents.slice(0, 6);
	const hasMoreComponents = filteredComponents.length > 6;

	let tableDialog = undefined;
	if (showTableDialog) {
		tableDialog = (
			<div
				className="_popupBackground"
				onClick={e => {
					if (e.target === e.currentTarget) setShowTableDialog(false);
				}}
			>
				<div className="_linkDialog">
					<div className="_linkDialogHeader">
						<h3>Add a Table</h3>
						<button onClick={() => setShowTableDialog(false)} className="_closeButton">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path
									d="M12 4L4 12M4 4L12 12"
									stroke="black"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<div className="_linkDialogContent">
						<div className="_inputGroup">
							<label>Number of Rows (including header):</label>
							<input
								type="number"
								min="2"
								max="30"
								className="_linkInput"
								value={tableConfig.rows}
								onChange={e =>
									setTableConfig({
										...tableConfig,
										rows: Math.max(2, parseInt(e.target.value) || 2),
									})
								}
							/>
						</div>
						<div className="_inputGroup">
							<label>Number of Columns:</label>
							<input
								type="number"
								min="1"
								max="15"
								className="_linkInput"
								value={tableConfig.columns}
								onChange={e =>
									setTableConfig({
										...tableConfig,
										columns: Math.max(1, parseInt(e.target.value) || 1),
									})
								}
							/>
						</div>
						<div className="_linkDialogFooter">
							<button
								className="_cancelButton"
								onClick={() => setShowTableDialog(false)}
							>
								Cancel
							</button>
							<button className="_addLinkButton" onClick={handleTableAdd}>
								Add Table
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="_componentPanel" ref={panelRef}>
			{!isExpanded ? (
				<button
					className="_addButton"
					onClick={() => onExpandChange(!isExpanded)}
					title="Add Component ( ctrl/cmd + / )"
				>
					<i className={`fa fa-${isExpanded ? 'times' : 'plus'}`} />
				</button>
			) : (
				<div className="_componentPopup">
					<div className="_searchContainer">
						<button
							className="_closeaddButton"
							onClick={() => onExpandChange(!isExpanded)}
							title="Close add Component ( ctrl/cmd + / )"
						>
							<i className={`fa fa-${isExpanded ? 'times' : 'plus'}`} />
						</button>
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={e => onSearchChange(e.target.value)}
							className="_searchInput"
						/>
					</div>
					<div className="_componentGrid">
						{displayComponents.map(comp => (
							<button
								key={comp.id}
								onClick={() => handleComponentClick(comp)}
								className="_componentButton"
								title={comp.name}
							>
								<span className="_componentIcon">{comp.icon}</span>
								<span className="_componentName">{comp.name}</span>
							</button>
						))}
					</div>
					{tableDialog}
					{imageBrowser}
					{linkDialog}
					{hasMoreComponents && !showAll && (
						<div className="_footer">
							<button className="_browseAll" onClick={() => setShowAll(true)}>
								Show all components
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

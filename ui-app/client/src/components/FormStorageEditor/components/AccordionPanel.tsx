import React, { DragEvent, ReactNode, useState } from 'react';
import { FormCompDefinition } from './formCommons';

interface AccordionPanelProps {
	data: FormCompDefinition;
	children: ReactNode;
	handleDrop: (e: DragEvent<HTMLDivElement>, key: string) => void;
	handleDelete: (key: string) => void;
	handleDragStart: (e: DragEvent<HTMLDivElement>, key: string, dropType: string) => void;
}
export default function AccordionPanel({
	data,
	children,
	handleDrop,
	handleDelete,
	handleDragStart,
}: AccordionPanelProps) {
	const [isDraggable, setIsDraggable] = useState<boolean>(false);
	const [showContent, setShowContent] = useState<boolean>(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isHovered1, setIsHovered1] = useState(false);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	return (
		<div
			className="_accordion_panel"
			onDragStart={e => handleDragStart(e, data.key, 'Inside_Drop')}
			onDragOver={handleDragOver}
			onDrop={e => handleDrop(e, data.key)}
			draggable={isDraggable}
		>
			<div className="_header">
				<div className="_left">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="9"
						height="15"
						viewBox="0 0 9 15"
						fill="none"
						role="button"
						onMouseEnter={() => setIsDraggable(true)}
						onMouseLeave={() => setIsDraggable(false)}
					>
						<circle cx="7.5" cy="1.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="7.5"
							cy="1.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
						<circle cx="1.5" cy="1.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="1.5"
							cy="1.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
						<circle cx="7.5" cy="7.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="7.5"
							cy="7.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
						<circle cx="1.5" cy="7.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="1.5"
							cy="7.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
						<circle cx="7.5" cy="13.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="7.5"
							cy="13.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
						<circle cx="1.5" cy="13.5" r="1.5" fill="#D9D9D9" fillOpacity="0.1" />
						<circle
							cx="1.5"
							cy="13.5"
							r="1.1"
							stroke="black"
							strokeOpacity="0.15"
							strokeWidth="0.8"
						/>
					</svg>
					<span>{`${data.label} ${showContent ? 'properties' : ''}`}</span>
				</div>
				<div className="_right">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="15"
						viewBox="0 0 14 15"
						fill="none"
						role="button"
						onClick={() => setShowContent(!showContent)}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<path
							d="M13.9612 4.88181C14.054 5.13675 13.9757 5.42098 13.7755 5.60266L12.5193 6.75718C12.5513 7.00039 12.5687 7.24946 12.5687 7.50147C12.5687 7.75347 12.5513 8.00254 12.5193 8.24575L13.7755 9.40027C13.9757 9.58195 14.054 9.86619 13.9612 10.1211C13.8335 10.4698 13.6798 10.8039 13.5028 11.1262L13.3665 11.3635C13.175 11.6859 12.9603 11.9906 12.7253 12.2778C12.5542 12.4888 12.2698 12.5591 12.0146 12.477L10.3986 11.9584C10.0099 12.2602 9.58053 12.5122 9.12216 12.7027L8.75952 14.3759C8.7015 14.6425 8.49842 14.8535 8.23152 14.8974C7.83117 14.9648 7.41921 15 6.99855 15C6.57789 15 6.16593 14.9648 5.76558 14.8974C5.49868 14.8535 5.2956 14.6425 5.23758 14.3759L4.87494 12.7027C4.41657 12.5122 3.98721 12.2602 3.59846 11.9584L1.98545 12.48C1.73015 12.562 1.44584 12.4888 1.27468 12.2807C1.03969 11.9936 0.825008 11.6888 0.633535 11.3665L0.497184 11.1291C0.320216 10.8068 0.166458 10.4727 0.0388097 10.124C-0.0540255 9.86911 0.0243042 9.58488 0.22448 9.4032L1.48066 8.24868C1.44874 8.00254 1.43134 7.75347 1.43134 7.50147C1.43134 7.24946 1.44874 7.00039 1.48066 6.75718L0.22448 5.60266C0.0243042 5.42098 -0.0540255 5.13675 0.0388097 4.88181C0.166458 4.53311 0.320216 4.19906 0.497184 3.87673L0.633535 3.63938C0.825008 3.31705 1.03969 3.01231 1.27468 2.72514C1.44584 2.51416 1.73015 2.44384 1.98545 2.52588L3.60136 3.04454C3.99011 2.74272 4.41947 2.49072 4.87785 2.30025L5.24048 0.627076C5.2985 0.360422 5.50158 0.149443 5.76848 0.105489C6.16883 0.0351631 6.58079 0 7.00145 0C7.42211 0 7.83407 0.0351631 8.23442 0.102559C8.50132 0.146513 8.7044 0.357492 8.76242 0.624145L9.12506 2.29732C9.58343 2.48779 10.0128 2.73979 10.4015 3.04161L12.0175 2.52295C12.2727 2.44091 12.5571 2.51416 12.7282 2.72221C12.9632 3.00938 13.1779 3.31412 13.3694 3.63645L13.5057 3.8738C13.6827 4.19613 13.8364 4.53018 13.9641 4.87888L13.9612 4.88181ZM7.00145 9.84567C7.61699 9.84567 8.20731 9.59869 8.64256 9.15907C9.07781 8.71945 9.32233 8.12319 9.32233 7.50147C9.32233 6.87974 9.07781 6.28348 8.64256 5.84386C8.20731 5.40424 7.61699 5.15726 7.00145 5.15726C6.38591 5.15726 5.79559 5.40424 5.36034 5.84386C4.92509 6.28348 4.68057 6.87974 4.68057 7.50147C4.68057 8.12319 4.92509 8.71945 5.36034 9.15907C5.79559 9.59869 6.38591 9.84567 7.00145 9.84567Z"
							fill={!isHovered ? '#C8C8C8' : '#427EE4'}
						/>
					</svg>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="16"
						viewBox="0 0 12 16"
						fill="none"
						role="button"
						onClick={() => handleDelete(data.key)}
						onMouseEnter={() => setIsHovered1(true)}
						onMouseLeave={() => setIsHovered1(false)}
					>
						<path
							d="M0.954746 5.86849C0.951518 5.86849 0.948541 5.86759 0.945312 5.86759L1.43921 14.5554C1.48387 15.3654 2.17427 15.9988 3.00893 15.9988H8.72102C9.55568 15.9988 10.2461 15.3654 10.2907 14.5554L10.7847 5.86719C10.7801 5.86723 10.776 5.86849 10.7715 5.86849H0.954746ZM4.14738 12.43C4.14738 12.6142 3.99375 12.7633 3.8039 12.7633C3.61404 12.7633 3.46042 12.6142 3.46042 12.43V8.10328C3.46042 7.91903 3.61404 7.76994 3.8039 7.76994C3.99375 7.76994 4.14738 7.91903 4.14738 8.10328V12.43ZM6.20827 13.9479C6.20827 14.1322 6.05464 14.2813 5.86478 14.2813C5.67493 14.2813 5.5213 14.1322 5.5213 13.9479V6.58532C5.5213 6.40106 5.67493 6.25197 5.86478 6.25197C6.05464 6.25197 6.20827 6.40106 6.20827 6.58532V13.9479ZM8.26915 12.43C8.26915 12.6142 8.11553 12.7633 7.92567 12.7633C7.73582 12.7633 7.58219 12.6142 7.58219 12.43V8.10328C7.58219 7.91903 7.73582 7.76994 7.92567 7.76994C8.11553 7.76994 8.26915 7.91903 8.26915 8.10328V12.43Z"
							fill={!isHovered1 ? '#C8C8C8' : '#FF614D'}
						/>
						<path
							d="M10.775 2.4717H7.62072C7.70166 2.26621 7.7446 2.04655 7.7446 1.82234C7.7446 0.817417 6.90233 0 5.86686 0C4.83138 0 3.98911 0.817417 3.98911 1.82234C3.98911 2.04664 4.03207 2.26629 4.1131 2.4717H0.958326C0.429352 2.4717 0 2.88839 0 3.40175V4.27512C0 4.78845 0.429352 5.20513 0.958326 5.20513H10.775C11.304 5.20513 11.7333 4.78845 11.7333 4.27512V3.40175C11.7333 2.88839 11.304 2.4717 10.775 2.4717ZM4.67608 1.82234C4.67608 1.18527 5.21042 0.666695 5.86686 0.666695C6.52329 0.666695 7.05764 1.18527 7.05764 1.82234C7.05764 2.05571 6.98516 2.28159 6.85105 2.4717H4.88299C4.74889 2.28159 4.67608 2.05571 4.67608 1.82234Z"
							fill={!isHovered1 ? '#C8C8C8' : '#FF614D'}
						/>
					</svg>
				</div>
			</div>
			<div className={`_content ${showContent ? '_show' : ''}`}>{children}</div>
		</div>
	);
}

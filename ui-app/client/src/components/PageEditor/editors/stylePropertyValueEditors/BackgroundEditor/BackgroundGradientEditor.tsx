import React from 'react';
import { IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';

interface BackgroundGradientEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function BackgroundGradientEditor({ value, onChange }: BackgroundGradientEditorProps) {
	// Extract gradient type and parameters
	const gradientType = value.startsWith('linear-gradient')
		? 'linear-gradient'
		: value.startsWith('radial-gradient')
			? 'radial-gradient'
			: value.startsWith('conic-gradient')
				? 'conic-gradient'
				: value.startsWith('repeating-linear-gradient')
					? 'repeating-linear-gradient'
					: value.startsWith('repeating-radial-gradient')
						? 'repeating-radial-gradient'
						: 'linear-gradient';

	// For Phase 2, we'll focus on gradient type selection and direction
	return (
		<div className="_gradientEditor">
			<div className="_gradientTypeSelector">
				<IconsSimpleEditor
					options={[
						{
							name: 'linear-gradient',
							description: 'Linear Gradient',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="url(#linearGradient)"
									/>
									<defs>
										<linearGradient
											id="linearGradient"
											x1="0%"
											y1="0%"
											x2="0%"
											y2="100%"
										>
											<stop
												offset="0%"
												stopColor="#02B694"
												stopOpacity="0.2"
											/>
											<stop
												offset="100%"
												stopColor="#02B694"
												stopOpacity="1"
											/>
										</linearGradient>
									</defs>
								</g>
							),
						},
						{
							name: 'radial-gradient',
							description: 'Radial Gradient',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="url(#radialGradient)"
									/>
									<defs>
										<radialGradient
											id="radialGradient"
											cx="50%"
											cy="50%"
											r="50%"
											fx="50%"
											fy="50%"
										>
											<stop offset="0%" stopColor="#02B694" stopOpacity="1" />
											<stop
												offset="100%"
												stopColor="#02B694"
												stopOpacity="0.2"
											/>
										</radialGradient>
									</defs>
								</g>
							),
						},
						{
							name: 'conic-gradient',
							description: 'Conic Gradient',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<path
										d="M7 7 L7 2 A5 5 0 0 1 12 7 Z"
										fill="white"
										fillOpacity="0.3"
									/>
									<path
										d="M7 7 L12 7 A5 5 0 0 1 7 12 Z"
										fill="white"
										fillOpacity="0.5"
									/>
									<path
										d="M7 7 L7 12 A5 5 0 0 1 2 7 Z"
										fill="white"
										fillOpacity="0.7"
									/>
									<path
										d="M7 7 L2 7 A5 5 0 0 1 7 2 Z"
										fill="white"
										fillOpacity="0.9"
									/>
								</g>
							),
						},
						{
							name: 'repeating-linear-gradient',
							description: 'Repeating Linear Gradient',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<rect
										x="2"
										y="2"
										width="10"
										height="2"
										fill="white"
										fillOpacity="0.3"
									/>
									<rect
										x="2"
										y="6"
										width="10"
										height="2"
										fill="white"
										fillOpacity="0.3"
									/>
									<rect
										x="2"
										y="10"
										width="10"
										height="2"
										fill="white"
										fillOpacity="0.3"
									/>
								</g>
							),
						},
						{
							name: 'repeating-radial-gradient',
							description: 'Repeating Radial Gradient',
							icon: (
								<g transform="translate(9 9)">
									<rect
										x="2"
										y="2"
										width="10"
										height="10"
										rx="1"
										fill="#02B694"
									/>
									<circle
										cx="7"
										cy="7"
										r="4"
										fill="none"
										stroke="white"
										strokeOpacity="0.3"
										strokeWidth="1"
									/>
									<circle
										cx="7"
										cy="7"
										r="2"
										fill="none"
										stroke="white"
										strokeOpacity="0.3"
										strokeWidth="1"
									/>
								</g>
							),
						},
					]}
					selected={gradientType}
					onChange={type => {
						// Create a basic gradient of the selected type
						const newValue = `${type}(to bottom, transparent, transparent)`;
						onChange(newValue);
					}}
					withBackground={true}
				/>
			</div>

			{/* Direction selector for linear gradients */}
			{(gradientType === 'linear-gradient' ||
				gradientType === 'repeating-linear-gradient') && (
				<div className="_gradientDirectionSelector">
					<div className="_simpleLabel">Direction</div>
					<IconsSimpleEditor
						options={[
							{
								name: 'to bottom',
								description: 'Top to Bottom',
								icon: (
									<g transform="translate(9 9)">
										<rect
											x="2"
											y="2"
											width="10"
											height="10"
											rx="1"
											fill="url(#linearGradientBottom)"
										/>
										<defs>
											<linearGradient
												id="linearGradientBottom"
												x1="0%"
												y1="0%"
												x2="0%"
												y2="100%"
											>
												<stop
													offset="0%"
													stopColor="#02B694"
													stopOpacity="0.2"
												/>
												<stop
													offset="100%"
													stopColor="#02B694"
													stopOpacity="1"
												/>
											</linearGradient>
										</defs>
										<path d="M7 3 L9 5 L5 5 Z" fill="#02B694" />
										<path d="M7 11 L9 9 L5 9 Z" fill="#02B694" />
										<line
											x1="7"
											y1="5"
											x2="7"
											y2="9"
											stroke="#02B694"
											strokeWidth="1"
										/>
									</g>
								),
							},
							{
								name: 'to right',
								description: 'Left to Right',
								icon: (
									<g transform="translate(9 9)">
										<rect
											x="2"
											y="2"
											width="10"
											height="10"
											rx="1"
											fill="url(#linearGradientRight)"
										/>
										<defs>
											<linearGradient
												id="linearGradientRight"
												x1="0%"
												y1="0%"
												x2="100%"
												y2="0%"
											>
												<stop
													offset="0%"
													stopColor="#02B694"
													stopOpacity="0.2"
												/>
												<stop
													offset="100%"
													stopColor="#02B694"
													stopOpacity="1"
												/>
											</linearGradient>
										</defs>
										<path d="M3 7 L5 9 L5 5 Z" fill="#02B694" />
										<path d="M11 7 L9 9 L9 5 Z" fill="#02B694" />
										<line
											x1="5"
											y1="7"
											x2="9"
											y2="7"
											stroke="#02B694"
											strokeWidth="1"
										/>
									</g>
								),
							},
							{
								name: 'to top',
								description: 'Bottom to Top',
								icon: (
									<g transform="translate(9 9)">
										<rect
											x="2"
											y="2"
											width="10"
											height="10"
											rx="1"
											fill="url(#linearGradientTop)"
										/>
										<defs>
											<linearGradient
												id="linearGradientTop"
												x1="0%"
												y1="100%"
												x2="0%"
												y2="0%"
											>
												<stop
													offset="0%"
													stopColor="#02B694"
													stopOpacity="0.2"
												/>
												<stop
													offset="100%"
													stopColor="#02B694"
													stopOpacity="1"
												/>
											</linearGradient>
										</defs>
										<path d="M7 3 L9 5 L5 5 Z" fill="#02B694" />
										<path d="M7 11 L9 9 L5 9 Z" fill="#02B694" />
										<line
											x1="7"
											y1="5"
											x2="7"
											y2="9"
											stroke="#02B694"
											strokeWidth="1"
										/>
									</g>
								),
							},
							{
								name: 'to left',
								description: 'Right to Left',
								icon: (
									<g transform="translate(9 9)">
										<rect
											x="2"
											y="2"
											width="10"
											height="10"
											rx="1"
											fill="url(#linearGradientLeft)"
										/>
										<defs>
											<linearGradient
												id="linearGradientLeft"
												x1="100%"
												y1="0%"
												x2="0%"
												y2="0%"
											>
												<stop
													offset="0%"
													stopColor="#02B694"
													stopOpacity="0.2"
												/>
												<stop
													offset="100%"
													stopColor="#02B694"
													stopOpacity="1"
												/>
											</linearGradient>
										</defs>
										<path d="M3 7 L5 9 L5 5 Z" fill="#02B694" />
										<path d="M11 7 L9 9 L9 5 Z" fill="#02B694" />
										<line
											x1="5"
											y1="7"
											x2="9"
											y2="7"
											stroke="#02B694"
											strokeWidth="1"
										/>
									</g>
								),
							},
						]}
						selected={
							value.includes('to bottom')
								? 'to bottom'
								: value.includes('to right')
									? 'to right'
									: 'to bottom'
						}
						onChange={direction => {
							// Update the gradient direction
							const newValue = value.replace(/\([^,]+,/, `(${direction},`);
							onChange(newValue);
						}}
						withBackground={true}
					/>
				</div>
			)}

			{/* For Phase 2, we'll keep using the raw text input for color stops */}
			<div className="_gradientColorStops">
				<div className="_simpleLabel">Color Stops</div>
				<input
					type="text"
					value={value
						.substring(value.indexOf('(') + 1, value.lastIndexOf(')'))
						.split(',')
						.slice(1)
						.join(',')
						.trim()}
					onChange={e => {
						const direction = value.substring(
							value.indexOf('(') + 1,
							value.indexOf(','),
						);
						const newValue = `${gradientType}(${direction}, ${e.target.value})`;
						onChange(newValue);
					}}
					placeholder="transparent, black"
				/>
			</div>
		</div>
	);
}

import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

import Animated from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const pathHeight = 7;
let { height, width } = Dimensions.get('screen');

function Strings({ pathProps1, pathProps2, pathProps3 }) {
	return (
		<Svg
			style={{
				width: width,
				height: height,
			}}
		>
			<G x={(width - (width * 35) / 100) / 2 + 5}>
				<AnimatedPath
					transform={`translate(${width / 12}, 0)`}
					animatedProps={pathProps1}
					stroke='white'
					strokeWidth={pathHeight}
					strokeLinecap='round'
				/>

				<AnimatedPath
					transform={`translate(${width / 6 + 3}, 0)`}
					animatedProps={pathProps2}
					stroke='white'
					strokeWidth={pathHeight}
					strokeLinecap='round'
				/>

				<AnimatedPath
					transform={`translate(${width / 3 - 26}, 0)`}
					animatedProps={pathProps3}
					stroke='white'
					strokeWidth={pathHeight}
					strokeLinecap='round'
				/>
			</G>
		</Svg>
	);
}

export default Strings;

import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';

import {
	useAnimatedProps,
	useSharedValue,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	withSpring,
	useDerivedValue,
} from 'react-native-reanimated';

const availableWidth = 50;

function AnimationContainer(props) {
	let { height, width } = Dimensions.get('screen');

	const sliderX = 0;

	const stringPath = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

	const paths = stringPath.map((index) =>
		useDerivedValue(() => {
			const diffX = index.value - width / 2;

			const qX = width + diffX * 2;
			const qY = height / 2 - 200;

			return `M ${0} ${sliderX} Q ${qX} ${qY} ${0} ${height - 100}`;
		})
	);

	const pathProps = paths.map((string, index) =>
		useAnimatedProps(() => {
			return {
				d: paths[index].value,
			};
		})
	);

	const onGestureEvents = stringPath.map((st) =>
		useAnimatedGestureHandler({
			onStart: (_, ctx) => {
				ctx.start = _.translationX;
			},
			onActive: (event, ctx) => {
				let nextX = event.translationX;

				if (nextX < availableWidth && nextX + availableWidth >= 0)
					stringPath[0].value = nextX;
			},
			onEnd: () => {
				///pirveli simi
				// if(event.x > 0 && event.x<100){

				// }

				// //meore
				// if(event.x > 100 && event.x<200){

				// }

				// //mesame
				// if(event.x > 100 && event.x<200){

				// }

				stringPath[0].value = withSpring(sliderX, {
					damping: 3,
					stiffness: 150,
					mass: 0.5,
				});
			},
		})
	);

	return props.render(stringPath, pathProps, paths, onGestureEvents);
}

export default AnimationContainer;

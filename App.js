import React, { useRef } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Video } from 'expo-av';

import {
	StyleSheet,
	View,
	Image,
	Dimensions,
	TouchableOpacity,
} from 'react-native';

import Animated, {
	useAnimatedProps,
	useSharedValue,
	useAnimatedGestureHandler,
	withSpring,
	useDerivedValue,
	runOnJS,
} from 'react-native-reanimated';

import Strings from './components/Strings';

const sounds = [
	require('./assets/sound1.m4a'),
	require('./assets/sound2.m4a'),
	require('./assets/sound3.m4a'),
];
let { height, width } = Dimensions.get('screen');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function App() {
	let pormula = (width - (width * 35) / 100) / 2 + 30;
	let AVAILABLE_SPACE = 30;
	const sliderX = 0;
	const sliderY = height - height * 0.4;
	const playbackObject = useRef();
	const playbackObject2 = useRef();
	const playbackObject3 = useRef();

	const stringPath = useSharedValue(0);
	const stringPath2 = useSharedValue(0);
	const stringPath3 = useSharedValue(0);

	const isPlay = useSharedValue(false);
	const isPlay2 = useSharedValue(false);
	const isPlay3 = useSharedValue(false);
	const knobY = useSharedValue(sliderY);

	const path = useDerivedValue(() => {
		const diffX = stringPath.value - width / 2;
		const diffY = knobY.value - sliderY;

		const qX = width + diffX * 2;
		const qY = sliderY + diffY * 2;

		return `M ${0} ${sliderX} Q ${qX} ${qY} ${0} ${height}`;
	});

	const path2 = useDerivedValue(() => {
		const diffX = stringPath2.value - width / 2;
		const diffY = knobY.value - sliderY;

		const qX = width + diffX * 2;
		const qY = sliderY + diffY * 2;

		return `M ${0} ${sliderX} Q ${qX} ${qY} ${0} ${height}`;
	});

	const path3 = useDerivedValue(() => {
		const diffX = stringPath3.value - width / 2;
		const diffY = knobY.value - sliderY;

		const qX = width + diffX * 2;
		const qY = sliderY + diffY * 2;

		return `M ${0} ${sliderX} Q ${qX} ${qY} ${0} ${height}`;
	});

	const pathProps = useAnimatedProps(() => {
		return {
			d: path.value,
		};
	});

	const pathProps2 = useAnimatedProps(() => {
		return {
			d: path2.value,
		};
	});

	const pathProps3 = useAnimatedProps(() => {
		return {
			d: path3.value,
		};
	});

	function playSound(num) {
		switch (num) {
			case 1:
				playbackObject.current.stopAsync();
				playbackObject.current.playAsync();

				playbackObject.current.setOnPlaybackStatusUpdate((playbackStatus) => {
					if (playbackStatus.didJustFinish) {
						playbackObject.current.stopAsync();
					}
				});
				break;
			case 2:
				playbackObject2.current.stopAsync();
				playbackObject2.current.playAsync();

				playbackObject2.current.setOnPlaybackStatusUpdate((playbackStatus) => {
					if (playbackStatus.didJustFinish) {
						playbackObject2.current.stopAsync();
					}
				});
				break;
			case 3:
				playbackObject3.current.stopAsync();
				playbackObject3.current.playAsync();

				playbackObject3.current.setOnPlaybackStatusUpdate((playbackStatus) => {
					if (playbackStatus.didJustFinish) {
						playbackObject3.current.stopAsync();
					}
				});
				break;
		}
	}

	const playDifferentSounds = (isPlayValue, num) => {
		if (isPlayValue.value === false) {
			switch (num) {
				case 1:
					runOnJS(playSound)(num);
					isPlay.value = true;
					break;
				case 2:
					isPlay2.value = true;
					runOnJS(playSound)(num);
					break;
				case 3:
					isPlay3.value = true;
					runOnJS(playSound)(num);
					break;
			}
		}

		isPlayValue.value = true;
	};

	const cancelAnimation = (path) => {
		path.value = withSpring(sliderX, {
			damping: 3,
			stiffness: 150,
			mass: 0.5,
		});
	};

	const animatePath = (
		path,
		pormula,
		startX,
		translationX,
		absoluteX,
		isPlayValue,
		number
	) => {
		if (startX >= pormula - 5 && startX < pormula + 15) {
			if (
				absoluteX < pormula - AVAILABLE_SPACE ||
				absoluteX > pormula + AVAILABLE_SPACE
			) {
				runOnJS(cancelAnimation)(path);
				runOnJS(playDifferentSounds)(isPlayValue, number);
			} else {
				path.value = translationX;
			}
		} else {
			if (startX < pormula) {
				if (absoluteX > pormula + AVAILABLE_SPACE) {
					runOnJS(cancelAnimation)(path);
					runOnJS(playDifferentSounds)(isPlayValue, number);
				} else if (absoluteX >= pormula && absoluteX < pormula + 20) {
					path.value = absoluteX - pormula;
				}
			} else if (startX > pormula) {
				if (absoluteX < pormula - AVAILABLE_SPACE) {
					runOnJS(cancelAnimation)(path);
					runOnJS(playDifferentSounds)(isPlayValue, number);
				} else if (absoluteX <= pormula && absoluteX - 20 < pormula) {
					path.value = absoluteX - pormula;
				}
			}
		}
	};

	const gestureHandler = useAnimatedGestureHandler({
		onStart: (_, ctx) => {
			ctx.translationX = _.translationX;
			ctx.absoluteX = _.absoluteX;
			ctx.offsetY = _.y;
			isPlay.value = false;
			isPlay2.value = false;
			isPlay3.value = false;
		},
		onActive: (event, ctx) => {
			let startX = ctx.absoluteX;
			let translationX = event.translationX;
			let absoluteX = event.x;

			knobY.value = ctx.offsetY + event.translationY;

			runOnJS(animatePath)(
				stringPath,
				pormula,
				startX,
				translationX,
				absoluteX,
				isPlay,
				1
			);

			runOnJS(animatePath)(
				stringPath2,
				pormula + 40,
				startX,
				translationX,
				absoluteX,
				isPlay2,
				2
			);

			runOnJS(animatePath)(
				stringPath3,
				pormula + 70,
				startX,
				translationX,
				absoluteX,
				isPlay3,
				3
			);
		},
		onEnd: () => {
			runOnJS(cancelAnimation)(stringPath);
			runOnJS(cancelAnimation)(stringPath2);
			runOnJS(cancelAnimation)(stringPath3);
		},
	});

	return (
		<>
			<Image
				style={{ width, height, position: 'absolute' }}
				source={require('./assets/fandura.png')}
			/>

			<View style={styles.container}>
				<Strings
					pathProps1={pathProps}
					pathProps2={pathProps2}
					pathProps3={pathProps3}
				/>

				<PanGestureHandler onGestureEvent={gestureHandler}>
					<AnimatedTouchable style={styles.AnimatedTouchableopacity}>
						<Animated.View />
					</AnimatedTouchable>
				</PanGestureHandler>

				<Video
					ref={playbackObject}
					source={sounds[0]}
					style={{ opacity: 0, zIndex: -1 }}
				/>

				<Video
					ref={playbackObject2}
					source={sounds[1]}
					style={{ opacity: 0, zIndex: -1 }}
				/>

				<Video
					ref={playbackObject3}
					source={sounds[2]}
					style={{ opacity: 0, zIndex: -1 }}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'row',
	},
	AnimatedTouchableopacity: {
		position: 'absolute',
		width: width,
		height: height,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'transparent',
	},
});

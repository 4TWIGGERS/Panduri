import React, { useRef } from 'react';
import {
	GestureHandlerRootView,
	PanGestureHandler,
} from 'react-native-gesture-handler';
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
	const position = (width - (width * 35) / 100) / 2 + 30;
	const AVAILABLE_SPACE = 30;
	const sliderY = height - height * 0.4;
	const playbackObject = useRef();
	const playbackObject2 = useRef();
	const playbackObject3 = useRef();

	const stringPath = useSharedValue(0);
	const stringPath2 = useSharedValue(0);
	const stringPath3 = useSharedValue(0);
	const pathsArray = useSharedValue([
		{
			id: 1,
			path: stringPath,
			number: position,
			isPlaying: false,
		},
		{
			id: 2,
			path: stringPath2,
			number: position + 30,
			isPlaying: false,
		},
		{
			id: 3,
			path: stringPath3,
			number: position + 70,
			isPlaying: false,
		},
	]);

	const knobY = useSharedValue(sliderY);

	const paths = pathsArray.value.map((strings) =>
		useDerivedValue(() => {
			const diffX = strings.path.value - width / 2;
			const diffY = knobY.value - sliderY;

			const qX = width + diffX * 2;
			const qY = sliderY + diffY * 2;

			return `M ${0} ${0} Q ${qX} ${qY} ${0} ${height}`;
		})
	);

	const pathProps = paths.map((path) =>
		useAnimatedProps(() => {
			return {
				d: path.value,
			};
		})
	);

	const setOnPlaybackStatusUpdate = async (refEl) => {
		refEl.current.stopAsync();
		refEl.current.playAsync();

		refEl.current.setOnPlaybackStatusUpdate((playbackStatus) => {
			if (playbackStatus.didJustFinish) {
				refEl.current.stopAsync();
			}
		});
	};

	function playSound(num) {
		switch (num) {
			case 1:
				setOnPlaybackStatusUpdate(playbackObject);
				break;
			case 2:
				setOnPlaybackStatusUpdate(playbackObject2);
				break;
			case 3:
				setOnPlaybackStatusUpdate(playbackObject3);
				break;
		}
	}

	const changeSharedValue = (id) => {
		'worklet';
		let newArray = pathsArray.value.map((strings) => {
			if (id === strings.id) {
				return { ...strings, isPlaying: true };
			} else {
				return strings;
			}
		});

		pathsArray.value = newArray;
	};

	const playDifferentSounds = (isPlayValue, num) => {
		'worklet';
		if (isPlayValue === false) {
			runOnJS(playSound)(num);
			changeSharedValue(num);
		}

		isPlayValue.value = true;
	};

	const cancelAnimation = (path) => {
		'worklet';
		path.value = withSpring(0, {
			damping: 3,
			stiffness: 150,
			mass: 0.5,
		});
	};

	const animatePath = (
		path,
		position,
		startX,
		translationX,
		absoluteX,
		isPlayValue,
		number
	) => {
		'worklet';

		if (startX >= position - 5 && startX < position + 15) {
			if (
				absoluteX < position - AVAILABLE_SPACE ||
				absoluteX > position + AVAILABLE_SPACE
			) {
				cancelAnimation(path);
				playDifferentSounds(isPlayValue, number);
			} else {
				path.value = translationX;
			}
		} else {
			if (startX < position) {
				if (absoluteX > position + AVAILABLE_SPACE) {
					cancelAnimation(path);
					playDifferentSounds(isPlayValue, number);
				} else if (absoluteX >= position && absoluteX < position + 20) {
					path.value = absoluteX - position;
				}
			} else if (startX > position) {
				if (absoluteX < position - AVAILABLE_SPACE) {
					cancelAnimation(path);
					playDifferentSounds(isPlayValue, number);
				} else if (absoluteX <= position && absoluteX - 20 < position) {
					path.value = absoluteX - position;
				}
			}
		}
	};

	const gestureHandler = useAnimatedGestureHandler({
		onStart: (_, ctx) => {
			ctx.translationX = _.translationX;
			ctx.absoluteX = _.absoluteX;
			ctx.offsetY = _.y;
			const newArray = pathsArray.value.map((stringPath) => {
				return { ...stringPath, isPlaying: false };
			});
			pathsArray.value = newArray;
		},
		onActive: (event, ctx) => {
			let startX = ctx.absoluteX;
			let translationX = event.translationX;
			let absoluteX = event.x;

			knobY.value = ctx.offsetY + event.translationY;

			pathsArray.value.forEach((string, i) => {
				animatePath(
					string.path,
					string.number,
					startX,
					translationX,
					absoluteX,
					string.isPlaying,
					string.id
				);
			});
		},
		onEnd: () => {
			pathsArray.value.forEach((stringPath) =>
				cancelAnimation(stringPath.path)
			);
		},
	});

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Image
				style={{
					width,
					height,
					position: 'absolute',
				}}
				source={require('./assets/fandura.png')}
			/>

			<View style={styles.container}>
				<Strings
					pathProps1={pathProps[0]}
					pathProps2={pathProps[1]}
					pathProps3={pathProps[2]}
				/>

				<PanGestureHandler onGestureEvent={gestureHandler}>
					<AnimatedTouchable style={styles.AnimatedTouchableOpacity}>
						<Animated.View collapsable={false} />
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
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'row',
	},
	AnimatedTouchableOpacity: {
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

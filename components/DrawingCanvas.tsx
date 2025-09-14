import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import { Image } from 'expo-image';
import { DrawingCanvasProps } from '@/types/components';
import { Point, DrawingStroke, GestureState } from '@/types';
import {
  generateSVGPath,
  generateStrokeId,
  clamp,
  smoothStroke,
} from './drawing.util';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const DrawingCanvas = ({
  imageUri,
  canvasDimensions,
  brushSettings,
  strokes,
  isDrawingEnabled,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeEnd,
  onCanvasReady,
  gestureState,
  onGestureStateChange,
}: DrawingCanvasProps) => {
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panRef = useRef<PanGestureHandler>(null);
  const pinchRef = useRef<PinchGestureHandler>(null);

  // Drawing state
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Canvas dimensions state
  const [actualCanvasDimensions, setActualCanvasDimensions] =
    useState(canvasDimensions);

  // Initialize gesture state
  useEffect(() => {
    if (gestureState) {
      scale.value = gestureState.scale;
      translateX.value = gestureState.translateX;
      translateY.value = gestureState.translateY;
    }
  }, [gestureState]);

  // Handle image load to get actual dimensions
  const handleImageLoad = useCallback(
    (event: any) => {
      const { width, height } = event.source;
      const aspectRatio = width / height;
      const maxWidth = screenWidth - 40;
      const maxHeight = screenHeight * 0.6;

      let finalWidth = maxWidth;
      let finalHeight = maxWidth / aspectRatio;

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = maxHeight * aspectRatio;
      }

      const dimensions = { width: finalWidth, height: finalHeight };
      setActualCanvasDimensions(dimensions);
      setCanvasReady(true);
      onCanvasReady(dimensions);
    },
    [onCanvasReady]
  );

  // Start new stroke
  const startStroke = useCallback(
    (point: Point) => {
      if (!isDrawingEnabled || !canvasReady) return;

      const newStroke: DrawingStroke = {
        id: generateStrokeId(),
        points: [point],
        color: brushSettings.color,
        width: brushSettings.width,
        opacity: brushSettings.opacity,
        timestamp: Date.now(),
      };

      setCurrentStroke(newStroke);
      setIsDrawing(true);
      onStrokeStart(newStroke);
    },
    [isDrawingEnabled, canvasReady, brushSettings, onStrokeStart]
  );

  // Update current stroke
  const updateStroke = useCallback(
    (point: Point) => {
      if (!isDrawing || !currentStroke) return;

      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, point],
      };

      setCurrentStroke(updatedStroke);
      onStrokeUpdate(updatedStroke);
    },
    [isDrawing, currentStroke, onStrokeUpdate]
  );

  // End current stroke
  const endStroke = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    // Smooth the stroke points before finalizing
    const smoothedStroke = {
      ...currentStroke,
      points: smoothStroke(currentStroke.points, 3),
    };

    setIsDrawing(false);
    setCurrentStroke(null);
    onStrokeEnd(smoothedStroke);
  }, [isDrawing, currentStroke, onStrokeEnd]);

  // Update gesture state
  const updateGestureState = useCallback(
    (newState: Partial<GestureState>) => {
      if (onGestureStateChange) {
        const currentState: GestureState = {
          isDrawing,
          currentStroke: currentStroke || undefined,
          scale: scale.value,
          translateX: translateX.value,
          translateY: translateY.value,
        };
        onGestureStateChange({ ...currentState, ...newState });
      }
    },
    [
      isDrawing,
      currentStroke,
      onGestureStateChange,
      scale.value,
      translateX.value,
      translateY.value,
    ]
  );

  // Pan gesture handler for drawing and panning
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      if (isDrawingEnabled) {
        const canvasPoint = {
          x: (event.x - translateX.value) / scale.value,
          y: (event.y - translateY.value) / scale.value,
        };

        if (
          canvasPoint.x >= 0 &&
          canvasPoint.x <= actualCanvasDimensions.width &&
          canvasPoint.y >= 0 &&
          canvasPoint.y <= actualCanvasDimensions.height
        ) {
          runOnJS(startStroke)(canvasPoint);
        }
      }
    },
    onActive: (event) => {
      if (isDrawingEnabled && isDrawing) {
        const canvasPoint = {
          x: (event.x - translateX.value) / scale.value,
          y: (event.y - translateY.value) / scale.value,
        };

        if (
          canvasPoint.x >= 0 &&
          canvasPoint.x <= actualCanvasDimensions.width &&
          canvasPoint.y >= 0 &&
          canvasPoint.y <= actualCanvasDimensions.height
        ) {
          runOnJS(updateStroke)(canvasPoint);
        }
      } else if (!isDrawingEnabled) {
        // Pan the canvas when not drawing
        translateX.value = clamp(
          event.translationX,
          -actualCanvasDimensions.width * (scale.value - 1),
          actualCanvasDimensions.width * (scale.value - 1)
        );
        translateY.value = clamp(
          event.translationY,
          -actualCanvasDimensions.height * (scale.value - 1),
          actualCanvasDimensions.height * (scale.value - 1)
        );
        runOnJS(updateGestureState)({
          translateX: translateX.value,
          translateY: translateY.value,
        });
      }
    },
    onEnd: () => {
      if (isDrawingEnabled && isDrawing) {
        runOnJS(endStroke)();
      }
    },
  });

  // Pinch gesture handler for zooming
  const pinchGestureHandler = useAnimatedGestureHandler({
    onActive: (event: any) => {
      const scaleValue = event.scale || 1;
      scale.value = clamp(scaleValue, 0.5, 3);
      runOnJS(updateGestureState)({ scale: scale.value });
    },
    onEnd: () => {
      scale.value = withSpring(clamp(scale.value, 0.8, 2.5));
    },
  });

  // Animated style for the canvas container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Render stroke paths
  const renderStrokes = useCallback(() => {
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    return allStrokes.map((stroke) => (
      <Path
        key={stroke.id}
        d={generateSVGPath(stroke.points)}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeOpacity={stroke.opacity}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  }, [strokes, currentStroke]);

  if (!canvasReady) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: imageUri }}
          style={styles.hiddenImage}
          onLoad={handleImageLoad}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PinchGestureHandler
        ref={pinchRef}
        onGestureEvent={pinchGestureHandler}
        simultaneousHandlers={panRef}
      >
        <Animated.View>
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={panGestureHandler}
            simultaneousHandlers={pinchRef}
            minPointers={1}
            maxPointers={1}
          >
            <Animated.View style={[styles.canvasContainer, animatedStyle]}>
              <Svg
                width={actualCanvasDimensions.width}
                height={actualCanvasDimensions.height}
                style={styles.svg}
              >
                <SvgImage
                  x="0"
                  y="0"
                  width={actualCanvasDimensions.width}
                  height={actualCanvasDimensions.height}
                  href={imageUri}
                  preserveAspectRatio="xMidYMid slice"
                />
                {renderStrokes()}
              </Svg>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  svg: {
    borderRadius: 10,
  },
  hiddenImage: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

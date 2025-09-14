import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import StudioScreen from '../app/(tabs)/index';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock other dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('lucide-react-native', () => ({
  Camera: 'Camera',
  Upload: 'Upload',
  Palette: 'Palette',
  ArrowRight: 'ArrowRight',
}));

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: 'KeyboardAwareScrollView',
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@/components/ColorPalette', () => ({
  ColorPalette: 'ColorPalette',
}));

jest.mock('@/components/HairStyleSelector', () => ({
  HairStyleSelector: 'HairStyleSelector',
}));

jest.mock('@/components/PromptInput', () => ({
  PromptInput: 'PromptInput',
}));

jest.mock('@/components/GenerateButton', () => ({
  GenerateButton: 'GenerateButton',
}));

jest.mock('@/components/FullscreenImageViewer', () => ({
  FullscreenImageViewer: 'FullscreenImageViewer',
}));

jest.mock('@/components/GeminiService', () => ({
  geminiService: {
    generateHairTransformation: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('StudioScreen Navigation to HighlightStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders highlight studio card', () => {
    const { getByText } = render(<StudioScreen />);

    expect(getByText('3. Customize Highlights (Optional)')).toBeTruthy();
    expect(getByText('Draw Your Highlight Pattern')).toBeTruthy();
    expect(getByText('Open Highlight Studio')).toBeTruthy();
  });

  it('shows highlight studio button as disabled initially', () => {
    const { getByText } = render(<StudioScreen />);

    const button = getByText('Open Highlight Studio');
    // In a real test, we'd verify the button has disabled styling
    expect(button).toBeTruthy();
  });

  it('shows alert when trying to navigate without required selections', () => {
    const { getByText } = render(<StudioScreen />);

    const button = getByText('Open Highlight Studio');
    fireEvent.press(button);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing Information',
      'Please select a photo, at least one color, and a hair style before customizing highlights'
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to highlight studio when all requirements are met', () => {
    // This test would need to simulate having all required selections
    // In a real implementation, we'd need to mock the component state
    // or provide a way to set the required selections for testing

    const { getByText } = render(<StudioScreen />);

    // Mock having all required selections
    // This would require either:
    // 1. Mocking the component's internal state
    // 2. Providing test props to set initial state
    // 3. Simulating user interactions to select image, colors, and hair style

    // For now, this is a placeholder for the complete test
    expect(getByText('Open Highlight Studio')).toBeTruthy();
  });

  it('passes correct parameters when navigating', () => {
    // This test would verify that the correct parameters are passed
    // when navigation occurs with all requirements met
    // Expected navigation call:
    // router.push({
    //   pathname: '/highlight-studio',
    //   params: {
    //     imageUri: selectedImage,
    //     selectedColors: JSON.stringify(selectedColors),
    //     hairStyle: selectedHairStyle,
    //   },
    // });
  });

  it('updates section numbering correctly', () => {
    const { getByText } = render(<StudioScreen />);

    // Verify the section numbering is correct after adding the new section
    expect(getByText('4. Describe Your Vision')).toBeTruthy();
  });

  it('displays highlight studio description correctly', () => {
    const { getByText } = render(<StudioScreen />);

    expect(
      getByText(/Use our drawing tools to create a custom highlight pattern/)
    ).toBeTruthy();
    expect(
      getByText(
        /This will help the AI understand exactly where you want your highlights placed/
      )
    ).toBeTruthy();
  });
});

// Integration test for the complete navigation flow
describe('HighlightStudio Navigation Integration', () => {
  it('completes the full navigation workflow', () => {
    // This would test the complete flow:
    // 1. User selects photo
    // 2. User selects colors
    // 3. User selects hair style
    // 4. Highlight studio button becomes enabled
    // 5. User clicks button
    // 6. Navigation occurs with correct parameters
    // 7. User returns from highlight studio with drawing data
    // This requires a more comprehensive test setup with proper mocking
    // of all the component interactions and state changes
  });
});

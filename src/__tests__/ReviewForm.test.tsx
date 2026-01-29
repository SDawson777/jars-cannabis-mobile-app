import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReviewForm from '../components/ReviewForm';

describe('ReviewForm', () => {
  it('renders with accessibility label', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    expect(getByLabelText('Write a review')).toBeTruthy();
  });

  it('renders rating input field', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    expect(getByLabelText('Rating')).toBeTruthy();
  });

  it('renders review text input field', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    expect(getByLabelText('Review text')).toBeTruthy();
  });

  it('renders submit button', () => {
    const onSubmit = jest.fn();
    const { UNSAFE_getAllByType } = render(<ReviewForm onSubmit={onSubmit} />);

    const buttons = UNSAFE_getAllByType('Button' as any);
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.title).toBe('Submit Review');
  });

  it('allows entering rating', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const ratingInput = getByLabelText('Rating');
    fireEvent.changeText(ratingInput, '4');

    expect(ratingInput.props.value).toBe('4');
  });

  it('allows entering review text', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const textInput = getByLabelText('Review text');
    fireEvent.changeText(textInput, 'Great product!');

    expect(textInput.props.value).toBe('Great product!');
  });

  it('calls onSubmit with rating and text when submit button is pressed', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByLabelText('Rating'), '5');
    fireEvent.changeText(getByLabelText('Review text'), 'Amazing experience');
    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 5,
      text: 'Amazing experience',
    });
  });

  it('handles non-numeric rating input by setting rating to 0', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByLabelText('Rating'), 'abc');
    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 0,
      text: '',
    });
  });

  it('submits with only rating when text is empty', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByLabelText('Rating'), '3');
    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 3,
      text: '',
    });
  });

  it('has number-pad keyboard type for rating input', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const ratingInput = getByLabelText('Rating');
    expect(ratingInput.props.keyboardType).toBe('number-pad');
  });

  it('has multiline enabled for review text input', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const textInput = getByLabelText('Review text');
    expect(textInput.props.multiline).toBe(true);
  });
});

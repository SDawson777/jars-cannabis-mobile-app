/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from 'react-native';

import ReviewForm from '../../components/ReviewForm';

describe('ReviewForm', () => {
  it('renders rating input', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const ratingInput = getByLabelText('Rating');
    expect(ratingInput).toBeTruthy();
  });

  it('renders review text input', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const textInput = getByLabelText('Review text');
    expect(textInput).toBeTruthy();
  });

  it('renders submit button', () => {
    const onSubmit = jest.fn();
    const { UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    const button = UNSAFE_getByType(Button);
    expect(button).toBeTruthy();
    expect(button.props.title).toBe('Submit Review');
  });

  it('calls onSubmit with rating and text when submitted', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    const ratingInput = getByLabelText('Rating');
    const textInput = getByLabelText('Review text');

    fireEvent.changeText(ratingInput, '5');
    fireEvent.changeText(textInput, 'Great product!');
    fireEvent.press(UNSAFE_getByType(Button));

    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, text: 'Great product!' });
  });

  it('submits with default values if not filled', () => {
    const onSubmit = jest.fn();
    const { UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.press(UNSAFE_getByType(Button));

    expect(onSubmit).toHaveBeenCalledWith({ rating: 0, text: '' });
  });

  it('handles non-numeric rating input', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, UNSAFE_getByType } = render(<ReviewForm onSubmit={onSubmit} />);

    const ratingInput = getByLabelText('Rating');
    fireEvent.changeText(ratingInput, 'abc');
    fireEvent.press(UNSAFE_getByType(Button));

    expect(onSubmit).toHaveBeenCalledWith({ rating: 0, text: '' });
  });

  it('has accessible container', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(<ReviewForm onSubmit={onSubmit} />);

    const container = getByLabelText('Write a review');
    expect(container).toBeTruthy();
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import PointsProgressBar from '../PointsProgressBar';

describe('PointsProgressBar', () => {
  it('renders with testID', () => {
    const { getByTestId } = render(<PointsProgressBar current={50} target={100} />);
    expect(getByTestId('points-progress')).toBeTruthy();
  });

  it('displays points progress text', () => {
    const { getByText } = render(<PointsProgressBar current={50} target={100} />);
    expect(getByText('50 / 100 pts')).toBeTruthy();
  });

  it('displays different point values', () => {
    const { getByText } = render(<PointsProgressBar current={75} target={200} />);
    expect(getByText('75 / 200 pts')).toBeTruthy();
  });

  it('displays zero points', () => {
    const { getByText } = render(<PointsProgressBar current={0} target={100} />);
    expect(getByText('0 / 100 pts')).toBeTruthy();
  });

  it('displays full progress', () => {
    const { getByText } = render(<PointsProgressBar current={100} target={100} />);
    expect(getByText('100 / 100 pts')).toBeTruthy();
  });
});

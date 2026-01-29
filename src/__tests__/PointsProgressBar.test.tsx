import React from 'react';
import { render } from '@testing-library/react-native';
import PointsProgressBar from '../components/PointsProgressBar';

jest.mock('../utils/progress', () => ({
  calculateProgress: (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(current / target, 1);
  },
}));

describe('PointsProgressBar', () => {
  it('should render current and target points', () => {
    const { getByText } = render(<PointsProgressBar current={50} target={100} />);
    expect(getByText('50 / 100 pts')).toBeTruthy();
  });

  it('should render with testID', () => {
    const { getByTestId } = render(<PointsProgressBar current={25} target={100} />);
    expect(getByTestId('points-progress')).toBeTruthy();
  });

  it('should handle zero current points', () => {
    const { getByText } = render(<PointsProgressBar current={0} target={100} />);
    expect(getByText('0 / 100 pts')).toBeTruthy();
  });

  it('should handle completed progress', () => {
    const { getByText } = render(<PointsProgressBar current={100} target={100} />);
    expect(getByText('100 / 100 pts')).toBeTruthy();
  });

  it('should handle over target progress', () => {
    const { getByText } = render(<PointsProgressBar current={150} target={100} />);
    expect(getByText('150 / 100 pts')).toBeTruthy();
  });

  it('should render correctly', () => {
    const { toJSON } = render(<PointsProgressBar current={75} target={200} />);
    expect(toJSON()).toBeTruthy();
  });
});

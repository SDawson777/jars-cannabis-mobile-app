import React from 'react';
import { render } from '@testing-library/react-native';

import PointsProgressBar from '../../components/PointsProgressBar';

describe('PointsProgressBar component', () => {
  it('should render progress bar', () => {
    const { getByTestId } = render(<PointsProgressBar current={50} target={100} />);
    expect(getByTestId('points-progress')).toBeTruthy();
  });

  it('should display points text', () => {
    const { getByText } = render(<PointsProgressBar current={75} target={100} />);
    expect(getByText('75 / 100 pts')).toBeTruthy();
  });

  it('should handle zero current', () => {
    const { getByText } = render(<PointsProgressBar current={0} target={100} />);
    expect(getByText('0 / 100 pts')).toBeTruthy();
  });

  it('should handle equal current and target', () => {
    const { getByText } = render(<PointsProgressBar current={100} target={100} />);
    expect(getByText('100 / 100 pts')).toBeTruthy();
  });

  it('should handle overflow (current > target)', () => {
    const { getByText } = render(<PointsProgressBar current={150} target={100} />);
    expect(getByText('150 / 100 pts')).toBeTruthy();
  });
});

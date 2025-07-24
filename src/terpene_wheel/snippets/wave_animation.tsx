// After selecting
waveOpacity.value = 0.15;
waveScale.value = withTiming(1.4, { duration: 900 }, () => {
  waveOpacity.value = withTiming(0, { duration: 400 });
});

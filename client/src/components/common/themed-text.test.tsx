import { render, screen } from '@testing-library/react-native';

import { ThemedText } from './themed-text';

describe('ThemedText', () => {
  it('renders its children', async () => {
    await render(<ThemedText>Hello world</ThemedText>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('applies the eyebrow style (uppercase, tracked mono label)', async () => {
    await render(<ThemedText type="eyebrow">Step 1 of 3</ThemedText>);

    const node = screen.getByText('Step 1 of 3');
    expect(node.props.className).toContain('uppercase');
  });

  it('applies the destructive theme color', async () => {
    await render(<ThemedText themeColor="destructive">Something went wrong</ThemedText>);

    const node = screen.getByText('Something went wrong');
    expect(node.props.className).toContain('text-destructive');
  });
});

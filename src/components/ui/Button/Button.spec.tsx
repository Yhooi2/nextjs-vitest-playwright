// ⚠️ This is a conscious implementation test:
// We're testing if the button has the correct classes based on props.
// Testing Library recommends avoiding this type of test,
// but in this case, the behavior *is* visual.
// Therefore, this test is necessary and justified.

import { cn } from '@/lib/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants, Size, Variant, type Variants } from '.';

describe('<Button />', () => {
  const varintsFn = (prop: Variants) => cn(buttonVariants(prop));
  describe('default props and JSX', () => {
    test('should render the button with default props (only with children)', async () => {
      render(<Button> Test </Button>);
      // r.debug();
      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass(varintsFn({}));
      // expect(button).toMatchSnapshot();
    });
    test('verify if default JSX properties work correctly', async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} aria-hidden="false" type="submit">
          Test
        </Button>
      );
      const button = screen.getByText(/test/i);
      await userEvent.click(button);
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toBeCalledTimes(2);
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('variants (colors)', () => {
    const allVariants: Variant[] = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
    ];
    test.each(allVariants)('check %s applies the correct color', async (variant) => {
      render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass(varintsFn({ variant }));
    });
  });
  describe('size (sizes)', () => {
    const allSizes: Size[] = ['default', 'sm', 'lg', 'icon'];
    test.each(allSizes)('%s size should be correct', async (size) => {
      render(<Button size={size}>Test</Button>);
      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass(varintsFn({ size }));
    });
  });
  describe('disabled', () => {
    test('classes for disabled state are correct', async () => {
      render(<Button disabled> Test </Button>);
      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass(varintsFn({}));
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
    test('disabled button does not respond to clicks or keyboard events', async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Test
        </Button>
      );
      const button = screen.getByRole('button', { name: /test/i });
      await userEvent.click(button);
      await userEvent.keyboard('{Enter}');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

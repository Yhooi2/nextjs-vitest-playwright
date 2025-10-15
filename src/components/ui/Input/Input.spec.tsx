import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Props } from '.';

type InputProps = Partial<Props>;

const makeInput = (props: InputProps = {}) => {
  const defaultProps: Props = {
    labelText: 'label',
    placeholder: 'placeholder',
    type: 'text',
    disabled: false,
    required: false,
    readOnly: false,
    ...props,
  };
  return <Input {...defaultProps} />;
};

const renderInput = (props: InputProps = {}) => {
  const renderRes = render(makeInput(props));
  const input = renderRes.getByRole('textbox');
  return { renderRes, input };
};

const input = (props: InputProps = {}) => renderInput(props).input;

describe('<InputText />', () => {
  describe('default behavior', () => {
    test('renders with label', async () => {
      // Render the Input component with a label and check if the label is in
      // the document
      const el = input({ labelText: 'Test Label' });
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      // Check if the input is associated with the label
      expect(el).toHaveAttribute('aria-label', 'Test Label');
    });

    test('renders with placeholder', async () => {
      const el = input({ placeholder: 'new placeholder' });
      expect(el).toHaveAttribute('placeholder', 'new placeholder');
    });

    test('renders without placeholder', async () => {
      const el = input({ placeholder: undefined });
      expect(el).not.toHaveAttribute('placeholder');
    });

    test('renders without label', async () => {
      const el = input({ labelText: undefined });
      expect(el).not.toHaveAttribute('aria-labelledby', 'label');
    });

    test('uses labelText as aria-label when possible', async () => {
      expect(input()).toHaveAttribute('aria-label', 'label');
    });

    test('uses placeholder as aria-label fallback', async () => {
      const el = input({ labelText: undefined });
      expect(el).toHaveAttribute('aria-label', 'placeholder');
    });

    test('displays default value correctly', async () => {
      const el = input({ defaultValue: 'default value' });
      expect(el).toHaveValue('default value');
    });

    test('accepts other JSX props (name, maxLength)', async () => {
      const el = input({ name: 'input-name', maxLength: 10 });
      expect(el).toHaveAttribute('name', 'input-name');
      expect(el).toHaveAttribute('maxLength', '10');
    });
  });

  describe('accessibility', () => {
    test('does not display error message by default', async () => {
      const el = input();
      expect(el).toHaveAttribute('aria-invalid', 'false');
      expect(el).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('does not mark input as invalid by default', async () => {
      const el = input();
      expect(el).toHaveAttribute('aria-invalid', 'false');
    });

    test('renders error message when `errorMessage` is passed', async () => {
      const el = input({ errorMesage: 'Error occurred' });
      expect(el).toHaveAttribute('aria-invalid', 'true');
      const error = screen.getByRole('alert');
      const errorId = error.getAttribute('id');
      expect(el).toHaveAttribute('aria-describedby', errorId);
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Error occurred');
    });
  });

  describe('interactive behavior', () => {
    test('updates value as user types', async () => {
      const el = input();
      const user = userEvent.setup();
      expect(el).toHaveValue('');
      await user.type(el, 'Hello');
      expect(el).toHaveValue('Hello');
    });
  });

  describe('visual states', () => {
    test('applies visual classes when disabled', async () => {
      const el = input({ disabled: true });
      expect(el).toBeDisabled();
      expect(el).toHaveClass('disabled:pointer-events-none');
      expect(el).toHaveClass('disabled:cursor-not-allowed');
      expect(el).toHaveClass('disabled:opacity-50');
    });

    test('applies visual classes when readonly', async () => {
      const el = input({ readOnly: true });
      expect(el).toHaveAttribute('readonly');
      expect(el).toHaveClass('read-only:bg-muted/100');
      expect(el).toHaveClass('dark:read-only:bg-muted/100');
    });

    test('adds error class (red ring) when invalid', async () => {
      const el = input({ errorMesage: 'Error occurred' });
      expect(el).toHaveAttribute('aria-invalid', 'true');
      expect(el).toHaveClass('aria-invalid:ring-destructive/20');
      expect(el).toHaveClass('aria-invalid:placeholder:text-destructive/60');
      expect(el).toHaveClass('aria-invalid:text-destructive/80');
      expect(el).toHaveClass('dark:aria-invalid:ring-destructive/40');
      expect(el).toHaveClass('aria-invalid:border-destructive');
    });

    test('maintains custom developer classes', async () => {
      const el = input({ className: 'custom-class' });
      expect(el).toHaveClass('custom-class');
    });
  });
});

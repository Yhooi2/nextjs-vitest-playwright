import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from '.';

const meta = {
  title: 'Disign Sistem/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'file'],
      description: 'Type of input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text', detail: 'type for input' },
      },
    },
    labelText: {
      control: 'text',
      description: 'Label text for the input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Label', detail: 'label for input' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Input', detail: 'placeholder for input' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    errorMesage: {
      control: 'text',
      description: 'Error message to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'string', detail: 'error message for input' },
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    labelText: 'Label',
    placeholder: 'Input',
    required: true,
    disabled: false,
    readOnly: false,
  },
};

export const WithoutLabel: Story = {
  args: {
    ...Default.args,
    labelText: '',
    placeholder: 'Input without label',
  },
};

export const WithErrorMessage: Story = {
  args: {
    ...Default.args,
    errorMesage: 'Error Message',
  },
};
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

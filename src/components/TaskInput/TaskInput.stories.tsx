import type { Meta, StoryObj } from '@storybook/nextjs';
import z from 'zod';
import { TaskInput } from './index';

const meta = {
  title: 'Design System/InputText',
  component: TaskInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the TaskInput',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Label', detail: 'label for TaskInput' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the TaskInput',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'TaskInput', detail: 'placeholder for TaskInput' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the TaskInput is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the TaskInput is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the TaskInput is read-only',
    },
  },
} satisfies Meta<typeof TaskInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Label Text',
    placeholder: 'Placeholder text',
    required: true,
    disabled: false,
    readOnly: false,
  },
};

export const WithoutLabel: Story = {
  args: {
    ...Default.args,
    label: '',
    placeholder: 'TaskInput without label',
  },
};

export const WithoutPlaceholder: Story = {
  args: {
    ...Default.args,
    label: '',
    placeholder: undefined,
  },
};

export const WithErrorMessage: Story = {
  args: {
    ...Default.args,
    issues: [
      {
        code: 'custom' as const,
        path: ['description'],
        message: 'Error message',
      },
    ] as z.core.$ZodIssue[],
  },
};
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

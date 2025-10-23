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
  args: {
    label: 'Task Description',
    placeholder: 'Enter your task...',
    required: true,
    disabled: false,
    submitLabel: 'Create task',
    minRows: 1,
    maxRows: 5,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the TaskInput',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: 'Task Descriptionel', detail: 'label for TaskInput' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: 'TaskInput', detail: 'placeholder for TaskInput' },
      },
    },
    description: {
      control: 'text',
      description: 'Helper text displayed below the input',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    defaultValue: {
      control: 'text',
      description: 'Initial value of the textarea',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    submitLabel: {
      control: 'text',
      description: 'Submit button label text',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: 'Create task' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
      table: {
        category: 'Validation',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    issues: {
      control: 'object',
      description: 'Zod validation errors to display',
      table: {
        category: 'Validation',
        type: { summary: 'ZodIssue[]' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      table: {
        category: 'State',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    minRows: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Minimum number of rows for textarea',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    maxRows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Maximum number of rows before scrolling',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
  },
} satisfies Meta<typeof TaskInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  args: {
    label: 'Label Text',
    placeholder: 'Placeholder text',
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    placeholder: 'TaskInput without label',
  },
};

export const WithoutPlaceholder: Story = {
  args: {
    // ...Default.args,
    label: '',
    placeholder: undefined,
  },
};

export const WithError: Story = {
  args: {
    // ...Default.args,
    issues: [
      {
        code: 'too_small',
        minimum: 3,
        inclusive: true,
        exact: false,
        message: 'Task must be at least 3 characters',
        path: ['description'],
      },
    ] as z.core.$ZodIssue[],
  },
};
export const Disabled: Story = {
  args: {
    // ...Default.args,
    disabled: true,
    defaultValue: 'This field is disabled',
  },
};
export const LongText: Story = {
  args: {
    label: 'Project Description',
    minRows: 3,
    maxRows: 6,
    defaultValue: `This is a long task description that spans multiple lines.
It demonstrates the auto-resize behavior of the textarea component.
The component will grow from minRows (3) to maxRows (6).
After maxRows, a scrollbar will appear.
This helps maintain good UX with long content.
Users can type as much as they want.`,
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from '.';

const meta = {
  title: 'Disign Sistem/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Input',
  },
};

export const WithLabel: Story = {
  args: {
    labelText: 'Label',
    placeholder: 'Input',
  },
};

export const WithErrorMessage: Story = {
  args: {
    labelText: 'Label',
    placeholder: 'Input',
    errorMesage: 'Error Message',
  },
};

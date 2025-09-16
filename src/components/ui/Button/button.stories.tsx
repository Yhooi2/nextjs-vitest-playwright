import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button, Size, Variant } from '.';

const sizeOptions: Size[] = ['default', 'sm', 'lg', 'icon'];
const variantOptions: Variant[] = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
];

const meta = {
  title: 'Disign Sistem/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: sizeOptions,
    },
    variant: {
      control: 'select',
      options: variantOptions,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default = {
  args: {
    children: 'test text',
    size: 'sm',
    variant: 'default',
  },
} satisfies Story;

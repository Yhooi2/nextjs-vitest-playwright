  import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Button, Size, Variant } from '.';
import { boolean } from 'drizzle-orm/gel-core';

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
  title: 'Disign Sistem/ui/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
  argTypes: {
    size: {
      control: 'select',
      options: sizeOptions,
    },
    variant: {
      control: 'select',
      options: variantOptions,
    },
    disabled: { control: "boolean"},
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default = {
  args: {
    children: 'Button',
    size: 'default',
    variant: 'default',
  },
} satisfies Story;

export const onClick = {
  args: {
    children: 'Click Me',
    size: 'default',
    variant: 'default',
  },
  render: (args) => {
    const [click, setClick] = useState(0);
    return (
      <Button {...args} onClick={() => setClick((click: number) => click + 1)}>
        {click}
      </Button>
    );
  },
} satisfies Story;

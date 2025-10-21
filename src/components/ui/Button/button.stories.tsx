import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Bell, Pen, Plus, Star, ThumbsUp, Trash } from 'lucide-react';
import { ComponentProps, useState } from 'react';
import { fn } from 'storybook/test';
import { Button, type Size, type Variant } from './index';

const sizeOptions: Size[] = ['default', 'sm', 'lg', 'icon'];
const variantOptions: Variant[] = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
];
const iconMap = {
  none: null,
  star: <Star />,
  bell: <Bell />,
  pen: <Pen />,
  plus: <Plus />,
  thumbsUp: <ThumbsUp />,
  trash: <Trash />,
};
type iconType = keyof typeof iconMap;
const iconOptions = Object.keys(iconMap) as iconType[];

type ButtonStoryProps = ComponentProps<typeof Button> & {
  icon?: iconType;
};

const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
  argTypes: {
    size: {
      control: 'select',
      options: sizeOptions,
      description: 'Size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default', detail: 'size for button' },
      },
    },
    variant: {
      control: 'select',
      options: variantOptions,
      description: 'Variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default', detail: 'variant for button' },
      },
    },
    icon: {
      control: 'select',
      options: iconOptions,
      description: 'Icon to display in the button',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'none' },
      },
    },
    disabled: { control: 'boolean', description: 'Whether the button is disabled' },
  },
  tags: ['autodocs'],
} satisfies Meta<ButtonStoryProps>;

export default meta;

type Story = StoryObj<ButtonStoryProps>;
const ButtonIcon = ({ icon, children, size, ...args }: ButtonStoryProps) => (
  <Button {...args} size={size}>
    {icon !== 'none' && iconMap[icon as iconType]}
    {(size !== 'icon' || !icon) && children}
  </Button>
);

export const Playground = {
  args: {
    children: 'Button',
    icon: 'bell',
  },
  render: ButtonIcon,
} satisfies Story;

export const Large = {
  render: ({ ...args }) => (
    <div className="grid-cols-4 grid w-full max-w-2xl gap-4">
      <ButtonIcon {...args}>Button</ButtonIcon>
      <ButtonIcon icon="thumbsUp" {...args}>
        Lick{' '}
      </ButtonIcon>
      <ButtonIcon icon="star" {...args}>
        Favorit{' '}
      </ButtonIcon>
      <ButtonIcon variant="secondary" icon="plus" {...args}>
        Add{' '}
      </ButtonIcon>
      <ButtonIcon variant="outline" icon="pen" {...args}>
        Edit{' '}
      </ButtonIcon>
      <ButtonIcon variant="destructive" icon="trash" {...args}>
        Delete{' '}
      </ButtonIcon>

      <ButtonIcon variant="link" {...args}>
        {' '}
        link
      </ButtonIcon>
      <ButtonIcon variant="ghost" icon="bell" size="icon" {...args}></ButtonIcon>
    </div>
  ),
} satisfies Story;

export const onClick = {
  args: {
    children: 'Click Me',
    size: 'icon',
    variant: 'outline',
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

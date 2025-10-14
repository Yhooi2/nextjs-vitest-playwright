import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Bell, Pen, Plus, Star, ThumbsUp, Trash } from 'lucide-react';
import { useState } from 'react';
import { fn } from 'storybook/test';
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

type ButtonStoryProps = React.ComponentProps<typeof Button> & {
  icon?: iconType;
};

const meta = {
  title: 'Disign Sistem/Button',
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
    icon: {
      control: 'select',
      options: iconOptions,
      description: 'lalala',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'none' },
      },
    },
    disabled: { control: 'boolean' },
  },
  tags: ['autodocs'],
} satisfies Meta<ButtonStoryProps>;

export default meta;

type Story = StoryObj<ButtonStoryProps>;
const ButtonIcon = ({ icon, children, ...args }: ButtonStoryProps) => (
  <Button {...args}>
    {icon !== 'none' && iconMap[icon as iconType]}
    {children}
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
    <div className="flex gap-1">
      <ButtonIcon {...args}> Button </ButtonIcon>
      <ButtonIcon icon="thumbsUp" {...args}>
        Lick{' '}
      </ButtonIcon>
      <ButtonIcon icon="star" {...args}>
        Favorites{' '}
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
      <ButtonIcon variant="ghost" icon="bell" size="icon"></ButtonIcon>
      <ButtonIcon variant="link" {...args}>
        {' '}
        link
      </ButtonIcon>
    </div>
  ),
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

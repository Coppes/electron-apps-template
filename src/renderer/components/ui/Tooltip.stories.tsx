import Tooltip from './Tooltip';
import Button from './Button';

export default {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    content: {
      control: 'text',
    },
  },
};

export const Default = {
  args: {
    content: 'Add to library',
    side: 'top',
    children: <Button variant="outline">Hover me</Button>,
  },
};

export const Bottom = {
  args: {
    content: 'Tooltip on bottom',
    side: 'bottom',
    children: <Button variant="outline">Bottom</Button>,
  },
};

export const Left = {
  args: {
    content: 'Tooltip on left',
    side: 'left',
    children: <Button variant="outline">Left</Button>,
  },
};

export const Right = {
  args: {
    content: 'Tooltip on right',
    side: 'right',
    children: <Button variant="outline">Right</Button>,
  },
};

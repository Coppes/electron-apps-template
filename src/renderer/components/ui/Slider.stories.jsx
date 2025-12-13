import Slider from './Slider';
import { useState } from 'react';

export default {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
};

export const Default = {
  render: (args) => {
    const [value, setValue] = useState(50);
    return (
      <div className="w-[300px]">
        <Slider value={value} onChange={setValue} {...args} />
        <div className="mt-2 text-sm text-muted-foreground">Value: {value}</div>
      </div>
    );
  },
};

export const MinMax = {
  render: (args) => {
    const [value, setValue] = useState(25);
    return (
      <div className="w-[300px]">
        <Slider min={0} max={50} step={5} value={value} onChange={setValue} {...args} />
        <div className="mt-2 text-sm text-muted-foreground">Value: {value} (0-50, step 5)</div>
      </div>
    );
  },
};

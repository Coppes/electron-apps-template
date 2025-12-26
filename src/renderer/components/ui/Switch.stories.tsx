import Switch from './Switch';
import { useState } from 'react';
import Label from './Label';

export default {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
};

export const Default = {
  render: (args: any) => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} {...args} />;
  },
};

export const Checked = {
  render: (args: any) => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} {...args} />;
  },
};

export const Disabled = {
  render: (args: any) => <Switch disabled {...args} />,
};

export const WithLabel = {
  render: (args: any) => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" checked={checked} onCheckedChange={setChecked} {...args} />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
    );
  },
};

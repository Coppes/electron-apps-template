import Select from './Select';

export default {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export const Default = {
  render: (args) => (
    <Select {...args}>
      <option value="">Select an option...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </Select>
  ),
};

export const Disabled = {
  render: (args) => (
    <Select {...args} disabled>
      <option value="">Select an option...</option>
      <option value="1">Option 1</option>
    </Select>
  ),
};

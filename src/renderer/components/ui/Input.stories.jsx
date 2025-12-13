import Input from './Input';

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    type: {
      control: 'text',
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Enter text here...',
  },
};

export const WithValue = {
  args: {
    value: 'Some value',
    onChange: () => { },
  },
};

export const Disabled = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Password = {
  args: {
    type: 'password',
    placeholder: '********',
  },
};

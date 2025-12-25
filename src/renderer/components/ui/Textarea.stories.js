import Textarea from './Textarea';
export default {
    title: 'UI/Textarea',
    component: Textarea,
    tags: ['autodocs'],
};
export const Default = {
    args: {
        placeholder: 'Type your message here.',
    },
};
export const Disabled = {
    args: {
        placeholder: 'Disabled textarea',
        disabled: true,
    },
};
export const WithValue = {
    args: {
        value: 'This is a textarea with some content.',
        onChange: () => { },
    },
};

import { Alert, AlertTitle, AlertDescription } from './Alert';
import { Info, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';

export default {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error'],
    },
  },
};

export const Default = {
  render: (args: any) => (
    <Alert {...args}>
      <Info className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'default',
  },
};

export const InfoAlert = {
  render: (args: any) => (
    <Alert {...args}>
      <Info className="h-4 w-4" />
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>
        This is an informational alert.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'info',
  },
};

export const Success = {
  render: (args: any) => (
    <Alert {...args}>
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'success',
  },
};

export const WarningAlert = {
  render: (args: any) => (
    <Alert {...args}>
      <Warning className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your account is about to expire.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'warning',
  },
};

export const ErrorAlert = {
  render: (args: any) => (
    <Alert {...args}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'error',
  },
};

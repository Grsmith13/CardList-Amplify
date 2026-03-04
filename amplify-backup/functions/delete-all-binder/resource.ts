import { defineFunction } from '@aws-amplify/backend';

export const deleteAllBinder = defineFunction({
  name: 'delete-all-binder',
  entry: './handler.ts',
});
export default {
  name: 'assets',
  type: 'document',
  title: 'Asset',
  fields: [
    {
      name: 'postedBy',
      title: 'PostedBy',
      type: 'reference',
      to: [{ type: 'user' }],
    },
    {
      name: 'file',
      type: 'file',
      title: 'File',
    },
  ],
}

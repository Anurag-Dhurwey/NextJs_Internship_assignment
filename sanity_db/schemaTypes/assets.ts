export default {
  name: 'asset',
  type: 'document',
  title: 'Asset',
  fields: [
    {
      name: 'postedBy',
      title: 'PostedBy',
      type: 'user_ref',
    },
    {
      name: 'assets',
      type: 'array',
      title: 'Assets',
      of: [{type: 'file'}],
    },
  ],
}

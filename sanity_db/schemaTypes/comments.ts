export default {
  name: 'comments',
  title: 'Comments',
  type: 'document',
  fields: [
    {
      name: 'postedBy',
      title: 'PostedBy',
      type: 'reference',
      to: [{ type: 'user' }],
    },
    {
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'string',
    },
  ],
}

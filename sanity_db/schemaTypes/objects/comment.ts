export default {
  name: 'comment',
  title: 'Comment',
  type: 'object',
  fields: [
    {
      name: 'postedBy',
      title:"PostedBy",
      type: 'user_ref'
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'string',
    },
  ],
}

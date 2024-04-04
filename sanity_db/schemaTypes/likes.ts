// verification-token - only if you use email provider

export default {
  name: 'likes',
  title: 'Likes',
  type: 'document',
  fields: [
    {
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
    },
    {
      name: 'likedBy',
      title: 'LikedBy',
      type: 'reference',
      to: [{type: 'user'}],
    },
  ],
}

export default {
  name: 'post',
  title: 'Posts',
  type: 'document',
  fields: [
    {
      name: 'meadiaFiles',
      title: 'MeadiaFiles',
      type: 'array',
      of:[{type:'file'}],
      options: {
        hotspot: true,
      },
    },
    {
      name: 'postedBy',
      title: 'PostedBy',
      type: 'reference',
      to: [{ type: 'user' }],
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'desc',
      title: 'Description',
      type: 'string',
    },
    {
      name: 'tag',
      title: 'Tag',
      type: 'string',
    },
    // {
    //   name: 'likes',
    //   title: 'Likes',
    //   type: 'array',
    //   of: [{type: 'like'}],
    // },
    // {
    //   name: 'comments',
    //   title: 'Comments',
    //   type: 'array',
    //   of: [{type: 'comment'}],
    // },
  ],
}

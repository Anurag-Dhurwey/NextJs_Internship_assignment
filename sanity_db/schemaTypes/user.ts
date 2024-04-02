export default {
  name: 'user',
  title: 'Users',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'url',
    },
    {
      // this is only if you use credentials provider
      name: 'password',
      type: 'string',
      hidden: true,
    },
    {
      name: 'emailVerified',
      type: 'datetime',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'string',
    },
    {
      name: 'desc',
      title: 'Description',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Link',
      type: 'url',
    },
    {
      name: 'liked_posts',
      title: 'Liked Posts',
      type: 'array',
      of: [
        {
          name: 'post',
          title: 'post_data',
          type: 'object',
          fields: [{name:"post",type:"post_ref"}],
        },
      ],
    },
  ],
}

// type typeofarry = {
//   userId: string
//   name: string
//   mail: string
//   img: string
// }

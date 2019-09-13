const Subscription = {
  comment: {
    subscribe(parent, { postId }, { prisma }, info) {
      return prisma.subscription.comment(
        //    A -> 
        // null,
        // || B ->
        {
          where: {
            node: {
              post: {
                id: postId
              }
            }
          }
        },
        info)
    }
  },
  post: {
    subscribe(parent, args, { prisma }, info) {
      return prisma.subscription.post({ where: { node: { published: true } } }, info)
    }
  }
}

export { Subscription as default }
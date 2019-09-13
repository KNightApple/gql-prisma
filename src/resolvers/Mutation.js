import bcrypt from 'bcryptjs'
import getUserID from "../utils/getUserID"
import generateToken from "../utils/generateToken"

const Mutation = {
  // 
  // actions
  // 
  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    })
    if (!user) {
      throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(args.data.password, user.password)
    if (!isMatch) {
      throw new Error('Unable to login')
    }

    return {
      user,
      token: generateToken(user.id)
    }
  },
  // 
  // USER 
  // 
  async createUser(parent, args, { prisma }, info) {
    if (args.data.password.length < 8) {
      throw new Error('Password must be 8 characters or longer.')
    }
    const password = await bcrypt.hash(args.data.password, 10)
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: generateToken(user.id)
    }
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: args.data
    }, info)
  },
  deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    return prisma.mutation.deleteUser({
      where: {
        id: userId
      }
    }, info)
  },
  // 
  // Post 
  // 
  async  createPost(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    return prisma.mutation.createPost({
      data: {
        title: args.data.title,
        body: args.data.body,
        published: args.data.published,
        author: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },
  async updatePost(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    const postPublished = await prisma.exists.Post({
      id: args.id,
      published: true
    })



    if (!postExists) {
      throw new Error('Unable to update post')
    }

    if (postPublished && args.data.published === false) {
      await prisma.mutation.deleteManyComments({
        where: {
          post: {
            id: args.id
          }
        }
      }, info)
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id
      },
      data: args.data
    }, info)
  },
  async deletePost(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExists) {
      throw new Error('Unable to delete post')
    }

    return prisma.mutation.deletePost({
      where: {
        id: args.id
      }
    }, info)
  },
  // 
  // Comment 
  // 
  async createComment(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)

    const postExists = await prisma.exists.Post({ id: args.data.post, published: true })

    if (!postExists) {
      throw new Error("Unable to add comment")
    }

    return prisma.mutation.createComment({
      data: {
        text: args.data.text,
        author: {
          connect: {
            id: userId
          }
        },
        post: {
          connect: {
            id: args.data.post
          }
        }
      }
    }, info)
  },
  async updateComment(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)

    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })
    if (!commentExists) {
      throw new Error('Unable to delet comment')
    }
    return prisma.mutation.updateComment({
      where: {
        id: userId
      },
      data: args.data
    }, info)
  },
  async deleteComment(parent, args, { prisma, request }, info) {
    const userId = getUserID(request)
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!commentExists) {
      throw new Error('Unable to delet comment')
    }

    return prisma.mutation.deleteComment({
      where: {
        id: userId
      }
    }, info)
  }
}

export { Mutation as default }
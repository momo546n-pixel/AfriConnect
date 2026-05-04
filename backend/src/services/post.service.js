// src/services/post.service.js
const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Sélection commune pour tous les posts
const postSelect = {
  id: true,
  content: true,
  images: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
  _count: {
    select: { likes: true, comments: true },
  },
};

// ─── Créer un post ───────────────────────────────────
const createPost = async (userId, { content, visibility = 'PUBLIC' }, files = []) => {
  if (!content?.trim()) throw new AppError('Le contenu est requis', 400);

  // Uploader les images sur Cloudinary
  const imageUrls = [];
  for (const file of files) {
    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'africonnect/posts',
      transformation: [
        { width: 1200, quality: 'auto', fetch_format: 'auto' },
      ],
    });
    imageUrls.push(result.secure_url);
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      images: imageUrls,
      visibility,
      authorId: userId,
    },
    select: postSelect,
  });

  return post;
};

// ─── Modifier un post ────────────────────────────────
const updatePost = async (userId, postId, { content, visibility }) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post introuvable', 404);
  if (post.authorId !== userId) throw new AppError('Non autorisé', 403);

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(content && { content: content.trim() }),
      ...(visibility && { visibility }),
    },
    select: postSelect,
  });

  return updated;
};

// ─── Supprimer un post ───────────────────────────────
const deletePost = async (userId, postId, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post introuvable', 404);

  // Admin peut supprimer n'importe quel post
  if (post.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Non autorisé', 403);
  }

  await prisma.post.delete({ where: { id: postId } });
};

// ─── Feed principal ──────────────────────────────────
const getFeed = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Récupérer les IDs des connexions acceptées
  const connections = await prisma.connection.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  const connectedIds = connections.map(c =>
    c.senderId === userId ? c.receiverId : c.senderId
  );

  // Posts de ses connexions + ses propres posts
  const authorIds = [...connectedIds, userId];

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: { in: authorIds },
        visibility: { in: ['PUBLIC', 'CONNECTIONS'] },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        ...postSelect,
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    }),
    prisma.post.count({
      where: { authorId: { in: authorIds } },
    }),
  ]);

  // Ajouter isLiked à chaque post
  const postsWithLike = posts.map(({ likes, ...post }) => ({
    ...post,
    isLiked: likes.length > 0,
  }));

  return {
    posts: postsWithLike,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
};

// ─── Posts d'un utilisateur ──────────────────────────
const getUserPosts = async (username, currentUserId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new AppError('Utilisateur introuvable', 404);

  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      visibility: 'PUBLIC',
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      ...postSelect,
      likes: {
        where: { userId: currentUserId },
        select: { id: true },
      },
    },
  });

  const postsWithLike = posts.map(({ likes, ...post }) => ({
    ...post,
    isLiked: likes.length > 0,
  }));

  return postsWithLike;
};

// ─── Liker / Unliker ─────────────────────────────────
const toggleLike = async (userId, postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post introuvable', 404);

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existingLike) {
    // Unliker
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
    return { liked: false };
  } else {
    // Liker
    await prisma.like.create({ data: { userId, postId } });

    // Créer une notification pour l'auteur (si ce n'est pas soi-même)
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'LIKE',
          message: 'a aimé votre publication',
          userId: post.authorId,
          actorId: userId,
          entityId: postId,
        },
      });
    }

    return { liked: true };
  }
};

// ─── Ajouter un commentaire ──────────────────────────
const addComment = async (userId, postId, content) => {
  if (!content?.trim()) throw new AppError('Le commentaire est vide', 400);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post introuvable', 404);

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: userId,
      postId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Notification pour l'auteur du post
  if (post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        type: 'COMMENT',
        message: 'a commenté votre publication',
        userId: post.authorId,
        actorId: userId,
        entityId: postId,
      },
    });
  }

  return comment;
};

// ─── Supprimer un commentaire ────────────────────────
const deleteComment = async (userId, commentId, userRole) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError('Commentaire introuvable', 404);

  if (comment.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Non autorisé', 403);
  }

  await prisma.comment.delete({ where: { id: commentId } });
};

// ─── Commentaires d'un post ──────────────────────────
const getComments = async (postId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post introuvable', 404);

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    skip,
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  return comments;
};

module.exports = {
  createPost, updatePost, deletePost,
  getFeed, getUserPosts,
  toggleLike, addComment, deleteComment, getComments,
};
const { prisma } = require('../../config/db');

function buildFullName(user) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
}

function parseJsonMaybe(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

async function listConversations(meId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userId: meId }, { realtorId: meId }],
    },
    include: {
      apartment: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      realtor: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      messages: {
        select: { id: true, body: true, senderId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map((conversation) => {
    const apartmentTitle = parseJsonMaybe(conversation.apartment?.title, null);
    const lastMessage = conversation.messages?.[0] || null;

    return {
      id: conversation.id,
      apartment: conversation.apartment
        ? { ...conversation.apartment, title: apartmentTitle || conversation.apartment.title }
        : null,
      user: conversation.user ? { ...conversation.user, fullName: buildFullName(conversation.user) } : null,
      realtor: conversation.realtor ? { ...conversation.realtor, fullName: buildFullName(conversation.realtor) } : null,
      lastMessage,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    };
  });
}

async function getConversation(meId, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      apartment: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      realtor: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      messages: {
        select: { id: true, body: true, senderId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const isParticipant = conversation.userId === meId || conversation.realtorId === meId;
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const apartmentTitle = parseJsonMaybe(conversation.apartment?.title, null);

  return {
    id: conversation.id,
    apartment: conversation.apartment
      ? { ...conversation.apartment, title: apartmentTitle || conversation.apartment.title }
      : null,
    user: conversation.user ? { ...conversation.user, fullName: buildFullName(conversation.user) } : null,
    realtor: conversation.realtor ? { ...conversation.realtor, fullName: buildFullName(conversation.realtor) } : null,
    messages: conversation.messages,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
}

async function sendMessageForApartment(meId, apartmentId, text) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true, status: true, realtorId: true },
  });

  if (!apartment || apartment.status !== 'active') {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  if (!apartment.realtorId) {
    const err = new Error('Realtor is not assigned for this apartment yet');
    err.statusCode = 400;
    throw err;
  }

  const realtorId = apartment.realtorId;

  return prisma.$transaction(async (tx) => {
    const conversation =
      (await tx.conversation.findUnique({
        where: {
          apartmentId_userId_realtorId: {
            apartmentId: apartment.id,
            userId: meId,
            realtorId,
          },
        },
      })) ||
      (await tx.conversation.create({
        data: {
          apartmentId: apartment.id,
          userId: meId,
          realtorId,
        },
      }));

    const message = await tx.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: meId,
        body: text,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return { conversationId: conversation.id, message };
  });
}

async function sendMessageToConversation(meId, conversationId, text) {
  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userId: true, realtorId: true },
    });

    if (!conversation) {
      const err = new Error('Conversation not found');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant = conversation.userId === meId || conversation.realtorId === meId;
    if (!isParticipant) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const message = await tx.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: meId,
        body: text,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return message;
  });
}

module.exports = {
  listConversations,
  getConversation,
  sendMessageForApartment,
  sendMessageToConversation,
};


import { Router, Request, Response, NextFunction } from 'express';
import { validate, chatMessageSchema } from '../middleware/validate';
import { processMessage } from '../services/chat.service';
import {
  findConversationById,
  getConversationMessages,
  listConversations,
} from '../services/conversation.service';
import type { ChatRequest } from '../types';

const router = Router();

// GET /api/chat/conversations — list all conversations (sidebar)
// IMPORTANT: must be before /:sessionId to avoid "conversations" being treated as a sessionId
router.get(
  '/conversations',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const convs = await listConversations();
      res.status(200).json({ conversations: convs });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/chat/message
router.post(
  '/message',
  validate(chatMessageSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, sessionId } = req.body as ChatRequest;
      const result = await processMessage(message, sessionId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/chat/:sessionId — get messages for a session
router.get(
  '/:sessionId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;

      const conversation = await findConversationById(sessionId!);
      if (!conversation) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const msgs = await getConversationMessages(sessionId!);
      res.status(200).json({ sessionId, messages: msgs });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

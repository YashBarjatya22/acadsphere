-- Private Messages Schema
-- Real-time 1-on-1 messaging between any two authenticated users
-- Works regardless of login method (Google, standard email, etc.)

CREATE TABLE IF NOT EXISTS public.private_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast conversation queries
CREATE INDEX IF NOT EXISTS pm_sender_receiver_idx   ON public.private_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS pm_receiver_sender_idx   ON public.private_messages(receiver_id, sender_id);
CREATE INDEX IF NOT EXISTS pm_created_at_idx        ON public.private_messages(created_at ASC);

-- RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Only participants of a conversation can read it
CREATE POLICY "Participants can view their messages"
  ON public.private_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Only sender can insert (and must be the sender)
CREATE POLICY "Sender can insert message"
  ON public.private_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Only sender can delete their own message
CREATE POLICY "Sender can delete own message"
  ON public.private_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

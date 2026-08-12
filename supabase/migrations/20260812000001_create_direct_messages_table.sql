-- ============================================================
-- Direct Messages Schema: Phase 1 Real-time DM Migration
-- Creates direct_messages table with RLS and realtime enabled
-- ============================================================

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast conversation queries
CREATE INDEX IF NOT EXISTS dm_sender_receiver_idx ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS dm_receiver_sender_idx ON public.direct_messages(receiver_id, sender_id);
CREATE INDEX IF NOT EXISTS dm_created_at_idx        ON public.direct_messages(created_at ASC);

-- RLS Configuration
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can select direct messages" ON public.direct_messages;
CREATE POLICY "Participants can select direct messages"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Sender can insert direct message" ON public.direct_messages;
CREATE POLICY "Sender can insert direct message"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Sender can delete own direct message" ON public.direct_messages;
CREATE POLICY "Sender can delete own direct message"
  ON public.direct_messages FOR DELETE
  USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Service role policy direct messages" ON public.direct_messages;
CREATE POLICY "Service role policy direct messages"
  ON public.direct_messages FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Set Replica Identity Full for complete real-time payload delivery
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;

-- Enable Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  END IF;
END $$;

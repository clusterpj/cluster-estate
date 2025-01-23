-- Create calendar_sync table
CREATE TABLE IF NOT EXISTS calendar_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    feed_url TEXT NOT NULL,
    feed_type TEXT CHECK (feed_type IN ('import', 'export')) NOT NULL,
    sync_enabled BOOLEAN DEFAULT true,
    sync_frequency INTEGER NOT NULL CHECK (sync_frequency > 0),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON calendar_sync
    FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

-- RLS Policies
ALTER TABLE calendar_sync ENABLE ROW LEVEL SECURITY;

-- Allow property owners to manage their calendar syncs
CREATE POLICY "Enable property owners to manage calendar syncs"
    ON calendar_sync
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = calendar_sync.property_id
            AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = calendar_sync.property_id
            AND p.user_id = auth.uid()
        )
    );

-- Allow read access for service role
CREATE POLICY "Enable service role to read calendar syncs"
    ON calendar_sync
    FOR SELECT
    TO service_role
    USING (true);

-- Create index for faster lookups
CREATE INDEX idx_calendar_sync_property_id ON calendar_sync(property_id);
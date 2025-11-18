-- Profile policies
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their profile"
ON profile
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their profile"
ON profile
FOR SELECT
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());


-- Entry policies
ALTER TABLE entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own entries"
ON entry
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own entries"
ON entry
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own entries"
ON entry
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own entries"
ON entry
FOR DELETE
USING (user_id = auth.uid());


-- Paragraph policies
ALTER TABLE paragraph ENABLE ROW LEVEL SECURITY;
ALTER TABLE paragraph FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own paragraphs"
ON paragraph
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own paragraphs"
ON paragraph
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own paragraphs"
ON paragraph
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own paragraphs"
ON paragraph
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);